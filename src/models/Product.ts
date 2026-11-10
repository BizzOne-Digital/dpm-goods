import mongoose, { Schema, type Model } from "mongoose";

export interface IProduct {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  shortDescription?: string;
  description?: string;
  sku?: string;
  category: string;
  subCategory?: string;
  gender: "men" | "women" | "unisex";
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  stock: number;
  sizes: string[];
  colors: string[];
  images: string[];
  featuredImage?: string;
  tags: string[];
  featured: boolean;
  bestSeller: boolean;
  newArrival: boolean;
  published: boolean;
  rating: number;
  reviewCount: number;
  salesCount: number;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    shortDescription: String,
    description: String,
    sku: { type: String, trim: true },
    category: { type: String, required: true, index: true },
    subCategory: String,
    gender: { type: String, enum: ["men", "women", "unisex"], default: "unisex", index: true },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 },
    costPrice: { type: Number, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
    sizes: { type: [String], default: [] },
    colors: { type: [String], default: [] },
    images: { type: [String], default: [] },
    featuredImage: String,
    tags: { type: [String], default: [] },
    featured: { type: Boolean, default: false },
    bestSeller: { type: Boolean, default: false },
    newArrival: { type: Boolean, default: false },
    published: { type: Boolean, default: true, index: true },
    rating: { type: Number, default: 5, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    salesCount: { type: Number, default: 0 },
    seoTitle: String,
    seoDescription: String,
  },
  { timestamps: true }
);

const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);
export default Product;
