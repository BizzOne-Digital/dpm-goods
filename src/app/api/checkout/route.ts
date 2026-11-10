import { getCustomerSession } from "@/lib/auth";
import { fail, handleApiError, ok, readJson } from "@/lib/api";
import { createOrder, restockOrder } from "@/lib/orders";
import { createPaymentSession } from "@/lib/payments";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { checkoutSchema } from "@/lib/validation";
import Order from "@/models/Order";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    if (!rateLimit(clientKey(request, "checkout"), 10)) return fail("Too many checkout attempts. Please wait a moment.", 429);
    const input = checkoutSchema.parse(await readJson(request));
    const session = await getCustomerSession();
    const order = await createOrder(input, session?.sub);

    try {
      const payment = await createPaymentSession({
        id: String(order._id),
        orderNumber: order.orderNumber,
        email: order.email,
        currency: order.currency,
        items: order.items.map((i) => ({ name: [i.name, i.size, i.color].filter(Boolean).join(" - "), unitPrice: i.unitPrice, quantity: i.quantity })),
        shipping: order.shipping,
        tax: order.tax,
        discount: order.discount,
      });
      order.paymentProvider = payment.provider;
      if (payment.reference) order.paymentReference = payment.reference;
      await order.save();
      return ok({ orderNumber: order.orderNumber, redirectUrl: payment.redirectUrl ?? null }, 201);
    } catch {
      // Payment session could not be created: release stock and cancel the order.
      await restockOrder(order.items);
      await Order.updateOne({ _id: order._id }, { status: "cancelled", $push: { statusHistory: { status: "cancelled", at: new Date(), note: "Payment session failed" } } });
      return fail("We couldn't start the payment. Please try again.", 502);
    }
  } catch (error) {
    return handleApiError(error);
  }
}
