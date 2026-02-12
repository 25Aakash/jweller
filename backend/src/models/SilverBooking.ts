import mongoose, { Schema, Document } from 'mongoose';

export interface ISilverBooking extends Document {
    user_id: mongoose.Types.ObjectId;
    jeweller_id: string;
    amount_paid: number;
    silver_grams: number;
    locked_price_per_gram: number;
    status: 'ACTIVE' | 'REDEEMED' | 'CANCELLED';
    booked_at: Date;
    updated_at: Date;
}

const SilverBookingSchema = new Schema<ISilverBooking>(
    {
        user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        jeweller_id: { type: String, required: true, index: true },
        amount_paid: { type: Number, required: true },
        silver_grams: { type: Number, required: true },
        locked_price_per_gram: { type: Number, required: true },
        status: { type: String, enum: ['ACTIVE', 'REDEEMED', 'CANCELLED'], default: 'ACTIVE' },
        booked_at: { type: Date, default: Date.now },
    },
    {
        timestamps: { createdAt: false, updatedAt: 'updated_at' },
    }
);

SilverBookingSchema.index({ user_id: 1, jeweller_id: 1 });
SilverBookingSchema.index({ booked_at: -1 });

export default mongoose.model<ISilverBooking>('SilverBooking', SilverBookingSchema);
