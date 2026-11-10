"use client";

import { Truck } from "lucide-react";
import { useI18n } from "@/components/providers/I18nProvider";
import { useStoreConfig } from "@/components/providers/SiteProviders";

export default function FreeShippingBar({ subtotal }: { subtotal: number }) {
  const { t, price } = useI18n();
  const { freeShippingThreshold } = useStoreConfig();
  if (!freeShippingThreshold) return null;
  const remaining = Math.max(freeShippingThreshold - subtotal, 0);
  const pct = Math.min((subtotal / freeShippingThreshold) * 100, 100);

  return (
    <div className="rounded-lg bg-cream p-3">
      <p className="flex items-center gap-2 text-xs font-medium text-ink">
        <Truck className="h-4 w-4 text-primary" aria-hidden="true" />
        {remaining > 0 ? t.cart.freeShippingProgress.replace("{amount}", price(remaining)) : t.cart.freeShippingUnlocked}
      </p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-beige" aria-hidden="true">
        <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
