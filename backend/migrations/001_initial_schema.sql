-- White-Label Jeweller Platform Database Schema
-- PostgreSQL 15+

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: jewellers
-- Stores jeweller business information and configuration
-- =====================================================
CREATE TABLE jewellers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_name VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255) NOT NULL UNIQUE,
    contact_phone VARCHAR(15) NOT NULL,
    branding_config JSONB DEFAULT '{}',
    margin_percentage DECIMAL(5,2) DEFAULT 0.00,
    margin_fixed DECIMAL(10,2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_jewellers_active ON jewellers(is_active);
CREATE INDEX idx_jewellers_email ON jewellers(contact_email);

-- =====================================================
-- TABLE: users
-- Stores customer and admin users
-- =====================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    jeweller_id UUID NOT NULL REFERENCES jewellers(id) ON DELETE CASCADE,
    phone_number VARCHAR(15) NOT NULL,
    name VARCHAR(255),
    email VARCHAR(255),
    password_hash VARCHAR(255), -- Only for admin users
    role VARCHAR(20) NOT NULL CHECK (role IN ('CUSTOMER', 'ADMIN')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(jeweller_id, phone_number)
);

CREATE INDEX idx_users_jeweller ON users(jeweller_id);
CREATE INDEX idx_users_phone ON users(phone_number);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);

-- =====================================================
-- TABLE: otp_verifications
-- Stores OTP codes for phone verification
-- =====================================================
CREATE TABLE otp_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_number VARCHAR(15) NOT NULL,
    otp_code VARCHAR(6) NOT NULL,
    jeweller_id UUID NOT NULL REFERENCES jewellers(id) ON DELETE CASCADE,
    is_verified BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_otp_phone_jeweller ON otp_verifications(phone_number, jeweller_id, is_verified);
CREATE INDEX idx_otp_expires ON otp_verifications(expires_at);

-- =====================================================
-- TABLE: refresh_tokens
-- Stores JWT refresh tokens
-- =====================================================
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX idx_refresh_tokens_expires ON refresh_tokens(expires_at);

-- =====================================================
-- TABLE: gold_price_config
-- Stores daily gold price configuration per jeweller
-- =====================================================
CREATE TABLE gold_price_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    jeweller_id UUID NOT NULL REFERENCES jewellers(id) ON DELETE CASCADE,
    base_mcx_price DECIMAL(10,2) NOT NULL,
    jeweller_margin_percent DECIMAL(5,2) DEFAULT 0.00,
    jeweller_margin_fixed DECIMAL(10,2) DEFAULT 0.00,
    final_price DECIMAL(10,2) NOT NULL,
    effective_date DATE NOT NULL,
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(jeweller_id, effective_date)
);

CREATE INDEX idx_gold_price_jeweller ON gold_price_config(jeweller_id);
CREATE INDEX idx_gold_price_date ON gold_price_config(effective_date);

-- =====================================================
-- TABLE: wallet
-- Stores user wallet balances
-- =====================================================
CREATE TABLE wallet (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    jeweller_id UUID NOT NULL REFERENCES jewellers(id) ON DELETE CASCADE,
    balance DECIMAL(12,2) DEFAULT 0.00 CHECK (balance >= 0),
    gold_grams DECIMAL(10,4) DEFAULT 0.0000 CHECK (gold_grams >= 0),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_wallet_user ON wallet(user_id);
CREATE INDEX idx_wallet_jeweller ON wallet(jeweller_id);

-- =====================================================
-- TABLE: transactions
-- Stores all financial transactions
-- =====================================================
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    jeweller_id UUID NOT NULL REFERENCES jewellers(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES gold_bookings(id),
    transaction_ref VARCHAR(255) UNIQUE,
    amount DECIMAL(12,2) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('WALLET_CREDIT', 'GOLD_BOOKING', 'REFUND')),
    status VARCHAR(50) NOT NULL CHECK (status IN ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED')),
    payment_gateway_response JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_jeweller ON transactions(jeweller_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_ref ON transactions(transaction_ref);
CREATE INDEX idx_transactions_created ON transactions(created_at DESC);

-- =====================================================
-- TABLE: gold_bookings
-- Stores gold purchase bookings
-- =====================================================
CREATE TABLE gold_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    jeweller_id UUID NOT NULL REFERENCES jewellers(id) ON DELETE CASCADE,
    amount_paid DECIMAL(12,2) NOT NULL CHECK (amount_paid > 0),
    gold_grams DECIMAL(10,4) NOT NULL CHECK (gold_grams > 0),
    locked_price_per_gram DECIMAL(10,2) NOT NULL CHECK (locked_price_per_gram > 0),
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'REDEEMED', 'CANCELLED')),
    booked_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_gold_bookings_user ON gold_bookings(user_id);
CREATE INDEX idx_gold_bookings_jeweller ON gold_bookings(jeweller_id);
CREATE INDEX idx_gold_bookings_status ON gold_bookings(status);
CREATE INDEX idx_gold_bookings_date ON gold_bookings(booked_at DESC);

-- Add constraint to prevent price updates after booking
ALTER TABLE gold_bookings ADD CONSTRAINT prevent_price_update 
    CHECK (locked_price_per_gram > 0);

-- =====================================================
-- TABLE: audit_logs
-- Stores audit trail for compliance
-- =====================================================
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    jeweller_id UUID NOT NULL REFERENCES jewellers(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    changes JSONB,
    ip_address INET,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_jeweller ON audit_logs(jeweller_id);
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);

-- =====================================================
-- TABLE: app_versions
-- Stores app version requirements for force updates
-- =====================================================
CREATE TABLE app_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    jeweller_id UUID REFERENCES jewellers(id) ON DELETE CASCADE,
    platform VARCHAR(10) NOT NULL CHECK (platform IN ('android', 'ios')),
    min_version VARCHAR(20) NOT NULL,
    latest_version VARCHAR(20) NOT NULL,
    force_update BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_app_versions_jeweller ON app_versions(jeweller_id);
CREATE INDEX idx_app_versions_platform ON app_versions(platform);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_jewellers_updated_at BEFORE UPDATE ON jewellers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wallet_updated_at BEFORE UPDATE ON wallet
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gold_bookings_updated_at BEFORE UPDATE ON gold_bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_app_versions_updated_at BEFORE UPDATE ON app_versions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to create wallet automatically when user is created
CREATE OR REPLACE FUNCTION create_wallet_for_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO wallet (user_id, jeweller_id)
    VALUES (NEW.id, NEW.jeweller_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_wallet
    AFTER INSERT ON users
    FOR EACH ROW
    WHEN (NEW.role = 'CUSTOMER')
    EXECUTE FUNCTION create_wallet_for_user();

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE jewellers IS 'Stores jeweller business information and branding configuration';
COMMENT ON TABLE users IS 'Stores customer and admin users with role-based access';
COMMENT ON TABLE otp_verifications IS 'Temporary storage for OTP codes during phone verification';
COMMENT ON TABLE refresh_tokens IS 'JWT refresh tokens for authentication';
COMMENT ON TABLE gold_price_config IS 'Daily gold price configuration per jeweller with margin';
COMMENT ON TABLE wallet IS 'User wallet balances for cash and gold';
COMMENT ON TABLE transactions IS 'All financial transactions including payments and bookings';
COMMENT ON TABLE gold_bookings IS 'Gold purchase bookings with locked prices';
COMMENT ON TABLE audit_logs IS 'Audit trail for compliance and debugging';
COMMENT ON TABLE app_versions IS 'App version management for force updates';
