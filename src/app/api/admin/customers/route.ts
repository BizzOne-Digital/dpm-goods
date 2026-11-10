import { connectDB } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/auth";
import { handleApiError, ok } from "@/lib/api";
import { escapeRegex } from "@/lib/utils";
import Order from "@/models/Order";
import User from "@/models/User";

export const runtime = "nodejs";

/** Customer list with order counts and lifetime spend (password hashes are never selected). */
export async function GET(request: Request) {
  try {
    await requireAdmin();
    const url = new URL(request.url);
    const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
    const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit")) || 20));
    const q = url.searchParams.get("q")?.trim();
    const query: Record<string, unknown> = {};
    if (q) {
      const rx = new RegExp(escapeRegex(q.slice(0, 80)), "i");
      query.$or = [{ name: rx }, { email: rx }, { phone: rx }];
    }
    await connectDB();
    const [users, total] = await Promise.all([
      User.find(query).select("name email phone active createdAt").sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      User.countDocuments(query),
    ]);
    const stats = await Order.aggregate([
      { $match: { user: { $in: users.map((u) => u._id) }, status: { $nin: ["cancelled", "refunded"] } } },
      { $group: { _id: "$user", orders: { $sum: 1 }, spent: { $sum: "$total" } } },
    ]);
    const byUser = new Map(stats.map((s) => [String(s._id), s]));
    const items = users.map((u) => ({ ...u, orders: byUser.get(String(u._id))?.orders ?? 0, spent: byUser.get(String(u._id))?.spent ?? 0 }));
    return ok({ items, total, page, pages: Math.max(1, Math.ceil(total / limit)) });
  } catch (error) {
    return handleApiError(error);
  }
}
