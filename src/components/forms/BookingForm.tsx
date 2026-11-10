"use client";

import { useState } from "react";
import { CalendarCheck, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/components/providers/I18nProvider";
import { cn } from "@/lib/utils";

const TIMES = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

export default function BookingForm({ bookingTypes }: { bookingTypes: string[] }) {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [time, setTime] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const today = new Date().toISOString().slice(0, 10);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!time) {
      setErrors({ time: t.forms.required });
      return;
    }
    const body = { ...Object.fromEntries(new FormData(e.currentTarget).entries()), time };
    setLoading(true);
    setErrors({});
    try {
      const res = await fetch("/api/bookings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (data.success) {
        toast.success(t.forms.booked);
        setDone(true);
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

  if (done) {
    return (
      <div className="flex flex-col items-center py-10 text-center" role="status">
        <CheckCircle2 className="h-14 w-14 text-emerald-600" aria-hidden="true" />
        <h2 className="mt-4 text-2xl font-extrabold">{t.forms.booked}</h2>
        <button
          type="button"
          className="btn-outline mt-6"
          onClick={() => {
            setDone(false);
            setTime("");
          }}
        >
          {t.forms.book}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label htmlFor="b-type" className="label">
          {t.forms.bookingType} <span className="text-primary">*</span>
        </label>
        <select id="b-type" name="bookingType" required className="input" defaultValue="">
          <option value="" disabled>
            -
          </option>
          {bookingTypes.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="b-name" className="label">
          {t.forms.name} <span className="text-primary">*</span>
        </label>
        <input id="b-name" name="name" required autoComplete="name" className="input" />
        {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
      </div>
      <div>
        <label htmlFor="b-email" className="label">
          {t.forms.email} <span className="text-primary">*</span>
        </label>
        <input id="b-email" name="email" type="email" required autoComplete="email" className="input" />
        {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
      </div>
      <div>
        <label htmlFor="b-phone" className="label">
          {t.forms.phone}
        </label>
        <input id="b-phone" name="phone" type="tel" autoComplete="tel" className="input" />
      </div>
      <div>
        <label htmlFor="b-date" className="label">
          {t.forms.date} <span className="text-primary">*</span>
        </label>
        <input id="b-date" name="date" type="date" min={today} required className="input" />
        {errors.date && <p className="mt-1 text-xs text-red-600">{errors.date}</p>}
      </div>
      <fieldset className="sm:col-span-2">
        <legend className="label">
          {t.forms.time} <span className="text-primary">*</span>
        </legend>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {TIMES.map((slot) => (
            <button
              key={slot}
              type="button"
              aria-pressed={time === slot}
              onClick={() => setTime(slot)}
              className={cn("min-h-11 rounded-md border text-sm font-medium transition", time === slot ? "border-primary bg-primary text-white" : "border-line hover:border-primary")}
            >
              {slot}
            </button>
          ))}
        </div>
        {errors.time && <p className="mt-1 text-xs text-red-600">{errors.time}</p>}
      </fieldset>
      <div className="sm:col-span-2">
        <label htmlFor="b-message" className="label">
          {t.forms.message}
        </label>
        <textarea id="b-message" name="message" rows={4} maxLength={2000} className="input" />
      </div>
      <div className="sm:col-span-2">
        <button type="submit" disabled={loading} className="btn-primary h-12 w-full">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarCheck className="h-4 w-4" aria-hidden="true" />}
          {t.forms.book}
        </button>
      </div>
    </form>
  );
}
