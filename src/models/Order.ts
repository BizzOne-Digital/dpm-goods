import mongoose, { Schema, type Model } from "mongoose";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/constants";

export interface IOrderItem {
  productId: string;
  slug: string;
  name: string;
  image?: string;
  sku?: string;
  size?: string;
  color?: string;
  quantity: number;
  unitPrice: number;
}

export interface IOrder {
  _id: mongoose.Types.ObjectId;
  orderNumber: string;
  user?: mongoose.Types.ObjectId | null;
  email: string;
  phone?: string;
  shippingAddress: Record<string, string>;
  items: IOrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  currency: string;
  promoCode?: string;
  status: OrderStatus;
  paymentProvider: string;
  paymentReference?: string;
  trackingNumber?: string;
  notes?: string;
  statusHistory: Array<{ status: string; at: Date; note?: string }>;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: String, required: true },
    slug: String,
    name: { type: String, required: true },
    image: String,
    sku: String,
    size: String,
    color: String,
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true },
    user: { type: Schema.Types.ObjectId, ref: "User", default: null, index: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: String,
    shippingAddress: {
      firstName: String,
      lastName: String,
      address: String,
      apartment: String,
      city: String,
      state: String,
      zip: String,
      country: String,
    },
    items: { type: [OrderItemSchema], default: [] },
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    shipping: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, required: true },
    currency: { type: String, default: "USD" },
    promoCode: String,
    status: { type: String, enum: [...ORDER_STATUSES], default: "pending", index: true },
    paymentProvider: { type: String, default: "manual" },
    paymentReference: String,
    trackingNumber: String,
    notes: String,
    statusHistory: { type: [{ status: String, at: Date, note: String }], default: [] },
  },
  { timestamps: true }
);

const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);
export default Order;
