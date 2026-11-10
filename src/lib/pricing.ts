// Pure order math shared by the cart UI and the server checkout (server is authoritative).

export type PricingConfig = {
  flatShippingRate: number;
  freeShippingThreshold: number;
  taxRate: number; // percent, e.g. 8.25
};

export type PromoRule = {
  code: string;
  discountType: "percent" | "fixed";
  discountValue: number;
  minSubtotal: number;
};

const round = (n: number) => Math.round(n * 100) / 100;

export function computeDiscount(subtotal: number, promo?: PromoRule | null): number {
  if (!promo || subtotal < (promo.minSubtotal || 0)) return 0;
  const raw = promo.discountType === "percent" ? (subtotal * promo.discountValue) / 100 : promo.discountValue;
  return round(Math.min(Math.max(raw, 0), subtotal));
}

export function computeTotals(subtotal: number, discount: number, cfg: PricingConfig) {
  const afterDiscount = Math.max(subtotal - discount, 0);
  const shipping = subtotal === 0 ? 0 : cfg.freeShippingThreshold > 0 && afterDiscount >= cfg.freeShippingThreshold ? 0 : cfg.flatShippingRate;
  const tax = round((afterDiscount * (cfg.taxRate || 0)) / 100);
  return {
    subtotal: round(subtotal),
    discount: round(discount),
    shipping: round(shipping),
    tax,
    total: round(afterDiscount + shipping + tax),
  };
}
