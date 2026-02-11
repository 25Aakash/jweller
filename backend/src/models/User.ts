import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    jeweller_id: string;
    phone_number: string;
    email?: string;
    name: string;
    password_hash?: string;
    role: 'CUSTOMER' | 'ADMIN';
    state?: string;
    city?: string;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
}

const UserSchema = new Schema<IUser>(
    {
        jeweller_id: { type: String, required: true, index: true },
        phone_number: { type: String, required: true },
        email: { type: String, lowercase: true, sparse: true },
        name: { type: String, required: true },
        password_hash: { type: String },
        role: { type: String, enum: ['CUSTOMER', 'ADMIN'], default: 'CUSTOMER' },
        state: { type: String },
        city: { type: String },
        is_active: { type: Boolean, default: true },
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    }
);

// Compound unique index: one phone per jeweller
UserSchema.index({ jeweller_id: 1, phone_number: 1 }, { unique: true });
// Admin lookup by email + jeweller
UserSchema.index({ jeweller_id: 1, email: 1 }, { unique: true, sparse: true });

export default mongoose.model<IUser>('User', UserSchema);
