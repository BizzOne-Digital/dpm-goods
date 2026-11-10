import mongoose, { Schema, type Model } from "mongoose";

export interface IPageContent {
  _id: mongoose.Types.ObjectId;
  page: string;
  sectionKey: string;
  title?: string;
  subtitle?: string;
  description?: string;
  image?: string;
  ctaText?: string;
  ctaUrl?: string;
  enabled: boolean;
  sortOrder: number;
  metadata?: Record<string, unknown>;
}

const PageContentSchema = new Schema<IPageContent>(
  {
    page: { type: String, required: true, index: true },
    sectionKey: { type: String, required: true },
    title: String,
    subtitle: String,
    description: String,
    image: String,
    ctaText: String,
    ctaUrl: String,
    enabled: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

PageContentSchema.index({ page: 1, sectionKey: 1 }, { unique: true });

const PageContent: Model<IPageContent> =
  mongoose.models.PageContent || mongoose.model<IPageContent>("PageContent", PageContentSchema);
export default PageContent;
