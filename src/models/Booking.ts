import mongoose, { Schema, type Model } from "mongoose";
import { BOOKING_STATUSES } from "@/lib/constants";

export interface IBooking {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  bookingType: string;
  date: string;
  time: string;
  message?: string;
  status: (typeof BOOKING_STATUSES)[number];
  adminNotes?: string;
  createdAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: String,
    bookingType: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    message: String,
    status: { type: String, enum: [...BOOKING_STATUSES], default: "pending", index: true },
    adminNotes: String,
  },
  { timestamps: true }
);

const Booking: Model<IBooking> = mongoose.models.Booking || mongoose.model<IBooking>("Booking", BookingSchema);
export default Booking;
