"use client";

import { createContext, useContext } from "react";
import type { Locale } from "@/lib/i18n/config";
import { I18nProvider } from "./I18nProvider";
import { CartProvider } from "./CartProvider";
import { WishlistProvider } from "./WishlistProvider";

export type StoreConfig = {
  currency: string;
  flatShippingRate: number;
  freeShippingThreshold: number;
  taxRate: number;
  signedIn: boolean;
  customerName?: string;
};

const StoreConfigContext = createContext<StoreConfig | null>(null);

export function useStoreConfig() {
  const ctx = useContext(StoreConfigContext);
  if (!ctx) throw new Error("useStoreConfig must be used inside SiteProviders");
  return ctx;
}

export function SiteProviders({
  locale,
  config,
  children,
}: {
  locale: Locale;
  config: StoreConfig;
  children: React.ReactNode;
}) {
  return (
    <StoreConfigContext.Provider value={config}>
      <I18nProvider locale={locale} currency={config.currency}>
        <CartProvider signedIn={config.signedIn}>
          <WishlistProvider signedIn={config.signedIn}>{children}</WishlistProvider>
        </CartProvider>
      </I18nProvider>
    </StoreConfigContext.Provider>
  );
}
