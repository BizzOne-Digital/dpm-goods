"use client";

import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/components/providers/I18nProvider";

export default function ContactForm() {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const body = Object.fromEntries(new FormData(form).entries());
    setLoading(true);
    setErrors({});
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (data.success) {
        toast.success(t.forms.sent);
        form.reset();
      } else {
        setErrors(data.errors ?? {});
        toast.error(data.message || t.common.error);
      }
    } catch {
      toast.error(t.common.error);
    } finally {
      setLoading(false);
    }
  };

  const field = (name: string, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div>
      <label htmlFor={`c-${name}`} className="label">
        {label}
        {props.required && <span className="text-primary"> *</span>}
      </label>
      <input id={`c-${name}`} name={name} className="input" aria-invalid={Boolean(errors[name])} aria-describedby={errors[name] ? `c-${name}-err` : undefined} {...props} />
      {errors[name] && <p id={`c-${name}-err`} className="mt-1 text-xs text-red-600">{errors[name]}</p>}
    </div>
  );

  return (
    <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
      {field("name", t.forms.name, { required: true, autoComplete: "name", maxLength: 100 })}
      {field("email", t.forms.email, { required: true, type: "email", autoComplete: "email" })}
      {field("phone", t.forms.phone, { type: "tel", autoComplete: "tel" })}
      {field("subject", t.forms.subject, { maxLength: 150 })}
      <div className="sm:col-span-2">
        <label htmlFor="c-message" className="label">
          {t.forms.message} <span className="text-primary">*</span>
        </label>
        <textarea id="c-message" name="message" required rows={6} maxLength={3000} className="input resize-y" aria-invalid={Boolean(errors.message)} />
        {errors.message && <p className="mt-1 text-xs text-red-600">{errors.message}</p>}
      </div>
      <div className="sm:col-span-2">
        <button type="submit" disabled={loading} className="btn-primary h-12 w-full sm:w-auto sm:px-8">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" aria-hidden="true" />}
          {loading ? t.forms.sending : t.forms.send}
        </button>
      </div>
    </form>
  );
}
