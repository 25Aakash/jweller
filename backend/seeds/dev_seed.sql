-- Development Seed Data
-- This file contains sample data for development and testing

-- Insert sample jeweller
INSERT INTO jewellers (id, business_name, contact_email, contact_phone, branding_config, margin_percentage, margin_fixed, is_active)
VALUES 
(
    '550e8400-e29b-41d4-a716-446655440000',
    'Sample Jewellers',
    'admin@samplejewellers.com',
    '+919876543210',
    '{
        "app_name": "Sample Gold",
        "primary_color": "#FFD700",
        "secondary_color": "#FFA500",
        "logo_url": "",
        "splash_url": ""
    }'::jsonb,
    2.50,
    0.00,
    true
);

-- Insert admin user for the jeweller
INSERT INTO users (id, jeweller_id, phone_number, name, email, password_hash, role, is_active)
VALUES 
(
    '660e8400-e29b-41d4-a716-446655440000',
    '550e8400-e29b-41d4-a716-446655440000',
    '+919876543210',
    'Admin User',
    'admin@samplejewellers.com',
    '$2b$10$rKvVLPqZ5xqxqxqxqxqxqOXxqxqxqxqxqxqxqxqxqxqxqxqxqxqxq', -- password: admin123 (you should hash this properly)
    'ADMIN',
    true
);

-- Insert sample customer users
INSERT INTO users (jeweller_id, phone_number, name, role, is_active)
VALUES 
(
    '550e8400-e29b-41d4-a716-446655440000',
    '+919876543211',
    'Customer One',
    'CUSTOMER',
    true
),
(
    '550e8400-e29b-41d4-a716-446655440000',
    '+919876543212',
    'Customer Two',
    'CUSTOMER',
    true
);

-- Insert initial gold price configuration
INSERT INTO gold_price_config (jeweller_id, base_mcx_price, jeweller_margin_percent, jeweller_margin_fixed, final_price, effective_date, updated_by)
VALUES 
(
    '550e8400-e29b-41d4-a716-446655440000',
    6500.00,
    2.50,
    0.00,
    6662.50, -- 6500 + (6500 * 0.025)
    CURRENT_DATE,
    '660e8400-e29b-41d4-a716-446655440000'
);

-- Note: Wallets will be created automatically by the trigger for customer users

COMMENT ON TABLE jewellers IS 'Sample jeweller data for development';
