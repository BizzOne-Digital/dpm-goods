import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/mongodb";
import { fail, handleApiError, ok, readJson } from "@/lib/api";
import { ADMIN_COOKIE } from "@/lib/constants";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { sessionCookieOptions, signSession } from "@/lib/session";
import { loginSchema } from "@/lib/validation";
import Admin from "@/models/Admin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    if (!rateLimit(clientKey(request, "admin-login"), 5)) return fail("Too many attempts. Please wait a minute and try again.", 429);
    const { email, password } = loginSchema.parse(await readJson(request));
    await connectDB();
    const admin = await Admin.findOne({ email }).select("+passwordHash");
    if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) return fail("Invalid email or password.", 401);
    admin.lastLoginAt = new Date();
    await admin.save();
    const token = await signSession({ sub: String(admin._id), kind: "admin", email: admin.email, name: admin.name });
    (await cookies()).set(ADMIN_COOKIE, token, { ...sessionCookieOptions, maxAge: 60 * 60 * 12 });
    return ok();
  } catch (error) {
    return handleApiError(error);
  }
}
