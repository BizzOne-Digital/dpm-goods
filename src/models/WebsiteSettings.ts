import mongoose, { Schema, type Model } from "mongoose";

export interface IWebsiteSettings {
  _id: mongoose.Types.ObjectId;
  siteName: string;
  companyName: string;
  logo?: string;
  favicon?: string;
  announcementText: string;
  announcementEnabled: boolean;
  email?: string;
  phone?: string;
  address?: string;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  youtube?: string;
  currency: string;
  defaultLanguage: string;
  shippingText?: string;
  returnsText?: string;
  footerDescription?: string;
  seoTitle?: string;
  seoDescription?: string;
  flatShippingRate: number;
  freeShippingThreshold: number;
  taxRate: number;
  bookingTypes: string[];
}

const WebsiteSettingsSchema = new Schema<IWebsiteSettings>(
  {
    siteName: { type: String, default: "Universal UPM Goods" },
    companyName: { type: String, default: "Direct Primary Merchandises LLC" },
    logo: String,
    favicon: String,
    announcementText: { type: String, default: "Seasonal Discount • New Arrivals Weekly • Fast Shipping" },
    announcementEnabled: { type: Boolean, default: true },
    email: String,
    phone: String,
    address: String,
    instagram: String,
    facebook: String,
    tiktok: String,
    youtube: String,
    currency: { type: String, default: "USD" },
    defaultLanguage: { type: String, default: "en" },
    shippingText: String,
    returnsText: String,
    footerDescription: String,
    seoTitle: String,
    seoDescription: String,
    flatShippingRate: { type: Number, default: 6.99 },
    freeShippingThreshold: { type: Number, default: 75 },
    taxRate: { type: Number, default: 0 },
    bookingTypes: { type: [String], default: [] },
  },
  { timestamps: true }
);

const WebsiteSettings: Model<IWebsiteSettings> =
  mongoose.models.WebsiteSettings || mongoose.model<IWebsiteSettings>("WebsiteSettings", WebsiteSettingsSchema);
export default WebsiteSettings;
