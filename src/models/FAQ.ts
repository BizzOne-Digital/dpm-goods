import mongoose, { Schema, type Model } from "mongoose";

export interface IFAQ {
  _id: mongoose.Types.ObjectId;
  question: string;
  answer: string;
  category: string;
  published: boolean;
  sortOrder: number;
}

const FAQSchema = new Schema<IFAQ>(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
    category: { type: String, default: "General" },
    published: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const FAQ: Model<IFAQ> = mongoose.models.FAQ || mongoose.model<IFAQ>("FAQ", FAQSchema);
export default FAQ;
