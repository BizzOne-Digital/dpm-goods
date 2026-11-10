import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/mongodb";
import { fail, handleApiError, ok, readJson } from "@/lib/api";
import { CUSTOMER_COOKIE } from "@/lib/constants";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { sessionCookieOptions, signSession } from "@/lib/session";
import { registerSchema } from "@/lib/validation";
import User from "@/models/User";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    if (!rateLimit(clientKey(request, "register"), 5)) return fail("Too many attempts. Please try again later.", 429);
    const { name, email, password } = registerSchema.parse(await readJson(request));
    await connectDB();
    if (await User.exists({ email })) return fail("An account with this email already exists.", 409, { email: "Already registered" });
    const user = await User.create({ name, email, passwordHash: await bcrypt.hash(password, 12) });
    const token = await signSession({ sub: String(user._id), kind: "customer", email: user.email, name: user.name });
    (await cookies()).set(CUSTOMER_COOKIE, token, sessionCookieOptions);
    return ok({ user: { name: user.name, email: user.email } }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
