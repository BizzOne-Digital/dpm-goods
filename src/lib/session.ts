import "server-only";
import { SignJWT, jwtVerify } from "jose";

export type SessionKind = "admin" | "customer";

export type SessionPayload = {
  sub: string;
  kind: SessionKind;
  email: string;
  name?: string;
};

const SESSION_DAYS = 7;

function getSecret(): Uint8Array {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("ADMIN_SESSION_SECRET must be set (32+ characters)");
    }
    // Development-only fallback so the project boots before env is configured.
    return new TextEncoder().encode("dev-only-insecure-secret-change-me-please-0001");
  }
  return new TextEncoder().encode(secret);
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ kind: payload.kind, email: payload.email, name: payload.name })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .setAudience(payload.kind)
    .sign(getSecret());
}

export async function verifySession(token: string | undefined, kind: SessionKind): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret(), { audience: kind, algorithms: ["HS256"] });
    if (!payload.sub || payload.kind !== kind) return null;
    return {
      sub: payload.sub,
      kind,
      email: String(payload.email ?? ""),
      name: payload.name ? String(payload.name) : undefined,
    };
  } catch {
    return null;
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_DAYS * 24 * 60 * 60,
};
