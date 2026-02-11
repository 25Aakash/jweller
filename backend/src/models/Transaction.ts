import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction extends Document {
    user_id: mongoose.Types.ObjectId;
    jeweller_id: string;
    transaction_ref?: string;
    booking_id?: mongoose.Types.ObjectId;
    amount: number;
    type: 'WALLET_CREDIT' | 'GOLD_BOOKING' | 'REFUND';
    status: 'SUCCESS' | 'FAILED' | 'PENDING';
    payment_gateway_response?: any;
    created_at: Date;
}

const TransactionSchema = new Schema<ITransaction>(
    {
        user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        jeweller_id: { type: String, required: true, index: true },
        transaction_ref: { type: String },
        booking_id: { type: Schema.Types.ObjectId, ref: 'GoldBooking' },
        amount: { type: Number, required: true },
        type: { type: String, enum: ['WALLET_CREDIT', 'GOLD_BOOKING', 'REFUND'], required: true },
        status: { type: String, enum: ['SUCCESS', 'FAILED', 'PENDING'], default: 'PENDING' },
        payment_gateway_response: { type: Schema.Types.Mixed },
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: false },
    }
);

TransactionSchema.index({ user_id: 1, jeweller_id: 1 });
TransactionSchema.index({ created_at: -1 });

export default mongoose.model<ITransaction>('Transaction', TransactionSchema);
