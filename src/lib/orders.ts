import "server-only";
import { randomBytes } from "crypto";
import type { z } from "zod";
import { ApiError } from "@/lib/api";
import { connectDB } from "@/lib/mongodb";
import { computeDiscount, computeTotals, type PromoRule } from "@/lib/pricing";
import { escapeRegex, isValidObjectId } from "@/lib/utils";
import type { checkoutSchema } from "@/lib/validation";
import { defaultSettings } from "@/lib/demo-data";
import { Order, Product, Promotion, WebsiteSettings } from "@/models";
import type { IOrderItem } from "@/models/Order";

export async function findActivePromo(code: string): Promise<PromoRule | null> {
  if (!code) return null;
  await connectDB();
  const now = new Date();
  const promo = await Promotion.findOne({
    code: { $regex: `^${escapeRegex(code.trim())}$`, $options: "i" },
    enabled: true,
    discountValue: { $gt: 0 },
    $and: [
      { $or: [{ startsAt: null }, { startsAt: { $exists: false } }, { startsAt: { $lte: now } }] },
      { $or: [{ endsAt: null }, { endsAt: { $exists: false } }, { endsAt: { $gte: now } }] },
    ],
  }).lean();
  if (!promo?.code) return null;
  return { code: promo.code, discountType: promo.discountType, discountValue: promo.discountValue, minSubtotal: promo.minSubtotal ?? 0 };
}

function orderNumber() {
  const d = new Date();
  const ymd = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  return `DPM-${ymd}-${randomBytes(3).toString("hex").toUpperCase()}`;
}

type CheckoutInput = z.infer<typeof checkoutSchema>;

/**
 * Creates an order with server-side prices, stock checks and promo validation.
 * The client's prices are never trusted.
 */
export async function createOrder(input: CheckoutInput, userId?: string | null) {
  await connectDB();
  const ids = [...new Set(input.items.map((i) => i.productId))];
  if (!ids.every(isValidObjectId)) throw new ApiError("Some items in your cart are no longer available. Please refresh your cart.", 409);

  const products = await Product.find({ _id: { $in: ids }, published: true }).lean();
  const byId = new Map(products.map((p) => [String(p._id), p]));

  const items: IOrderItem[] = [];
  for (const line of input.items) {
    const p = byId.get(line.productId);
    if (!p) throw new ApiError("Some items in your cart are no longer available. Please refresh your cart.", 409);
    if (p.sizes?.length && (!line.size || !p.sizes.includes(line.size))) throw new ApiError(`Please choose a valid size for ${p.name}.`, 422);
    if (p.colors?.length && line.color && !p.colors.includes(line.color)) throw new ApiError(`Please choose a valid color for ${p.name}.`, 422);
    const alreadyRequested = items.filter((i) => i.productId === line.productId).reduce((n, i) => n + i.quantity, 0);
    if (p.stock < alreadyRequested + line.quantity) throw new ApiError(`Only ${p.stock} left of ${p.name}.`, 409);
    items.push({
      productId: String(p._id),
      slug: p.slug,
      name: p.name,
      image: p.featuredImage || p.images?.[0],
      sku: p.sku,
      size: line.size,
      color: line.color,
      quantity: line.quantity,
      unitPrice: p.price,
    });
  }

  const subtotal = items.reduce((n, i) => n + i.unitPrice * i.quantity, 0);
  const promo = input.promoCode ? await findActivePromo(input.promoCode) : null;
  if (input.promoCode && !promo) throw new ApiError("That promo code is not valid.", 422);
  const discount = computeDiscount(subtotal, promo);

  const settingsDoc = await WebsiteSettings.findOne().lean();
  const settings = { ...defaultSettings, ...(settingsDoc ?? {}) };
  const totals = computeTotals(subtotal, discount, settings);

  // Reserve stock atomically; roll back if any line fails.
  const reserved: { id: string; qty: number }[] = [];
  for (const item of items) {
    const res = await Product.updateOne({ _id: item.productId, stock: { $gte: item.quantity } }, { $inc: { stock: -item.quantity, salesCount: item.quantity } });
    if (res.modifiedCount !== 1) {
      await Promise.all(reserved.map((r) => Product.updateOne({ _id: r.id }, { $inc: { stock: r.qty, salesCount: -r.qty } })));
      throw new ApiError(`${item.name} just sold out. Please update your cart.`, 409);
    }
    reserved.push({ id: item.productId, qty: item.quantity });
  }

  const order = await Order.create({
    orderNumber: orderNumber(),
    user: userId && isValidObjectId(userId) ? userId : null,
    email: input.contact.email,
    phone: input.contact.phone,
    shippingAddress: input.shipping,
    items,
    ...totals,
    currency: settings.currency || "USD",
    promoCode: promo?.code,
    status: "pending",
    statusHistory: [{ status: "pending", at: new Date(), note: "Order placed" }],
  });

  return order;
}

/** Returns stock when an order is cancelled or refunded. */
export async function restockOrder(items: IOrderItem[]) {
  await Promise.all(items.map((i) => (isValidObjectId(i.productId) ? Product.updateOne({ _id: i.productId }, { $inc: { stock: i.quantity, salesCount: -i.quantity } }) : null)));
}
