-- ============================================================
-- Swift Line Worldwide Courier — Seed Data
-- Run in Supabase SQL Editor AFTER schema.sql
-- ============================================================

-- 1. Super Admin (login: superadmin@myswiftline.com / superadmin123)
INSERT INTO users (email, password_hash, full_name, role, phone, country, is_active, permissions)
VALUES (
  'superadmin@myswiftline.com',
  '$2a$10$8FMQvINZRmLCy.Zl/yXlke5XSf25SafhsHZEdgX7wExmXBTQsAV7K',
  'Marcus Vance',
  'superadmin',
  '+1 (800) 555-0199',
  'United States',
  true,
  '["*"]'::jsonb
) ON CONFLICT (email) DO NOTHING;

-- 2. Admin (login: admin@myswiftline.com / admin123)
INSERT INTO users (email, password_hash, full_name, role, phone, country, is_active, permissions)
VALUES (
  'admin@myswiftline.com',
  '$2a$10$3gZIpvgnz3AzG6lvvMjCvONmQx1tS6OVWMnqXATZuY5Vr0P7SSqba',
  'Sarah Jenkins',
  'admin',
  '+1 (800) 555-0188',
  'United Kingdom',
  true,
  '["manage_shipments","update_status","manage_clients","print_documents"]'::jsonb
) ON CONFLICT (email) DO NOTHING;

-- 3. Demo Client (login: client@myswiftline.com / client123)
-- Will be assigned to admin after admin is inserted
INSERT INTO users (email, password_hash, full_name, company_name, role, phone, country, is_active, permissions)
VALUES (
  'client@myswiftline.com',
  '$2a$10$JeJxe/6vC1tHi5AMd9I8I.hCyM4z3C4Lynz3hA7NMX7nu/BjLl07e',
  'Alexander Wright',
  'Apex Global Trading',
  'client',
  '+1 (800) 555-0177',
  'Germany',
  true,
  '[]'::jsonb
) ON CONFLICT (email) DO NOTHING;

-- 4. Assign client to admin
UPDATE users
SET assigned_admin_id = (SELECT id FROM users WHERE email = 'admin@myswiftline.com'),
    created_by_user_id = (SELECT id FROM users WHERE email = 'superadmin@myswiftline.com')
WHERE email = 'client@myswiftline.com';

-- 5. Set admin created_by to superadmin
UPDATE users
SET created_by_user_id = (SELECT id FROM users WHERE email = 'superadmin@myswiftline.com')
WHERE email = 'admin@myswiftline.com';

-- ? Done! You can now log in with the credentials above.
