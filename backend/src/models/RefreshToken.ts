import mongoose, { Schema, Document } from 'mongoose';

export interface IRefreshToken extends Document {
    user_id: mongoose.Types.ObjectId;
    token: string;
    expires_at: Date;
    created_at: Date;
}

const RefreshTokenSchema = new Schema<IRefreshToken>(
    {
        user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        token: { type: String, required: true, unique: true },
        expires_at: { type: Date, required: true },
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: false },
    }
);

RefreshTokenSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 }); // TTL auto-delete

export default mongoose.model<IRefreshToken>('RefreshToken', RefreshTokenSchema);
