import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/mongodb";
import { fail, handleApiError, ok, readJson } from "@/lib/api";
import { CUSTOMER_COOKIE } from "@/lib/constants";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { sessionCookieOptions, signSession } from "@/lib/session";
import { loginSchema } from "@/lib/validation";
import User from "@/models/User";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    if (!rateLimit(clientKey(request, "login"), 8)) return fail("Too many attempts. Please wait a minute and try again.", 429);
    const { email, password } = loginSchema.parse(await readJson(request));
    await connectDB();
    const user = await User.findOne({ email, active: true }).select("+passwordHash");
    // Same message for unknown email and wrong password.
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) return fail("Invalid email or password.", 401);
    const token = await signSession({ sub: String(user._id), kind: "customer", email: user.email, name: user.name });
    (await cookies()).set(CUSTOMER_COOKIE, token, sessionCookieOptions);
    return ok({ user: { name: user.name, email: user.email } });
  } catch (error) {
    return handleApiError(error);
  }
}
