import pool from '../src/config/database';

async function checkTables() {
    try {
        console.log('🔍 Checking PostgreSQL database tables...\n');

        // Get all tables
        const tablesResult = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name;
        `);

        console.log(`📊 Found ${tablesResult.rows.length} tables:\n`);

        for (const row of tablesResult.rows) {
            const tableName = row.table_name;

            // Get row count for each table
            const countResult = await pool.query(`SELECT COUNT(*) as count FROM ${tableName}`);
            const count = countResult.rows[0].count;

            console.log(`  ✅ ${tableName.padEnd(30)} - ${count} rows`);
        }

        console.log('\n🎉 Database check complete!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error checking database:', error);
        process.exit(1);
    }
}

checkTables();
