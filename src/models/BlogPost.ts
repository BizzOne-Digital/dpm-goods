import mongoose, { Schema, type Model } from "mongoose";

export interface IBlogPost {
  _id: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  featuredImage?: string;
  category?: string;
  tags: string[];
  author?: string;
  published: boolean;
  publishedAt?: Date;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: Date;
}

const BlogPostSchema = new Schema<IBlogPost>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    excerpt: String,
    content: String,
    featuredImage: String,
    category: String,
    tags: { type: [String], default: [] },
    author: { type: String, default: "DPM Goods Editorial" },
    published: { type: Boolean, default: false, index: true },
    publishedAt: Date,
    seoTitle: String,
    seoDescription: String,
  },
  { timestamps: true }
);

const BlogPost: Model<IBlogPost> = mongoose.models.BlogPost || mongoose.model<IBlogPost>("BlogPost", BlogPostSchema);
export default BlogPost;
