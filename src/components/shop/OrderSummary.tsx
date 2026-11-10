"use client";

import SmartImage from "@/components/ui/SmartImage";
import { useI18n } from "@/components/providers/I18nProvider";
import type { CartItem } from "@/types";

export function TotalsTable({ totals, promoCode }: { totals: { subtotal: number; discount: number; shipping: number; tax: number; total: number }; promoCode?: string }) {
  const { t, price } = useI18n();
  return (
    <dl className="space-y-2.5 text-sm">
      <div className="flex justify-between">
        <dt className="text-muted">{t.cart.subtotal}</dt>
        <dd className="font-semibold">{price(totals.subtotal)}</dd>
      </div>
      {totals.discount > 0 && (
        <div className="flex justify-between text-emerald-700">
          <dt>
            {t.cart.discount} {promoCode && <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-xs font-bold">{promoCode}</span>}
          </dt>
          <dd className="font-semibold">-{price(totals.discount)}</dd>
        </div>
      )}
      <div className="flex justify-between">
        <dt className="text-muted">{t.cart.shipping}</dt>
        <dd className="font-semibold">{totals.shipping === 0 ? t.cart.free : price(totals.shipping)}</dd>
      </div>
      {totals.tax > 0 && (
        <div className="flex justify-between">
          <dt className="text-muted">{t.cart.taxes}</dt>
          <dd className="font-semibold">{price(totals.tax)}</dd>
        </div>
      )}
      <div className="flex justify-between border-t border-line pt-3 text-base">
        <dt className="font-bold">{t.cart.total}</dt>
        <dd className="font-extrabold text-primary">{price(totals.total)}</dd>
      </div>
    </dl>
  );
}

export function MiniItems({ items }: { items: CartItem[] }) {
  const { price } = useI18n();
  return (
    <ul className="divide-y divide-line">
      {items.map((i) => (
        <li key={i.key} className="flex items-center gap-3 py-3">
          <span className="relative h-16 w-14 shrink-0 overflow-hidden rounded-md bg-cream">
            <SmartImage src={i.image} alt={i.name} fill sizes="56px" className="object-cover" />
            <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-ink px-1 text-[10px] font-bold text-white">{i.quantity}</span>
          </span>
          <div className="min-w-0 flex-1">
            <p className="line-clamp-1 text-sm font-semibold">{i.name}</p>
            <p className="text-xs text-muted">{[i.size, i.color].filter(Boolean).join(" / ")}</p>
          </div>
          <span className="text-sm font-semibold">{price(i.price * i.quantity)}</span>
        </li>
      ))}
    </ul>
  );
}
