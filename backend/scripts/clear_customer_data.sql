-- Clear all customer data (keep admin and jeweller data)
DELETE FROM gold_bookings;
DELETE FROM wallet_transactions;
DELETE FROM wallets;
DELETE FROM otp_verifications;
DELETE FROM refresh_tokens WHERE user_id IN (SELECT id FROM users WHERE role = 'CUSTOMER');
DELETE FROM users WHERE role = 'CUSTOMER';

-- Reset sequences if needed
-- ALTER SEQUENCE users_id_seq RESTART WITH 1;

SELECT 'Customer data cleared successfully!' as message;
