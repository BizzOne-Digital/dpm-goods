"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/components/providers/I18nProvider";

export default function ProfileForm({ initial }: { initial: { name: string; email: string; phone: string } }) {
  const { t } = useI18n();
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [pw, setPw] = useState({ currentPassword: "", newPassword: "" });
  const [saving, setSaving] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/account/profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (data.success) {
        toast.success(t.account.saved);
        router.refresh();
      } else toast.error(data.message);
    } catch {
      toast.error(t.common.error);
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPw(true);
    try {
      const res = await fetch("/api/account/password", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(pw) });
      const data = await res.json();
      if (data.success) {
        toast.success(t.account.saved);
        setPw({ currentPassword: "", newPassword: "" });
      } else toast.error(data.message);
    } catch {
      toast.error(t.common.error);
    } finally {
      setSavingPw(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={save} className="card grid gap-4 p-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="p-name" className="label">{t.account.name}</label>
          <input id="p-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="input h-11" autoComplete="name" />
        </div>
        <div>
          <label htmlFor="p-email" className="label">{t.account.email}</label>
          <input id="p-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="input h-11" autoComplete="email" />
        </div>
        <div>
          <label htmlFor="p-phone" className="label">{t.account.phone}</label>
          <input id="p-phone" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input h-11" autoComplete="tel" />
        </div>
        <div className="sm:col-span-2">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />} {t.account.save}
          </button>
        </div>
      </form>

      <form onSubmit={changePassword} className="card grid gap-4 p-6 sm:grid-cols-2">
        <h2 className="text-lg font-bold sm:col-span-2">{t.account.password}</h2>
        <div>
          <label htmlFor="p-cur" className="label">{t.account.currentPassword}</label>
          <input id="p-cur" type="password" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} required className="input h-11" autoComplete="current-password" />
        </div>
        <div>
          <label htmlFor="p-new" className="label">{t.account.newPassword}</label>
          <input id="p-new" type="password" minLength={8} value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} required className="input h-11" autoComplete="new-password" />
        </div>
        <div className="sm:col-span-2">
          <button type="submit" disabled={savingPw} className="btn-dark">
            {savingPw && <Loader2 className="h-4 w-4 animate-spin" />} {t.account.save}
          </button>
        </div>
      </form>
    </div>
  );
}
