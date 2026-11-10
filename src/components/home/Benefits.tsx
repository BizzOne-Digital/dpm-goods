import { Gem, ShieldCheck, TrendingUp, Truck } from "lucide-react";
import { SectionHeading } from "@/components/ui/Primitives";
import type { Dictionary } from "@/lib/i18n/config";

export default function Benefits({ t }: { t: Dictionary }) {
  const items = [
    { Icon: Gem, title: t.home.qualityPicks, text: t.home.qualityPicksText },
    { Icon: TrendingUp, title: t.home.trendStyles, text: t.home.trendStylesText },
    { Icon: ShieldCheck, title: t.home.secureCheckout, text: t.home.secureCheckoutText },
    { Icon: Truck, title: t.home.fastDelivery, text: t.home.fastDeliveryText },
  ];
  return (
    <section className="bg-cream py-12 sm:py-14" aria-label={t.home.whyShop}>
      <div className="container-x">
        <SectionHeading title={t.home.whyShop} centered />
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map(({ Icon, title, text }) => (
            <li key={title} className="card flex items-start gap-4 p-5 transition hover:-translate-y-0.5 hover:shadow-md">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg text-primary">
                <Icon className="h-9 w-9" strokeWidth={1.4} aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-[15px] font-bold">{title}</h3>
                <p className="mt-1 text-[13px] leading-relaxed text-muted">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
