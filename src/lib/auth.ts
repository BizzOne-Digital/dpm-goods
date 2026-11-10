import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, CUSTOMER_COOKIE } from "@/lib/constants";
import { verifySession, type SessionPayload } from "@/lib/session";
import { ApiError } from "@/lib/api";
import { connectDB, isDbConfigured } from "@/lib/mongodb";
import Admin from "@/models/Admin";
import User from "@/models/User";

/** Reads and verifies the admin session, then confirms the admin still exists. */
export async function getAdminSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const session = await verifySession(store.get(ADMIN_COOKIE)?.value, "admin");
  if (!session || !isDbConfigured()) return null;
  try {
    await connectDB();
    const exists = await Admin.exists({ _id: session.sub });
    return exists ? session : null;
  } catch {
    return null;
  }
}

/** Use in every protected admin API route. Throws 401 when not authenticated. */
export async function requireAdmin(): Promise<SessionPayload> {
  const session = await getAdminSession();
  if (!session) throw new ApiError("Unauthorized", 401);
  return session;
}

/** Use in admin server components/layouts. Redirects to the login page. */
export async function requireAdminPage(): Promise<SessionPayload> {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return session;
}

export async function getCustomerSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  return verifySession(store.get(CUSTOMER_COOKIE)?.value, "customer");
}

export async function requireCustomer(): Promise<SessionPayload> {
  const session = await getCustomerSession();
  if (!session) throw new ApiError("Please sign in to continue.", 401);
  await connectDB();
  const exists = await User.exists({ _id: session.sub, active: true });
  if (!exists) throw new ApiError("Please sign in to continue.", 401);
  return session;
}

export async function requireCustomerPage(next = "/account"): Promise<SessionPayload> {
  const session = await getCustomerSession();
  if (!session) redirect(`/login?next=${encodeURIComponent(next)}`);
  return session;
}
