export const PLACEHOLDER_IMAGE = "/images/placeholder.jpg";

/**
 * Normalizes admin-managed image URLs before rendering.
 * Legacy `/uploads/...` files lived on local disk and disappear on serverless
 * redeploys, so they fall back to the placeholder.
 */
export function normalizeImageUrl(url?: string | null): string {
  if (!url || typeof url !== "string") return PLACEHOLDER_IMAGE;
  const trimmed = url.trim();
  if (!trimmed) return PLACEHOLDER_IMAGE;
  if (trimmed.startsWith("/uploads/")) return PLACEHOLDER_IMAGE;
  if (trimmed.startsWith("/") || trimmed.startsWith("https://")) return trimmed;
  return PLACEHOLDER_IMAGE;
}

export function isStoredUploadUrl(url?: string | null): boolean {
  return typeof url === "string" && url.startsWith("/api/uploads/");
}

/** Unsplash helper so demo imagery is requested at a sensible size. */
export function unsplash(id: string, width = 1200): string {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&q=80`;
}
