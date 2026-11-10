import { z } from "zod";
import { getCustomerSession, requireCustomer } from "@/lib/auth";
import { handleApiError, ok, readJson } from "@/lib/api";
import { isDbConfigured } from "@/lib/mongodb";
import { cartItemSchema } from "@/lib/validation";
import User from "@/models/User";

export const runtime = "nodejs";

export async function GET() {
  try {
    if (!(await getCustomerSession()) || !isDbConfigured()) return ok({ items: [] });
    const session = await requireCustomer();
    const user = await User.findById(session.sub).select("cart").lean();
    return ok({ items: user?.cart ?? [] });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: Request) {
  try {
    const session = await requireCustomer();
    const { items } = z.object({ items: z.array(cartItemSchema).max(50) }).parse(await readJson(request));
    await User.updateOne({ _id: session.sub }, { cart: items });
    return ok();
  } catch (error) {
    return handleApiError(error);
  }
}
