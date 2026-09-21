import express from 'express';
import { authenticateToken, requireRole, requirePermission } from '../middleware/auth.js';
import { securityAuditLogs, logSecurityEvent } from '../middleware/security.js';
import { emailDispatchLogs } from '../services/emailService.js';
import supabase from '../db/supabaseClient.js';

const router = express.Router();

// ─── 1. GET /api/system/settings ─────────────────────────────────────────────
router.get('/settings', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  let isPrivileged = false;

  if (token) {
    try {
      const { JWT_SECRET } = await import('../middleware/auth.js');
      const jwt = await import('jsonwebtoken');
      const decoded = jwt.default.verify(token, JWT_SECRET);

      if (decoded.role === 'superadmin') {
        isPrivileged = true;
      } else if (decoded.role === 'admin') {
        const { data: dbUser } = await supabase.from('users').select('permissions').eq('id', decoded.id).single();
        if (dbUser?.permissions?.includes('edit_settings') || dbUser?.permissions?.includes('*')) {
          isPrivileged = true;
        }
      }
    } catch (_) {}
  }

  const { data: settings, error } = await supabase.from('settings').select('*').order('category');
  if (error) return res.status(500).json({ error: 'Failed to fetch settings' });

  if (isPrivileged) {
    return res.json(settings);
  }
  return res.json(settings.filter(s => s.is_public));
});

// ─── 2. POST /api/system/settings (CREATE) ───────────────────────────────────
router.post('/settings', authenticateToken, requirePermission('edit_settings'), async (req, res) => {
  const { key, value, category, description, is_public } = req.body;
  if (!key || value === undefined) return res.status(400).json({ error: 'Setting key and value are required.' });

  const cleanKey = key.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');

  const { data: existing } = await supabase.from('settings').select('key').eq('key', cleanKey).single();
  if (existing) return res.status(409).json({ error: `Setting key "${cleanKey}" already exists. Use PUT to update.` });

  const { data: newSetting, error } = await supabase
    .from('settings')
    .insert([{
      key: cleanKey,
      value: String(value),
      category: category || 'general',
      description: description || '',
      is_public: !!is_public
    }])
    .select()
    .single();

  if (error) return res.status(500).json({ error: 'Failed to create setting' });

  logSecurityEvent('SETTING_CREATED', req, `Key: ${cleanKey} by ${req.user.email}`);
  res.status(201).json({ message: 'Website setting created successfully', setting: newSetting });
});

// ─── 3. PUT /api/system/settings/:key (UPDATE) ───────────────────────────────
router.put('/settings/:key', authenticateToken, requirePermission('edit_settings'), async (req, res) => {
  const { key } = req.params;
  const { value, category, description, is_public } = req.body;

  const { data: existing } = await supabase.from('settings').select('key').eq('key', key.toLowerCase()).single();
  if (!existing) return res.status(404).json({ error: `Setting with key "${key}" not found.` });

  const updates = { updated_at: new Date().toISOString() };
  if (value !== undefined) updates.value = String(value);
  if (category !== undefined) updates.category = category;
  if (description !== undefined) updates.description = description;
  if (is_public !== undefined) updates.is_public = !!is_public;

  const { data: updated, error } = await supabase
    .from('settings')
    .update(updates)
    .eq('key', key.toLowerCase())
    .select()
    .single();

  if (error) return res.status(500).json({ error: 'Failed to update setting' });

  logSecurityEvent('SETTING_UPDATED', req, `Key: ${key} by ${req.user.email}`);
  res.json({ message: `Setting "${key}" updated successfully`, setting: updated });
});

// ─── 4. DELETE /api/system/settings/:key (SuperAdmin Only) ───────────────────
router.delete('/settings/:key', authenticateToken, requireRole('superadmin'), async (req, res) => {
  const { key } = req.params;

  const { data: existing } = await supabase.from('settings').select('*').eq('key', key.toLowerCase()).single();
  if (!existing) return res.status(404).json({ error: `Setting with key "${key}" not found.` });

  const { error } = await supabase.from('settings').delete().eq('key', key.toLowerCase());
  if (error) return res.status(500).json({ error: 'Failed to delete setting' });

  logSecurityEvent('SETTING_DELETED', req, `Key: ${key} deleted by ${req.user.email}`);
  res.json({ message: `Setting "${key}" deleted successfully by Super Admin`, setting: existing });
});

// ─── 5. GET /api/system/metrics (SuperAdmin Dashboard) ───────────────────────
router.get('/metrics', authenticateToken, requireRole('superadmin'), async (req, res) => {
  const [
    { count: totalUsers },
    { count: totalShipments },
    { data: shipmentData },
    { count: activeTransits },
    { count: customsHolds }
  ] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('shipments').select('*', { count: 'exact', head: true }),
    supabase.from('shipments').select('shipping_cost_usd'),
    supabase.from('shipments').select('*', { count: 'exact', head: true }).in('status', ['IN_TRANSIT', 'OUT_FOR_DELIVERY', 'PICKED_UP']),
    supabase.from('shipments').select('*', { count: 'exact', head: true }).eq('status', 'CUSTOMS_HOLD')
  ]);

  const totalRevenueUSD = (shipmentData || []).reduce((acc, s) => acc + (parseFloat(s.shipping_cost_usd) || 0), 0);

  res.json({
    metrics: {
      totalUsers: totalUsers || 0,
      totalShipments: totalShipments || 0,
      totalRevenueUSD: Math.round(totalRevenueUSD * 100) / 100,
      activeTransits: activeTransits || 0,
      customsHolds: customsHolds || 0,
      systemStatus: 'ONLINE_SECURE',
      botProtection: 'ACTIVE (Rate Limit 300req/15min)'
    },
    securityAuditLogs: securityAuditLogs.slice(0, 30),
    emailDispatchLogs: emailDispatchLogs.slice(0, 30)
  });
});

export default router;
