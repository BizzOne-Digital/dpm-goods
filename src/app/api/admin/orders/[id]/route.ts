import { z } from "zod";
import { connectDB } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/auth";
import { ApiError, handleApiError, ok, readJson } from "@/lib/api";
import { ORDER_STATUSES } from "@/lib/constants";
import { restockOrder } from "@/lib/orders";
import { isValidObjectId } from "@/lib/utils";
import Order from "@/models/Order";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

const patchSchema = z.object({
  status: z.enum(ORDER_STATUSES).optional(),
  trackingNumber: z.string().trim().max(100).optional(),
  notes: z.string().trim().max(2000).optional(),
  note: z.string().trim().max(300).optional(),
});

export async function GET(_request: Request, { params }: Ctx) {
  try {
    await requireAdmin();
    const { id } = await params;
    if (!isValidObjectId(id)) throw new ApiError("Invalid id", 400);
    await connectDB();
    const item = await Order.findById(id).populate("user", "name email").lean();
    if (!item) throw new ApiError("Order not found", 404);
    return ok({ item });
  } catch (error) {
    return handleApiError(error);
  }
}

/** Update status/tracking. Cancelling or refunding returns items to stock once. */
export async function PATCH(request: Request, { params }: Ctx) {
  try {
    await requireAdmin();
    const { id } = await params;
    if (!isValidObjectId(id)) throw new ApiError("Invalid id", 400);
    const input = patchSchema.parse(await readJson(request));
    await connectDB();
    const order = await Order.findById(id);
    if (!order) throw new ApiError("Order not found", 404);

    if (input.status && input.status !== order.status) {
      const wasReleased = ["cancelled", "refunded"].includes(order.status);
      const willRelease = ["cancelled", "refunded"].includes(input.status);
      if (willRelease && !wasReleased) await restockOrder(order.items);
      if (!willRelease && wasReleased) throw new ApiError("Cancelled or refunded orders cannot be reopened. Create a new order instead.", 409);
      order.status = input.status;
      order.statusHistory.push({ status: input.status, at: new Date(), note: input.note || "Updated by admin" });
    }
    if (input.trackingNumber !== undefined) order.trackingNumber = input.trackingNumber;
    if (input.notes !== undefined) order.notes = input.notes;
    await order.save();
    return ok({ item: order.toObject() });
  } catch (error) {
    return handleApiError(error);
  }
}
