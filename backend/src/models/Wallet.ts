import mongoose, { Schema, Document } from 'mongoose';

export interface IWallet extends Document {
    user_id: mongoose.Types.ObjectId;
    jeweller_id: string;
    balance: number;
    gold_grams: number;
    created_at: Date;
    updated_at: Date;
}

const WalletSchema = new Schema<IWallet>(
    {
        user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        jeweller_id: { type: String, required: true, index: true },
        balance: { type: Number, default: 0, min: 0 },
        gold_grams: { type: Number, default: 0, min: 0 },
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    }
);

WalletSchema.index({ user_id: 1, jeweller_id: 1 }, { unique: true });

export default mongoose.model<IWallet>('Wallet', WalletSchema);
