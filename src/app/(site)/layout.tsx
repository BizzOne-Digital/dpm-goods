import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import CartDrawer from "@/components/layout/CartDrawer";
import { SiteProviders } from "@/components/providers/SiteProviders";
import { getSettings } from "@/lib/data";
import { getDictionary } from "@/lib/i18n/server";
import { getCustomerSession } from "@/lib/auth";

// Storefront is rendered per request so admin changes appear immediately.
export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, { locale, t }, customer] = await Promise.all([getSettings(), getDictionary(), getCustomerSession()]);

  return (
    <SiteProviders
      locale={locale}
      config={{
        currency: settings.currency,
        flatShippingRate: settings.flatShippingRate,
        freeShippingThreshold: settings.freeShippingThreshold,
        taxRate: settings.taxRate,
        signedIn: Boolean(customer),
        customerName: customer?.name,
      }}
    >
      <a href="#main" className="sr-only z-[100] rounded bg-primary px-4 py-2 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        Skip to content
      </a>
      {settings.announcementEnabled && settings.announcementText && <AnnouncementBar text={settings.announcementText} />}
      <Header logo={settings.logo} siteName={settings.siteName} companyName={settings.companyName} />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer settings={settings} t={t} />
      <CartDrawer />
    </SiteProviders>
  );
}
