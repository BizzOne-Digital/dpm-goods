"use client";

import { useState } from "react";
import { ArrowRight, Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/components/providers/I18nProvider";

export default function NewsletterForm() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.duplicate ? t.newsletter.duplicate : t.newsletter.success);
        setEmail("");
      } else {
        toast.error(data.message || t.common.error);
      }
    } catch {
      toast.error(t.common.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="mx-auto mt-6 flex w-full max-w-xl flex-col gap-3 sm:flex-row">
      <label htmlFor="newsletter-email" className="sr-only">
        {t.newsletter.placeholder}
      </label>
      <div className="relative flex-1">
        <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
        <input
          id="newsletter-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t.newsletter.placeholder}
          className="input h-12 pl-10"
        />
      </div>
      <button type="submit" disabled={loading} className="btn h-12 border border-white/70 bg-primary-dark px-7 text-white hover:bg-primary">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {t.newsletter.subscribe}
        {!loading && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
      </button>
    </form>
  );
}
