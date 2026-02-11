import mongoose, { Schema, Document } from 'mongoose';

export interface IOtpVerification extends Document {
    phone_number: string;
    otp_code: string;
    jeweller_id: string;
    is_verified: boolean;
    expires_at: Date;
    created_at: Date;
}

const OtpVerificationSchema = new Schema<IOtpVerification>(
    {
        phone_number: { type: String, required: true },
        otp_code: { type: String, required: true },
        jeweller_id: { type: String, required: true },
        is_verified: { type: Boolean, default: false },
        expires_at: { type: Date, required: true },
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: false },
    }
);

OtpVerificationSchema.index({ phone_number: 1, jeweller_id: 1 });
OtpVerificationSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 }); // TTL auto-delete

export default mongoose.model<IOtpVerification>('OtpVerification', OtpVerificationSchema);
