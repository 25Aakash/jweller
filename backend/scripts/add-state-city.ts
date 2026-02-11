import pool from '../src/config/database';

async function addStateCity() {
    try {
        console.log('🔧 Adding state and city columns to users table...');

        await pool.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS state VARCHAR(100),
            ADD COLUMN IF NOT EXISTS city VARCHAR(100)
        `);

        console.log('✅ Columns added successfully');

        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_users_state_city ON users(state, city)
        `);

        console.log('✅ Index created');
        console.log('\n🎉 Migration complete!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

addStateCity();
