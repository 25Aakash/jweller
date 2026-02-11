import mongoose, { Schema, Document } from 'mongoose';

export interface IJeweller extends Document {
    name: string;
    margin_percentage: number;
    margin_fixed: number;
    created_at: Date;
    updated_at: Date;
}

const JewellerSchema = new Schema<IJeweller>(
    {
        name: { type: String, required: true },
        margin_percentage: { type: Number, default: 0 },
        margin_fixed: { type: Number, default: 0 },
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    }
);

export default mongoose.model<IJeweller>('Jeweller', JewellerSchema);
