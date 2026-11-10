"use client";

import { createContext, useCallback, useContext, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import { getDictionaryFor, INTL_LOCALE, type Dictionary, type Locale } from "@/lib/i18n/config";
import { LOCALE_COOKIE } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";

type I18nContextValue = {
  locale: Locale;
  t: Dictionary;
  setLocale: (locale: Locale) => void;
  switching: boolean;
  currency: string;
  price: (value: number) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({
  locale,
  currency = "USD",
  children,
}: {
  locale: Locale;
  currency?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [switching, startTransition] = useTransition();

  const setLocale = useCallback(
    (next: Locale) => {
      document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
      document.documentElement.lang = next;
      // Re-render server components in place so the user stays on the current page.
      startTransition(() => router.refresh());
    },
    [router]
  );

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      t: getDictionaryFor(locale),
      setLocale,
      switching,
      currency,
      price: (v: number) => formatPrice(v, currency, INTL_LOCALE[locale]),
    }),
    [locale, setLocale, switching, currency]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}
