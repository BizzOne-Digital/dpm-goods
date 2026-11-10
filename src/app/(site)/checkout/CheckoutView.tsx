"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CreditCard, Loader2, Lock, ShoppingBag, Tag, X } from "lucide-react";
import { toast } from "sonner";
import { MiniItems, TotalsTable } from "@/components/shop/OrderSummary";
import { PaymentMethods } from "@/components/icons/BrandIcons";
import { EmptyState, Skeleton } from "@/components/ui/Primitives";
import { useCart } from "@/components/providers/CartProvider";
import { useI18n } from "@/components/providers/I18nProvider";
import { useStoreConfig } from "@/components/providers/SiteProviders";
import { computeTotals } from "@/lib/pricing";

type FormState = Record<"email" | "phone" | "firstName" | "lastName" | "address" | "apartment" | "city" | "state" | "zip" | "country", string>;

const EMPTY: FormState = { email: "", phone: "", firstName: "", lastName: "", address: "", apartment: "", city: "", state: "", zip: "", country: "United States" };

export default function CheckoutView() {
  const { items, ready, subtotal, clear } = useCart();
  const { t } = useI18n();
  const cfg = useStoreConfig();
  const router = useRouter();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [promoInput, setPromoInput] = useState("");
  const [promo, setPromo] = useState<{ code: string; discount: number } | null>(null);
  const [checkingPromo, setCheckingPromo] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Prefill from the customer account when signed in.
  useEffect(() => {
    if (!cfg.signedIn) return;
    fetch("/api/account/profile")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data?.success) return;
        const u = data.user;
        const addr = (u.addresses ?? []).find((a: { isDefault?: boolean }) => a.isDefault) ?? u.addresses?.[0] ?? {};
        setForm((f) => ({
          ...f,
          email: u.email ?? f.email,
          phone: u.phone ?? addr.phone ?? f.phone,
          firstName: addr.firstName ?? u.name?.split(" ")[0] ?? "",
          lastName: addr.lastName ?? u.name?.split(" ").slice(1).join(" ") ?? "",
          address: addr.address ?? "",
          apartment: addr.apartment ?? "",
          city: addr.city ?? "",
          state: addr.state ?? "",
          zip: addr.zip ?? "",
          country: addr.country ?? f.country,
        }));
      })
      .catch(() => undefined);
  }, [cfg.signedIn]);

  // Re-validate the promo if the cart changes.
  const discount = promo ? promo.discount : 0;
  const totals = computeTotals(subtotal, Math.min(discount, subtotal), cfg);

  const set = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const applyPromo = async () => {
    if (!promoInput.trim()) return;
    setCheckingPromo(true);
    try {
      const res = await fetch("/api/checkout/promo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoInput.trim(), subtotal }),
      });
      const data = await res.json();
      if (data.success) {
        setPromo({ code: data.code, discount: data.discount });
        toast.success(`${data.code}: -${data.discount.toFixed(2)}`);
      } else {
        setPromo(null);
        toast.error(data.message);
      }
    } catch {
      toast.error(t.common.error);
    } finally {
      setCheckingPromo(false);
    }
  };

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, size: i.size, color: i.color, quantity: i.quantity })),
          contact: { email: form.email, phone: form.phone },
          shipping: {
            firstName: form.firstName,
            lastName: form.lastName,
            address: form.address,
            apartment: form.apartment,
            city: form.city,
            state: form.state,
            zip: form.zip,
            country: form.country,
          },
          promoCode: promo?.code,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setErrors(data.errors ?? {});
        toast.error(data.message || t.common.error);
        return;
      }
      if (data.redirectUrl && /^https:\/\//.test(data.redirectUrl)) {
        // External hosted payment page (e.g. Stripe Checkout). Cart is cleared on the success page.
        window.location.href = data.redirectUrl;
        return;
      }
      clear();
      router.push(`/checkout/success?order=${encodeURIComponent(data.orderNumber)}`);
    } catch {
      toast.error(t.common.error);
    } finally {
      setSubmitting(false);
    }
  };

  if (!ready) {
    return (
      <div className="container-x grid gap-8 py-12 lg:grid-cols-[1fr_400px]">
        <Skeleton className="h-[600px]" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-x py-14">
        <EmptyState icon={ShoppingBag} title={t.cart.empty} description={t.cart.emptyHint} actionText={t.cart.continue} actionHref="/shop" />
      </div>
    );
  }

  const input = (key: keyof FormState, label: string, { className: wrapperClass, ...props }: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div className={wrapperClass}>
      <label htmlFor={`co-${key}`} className="label">
        {label}
        {props.required && <span className="text-primary"> *</span>}
      </label>
      <input
        id={`co-${key}`}
        value={form[key]}
        onChange={set(key)}
        className="input h-11"
        aria-invalid={Boolean(errors[`shipping.${key}`] || errors[`contact.${key}`])}
        {...props}
      />
      {(errors[`shipping.${key}`] || errors[`contact.${key}`]) && <p className="mt-1 text-xs text-red-600">{errors[`shipping.${key}`] || errors[`contact.${key}`]}</p>}
    </div>
  );

  return (
    <div className="bg-cream/50">
      <form onSubmit={placeOrder} className="container-x grid gap-8 py-10 lg:grid-cols-[1fr_420px] lg:py-14">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-extrabold">{t.checkout.title}</h1>
            {!cfg.signedIn && (
              <Link href="/login?next=/checkout" className="text-sm font-semibold text-primary hover:underline">
                {t.account.signIn}
              </Link>
            )}
          </div>

          <section className="card p-6" aria-labelledby="co-contact">
            <h2 id="co-contact" className="mb-4 text-lg font-bold">1. {t.checkout.contact}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {input("email", t.checkout.email, { type: "email", required: true, autoComplete: "email" })}
              {input("phone", t.checkout.phone, { type: "tel", autoComplete: "tel" })}
            </div>
          </section>

          <section className="card p-6" aria-labelledby="co-shipping">
            <h2 id="co-shipping" className="mb-4 text-lg font-bold">2. {t.checkout.shipping}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {input("firstName", t.checkout.firstName, { required: true, autoComplete: "given-name" })}
              {input("lastName", t.checkout.lastName, { required: true, autoComplete: "family-name" })}
              {input("address", t.checkout.address, { required: true, autoComplete: "address-line1", className: "sm:col-span-2" })}
              {input("apartment", t.checkout.apartment, { autoComplete: "address-line2", className: "sm:col-span-2" })}
              {input("city", t.checkout.city, { required: true, autoComplete: "address-level2" })}
              {input("state", t.checkout.state, { required: true, autoComplete: "address-level1" })}
              {input("zip", t.checkout.zip, { required: true, autoComplete: "postal-code", inputMode: "numeric" })}
              <div>
                <label htmlFor="co-country" className="label">{t.checkout.country} <span className="text-primary">*</span></label>
                <select id="co-country" value={form.country} onChange={set("country")} className="input h-11" autoComplete="country-name">
                  {["United States", "Canada", "United Kingdom", "Mexico", "Australia"].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <section className="card p-6" aria-labelledby="co-payment">
            <h2 id="co-payment" className="mb-2 flex items-center gap-2 text-lg font-bold">
              3. {t.checkout.payment}
            </h2>
            <div className="rounded-lg border border-primary/40 bg-cream/60 p-4">
              <p className="flex items-center gap-2 font-semibold">
                <CreditCard className="h-5 w-5 text-primary" aria-hidden="true" /> Card, PayPal &amp; wallets
              </p>
              <p className="mt-1 text-sm text-muted">{t.checkout.paymentNote}</p>
              <PaymentMethods className="mt-3" />
            </div>
          </section>
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start" aria-label={t.checkout.summary}>
          <div className="card space-y-5 p-6">
            <h2 className="text-lg font-extrabold">{t.checkout.summary}</h2>
            <MiniItems items={items} />

            <div>
              <label htmlFor="promo" className="label">{t.checkout.promo}</label>
              {promo ? (
                <div className="flex items-center justify-between rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm">
                  <span className="flex items-center gap-2 font-semibold text-emerald-700"><Tag className="h-4 w-4" aria-hidden="true" /> {promo.code}</span>
                  <button type="button" onClick={() => setPromo(null)} aria-label="Remove promo code" className="text-emerald-700 hover:text-red-600">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input id="promo" value={promoInput} onChange={(e) => setPromoInput(e.target.value.toUpperCase())} className="input h-11 uppercase" placeholder="SEASON15" />
                  <button type="button" onClick={applyPromo} disabled={checkingPromo} className="btn-dark h-11 px-4">
                    {checkingPromo ? <Loader2 className="h-4 w-4 animate-spin" /> : t.checkout.apply}
                  </button>
                </div>
              )}
            </div>

            <TotalsTable totals={totals} promoCode={promo?.code} />

            <button type="submit" disabled={submitting} className="btn-primary h-12 w-full text-base">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" aria-hidden="true" />}
              {submitting ? t.checkout.processing : t.checkout.placeOrder}
            </button>
            <p className="text-center text-xs text-muted">{t.checkout.secure}</p>
          </div>
        </aside>
      </form>
    </div>
  );
}
