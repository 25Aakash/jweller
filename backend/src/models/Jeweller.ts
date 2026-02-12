import mongoose, { Schema, Document } from 'mongoose';

export interface IJeweller extends Document {
    jeweller_id: string;
    name: string;
    margin_percentage: number;
    margin_fixed: number;
    created_at: Date;
    updated_at: Date;
}

const JewellerSchema = new Schema<IJeweller>(
    {
        jeweller_id: { type: String, required: true, unique: true },
        name: { type: String, required: true },
        margin_percentage: { type: Number, default: 0 },
        margin_fixed: { type: Number, default: 0 },
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    }
);

export default mongoose.model<IJeweller>('Jeweller', JewellerSchema);
