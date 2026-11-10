"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/components/providers/I18nProvider";

export default function AuthForm({ mode }: { mode: "login" | "register" }) {
  const { t } = useI18n();
  const router = useRouter();
  const params = useSearchParams();
  const rawNext = params.get("next") ?? "/account";
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/account";
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      const body = Object.fromEntries(new FormData(e.currentTarget).entries());
      const res = await fetch(`/api/auth/${mode}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!data.success) {
        setErrors(data.errors ?? {});
        toast.error(data.message || t.common.error);
        return;
      }
      toast.success(mode === "login" ? t.account.welcome : t.account.register);
      router.replace(next);
      router.refresh();
    } catch {
      toast.error(t.common.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {mode === "register" && (
        <div>
          <label htmlFor="a-name" className="label">{t.account.name}</label>
          <input id="a-name" name="name" required autoComplete="name" className="input h-11" />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
        </div>
      )}
      <div>
        <label htmlFor="a-email" className="label">{t.account.email}</label>
        <input id="a-email" name="email" type="email" required autoComplete="email" className="input h-11" />
        {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
      </div>
      <div>
        <label htmlFor="a-password" className="label">{t.account.password}</label>
        <div className="relative">
          <input
            id="a-password"
            name="password"
            type={show ? "text" : "password"}
            required
            minLength={mode === "register" ? 8 : 1}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            className="input h-11 pr-11"
          />
          <button type="button" onClick={() => setShow((v) => !v)} className="absolute right-1 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center text-muted" aria-label={show ? "Hide password" : "Show password"}>
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {mode === "register" && <p className="mt-1 text-xs text-muted">At least 8 characters.</p>}
        {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
      </div>
      <button type="submit" disabled={loading} className="btn-primary h-12 w-full">
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {mode === "login" ? t.account.signIn : t.account.register}
      </button>
      <p className="text-center text-sm text-muted">
        {mode === "login" ? t.account.noAccount : t.account.haveAccount}{" "}
        <Link href={`/${mode === "login" ? "register" : "login"}${next !== "/account" ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-semibold text-primary hover:underline">
          {mode === "login" ? t.account.register : t.account.signIn}
        </Link>
      </p>
    </form>
  );
}
