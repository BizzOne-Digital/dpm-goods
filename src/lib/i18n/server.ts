import "server-only";
import { cookies } from "next/headers";
import { LOCALE_COOKIE } from "@/lib/constants";
import { DEFAULT_LOCALE, getDictionaryFor, isLocale, type Locale } from "./config";

export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export async function getDictionary() {
  const locale = await getLocale();
  return { locale, t: getDictionaryFor(locale) };
}
