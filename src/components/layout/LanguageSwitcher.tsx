"use client";

import { Globe } from "lucide-react";
import { useI18n } from "@/components/providers/I18nProvider";
import { LOCALES, LOCALE_LABELS, type Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

export default function LanguageSwitcher({ full = false, dark = false }: { full?: boolean; dark?: boolean }) {
  const { locale, setLocale, switching, t } = useI18n();

  if (full) {
    return (
      <div className="flex items-center gap-2" role="group" aria-label={t.nav.language}>
        <Globe className="h-4 w-4 text-muted" aria-hidden="true" />
        {LOCALES.map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => setLocale(l)}
            disabled={switching}
            aria-pressed={locale === l}
            className={cn("rounded-md px-3 py-1.5 text-sm font-medium transition", locale === l ? "bg-primary text-white" : "bg-cream text-ink hover:bg-beige")}
          >
            {LOCALE_LABELS[l]}
          </button>
        ))}
      </div>
    );
  }

  return (
    <label className={cn("relative inline-flex items-center gap-1 rounded-full px-2 py-1.5 text-xs font-semibold", dark ? "text-white" : "text-ink hover:bg-cream")}>
      <Globe className="h-4 w-4" aria-hidden="true" />
      <span className="sr-only">{t.nav.language}</span>
      <select
        value={locale}
        disabled={switching}
        onChange={(e) => setLocale(e.target.value as Locale)}
        className={cn("cursor-pointer appearance-none bg-transparent pr-1 uppercase outline-none", dark && "[&>option]:text-ink")}
      >
        {LOCALES.map((l) => (
          <option key={l} value={l}>
            {l.toUpperCase()}
          </option>
        ))}
      </select>
    </label>
  );
}
