-- Swift Line Worldwide Courier Database Schema (Supabase / PostgreSQL)

-- 1. ENUM TYPES
CREATE TYPE user_role AS ENUM ('superadmin', 'admin', 'client');
CREATE TYPE shipment_status AS ENUM ('ORDER_CREATED', 'PICKED_UP', 'IN_TRANSIT', 'CUSTOMS_HOLD', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED');
CREATE TYPE service_type AS ENUM ('EXPRESS_AIR', 'STANDARD_OCEAN', 'PRIORITY_COURIER', 'OVERNIGHT');

-- 2. USERS TABLE (WITH FINE-GRAINED ADMIN PERMISSIONS & CLIENT-ADMIN ASSIGNMENTS)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255),
    role user_role DEFAULT 'client',
    phone VARCHAR(50),
    country VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Super Admin Delegation & Admin Scoping
    assigned_admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Fine-Grained Permissions for Admins:
    -- e.g. ["manage_shipments", "update_status", "manage_clients", "print_documents", "edit_settings"]
    permissions JSONB DEFAULT '["manage_shipments","update_status","manage_clients","print_documents"]'::jsonb,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. WEBSITE / SYSTEM SETTINGS TABLE (FULL SUPER ADMIN CRUD)
CREATE TABLE IF NOT EXISTS settings (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'general',
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. SHIPMENTS TABLE
CREATE TABLE IF NOT EXISTS shipments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tracking_number VARCHAR(100) UNIQUE NOT NULL,
    sender_name VARCHAR(255) NOT NULL,
    sender_email VARCHAR(255) NOT NULL,
    sender_phone VARCHAR(50) NOT NULL,
    sender_address TEXT NOT NULL,
    sender_country VARCHAR(100) NOT NULL,
    
    recipient_name VARCHAR(255) NOT NULL,
    recipient_email VARCHAR(255) NOT NULL,
    recipient_phone VARCHAR(50) NOT NULL,
    recipient_address TEXT NOT NULL,
    recipient_country VARCHAR(100) NOT NULL,
    
    courier_partner VARCHAR(100) DEFAULT 'Swift Line Express',
    service_type service_type DEFAULT 'EXPRESS_AIR',
    weight_kg NUMERIC(10, 2) NOT NULL,
    dimensions_cm VARCHAR(100) DEFAULT '30x20x15',
    declared_value_usd NUMERIC(10, 2) DEFAULT 100.00,
    shipping_cost_usd NUMERIC(10, 2) NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'PAID',
    
    status shipment_status DEFAULT 'ORDER_CREATED',
    current_location VARCHAR(255) NOT NULL,
    origin VARCHAR(100) NOT NULL,
    destination VARCHAR(100) NOT NULL,
    estimated_delivery TIMESTAMP WITH TIME ZONE,
    
    -- Scoping: Admin Assignment & Client Ownership
    assigned_admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. TRACKING EVENTS TABLE
CREATE TABLE IF NOT EXISTS tracking_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id UUID REFERENCES shipments(id) ON DELETE CASCADE,
    tracking_number VARCHAR(100) NOT NULL,
    status shipment_status NOT NULL,
    location VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    performed_by VARCHAR(255) DEFAULT 'System Scan',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. RATE RULES TABLE
CREATE TABLE IF NOT EXISTS rate_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    courier_name VARCHAR(100) NOT NULL,
    base_rate_usd NUMERIC(10, 2) NOT NULL,
    per_kg_rate_usd NUMERIC(10, 2) NOT NULL,
    estimated_days VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. SYSTEM SECURITY & BOT AUDIT LOGS
CREATE TABLE IF NOT EXISTS security_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ip_address VARCHAR(100) NOT NULL,
    user_agent TEXT,
    event_type VARCHAR(100) NOT NULL,
    details TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES FOR HIGH-SPEED QUERIES & RBAC FILTERING
CREATE INDEX IF NOT EXISTS idx_users_assigned_admin ON users(assigned_admin_id);
CREATE INDEX IF NOT EXISTS idx_users_created_by ON users(created_by_user_id);
CREATE INDEX IF NOT EXISTS idx_shipments_assigned_admin ON shipments(assigned_admin_id);
CREATE INDEX IF NOT EXISTS idx_shipments_created_by ON shipments(created_by_user_id);
CREATE INDEX IF NOT EXISTS idx_shipments_tracking ON shipments(tracking_number);
CREATE INDEX IF NOT EXISTS idx_shipments_sender ON shipments(sender_email);
CREATE INDEX IF NOT EXISTS idx_shipments_recipient ON shipments(recipient_email);
CREATE INDEX IF NOT EXISTS idx_tracking_events_number ON tracking_events(tracking_number);

-- SEED WEBSITE SETTINGS
INSERT INTO settings (key, value, category, description, is_public) VALUES
('site_name', 'Swift Line Worldwide Courier', 'general', 'Public branding name for the courier platform', TRUE),
('company_founded', '2011', 'history', 'The year Swift Line was founded in New York', TRUE),
('contact_email', 'dispatch@myswiftline.com', 'contact', 'Primary global dispatch and inquiry email', TRUE),
('contact_phone', '+1 (800) 555-0199', 'contact', '24/7 Toll-free worldwide telephone line', TRUE),
('support_hours', '24/7/365 Global Live Telemetry & Support', 'contact', 'Operating schedule for customer operations', TRUE),
('default_currency', 'USD', 'financial', 'Base operating billing currency', TRUE),
('tracking_prefix', 'SL-', 'logistics', 'Standard prefix for barcode airway bills', FALSE),
('allow_client_registration', 'true', 'access', 'Enable or disable public client signups', FALSE),
('maintenance_mode', 'false', 'system', 'Put customer portal into maintenance mode', FALSE),
('bot_rate_limit_per_15m', '300', 'security', 'DDoS protection max requests threshold', FALSE),
('email_notifications_enabled', 'true', 'notifications', 'Enable automated dispatch of SMTP delivery alerts', FALSE)
ON CONFLICT (key) DO NOTHING;

-- SEED RATE RULES
INSERT INTO rate_rules (courier_name, base_rate_usd, per_kg_rate_usd, estimated_days) VALUES
('Swift Line Express', 25.00, 4.50, '1 - 3 Days'),
('DHL Express', 35.00, 6.00, '2 - 4 Days'),
('FedEx World Express', 34.00, 5.80, '2 - 4 Days'),
('UPS Worldwide Saver', 32.00, 5.50, '3 - 5 Days'),
('Aramex Global', 22.00, 4.00, '4 - 7 Days'),
('Maersk Logistics Ocean', 15.00, 2.00, '10 - 15 Days')
ON CONFLICT DO NOTHING;
