import mongoose, { Schema, type Model } from "mongoose";

export interface INewsletterSubscriber {
  _id: mongoose.Types.ObjectId;
  email: string;
  source?: string;
  active: boolean;
  createdAt: Date;
}

const NewsletterSubscriberSchema = new Schema<INewsletterSubscriber>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    source: { type: String, default: "website" },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const NewsletterSubscriber: Model<INewsletterSubscriber> =
  mongoose.models.NewsletterSubscriber ||
  mongoose.model<INewsletterSubscriber>("NewsletterSubscriber", NewsletterSubscriberSchema);
export default NewsletterSubscriber;
