"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ShoppingBag, X } from "lucide-react";
import SmartImage from "@/components/ui/SmartImage";
import QuantityControl from "@/components/shop/QuantityControl";
import FreeShippingBar from "@/components/shop/FreeShippingBar";
import { useCart } from "@/components/providers/CartProvider";
import { useI18n } from "@/components/providers/I18nProvider";

export default function CartDrawer() {
  const { items, drawerOpen, setDrawerOpen, updateQuantity, removeItem, subtotal, count } = useCart();
  const { t, price } = useI18n();

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDrawerOpen(false);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [drawerOpen, setDrawerOpen]);

  if (!drawerOpen) return null;

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label={t.cart.title}>
      <button type="button" aria-label={t.nav.close} className="absolute inset-0 animate-fade-in bg-ink/50" onClick={() => setDrawerOpen(false)} />
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-2xl" style={{ animation: "fade-in .25s ease-out" }}>
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-lg font-extrabold">
            {t.cart.title} <span className="text-sm font-medium text-muted">({count})</span>
          </h2>
          <button type="button" onClick={() => setDrawerOpen(false)} className="grid h-10 w-10 place-items-center rounded-full hover:bg-cream" aria-label={t.nav.close}>
            <X className="h-5 w-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-cream text-primary">
              <ShoppingBag className="h-7 w-7" />
            </span>
            <p className="font-semibold">{t.cart.empty}</p>
            <p className="text-sm text-muted">{t.cart.emptyHint}</p>
            <Link href="/shop" className="btn-primary mt-2" onClick={() => setDrawerOpen(false)}>
              {t.cart.continue}
            </Link>
          </div>
        ) : (
          <>
            <div className="px-5 pt-4">
              <FreeShippingBar subtotal={subtotal} />
            </div>
            <ul className="flex-1 divide-y divide-line overflow-y-auto px-5">
              {items.map((item) => (
                <li key={item.key} className="flex gap-4 py-4">
                  <Link href={`/shop/${item.slug}`} onClick={() => setDrawerOpen(false)} className="relative h-24 w-20 shrink-0 overflow-hidden rounded-lg bg-cream">
                    <SmartImage src={item.image} alt={item.name} fill sizes="80px" className="object-cover" />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex justify-between gap-2">
                      <Link href={`/shop/${item.slug}`} onClick={() => setDrawerOpen(false)} className="line-clamp-2 text-sm font-semibold hover:text-primary">
                        {item.name}
                      </Link>
                      <span className="text-sm font-bold">{price(item.price * item.quantity)}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted">{[item.size, item.color].filter(Boolean).join(" / ")}</p>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <QuantityControl value={item.quantity} onChange={(q) => updateQuantity(item.key, q)} size="sm" />
                      <button type="button" onClick={() => removeItem(item.key)} className="text-xs font-medium text-muted underline-offset-2 hover:text-red-600 hover:underline">
                        {t.cart.remove}
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="space-y-3 border-t border-line bg-cream/40 p-5">
              <div className="flex justify-between text-sm">
                <span>{t.cart.subtotal}</span>
                <span className="font-bold">{price(subtotal)}</span>
              </div>
              <p className="text-xs text-muted">
                {t.cart.shipping} &amp; {t.cart.taxes.toLowerCase()}: {t.cart.calculatedAtCheckout}
              </p>
              <Link href="/checkout" onClick={() => setDrawerOpen(false)} className="btn-primary w-full">
                {t.cart.checkout}
              </Link>
              <Link href="/cart" onClick={() => setDrawerOpen(false)} className="btn-outline w-full">
                {t.cart.title}
              </Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
