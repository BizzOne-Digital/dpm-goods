import { fail, handleApiError, ok, readJson } from "@/lib/api";
import { findActivePromo } from "@/lib/orders";
import { computeDiscount } from "@/lib/pricing";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { promoCheckSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    if (!rateLimit(clientKey(request, "promo"), 15)) return fail("Too many attempts. Please wait a moment.", 429);
    const { code, subtotal } = promoCheckSchema.parse(await readJson(request));
    const promo = await findActivePromo(code);
    if (!promo) return fail("That promo code is not valid.", 404);
    if (subtotal < promo.minSubtotal) return fail(`This code requires a minimum order of $${promo.minSubtotal.toFixed(2)}.`, 422);
    return ok({ code: promo.code, discount: computeDiscount(subtotal, promo) });
  } catch (error) {
    return handleApiError(error);
  }
}
