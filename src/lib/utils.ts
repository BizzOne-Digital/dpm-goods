import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(input: string): string {
  return input
    .toString()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

export function formatPrice(value: number, currency = "USD", locale = "en-US"): string {
  try {
    return new Intl.NumberFormat(locale, { style: "currency", currency }).format(value || 0);
  } catch {
    return `$${(value || 0).toFixed(2)}`;
  }
}

export function formatDate(value: string | Date | undefined, locale = "en-US"): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(locale, { month: "short", day: "numeric", year: "numeric" });
}

export function isValidObjectId(id: unknown): id is string {
  return typeof id === "string" && /^[a-f\d]{24}$/i.test(id);
}

export function discountPercent(price: number, compareAt?: number | null): number {
  if (!compareAt || compareAt <= price) return 0;
  return Math.round(((compareAt - price) / compareAt) * 100);
}

export function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/** Converts Mongoose lean docs (ObjectIds, Dates) into plain JSON for client components. */
export function toPlain<T>(value: unknown): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function siteUrl(path = ""): string {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  return `${base}${path}`;
}
