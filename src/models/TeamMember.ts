import mongoose, { Schema, type Model } from "mongoose";

export interface ITeamMember {
  _id: mongoose.Types.ObjectId;
  name: string;
  role: string;
  bio?: string;
  photo?: string;
  socialLinks: { instagram?: string; linkedin?: string; email?: string };
  published: boolean;
  sortOrder: number;
}

const TeamMemberSchema = new Schema<ITeamMember>(
  {
    name: { type: String, required: true, trim: true },
    role: { type: String, required: true },
    bio: String,
    photo: String,
    socialLinks: { instagram: String, linkedin: String, email: String },
    published: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const TeamMember: Model<ITeamMember> =
  mongoose.models.TeamMember || mongoose.model<ITeamMember>("TeamMember", TeamMemberSchema);
export default TeamMember;
