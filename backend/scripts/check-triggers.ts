import pool from '../src/config/database';

async function checkTriggers() {
    try {
        console.log('🔍 Checking for database triggers...\n');

        const result = await pool.query(`
            SELECT 
                trigger_name,
                event_manipulation,
                event_object_table,
                action_statement
            FROM information_schema.triggers
            WHERE trigger_schema = 'public'
            ORDER BY event_object_table, trigger_name;
        `);

        if (result.rows.length === 0) {
            console.log('✅ No triggers found');
        } else {
            console.log(`Found ${result.rows.length} triggers:\n`);
            result.rows.forEach(row => {
                console.log(`Trigger: ${row.trigger_name}`);
                console.log(`  Table: ${row.event_object_table}`);
                console.log(`  Event: ${row.event_manipulation}`);
                console.log(`  Action: ${row.action_statement}\n`);
            });
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkTriggers();
