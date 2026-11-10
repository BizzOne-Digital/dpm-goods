import "server-only";

/**
 * Best-effort in-memory rate limiter (per server instance).
 * On serverless it limits bursts within a warm instance; pair with platform/WAF limits for strict guarantees.
 */
const buckets = new Map<string, { count: number; reset: number }>();

export function rateLimit(key: string, limit = 10, windowMs = 60_000): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.reset < now) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    if (buckets.size > 5000) {
      for (const [k, v] of buckets) if (v.reset < now) buckets.delete(k);
    }
    return true;
  }
  bucket.count += 1;
  return bucket.count <= limit;
}

export function clientKey(request: Request, scope: string): string {
  const fwd = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return `${scope}:${fwd || request.headers.get("x-real-ip") || "local"}`;
}
