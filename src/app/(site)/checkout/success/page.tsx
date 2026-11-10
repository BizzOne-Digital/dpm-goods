import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { getDictionary } from "@/lib/i18n/server";
import { getCustomerSession } from "@/lib/auth";
import { buildMetadata } from "@/lib/seo";
import ClearCartOnMount from "./ClearCartOnMount";

export const metadata = buildMetadata({ title: "Order Confirmed", path: "/checkout/success", noIndex: true });

export default async function SuccessPage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const [{ t }, sp, customer] = await Promise.all([getDictionary(), searchParams, getCustomerSession()]);
  const orderNumber = typeof sp.order === "string" && /^DPM-[A-Z0-9-]{4,30}$/.test(sp.order) ? sp.order : null;

  return (
    <section className="container-x flex flex-col items-center py-20 text-center">
      <ClearCartOnMount />
      <span className="grid h-20 w-20 place-items-center rounded-full bg-emerald-50 text-emerald-600">
        <CheckCircle2 className="h-10 w-10" aria-hidden="true" />
      </span>
      <h1 className="mt-6 text-3xl font-extrabold sm:text-4xl">{t.checkout.successTitle}</h1>
      <p className="mt-3 max-w-md text-ink/75">{t.checkout.successText}</p>
      {orderNumber && (
        <p className="mt-6 rounded-lg bg-cream px-5 py-3 text-sm">
          {t.checkout.orderNumber}: <strong className="font-mono text-base">{orderNumber}</strong>
        </p>
      )}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {customer && (
          <Link href="/account/orders" className="btn-primary">
            {t.checkout.viewOrders}
          </Link>
        )}
        <Link href="/shop" className="btn-outline">
          {t.cart.continue}
        </Link>
      </div>
    </section>
  );
}
