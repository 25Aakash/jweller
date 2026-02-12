import mongoose, { Schema, Document } from 'mongoose';

export interface ISilverPriceConfig extends Document {
    jeweller_id: string;
    base_mcx_price: number;
    jeweller_margin_percent: number;
    jeweller_margin_fixed: number;
    final_price: number;
    effective_date: Date;
    updated_by: mongoose.Types.ObjectId;
    created_at: Date;
    updated_at: Date;
}

const SilverPriceConfigSchema = new Schema<ISilverPriceConfig>(
    {
        jeweller_id: { type: String, required: true, index: true },
        base_mcx_price: { type: Number, required: true },
        jeweller_margin_percent: { type: Number, default: 0 },
        jeweller_margin_fixed: { type: Number, default: 0 },
        final_price: { type: Number, required: true },
        effective_date: { type: Date, required: true },
        updated_by: { type: Schema.Types.ObjectId, ref: 'User' },
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    }
);

SilverPriceConfigSchema.index({ jeweller_id: 1, effective_date: -1 });
SilverPriceConfigSchema.index({ jeweller_id: 1, effective_date: 1 }, { unique: true });

export default mongoose.model<ISilverPriceConfig>('SilverPriceConfig', SilverPriceConfigSchema);
