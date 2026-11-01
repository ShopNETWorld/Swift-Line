import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import supabase from '../db/supabaseClient.js';
import { sendEmail, buildTrackingStatusEmail, sendShipmentNotification } from '../services/emailService.js';
import { logSecurityEvent } from '../middleware/security.js';

const router = express.Router();

function generateTrackingNumber(countryCode = 'US') {
  const randomNum = Math.floor(1000000 + Math.random() * 9000000);
  return `SL-${randomNum}-${countryCode.substring(0, 2).toUpperCase()}`;
}

// ─── 1. GET /api/shipments/track/:trackingNumber (PUBLIC) ────────────────────
router.get('/track/:trackingNumber', async (req, res) => {
  const trackingNumber = req.params.trackingNumber.trim().toUpperCase();

  const { data: shipment, error } = await supabase
    .from('shipments')
    .select('*, tracking_events(*)')
    .ilike('tracking_number', trackingNumber)
    .single();

  if (error || !shipment) {
    return res.status(404).json({ error: `No shipment found matching tracking number "${trackingNumber}".` });
  }

  res.json({
    tracking_number: shipment.tracking_number,
    status: shipment.status,
    origin: shipment.origin,
    destination: shipment.destination,
    current_location: shipment.current_location,
    courier_partner: shipment.courier_partner,
    service_type: shipment.service_type,
    estimated_delivery: shipment.estimated_delivery,
    weight_kg: shipment.weight_kg,
    created_at: shipment.created_at,
    sender_name: shipment.sender_name,
    recipient_name: shipment.recipient_name,
    tracking_events: (shipment.tracking_events || []).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  });
});

// ─── 2. GET /api/shipments (SCOPED) ─────────────────────────────────────────
router.get('/', authenticateToken, async (req, res) => {
  let query = supabase.from('shipments').select('*, tracking_events(*)').order('created_at', { ascending: false });

  if (req.user.role === 'client') {
    query = query.or(`created_by_user_id.eq.${req.user.id},sender_email.ilike.${req.user.email},recipient_email.ilike.${req.user.email}`);
  } else if (req.user.role === 'admin') {
    // Get managed client IDs first
    const { data: managedClients } = await supabase
      .from('users')
      .select('id, email')
      .eq('role', 'client')
      .or(`assigned_admin_id.eq.${req.user.id},created_by_user_id.eq.${req.user.id}`);

    const clientIds = (managedClients || []).map(u => u.id);
    const clientEmails = (managedClients || []).map(u => u.email.toLowerCase());

    if (clientIds.length === 0) return res.json([]);

    // Build filter for admin-scoped shipments
    const idFilter = clientIds.map(id => `created_by_user_id.eq.${id}`).join(',');
    const emailFilter = clientEmails.map(e => `sender_email.ilike.${e}`).join(',');
    const recipFilter = clientEmails.map(e => `recipient_email.ilike.${e}`).join(',');

    query = query.or(`assigned_admin_id.eq.${req.user.id},${idFilter},${emailFilter},${recipFilter}`);
  }
  // superadmin gets all — no filter

  const { data: shipments, error } = await query;
  if (error) {
    console.error('Fetch shipments error:', error);
    return res.status(500).json({ error: 'Failed to fetch shipments' });
  }

  res.json(shipments.map(s => ({
    ...s,
    tracking_events: (s.tracking_events || []).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  })));
});

// ─── 3. POST /api/shipments (CREATE) ────────────────────────────────────────
router.post('/', authenticateToken, async (req, res) => {
  if (req.user.role === 'admin') {
    const { data: dbUser } = await supabase.from('users').select('permissions').eq('id', req.user.id).single();
    const hasPerm = dbUser?.permissions?.includes('manage_shipments') || dbUser?.permissions?.includes('*');
    if (!hasPerm) return res.status(403).json({ error: 'Permission denied: Requires "manage_shipments" permission.' });
  }

  const {
    sender_name, sender_email, sender_phone, sender_address, sender_country,
    recipient_name, recipient_email, recipient_phone, recipient_address, recipient_country,
    courier_partner, service_type, weight_kg, dimensions_cm, declared_value_usd, notes,
    assigned_client_id
  } = req.body;

  if (!sender_name || !recipient_name || !weight_kg || !sender_country || !recipient_country) {
    return res.status(400).json({ error: 'Sender, recipient, countries, and weight are required.' });
  }

  const tracking_number = generateTrackingNumber(recipient_country);
  const weight = parseFloat(weight_kg) || 1.0;
  const shipping_cost_usd = Math.round((25.00 + weight * 4.50) * 100) / 100;

  let assigned_admin_id = null;
  if (req.user.role === 'admin') {
    assigned_admin_id = req.user.id;
  } else if (req.user.role === 'client') {
    const { data: clientUser } = await supabase.from('users').select('assigned_admin_id').eq('id', req.user.id).single();
    assigned_admin_id = clientUser?.assigned_admin_id || null;
  }

  const { data: newShipment, error: shipErr } = await supabase
    .from('shipments')
    .insert([{
      tracking_number,
      sender_name,
      sender_email: sender_email || req.user.email,
      sender_phone: sender_phone || '',
      sender_address: sender_address || '',
      sender_country,
      recipient_name,
      recipient_email: recipient_email || '',
      recipient_phone: recipient_phone || '',
      recipient_address: recipient_address || '',
      recipient_country,
      courier_partner: courier_partner || 'Swift Line Express',
      service_type: service_type || 'EXPRESS_AIR',
      weight_kg: weight,
      dimensions_cm: dimensions_cm || '30x20x15',
      declared_value_usd: parseFloat(declared_value_usd) || 100.00,
      shipping_cost_usd,
      payment_status: 'PAID',
      status: 'ORDER_CREATED',
      current_location: `${sender_country} Origin Gateway Terminal`,
      origin: sender_country,
      destination: recipient_country,
      estimated_delivery: new Date(Date.now() + 86400000 * 3).toISOString(),
      assigned_admin_id,
      created_by_user_id: assigned_client_id || req.user.id,
      notes: notes || ''
    }])
    .select()
    .single();

  if (shipErr) {
    console.error('Create shipment error:', shipErr);
    return res.status(500).json({ error: 'Failed to create shipment. Please try again.' });
  }

  // Insert initial tracking event
  await supabase.from('tracking_events').insert([{
    shipment_id: newShipment.id,
    tracking_number,
    status: 'ORDER_CREATED',
    location: `${sender_country} Dispatch Center`,
    description: 'Shipment booking completed & barcode airway bill issued.',
    performed_by: `${req.user.fullName} (${req.user.role})`
  }]);

  logSecurityEvent('SHIPMENT_CREATED', req, `Tracking: ${tracking_number}`);

  // Dispatch email alerts to BOTH sender and recipient
  sendShipmentNotification(newShipment, 'ORDER_CREATED', newShipment.current_location)
    .catch(err => console.error('Shipment notification email error:', err));

  res.status(201).json({ message: 'Shipment created successfully', shipment: newShipment });
});

// ─── 4. PUT /api/shipments/:id/status (UPDATE STATUS) ───────────────────────
router.put('/:id/status', authenticateToken, requireRole('admin', 'superadmin'), async (req, res) => {
  const { id } = req.params;
  const { status, current_location, description } = req.body;

  if (req.user.role === 'admin') {
    const { data: dbUser } = await supabase.from('users').select('permissions').eq('id', req.user.id).single();
    const hasPerm = dbUser?.permissions?.includes('update_status') || dbUser?.permissions?.includes('*');
    if (!hasPerm) return res.status(403).json({ error: 'Permission denied: Requires "update_status" permission.' });
  }

  const { data: shipment } = await supabase
    .from('shipments')
    .select('*')
    .or(`id.eq.${id},tracking_number.ilike.${id}`)
    .single();

  if (!shipment) return res.status(404).json({ error: 'Shipment not found' });

  // Admin scoping check
  if (req.user.role === 'admin') {
    const { data: managedClients } = await supabase
      .from('users')
      .select('id, email')
      .eq('role', 'client')
      .or(`assigned_admin_id.eq.${req.user.id},created_by_user_id.eq.${req.user.id}`);

    const managedClientIds = (managedClients || []).map(u => u.id);
    const managedClientEmails = (managedClients || []).map(u => u.email.toLowerCase());

    const isAuthorized =
      shipment.assigned_admin_id === req.user.id ||
      managedClientIds.includes(shipment.created_by_user_id) ||
      managedClientEmails.includes(shipment.sender_email?.toLowerCase()) ||
      managedClientEmails.includes(shipment.recipient_email?.toLowerCase());

    if (!isAuthorized) {
      return res.status(403).json({ error: 'Access denied: You are not assigned to manage this shipment.' });
    }
  }

  // Update shipment
  const updates = { updated_at: new Date().toISOString() };
  if (status) updates.status = status;
  if (current_location) updates.current_location = current_location;

  const { data: updatedShipment, error: upErr } = await supabase
    .from('shipments')
    .update(updates)
    .eq('id', shipment.id)
    .select()
    .single();

  if (upErr) return res.status(500).json({ error: 'Failed to update shipment' });

  // Insert tracking event
  await supabase.from('tracking_events').insert([{
    shipment_id: shipment.id,
    tracking_number: shipment.tracking_number,
    status: status || shipment.status,
    location: current_location || shipment.current_location,
    description: description || `Status updated to ${status?.replace(/_/g, ' ') || shipment.status}`,
    performed_by: `${req.user.fullName} (${req.user.role})`
  }]);

  logSecurityEvent('SHIPMENT_STATUS_UPDATED', req, `Tracking: ${shipment.tracking_number} → ${status}`);

  // Dispatch status update email to both sender and recipient
  sendShipmentNotification(updatedShipment, updatedShipment.status, updatedShipment.current_location)
    .catch(err => console.error('Status update notification email error:', err));

  res.json({ message: 'Shipment status updated & email alert dispatched', shipment: updatedShipment });
});

// ─── 5. DELETE /api/shipments/:id (SuperAdmin only) ─────────────────────────
router.delete('/:id', authenticateToken, requireRole('superadmin'), async (req, res) => {
  const { id } = req.params;

  const { data: shipment } = await supabase
    .from('shipments')
    .select('id, tracking_number')
    .or(`id.eq.${id},tracking_number.ilike.${id}`)
    .single();

  if (!shipment) return res.status(404).json({ error: 'Shipment not found' });

  const { error } = await supabase.from('shipments').delete().eq('id', shipment.id);
  if (error) return res.status(500).json({ error: 'Failed to delete shipment' });

  logSecurityEvent('SHIPMENT_DELETED', req, `Deleted tracking: ${shipment.tracking_number}`);
  res.json({ message: 'Shipment deleted by Super Admin', shipment });
});

export default router;
