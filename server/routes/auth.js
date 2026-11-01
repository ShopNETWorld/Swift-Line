import express from 'express';
import bcrypt from 'bcryptjs';
import { generateToken, authenticateToken, requireRole, requirePermission } from '../middleware/auth.js';
import { authLimiter, logSecurityEvent } from '../middleware/security.js';
import supabase from '../db/supabaseClient.js';
import { sendEmail } from '../services/emailService.js';

const router = express.Router();

// ─── helpers ────────────────────────────────────────────────────────────────
function safeUser(u) {
  return {
    id: u.id,
    email: u.email,
    fullName: u.full_name,
    companyName: u.company_name,
    role: u.role,
    phone: u.phone,
    country: u.country,
    isActive: u.is_active,
    permissions: u.permissions || [],
    assigned_admin_id: u.assigned_admin_id,
    created_by: u.created_by_user_id,
    createdAt: u.created_at
  };
}

// ─── 1. POST /api/auth/login ─────────────────────────────────────────────────
router.post('/login', authLimiter, async (req, res) => {
  const email = (req.body?.email || '').trim().toLowerCase();
  const password = (req.body?.password || '').trim();

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  if (!supabase) {
    console.error('CRITICAL: Supabase client is not initialized');
    return res.status(500).json({ error: 'Database connection error. Please verify Supabase credentials.' });
  }

  const { data: users, error } = await supabase
    .from('users')
    .select('*')
    .ilike('email', email)
    .limit(1);

  if (error) {
    console.error('Supabase query error during login:', error);
    return res.status(500).json({ error: 'Internal server error during database authentication' });
  }

  const user = users && users[0];

  if (!user) {
    logSecurityEvent('FAILED_LOGIN_ATTEMPT', req, `Email: ${email} (User not found)`);
    return res.status(401).json({ error: 'Invalid credentials. Please verify your email and password.' });
  }

  if (!user.is_active) {
    logSecurityEvent('INACTIVE_ACCOUNT_LOGIN', req, `Email: ${email}`);
    return res.status(403).json({ error: 'This account has been deactivated. Contact an administrator.' });
  }

  const validPassword = await bcrypt.compare(password, user.password_hash);
  if (!validPassword) {
    logSecurityEvent('FAILED_LOGIN_ATTEMPT', req, `Email: ${email} (Password mismatch)`);
    return res.status(401).json({ error: 'Invalid credentials. Please verify your email and password.' });
  }

  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
    fullName: user.full_name
  });

  logSecurityEvent('SUCCESSFUL_LOGIN', req, `User: ${user.email} (${user.role})`);

  res.json({
    message: 'Authentication successful',
    token,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      companyName: user.company_name,
      role: user.role,
      country: user.country,
      permissions: user.permissions || [],
      assigned_admin_id: user.assigned_admin_id
    }
  });
});

// ─── 2. POST /api/auth/register (Public Client Registration) ─────────────────
router.post('/register', authLimiter, async (req, res) => {
  const { email, password, fullName, companyName, country, phone } = req.body;
  if (!email || !password || !fullName) {
    return res.status(400).json({ error: 'Email, password, and full name are required' });
  }

  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .ilike('email', email)
    .limit(1);

  if (existing && existing.length > 0) {
    return res.status(409).json({ error: 'Account with this email already exists' });
  }

  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash(password, salt);

  const { data: newUser, error } = await supabase
    .from('users')
    .insert([{
      email,
      password_hash,
      full_name: fullName,
      company_name: companyName || '',
      role: 'client',
      phone: phone || '',
      country: country || 'United States',
      is_active: true,
      permissions: []
    }])
    .select()
    .single();

  if (error) {
    console.error('Register error:', error);
    return res.status(500).json({ error: 'Failed to create account. Please try again.' });
  }

  const token = generateToken({ id: newUser.id, email: newUser.email, role: newUser.role, fullName: newUser.full_name });
  logSecurityEvent('NEW_CLIENT_REGISTERED', req, `Email: ${email}`);

  res.status(201).json({
    message: 'Account created successfully',
    token,
    user: {
      id: newUser.id,
      email: newUser.email,
      fullName: newUser.full_name,
      role: newUser.role,
      permissions: [],
      assigned_admin_id: null
    }
  });
});

// ─── 2b. POST /api/auth/forgot-password ───────────────────────────────────────
router.post('/forgot-password', authLimiter, async (req, res) => {
  const email = (req.body?.email || '').trim().toLowerCase();
  if (!email) {
    return res.status(400).json({ error: 'Email address is required' });
  }

  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, full_name')
      .ilike('email', email)
      .limit(1);

    if (error) {
      console.error('Forgot password lookup error:', error);
    }

    const user = users && users[0];
    if (user) {
      const tempPassword = 'SL-' + Math.random().toString(36).substring(2, 8).toUpperCase() + '!';
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(tempPassword, salt);

      await supabase
        .from('users')
        .update({ password_hash })
        .eq('id', user.id);

      await sendEmail({
        to: user.email,
        subject: 'Swift Line Courier - Account Password Reset',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
            <div style="background-color: #0F2C59; padding: 15px; border-radius: 8px; text-align: center; color: white;">
              <h2 style="margin: 0; color: #FF6B00;">SWIFT LINE WORLDWIDE COURIER</h2>
              <p style="margin: 5px 0 0 0; font-size: 12px;">Secure Account Password Reset</p>
            </div>
            <div style="padding: 20px 0;">
              <p>Hello <strong>${user.full_name || 'Valued Client'}</strong>,</p>
              <p>We received a password reset request for your Swift Line account associated with <strong>${user.email}</strong>.</p>
              <p>Your temporary password to log in is:</p>
              <div style="background-color: #f1f5f9; padding: 14px; border-radius: 6px; font-family: monospace; font-size: 18px; font-weight: bold; text-align: center; color: #0F2C59; letter-spacing: 2px;">
                ${tempPassword}
              </div>
              <p style="font-size: 12px; color: #64748b; margin-top: 15px;">Please log in using this temporary password and update it in your portal settings.</p>
              <p style="font-size: 12px; color: #64748b;">If you did not request this reset, please contact support at support@myswiftline.com immediately.</p>
            </div>
            <div style="border-top: 1px solid #e2e8f0; padding-top: 12px; text-align: center; font-size: 11px; color: #94a3b8;">
              © 2026 Swift Line Worldwide Courier Inc. All rights reserved.
            </div>
          </div>
        `
      }).catch(err => console.error('Failed to dispatch reset email:', err));

      logSecurityEvent('PASSWORD_RESET_REQUESTED', req, `Email: ${email}`);
    }

    res.json({
      message: 'If an account is associated with this email, temporary login credentials have been dispatched to your inbox.'
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'Unable to process request. Please try again later.' });
  }
});

// ─── 3. GET /api/auth/me ─────────────────────────────────────────────────────
router.get('/me', authenticateToken, async (req, res) => {
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', req.user.id)
    .single();

  if (error || !user) return res.status(404).json({ error: 'User profile not found' });

  res.json(safeUser(user));
});

// ─── 4. GET /api/auth/users (SCOPED USER DIRECTORY) ──────────────────────────
router.get('/users', authenticateToken, requireRole('superadmin', 'admin'), async (req, res) => {
  if (req.user.role === 'superadmin') {
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: 'Failed to fetch users' });
    return res.json(users.map(safeUser));
  }

  // Admin: only their assigned/created clients
  const { data: clients, error } = await supabase
    .from('users')
    .select('*')
    .eq('role', 'client')
    .or(`assigned_admin_id.eq.${req.user.id},created_by_user_id.eq.${req.user.id}`);

  if (error) return res.status(500).json({ error: 'Failed to fetch clients' });
  return res.json(clients.map(u => ({ ...safeUser(u), permissions: [] })));
});

// ─── 5. POST /api/auth/clients/:clientId/assign ───────────────────────────────
router.post('/clients/:clientId/assign', authenticateToken, requireRole('superadmin'), async (req, res) => {
  const { clientId } = req.params;
  const { adminId } = req.body;

  const { data: client } = await supabase
    .from('users')
    .select('*')
    .eq('id', clientId)
    .eq('role', 'client')
    .single();

  if (!client) return res.status(404).json({ error: `Client with ID "${clientId}" not found.` });

  if (adminId) {
    const { data: admin } = await supabase
      .from('users')
      .select('id, role')
      .eq('id', adminId)
      .in('role', ['admin', 'superadmin'])
      .single();

    if (!admin) return res.status(404).json({ error: `Admin with ID "${adminId}" not found.` });
  }

  const { error } = await supabase
    .from('users')
    .update({ assigned_admin_id: adminId || null })
    .eq('id', clientId);

  if (error) return res.status(500).json({ error: 'Failed to update assignment' });

  logSecurityEvent('CLIENT_ADMIN_ASSIGNED', req, `Client ${client.email} → Admin: ${adminId || 'UNASSIGNED'}`);
  res.json({
    message: `Client "${client.full_name}" ${adminId ? 'assigned to admin' : 'unassigned'} successfully.`,
    client: { id: client.id, email: client.email, fullName: client.full_name, assigned_admin_id: adminId || null }
  });
});

// ─── 6. POST /api/auth/admins/:adminId/permissions ───────────────────────────
router.post('/admins/:adminId/permissions', authenticateToken, requireRole('superadmin'), async (req, res) => {
  const { adminId } = req.params;
  const { permissions } = req.body;

  if (!Array.isArray(permissions)) {
    return res.status(400).json({ error: 'Permissions must be an array of strings.' });
  }

  const validPermissions = ['manage_shipments', 'update_status', 'manage_clients', 'print_documents', 'edit_settings', 'view_analytics', '*'];
  const filtered = permissions.filter(p => validPermissions.includes(p));

  const { data: admin } = await supabase
    .from('users')
    .select('*')
    .eq('id', adminId)
    .eq('role', 'admin')
    .single();

  if (!admin) return res.status(404).json({ error: `Admin with ID "${adminId}" not found.` });

  const { error } = await supabase
    .from('users')
    .update({ permissions: filtered })
    .eq('id', adminId);

  if (error) return res.status(500).json({ error: 'Failed to update permissions' });

  logSecurityEvent('ADMIN_PERMISSIONS_UPDATED', req, `Admin ${admin.email} → [${filtered.join(', ')}]`);
  res.json({
    message: `Permissions updated for Admin "${admin.full_name}"`,
    admin: { id: admin.id, email: admin.email, fullName: admin.full_name, permissions: filtered }
  });
});

// ─── 7. POST /api/auth/users/create-client ────────────────────────────────────
router.post('/users/create-client', authenticateToken, requireRole('superadmin', 'admin'), async (req, res) => {
  if (req.user.role === 'admin') {
    const { data: adminUser } = await supabase.from('users').select('permissions').eq('id', req.user.id).single();
    const hasPerm = adminUser?.permissions?.includes('manage_clients') || adminUser?.permissions?.includes('*');
    if (!hasPerm) return res.status(403).json({ error: 'Permission denied: Requires "manage_clients" permission.' });
  }

  const { email, password, fullName, companyName, country, phone, assignedAdminId } = req.body;
  if (!email || !fullName) return res.status(400).json({ error: 'Email and Full Name are required.' });

  const { data: existing } = await supabase.from('users').select('id').ilike('email', email).limit(1);
  if (existing && existing.length > 0) return res.status(409).json({ error: 'User with this email already exists.' });

  const clientPassword = password || 'client123';
  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash(clientPassword, salt);

  const assigned_admin_id = req.user.role === 'admin' ? req.user.id : (assignedAdminId || null);

  const { data: newClient, error } = await supabase
    .from('users')
    .insert([{
      email,
      password_hash,
      full_name: fullName,
      company_name: companyName || '',
      role: 'client',
      phone: phone || '',
      country: country || 'United States',
      is_active: true,
      permissions: [],
      assigned_admin_id,
      created_by_user_id: req.user.id
    }])
    .select()
    .single();

  if (error) {
    console.error('Create client error:', error);
    return res.status(500).json({ error: 'Failed to create client. Please try again.' });
  }

  logSecurityEvent('CLIENT_CREATED_BY_ADMIN', req, `Client ${email} created by ${req.user.email}`);
  res.status(201).json({
    message: 'Client created successfully',
    client: {
      id: newClient.id, email: newClient.email, fullName: newClient.full_name,
      companyName: newClient.company_name, role: newClient.role,
      assigned_admin_id: newClient.assigned_admin_id, created_by: newClient.created_by_user_id,
      createdAt: newClient.created_at
    }
  });
});

// ─── 8. PUT /api/auth/users/:id/role ─────────────────────────────────────────
router.put('/users/:id/role', authenticateToken, requireRole('superadmin'), async (req, res) => {
  const { id } = req.params;
  const { role, isActive, permissions } = req.body;

  const { data: user } = await supabase.from('users').select('*').eq('id', id).single();
  if (!user) return res.status(404).json({ error: 'User not found' });

  const updates = {};

  if (role && ['superadmin', 'admin', 'client'].includes(role)) {
    updates.role = role;
    if (role === 'superadmin') updates.permissions = ['*'];
    else if (role === 'admin') updates.permissions = user.permissions?.length ? user.permissions : ['manage_shipments', 'update_status', 'manage_clients', 'print_documents'];
    else if (role === 'client') updates.permissions = [];
  }

  if (typeof isActive === 'boolean') updates.is_active = isActive;

  if (Array.isArray(permissions) && (updates.role || user.role) === 'admin') {
    updates.permissions = permissions;
  }

  const { data: updated, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: 'Failed to update user role' });

  logSecurityEvent('USER_ROLE_UPDATED', req, `Target ID: ${id} New Role: ${updated.role}`);
  res.json({ message: 'User role updated successfully', user: safeUser(updated) });
});

export default router;
