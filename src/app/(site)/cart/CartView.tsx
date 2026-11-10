"use client";

import Link from "next/link";
import { ArrowRight, Lock, ShoppingBag, Trash2 } from "lucide-react";
import SmartImage from "@/components/ui/SmartImage";
import QuantityControl from "@/components/shop/QuantityControl";
import FreeShippingBar from "@/components/shop/FreeShippingBar";
import { TotalsTable } from "@/components/shop/OrderSummary";
import { EmptyState, Skeleton } from "@/components/ui/Primitives";
import { useCart } from "@/components/providers/CartProvider";
import { useI18n } from "@/components/providers/I18nProvider";
import { useStoreConfig } from "@/components/providers/SiteProviders";
import { computeTotals } from "@/lib/pricing";

export default function CartView() {
  const { items, ready, updateQuantity, removeItem, subtotal, count } = useCart();
  const { t, price } = useI18n();
  const cfg = useStoreConfig();
  const totals = computeTotals(subtotal, 0, cfg);

  return (
    <div className="container-x py-10 sm:py-14">
      <h1 className="text-3xl font-extrabold sm:text-4xl">
        {t.cart.title} {ready && count > 0 && <span className="text-lg font-medium text-muted">({count} {count === 1 ? t.cart.item : t.cart.items})</span>}
      </h1>

      {!ready ? (
        <div className="mt-8 space-y-4">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      ) : items.length === 0 ? (
        <div className="mt-8">
          <EmptyState icon={ShoppingBag} title={t.cart.empty} description={t.cart.emptyHint} actionText={t.cart.continue} actionHref="/shop" />
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
          <div>
            <div className="hidden grid-cols-[1fr_140px_120px_40px] gap-4 border-b border-line pb-3 text-xs font-semibold uppercase tracking-wider text-muted md:grid">
              <span>Product</span>
              <span>{t.product.quantity}</span>
              <span className="text-right">{t.cart.total}</span>
              <span />
            </div>
            <ul className="divide-y divide-line">
              {items.map((item) => (
                <li key={item.key} className="grid grid-cols-[88px_1fr] gap-4 py-5 md:grid-cols-[1fr_140px_120px_40px] md:items-center">
                  <div className="contents md:flex md:items-center md:gap-4">
                    <Link href={`/shop/${item.slug}`} className="relative h-28 w-[88px] shrink-0 overflow-hidden rounded-lg bg-cream">
                      <SmartImage src={item.image} alt={item.name} fill sizes="88px" className="object-cover" />
                    </Link>
                    <div className="min-w-0">
                      <Link href={`/shop/${item.slug}`} className="font-semibold hover:text-primary">{item.name}</Link>
                      <p className="mt-0.5 text-sm text-muted">{[item.size && `${t.product.size}: ${item.size}`, item.color && `${t.product.color}: ${item.color}`].filter(Boolean).join(" · ")}</p>
                      <p className="mt-1 text-sm font-semibold text-primary">{price(item.price)}</p>
                      <div className="mt-3 flex items-center gap-3 md:hidden">
                        <QuantityControl value={item.quantity} onChange={(q) => updateQuantity(item.key, q)} size="sm" />
                        <button type="button" onClick={() => removeItem(item.key)} className="text-xs text-muted underline">{t.cart.remove}</button>
                      </div>
                    </div>
                  </div>
                  <div className="hidden md:block">
                    <QuantityControl value={item.quantity} onChange={(q) => updateQuantity(item.key, q)} size="sm" />
                  </div>
                  <p className="hidden text-right font-bold md:block">{price(item.price * item.quantity)}</p>
                  <button type="button" onClick={() => removeItem(item.key)} className="hidden h-9 w-9 place-items-center rounded-full text-muted hover:bg-red-50 hover:text-red-600 md:grid" aria-label={`${t.cart.remove} ${item.name}`}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
            <Link href="/shop" className="btn-ghost mt-4 text-primary">← {t.cart.continue}</Link>
          </div>

          <aside className="card h-fit space-y-5 p-6 lg:sticky lg:top-28" aria-label={t.checkout.summary}>
            <h2 className="text-lg font-extrabold">{t.checkout.summary}</h2>
            <FreeShippingBar subtotal={subtotal} />
            <TotalsTable totals={totals} />
            <p className="text-xs text-muted">{t.checkout.promo}: {t.cart.calculatedAtCheckout}</p>
            <Link href="/checkout" className="btn-primary h-12 w-full">
              {t.cart.checkout} <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <p className="flex items-center justify-center gap-1.5 text-xs text-muted"><Lock className="h-3.5 w-3.5" aria-hidden="true" /> {t.checkout.secure}</p>
          </aside>
        </div>
      )}
    </div>
  );
}
