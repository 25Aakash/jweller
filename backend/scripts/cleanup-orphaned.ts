import pool from '../src/config/database';

async function cleanupOrphanedData() {
    try {
        console.log('🧹 Cleaning up orphaned registration data...');

        const phoneNumber = '+918476976540';

        // Delete wallet first (foreign key)
        await pool.query(
            `DELETE FROM wallet WHERE user_id IN (SELECT id FROM users WHERE phone_number = $1)`,
            [phoneNumber]
        );

        // Delete user
        const result = await pool.query(
            `DELETE FROM users WHERE phone_number = $1 AND role = 'CUSTOMER'`,
            [phoneNumber]
        );

        console.log(`✅ Cleaned up orphaned data`);
        console.log('\n🎉 Database is clean! Try registration again.');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

cleanupOrphanedData();
