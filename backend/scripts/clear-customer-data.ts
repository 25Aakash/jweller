import pool from '../src/config/database';

async function clearCustomerData() {
    try {
        console.log('🗑️  Clearing customer data...');

        // Delete in correct order (respecting foreign keys)
        // Note: wallet_transactions table doesn't exist, skipping

        await pool.query('DELETE FROM gold_bookings');
        console.log('✅ Cleared gold bookings');

        await pool.query('DELETE FROM otp_verifications');
        console.log('✅ Cleared OTP verifications');

        await pool.query(`DELETE FROM refresh_tokens WHERE user_id IN (SELECT id FROM users WHERE role = 'CUSTOMER')`);
        console.log('✅ Cleared customer refresh tokens');

        // Clear wallets (note: table is named 'wallet' not 'wallets')
        await pool.query(`DELETE FROM wallet WHERE user_id IN (SELECT id FROM users WHERE role = 'CUSTOMER')`);
        console.log('✅ Cleared customer wallets');

        const result = await pool.query(`DELETE FROM users WHERE role = 'CUSTOMER'`);
        console.log(`✅ Deleted ${result.rowCount} customer users`);

        console.log('\n🎉 Customer data cleared successfully!');
        console.log('Admin and jeweller data preserved.');
        console.log('\n📊 Remaining data:');

        const counts = await pool.query(`
            SELECT 
                (SELECT COUNT(*) FROM users) as users,
                (SELECT COUNT(*) FROM wallet) as wallets,
                (SELECT COUNT(*) FROM gold_bookings) as bookings,
                (SELECT COUNT(*) FROM jewellers) as jewellers
        `);
        console.log(`  - Users: ${counts.rows[0].users}`);
        console.log(`  - Wallets: ${counts.rows[0].wallets}`);
        console.log(`  - Bookings: ${counts.rows[0].bookings}`);
        console.log(`  - Jewellers: ${counts.rows[0].jewellers}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error clearing data:', error);
        process.exit(1);
    }
}

clearCustomerData();
