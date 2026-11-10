import bcrypt from "bcryptjs";
import { requireCustomer } from "@/lib/auth";
import { fail, handleApiError, ok, readJson } from "@/lib/api";
import { passwordSchema } from "@/lib/validation";
import User from "@/models/User";

export const runtime = "nodejs";

export async function PUT(request: Request) {
  try {
    const session = await requireCustomer();
    const { currentPassword, newPassword } = passwordSchema.parse(await readJson(request));
    const user = await User.findById(session.sub).select("+passwordHash");
    if (!user || !(await bcrypt.compare(currentPassword, user.passwordHash))) return fail("Current password is incorrect.", 400);
    user.passwordHash = await bcrypt.hash(newPassword, 12);
    await user.save();
    return ok();
  } catch (error) {
    return handleApiError(error);
  }
}
