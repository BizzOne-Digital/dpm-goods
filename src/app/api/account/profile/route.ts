import { cookies } from "next/headers";
import { connectDB } from "@/lib/mongodb";
import { requireCustomer } from "@/lib/auth";
import { fail, handleApiError, ok, readJson } from "@/lib/api";
import { CUSTOMER_COOKIE } from "@/lib/constants";
import { sessionCookieOptions, signSession } from "@/lib/session";
import { profileSchema } from "@/lib/validation";
import User from "@/models/User";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await requireCustomer();
    const user = await User.findById(session.sub).select("name email phone addresses").lean();
    if (!user) return fail("Account not found", 404);
    return ok({ user });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: Request) {
  try {
    const session = await requireCustomer();
    const data = profileSchema.parse(await readJson(request));
    await connectDB();
    if (await User.exists({ email: data.email, _id: { $ne: session.sub } })) return fail("That email is already used by another account.", 409);
    const user = await User.findByIdAndUpdate(session.sub, data, { new: true }).select("name email phone");
    if (!user) return fail("Account not found", 404);
    // Refresh the session so the header shows the new name/email.
    const token = await signSession({ sub: String(user._id), kind: "customer", email: user.email, name: user.name });
    (await cookies()).set(CUSTOMER_COOKIE, token, sessionCookieOptions);
    return ok({ user });
  } catch (error) {
    return handleApiError(error);
  }
}
