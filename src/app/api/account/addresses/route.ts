import { requireCustomer } from "@/lib/auth";
import { fail, handleApiError, ok, readJson } from "@/lib/api";
import { addressesSchema } from "@/lib/validation";
import User from "@/models/User";

export const runtime = "nodejs";

export async function PUT(request: Request) {
  try {
    const session = await requireCustomer();
    const { addresses } = addressesSchema.parse(await readJson(request));
    // Exactly one default address when any exist.
    const defaultIndex = Math.max(addresses.findIndex((a) => a.isDefault), 0);
    const normalized = addresses.map((a, i) => ({ ...a, isDefault: i === defaultIndex }));
    const user = await User.findByIdAndUpdate(session.sub, { addresses: normalized }, { new: true }).select("addresses").lean();
    if (!user) return fail("Account not found", 404);
    return ok({ addresses: JSON.parse(JSON.stringify(user.addresses)) });
  } catch (error) {
    return handleApiError(error);
  }
}
