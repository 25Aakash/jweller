import pool from '../src/config/database';

async function deleteIncompleteUser() {
    try {
        console.log('🗑️  Removing incomplete user registration...');

        const phoneNumber = '+918476976540';

        // Delete user and related data
        const result = await pool.query(
            `DELETE FROM users WHERE phone_number = $1 AND role = 'CUSTOMER'`,
            [phoneNumber]
        );

        console.log(`✅ Deleted ${result.rowCount} user(s)`);
        console.log('\n🎉 You can now register again!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

deleteIncompleteUser();
