import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { isDbConfigured } from "@/lib/mongodb";
import AdminLoginForm from "./AdminLoginForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin Login", robots: { index: false, follow: false } };

export default async function AdminLoginPage() {
  if (await getAdminSession()) redirect("/admin");
  return (
    <main className="grid min-h-screen place-items-center bg-ink px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="font-display text-3xl font-extrabold text-white">
            Universal <span className="text-primary-light">UPM Goods</span>
          </p>
          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-white/50">Admin Dashboard</p>
        </div>
        <div className="rounded-2xl bg-white p-7 shadow-2xl">
          <h1 className="text-xl font-extrabold">Sign in</h1>
          <p className="mb-6 mt-1 text-sm text-muted">Authorized team members only.</p>
          {!isDbConfigured() && (
            <p className="mb-4 rounded-md bg-amber-50 p-3 text-xs text-amber-800" role="alert">
              MONGODB_URI is not configured. Add it to your environment and run <code>npm run seed</code> to create the first admin.
            </p>
          )}
          <AdminLoginForm />
        </div>
      </div>
    </main>
  );
}
