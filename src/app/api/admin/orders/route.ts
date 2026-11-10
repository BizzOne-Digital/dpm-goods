import { connectDB } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/auth";
import { handleApiError, ok } from "@/lib/api";
import { ORDER_STATUSES } from "@/lib/constants";
import { escapeRegex } from "@/lib/utils";
import Order from "@/models/Order";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const url = new URL(request.url);
    const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
    const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit")) || 20));
    const status = url.searchParams.get("status");
    const q = url.searchParams.get("q")?.trim();

    const query: Record<string, unknown> = {};
    if (status && (ORDER_STATUSES as readonly string[]).includes(status)) query.status = status;
    if (q) {
      const rx = new RegExp(escapeRegex(q.slice(0, 80)), "i");
      query.$or = [{ orderNumber: rx }, { email: rx }, { "shippingAddress.lastName": rx }];
    }

    await connectDB();
    const [items, total] = await Promise.all([
      Order.find(query).select("orderNumber email total currency status createdAt items.quantity shippingAddress.firstName shippingAddress.lastName paymentProvider").sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Order.countDocuments(query),
    ]);
    return ok({ items, total, page, pages: Math.max(1, Math.ceil(total / limit)) });
  } catch (error) {
    return handleApiError(error);
  }
}
