import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
import { siteUrl } from "@/lib/utils";

/**
 * Payment provider abstraction. Secrets are read server-side only.
 * - With STRIPE_SECRET_KEY set: creates a hosted Stripe Checkout Session (no SDK needed).
 * - Without it: "manual" mode — the order is created as `pending` and the team confirms payment
 *   (useful for invoicing/pay-on-confirmation while the provider is being set up).
 */

export type PaymentOrder = {
  id: string;
  orderNumber: string;
  email: string;
  currency: string;
  items: { name: string; unitPrice: number; quantity: number }[];
  shipping: number;
  tax: number;
  discount: number;
};

export type PaymentSession = { provider: "stripe" | "manual"; redirectUrl?: string; reference?: string };

export function activeProvider(): "stripe" | "manual" {
  return process.env.STRIPE_SECRET_KEY ? "stripe" : "manual";
}

const cents = (n: number) => Math.round(n * 100);

export async function createPaymentSession(order: PaymentOrder): Promise<PaymentSession> {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return { provider: "manual" };

  const params = new URLSearchParams();
  params.set("mode", "payment");
  params.set("customer_email", order.email);
  params.set("client_reference_id", order.id);
  params.set("metadata[orderNumber]", order.orderNumber);
  params.set("success_url", siteUrl(`/checkout/success?order=${encodeURIComponent(order.orderNumber)}`));
  params.set("cancel_url", siteUrl("/checkout"));

  const lines = [...order.items.map((i) => ({ name: i.name, amount: cents(i.unitPrice), qty: i.quantity }))];
  if (order.shipping > 0) lines.push({ name: "Shipping", amount: cents(order.shipping), qty: 1 });
  if (order.tax > 0) lines.push({ name: "Tax", amount: cents(order.tax), qty: 1 });
  lines.forEach((l, idx) => {
    params.set(`line_items[${idx}][price_data][currency]`, order.currency.toLowerCase());
    params.set(`line_items[${idx}][price_data][product_data][name]`, l.name.slice(0, 120));
    params.set(`line_items[${idx}][price_data][unit_amount]`, String(l.amount));
    params.set(`line_items[${idx}][quantity]`, String(l.qty));
  });
  if (order.discount > 0) {
    // One-off coupon for the computed discount amount.
    const couponRes = await fetch("https://api.stripe.com/v1/coupons", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ amount_off: String(cents(order.discount)), currency: order.currency.toLowerCase(), duration: "once" }),
    });
    const coupon = await couponRes.json();
    if (coupon?.id) params.set("discounts[0][coupon]", coupon.id);
  }

  const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });
  const data = await res.json();
  if (!res.ok || !data?.url) {
    console.error("[payments] Stripe session failed", data?.error?.message);
    throw new Error("Payment provider error");
  }
  return { provider: "stripe", redirectUrl: data.url as string, reference: data.id as string };
}

/** Verifies a Stripe webhook signature header (t=...,v1=...). */
export function verifyStripeSignature(payload: string, header: string | null, secret: string, toleranceSec = 300): boolean {
  if (!header) return false;
  const parts = Object.fromEntries(header.split(",").map((p) => p.split("=") as [string, string]));
  const timestamp = Number(parts.t);
  if (!timestamp || Math.abs(Date.now() / 1000 - timestamp) > toleranceSec) return false;
  const expected = createHmac("sha256", secret).update(`${timestamp}.${payload}`).digest("hex");
  const signatures = header
    .split(",")
    .filter((p) => p.startsWith("v1="))
    .map((p) => p.slice(3));
  return signatures.some((sig) => {
    try {
      return timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expected, "hex"));
    } catch {
      return false;
    }
  });
}
