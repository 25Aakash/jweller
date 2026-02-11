-- Row-Level Security for Multi-Tenant Data Isolation
-- This provides an additional layer of security at the database level

-- Enable Row-Level Security on all tenant-scoped tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet ENABLE ROW LEVEL SECURITY;
ALTER TABLE gold_price_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE gold_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE otp_verifications ENABLE ROW LEVEL SECURITY;

-- Create a function to get current jeweller_id from session
-- This will be set by the application when establishing database connection
CREATE OR REPLACE FUNCTION current_jeweller_id()
RETURNS UUID AS $$
BEGIN
    RETURN current_setting('app.jeweller_id', true)::UUID;
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;

-- Policies for users table
CREATE POLICY jeweller_isolation_users ON users
    FOR ALL
    USING (jeweller_id = current_jeweller_id());

-- Policies for wallet table
CREATE POLICY jeweller_isolation_wallet ON wallet
    FOR ALL
    USING (jeweller_id = current_jeweller_id());

-- Policies for gold_price_config table
CREATE POLICY jeweller_isolation_gold_price ON gold_price_config
    FOR ALL
    USING (jeweller_id = current_jeweller_id());

-- Policies for gold_bookings table
CREATE POLICY jeweller_isolation_bookings ON gold_bookings
    FOR ALL
    USING (jeweller_id = current_jeweller_id());

-- Policies for transactions table
CREATE POLICY jeweller_isolation_transactions ON transactions
    FOR ALL
    USING (jeweller_id = current_jeweller_id());

-- Policies for audit_logs table
CREATE POLICY jeweller_isolation_audit ON audit_logs
    FOR ALL
    USING (jeweller_id = current_jeweller_id());

-- Policies for otp_verifications table
CREATE POLICY jeweller_isolation_otp ON otp_verifications
    FOR ALL
    USING (jeweller_id = current_jeweller_id());

-- Note: The application must set the jeweller_id in the session for each request
-- Example: SET LOCAL app.jeweller_id = 'uuid-here';
