import mongoose, { Schema, type Model } from "mongoose";

export interface IContactMessage {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  status: "new" | "read" | "resolved";
  createdAt: Date;
}

const ContactMessageSchema = new Schema<IContactMessage>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    phone: String,
    subject: String,
    message: { type: String, required: true },
    status: { type: String, enum: ["new", "read", "resolved"], default: "new" },
  },
  { timestamps: true }
);

const ContactMessage: Model<IContactMessage> =
  mongoose.models.ContactMessage || mongoose.model<IContactMessage>("ContactMessage", ContactMessageSchema);
export default ContactMessage;
