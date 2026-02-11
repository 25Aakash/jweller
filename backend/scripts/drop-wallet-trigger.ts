import pool from '../src/config/database';

async function dropWalletTrigger() {
    try {
        console.log('🔧 Dropping auto-create wallet trigger...');

        await pool.query(`DROP TRIGGER IF EXISTS trigger_create_wallet ON users CASCADE`);
        await pool.query(`DROP FUNCTION IF EXISTS create_wallet_for_user() CASCADE`);

        console.log('✅ Trigger and function dropped');
        console.log('\n🎉 Wallets will now be created manually in registration code');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

dropWalletTrigger();
