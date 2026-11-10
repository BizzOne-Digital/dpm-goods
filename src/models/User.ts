import mongoose, { Schema, type Model } from "mongoose";

const AddressSchema = new Schema(
  {
    label: { type: String, default: "Home" },
    firstName: String,
    lastName: String,
    address: String,
    apartment: String,
    city: String,
    state: String,
    zip: String,
    country: { type: String, default: "United States" },
    phone: String,
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

const CartItemSchema = new Schema(
  {
    key: String,
    productId: String,
    slug: String,
    name: String,
    image: String,
    price: Number,
    size: String,
    color: String,
    quantity: Number,
  },
  { _id: false }
);

export interface IUser {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  passwordHash: string;
  addresses: Array<Record<string, unknown>>;
  wishlist: string[];
  cart: Array<Record<string, unknown>>;
  active: boolean;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    passwordHash: { type: String, required: true, select: false },
    addresses: { type: [AddressSchema], default: [] },
    wishlist: { type: [String], default: [] },
    cart: { type: [CartItemSchema], default: [] },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
export default User;
