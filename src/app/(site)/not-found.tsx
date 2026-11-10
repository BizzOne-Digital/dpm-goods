import Link from "next/link";
import { Search } from "lucide-react";
import { getDictionary } from "@/lib/i18n/server";

export default async function NotFound() {
  const { t } = await getDictionary();
  return (
    <section className="container-x flex flex-col items-center py-24 text-center">
      <p className="font-display text-7xl font-extrabold text-beige sm:text-8xl">404</p>
      <h1 className="mt-4 text-3xl font-extrabold">{t.common.notFound}</h1>
      <p className="mt-2 max-w-md text-muted">{t.common.notFoundText}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn-primary">{t.common.backHome}</Link>
        <Link href="/shop" className="btn-outline"><Search className="h-4 w-4" /> {t.nav.shop}</Link>
      </div>
    </section>
  );
}
