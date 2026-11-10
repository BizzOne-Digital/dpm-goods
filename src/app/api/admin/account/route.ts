import bcrypt from "bcryptjs";
import { z } from "zod";
import { connectDB } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/auth";
import { ApiError, handleApiError, ok, readJson } from "@/lib/api";
import Admin from "@/models/Admin";

export const runtime = "nodejs";

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().email().max(200),
  currentPassword: z.string().min(1, "Current password is required").max(200),
  newPassword: z.union([z.string().min(10, "New password must be at least 10 characters").max(200), z.literal("")]).optional(),
});

const createSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().email().max(200),
  password: z.string().min(10, "Password must be at least 10 characters").max(200),
});

export async function GET() {
  try {
    const session = await requireAdmin();
    await connectDB();
    const [me, admins] = await Promise.all([
      Admin.findById(session.sub).select("name email role lastLoginAt").lean(),
      Admin.find().select("name email role lastLoginAt createdAt").sort({ createdAt: 1 }).lean(),
    ]);
    return ok({ me, admins });
  } catch (error) {
    return handleApiError(error);
  }
}

/** Update own name/email/password (requires current password). */
export async function PUT(request: Request) {
  try {
    const session = await requireAdmin();
    const input = schema.parse(await readJson(request));
    await connectDB();
    const admin = await Admin.findById(session.sub).select("+passwordHash");
    if (!admin || !(await bcrypt.compare(input.currentPassword, admin.passwordHash))) throw new ApiError("Current password is incorrect.", 400);
    if (input.email !== admin.email && (await Admin.exists({ email: input.email }))) throw new ApiError("That email is already used by another admin.", 409);
    admin.name = input.name;
    admin.email = input.email;
    if (input.newPassword) admin.passwordHash = await bcrypt.hash(input.newPassword, 12);
    await admin.save();
    return ok();
  } catch (error) {
    return handleApiError(error);
  }
}

/** Owners can add another admin user. */
export async function POST(request: Request) {
  try {
    const session = await requireAdmin();
    await connectDB();
    const me = await Admin.findById(session.sub).select("role").lean();
    if (me?.role !== "owner") throw new ApiError("Only the owner account can add admins.", 403);
    const input = createSchema.parse(await readJson(request));
    if (await Admin.exists({ email: input.email })) throw new ApiError("An admin with that email already exists.", 409);
    await Admin.create({ name: input.name, email: input.email, passwordHash: await bcrypt.hash(input.password, 12), role: "admin" });
    return ok({}, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
