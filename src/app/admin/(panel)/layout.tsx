import type { Metadata } from "next";
import AdminShell from "@/components/admin/AdminShell";
import { requireAdminPage } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

/** Every page under /admin (except /admin/login) is protected server-side. */
export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdminPage();
  return <AdminShell adminName={session.name || session.email}>{children}</AdminShell>;
}
