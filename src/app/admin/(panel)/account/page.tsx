"use client";

import { useEffect, useState } from "react";
import { Loader2, Save, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/Primitives";
import { adminFetch } from "@/lib/admin/client";
import { formatDate } from "@/lib/utils";

type AdminRow = { _id: string; name: string; email: string; role: string; lastLoginAt?: string; createdAt?: string };

export default function AdminAccountPage() {
  const [me, setMe] = useState<AdminRow | null>(null);
  const [admins, setAdmins] = useState<AdminRow[]>([]);
  const [form, setForm] = useState({ name: "", email: "", currentPassword: "", newPassword: "" });
  const [invite, setInvite] = useState({ name: "", email: "", password: "" });
  const [saving, setSaving] = useState(false);
  const [adding, setAdding] = useState(false);

  const load = () =>
    adminFetch<{ me: AdminRow; admins: AdminRow[] }>("/api/admin/account").then((res) => {
      if (!res.success) return toast.error(res.message);
      setMe(res.me);
      setAdmins(res.admins);
      setForm((f) => ({ ...f, name: res.me.name, email: res.me.email }));
    });

  useEffect(() => {
    load();
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await adminFetch("/api/admin/account", { method: "PUT", body: JSON.stringify(form) });
    setSaving(false);
    if (!res.success) return toast.error(res.message);
    toast.success("Admin settings saved");
    setForm((f) => ({ ...f, currentPassword: "", newPassword: "" }));
  };

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    const res = await adminFetch("/api/admin/account", { method: "POST", body: JSON.stringify(invite) });
    setAdding(false);
    if (!res.success) return toast.error(res.message);
    toast.success("Admin added. Share the password securely, not over chat.");
    setInvite({ name: "", email: "", password: "" });
    load();
  };

  if (!me) return <Skeleton className="h-96 w-full" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">Admin Settings</h1>
        <p className="text-sm text-muted">Your login details and admin users.</p>
      </div>

      <form onSubmit={save} className="card grid gap-4 p-6 md:grid-cols-2">
        <h2 className="font-bold md:col-span-2">Your account</h2>
        <div>
          <label htmlFor="ad-name" className="label">Name</label>
          <input id="ad-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="input" />
        </div>
        <div>
          <label htmlFor="ad-email" className="label">Email</label>
          <input id="ad-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="input" autoComplete="username" />
        </div>
        <div>
          <label htmlFor="ad-new" className="label">New password (optional, 10+ characters)</label>
          <input id="ad-new" type="password" minLength={10} value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} className="input" autoComplete="new-password" />
        </div>
        <div>
          <label htmlFor="ad-cur" className="label">Current password (required to save)</label>
          <input id="ad-cur" type="password" value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} required className="input" autoComplete="current-password" />
        </div>
        <div className="md:col-span-2">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save
          </button>
        </div>
      </form>

      <section className="card overflow-hidden">
        <h2 className="border-b border-line p-4 font-bold">Admin users</h2>
        <ul className="divide-y divide-line">
          {admins.map((a) => (
            <li key={a._id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
              <div>
                <p className="font-semibold">{a.name} {a._id === me._id && <span className="text-xs text-muted">(you)</span>}</p>
                <p className="text-xs text-muted">{a.email}</p>
              </div>
              <div className="text-right text-xs text-muted">
                <span className="rounded bg-cream px-2 py-0.5 font-semibold capitalize text-ink">{a.role}</span>
                <p className="mt-1">Last login: {a.lastLoginAt ? formatDate(a.lastLoginAt) : "Never"}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {me.role === "owner" && (
        <form onSubmit={add} className="card grid gap-4 p-6 md:grid-cols-3">
          <h2 className="font-bold md:col-span-3">Add an admin</h2>
          <input aria-label="Name" placeholder="Name" value={invite.name} onChange={(e) => setInvite({ ...invite, name: e.target.value })} required className="input" />
          <input aria-label="Email" type="email" placeholder="Email" value={invite.email} onChange={(e) => setInvite({ ...invite, email: e.target.value })} required className="input" />
          <input aria-label="Temporary password" type="password" placeholder="Temporary password (10+)" minLength={10} value={invite.password} onChange={(e) => setInvite({ ...invite, password: e.target.value })} required className="input" autoComplete="new-password" />
          <div className="md:col-span-3">
            <button type="submit" disabled={adding} className="btn-dark">
              {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />} Add admin
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
