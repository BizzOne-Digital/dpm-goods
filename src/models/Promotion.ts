import mongoose, { Schema, type Model } from "mongoose";

export interface IPromotion {
  _id: mongoose.Types.ObjectId;
  label?: string;
  title: string;
  subtitle?: string;
  discountText?: string;
  discountLabel?: string;
  ctaText?: string;
  ctaUrl?: string;
  image?: string;
  enabled: boolean;
  placement: string;
  code?: string;
  discountType: "percent" | "fixed";
  discountValue: number;
  minSubtotal: number;
  startsAt?: Date;
  endsAt?: Date;
}

const PromotionSchema = new Schema<IPromotion>(
  {
    label: { type: String, default: "Limited-Time Offer" },
    title: { type: String, required: true },
    subtitle: String,
    discountText: String,
    discountLabel: { type: String, default: "Up to" },
    ctaText: String,
    ctaUrl: String,
    image: String,
    enabled: { type: Boolean, default: true },
    placement: { type: String, default: "home" },
    code: { type: String, uppercase: true, trim: true },
    discountType: { type: String, enum: ["percent", "fixed"], default: "percent" },
    discountValue: { type: Number, default: 0 },
    minSubtotal: { type: Number, default: 0 },
    startsAt: Date,
    endsAt: Date,
  },
  { timestamps: true }
);

const Promotion: Model<IPromotion> = mongoose.models.Promotion || mongoose.model<IPromotion>("Promotion", PromotionSchema);
export default Promotion;
