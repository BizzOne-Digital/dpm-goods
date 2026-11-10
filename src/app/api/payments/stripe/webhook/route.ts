import { connectDB } from "@/lib/mongodb";
import { fail, ok } from "@/lib/api";
import { restockOrder } from "@/lib/orders";
import { verifyStripeSignature } from "@/lib/payments";
import Order from "@/models/Order";

export const runtime = "nodejs";

/** Stripe webhook: marks orders paid (or cancels expired sessions). Configure STRIPE_WEBHOOK_SECRET. */
export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return fail("Webhook not configured", 503);

  const payload = await request.text();
  if (!verifyStripeSignature(payload, request.headers.get("stripe-signature"), secret)) return fail("Invalid signature", 400);

  try {
    const event = JSON.parse(payload) as { type: string; data: { object: { id: string; client_reference_id?: string; payment_status?: string } } };
    const session = event.data.object;
    await connectDB();

    if (event.type === "checkout.session.completed" && session.payment_status === "paid") {
      await Order.updateOne(
        { _id: session.client_reference_id, status: "pending" },
        { status: "paid", paymentReference: session.id, $push: { statusHistory: { status: "paid", at: new Date(), note: "Payment confirmed by Stripe" } } }
      );
    }

    if (event.type === "checkout.session.expired") {
      const order = await Order.findOne({ _id: session.client_reference_id, status: "pending" });
      if (order) {
        await restockOrder(order.items);
        order.status = "cancelled";
        order.statusHistory.push({ status: "cancelled", at: new Date(), note: "Payment session expired" });
        await order.save();
      }
    }
    return ok({ received: true });
  } catch (error) {
    console.error("[stripe-webhook]", error);
    return fail("Webhook handling failed", 500);
  }
}
