import en, { type Dictionary } from "./dictionaries/en";
import es from "./dictionaries/es";

export const LOCALES = ["en", "es"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_LABELS: Record<Locale, string> = { en: "English", es: "Español" };
export const INTL_LOCALE: Record<Locale, string> = { en: "en-US", es: "es-US" };

const dictionaries: Record<Locale, Dictionary> = { en, es };

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

export function getDictionaryFor(locale: Locale): Dictionary {
  return dictionaries[locale] ?? en;
}

export type { Dictionary };
