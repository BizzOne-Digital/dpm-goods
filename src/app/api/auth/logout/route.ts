import { NextResponse, type NextRequest } from "next/server";
import { CUSTOMER_COOKIE } from "@/lib/constants";

export const runtime = "nodejs";

function clear(res: NextResponse) {
  res.cookies.set(CUSTOMER_COOKIE, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 0 });
  return res;
}

export async function POST() {
  return clear(NextResponse.json({ success: true }));
}

/** Used for server-side redirects when a session is no longer valid. */
export async function GET(request: NextRequest) {
  const next = request.nextUrl.searchParams.get("next") ?? "/login";
  const safe = next.startsWith("/") && !next.startsWith("//") ? next : "/login";
  return clear(NextResponse.redirect(new URL(safe, request.url)));
}
