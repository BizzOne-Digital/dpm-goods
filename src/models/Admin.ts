import mongoose, { Schema, type Model } from "mongoose";

export interface IAdmin {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  role: "owner" | "admin";
  lastLoginAt?: Date;
}

const AdminSchema = new Schema<IAdmin>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ["owner", "admin"], default: "admin" },
    lastLoginAt: Date,
  },
  { timestamps: true }
);

const Admin: Model<IAdmin> = mongoose.models.Admin || mongoose.model<IAdmin>("Admin", AdminSchema);
export default Admin;
