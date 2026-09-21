import jwt from 'jsonwebtoken';
import { logSecurityEvent } from './security.js';
import supabase from '../db/supabaseClient.js';

export const JWT_SECRET = process.env.JWT_SECRET || 'swift-line-worldwide-courier-super-secret-key-2026';

// Generate JWT Token
export function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName || user.full_name
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// Authenticate JWT Token
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      logSecurityEvent('INVALID_TOKEN_ATTEMPT', req, err.message);
      return res.status(403).json({ error: 'Invalid or expired session token' });
    }
    req.user = user;
    next();
  });
}

// Require Specific Roles (RBAC)
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized access' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      logSecurityEvent('RBAC_ACCESS_DENIED', req, `User ${req.user.email} (Role: ${req.user.role}) tried ${req.originalUrl}`);
      return res.status(403).json({
        error: `Forbidden: Access requires [${allowedRoles.join(', ')}] role.`,
        currentRole: req.user.role
      });
    }
    next();
  };
}

// Require Fine-Grained Permission (live DB lookup — always fresh from Supabase)
export function requirePermission(permissionKey) {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized access' });
    }

    // Super Admin has unconditional access to everything
    if (req.user.role === 'superadmin') {
      return next();
    }

    // Admins: check their current permissions from Supabase (not stale JWT)
    if (req.user.role === 'admin') {
      const { data: dbUser } = await supabase
        .from('users')
        .select('permissions')
        .eq('id', req.user.id)
        .single();

      const userPermissions = dbUser?.permissions || [];

      if (userPermissions.includes('*') || userPermissions.includes(permissionKey)) {
        return next();
      }

      logSecurityEvent('ADMIN_PERMISSION_DENIED', req, `Admin ${req.user.email} requires "${permissionKey}"`);
      return res.status(403).json({
        error: `Permission Denied: Super Admin has not granted "${permissionKey}" permission to your account.`,
        requiredPermission: permissionKey,
        currentPermissions: userPermissions
      });
    }

    // Clients never have admin permissions
    return res.status(403).json({ error: 'Administrative privileges required.' });
  };
}
