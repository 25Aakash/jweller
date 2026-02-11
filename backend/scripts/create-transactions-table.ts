import pool from '../src/config/database';

async function createTransactionsTable() {
    try {
        console.log('🔧 Creating transactions table...');

        await pool.query(`
            CREATE TABLE IF NOT EXISTS transactions (
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
        `);

        console.log('✅ Transactions table created');

        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
            CREATE INDEX IF NOT EXISTS idx_transactions_jeweller ON transactions(jeweller_id);
            CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
            CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
            CREATE INDEX IF NOT EXISTS idx_transactions_ref ON transactions(transaction_ref);
            CREATE INDEX IF NOT EXISTS idx_transactions_created ON transactions(created_at DESC);
        `);

        console.log('✅ Indexes created');
        console.log('\n🎉 Transactions table ready!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

createTransactionsTable();
