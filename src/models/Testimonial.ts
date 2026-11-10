import mongoose, { Schema, type Model } from "mongoose";

export interface ITestimonial {
  _id: mongoose.Types.ObjectId;
  name: string;
  avatar?: string;
  rating: number;
  review: string;
  published: boolean;
  sortOrder: number;
}

const TestimonialSchema = new Schema<ITestimonial>(
  {
    name: { type: String, required: true, trim: true },
    avatar: String,
    rating: { type: Number, default: 5, min: 1, max: 5 },
    review: { type: String, required: true },
    published: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Testimonial: Model<ITestimonial> =
  mongoose.models.Testimonial || mongoose.model<ITestimonial>("Testimonial", TestimonialSchema);
export default Testimonial;
