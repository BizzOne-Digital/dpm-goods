import type { Metadata, Viewport } from "next";
import { Inter, Manrope } from "next/font/google";
import { Toaster } from "sonner";
import { getSettings } from "@/lib/data";
import { getLocale } from "@/lib/i18n/server";
import { normalizeImageUrl } from "@/lib/image-url";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"], weight: ["500", "600", "700", "800"], display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const title = settings.seoTitle || `${settings.siteName} | ${settings.companyName}`;
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
    title: { default: title, template: `%s | ${settings.siteName}` },
    description: settings.seoDescription,
    applicationName: settings.siteName,
    icons: settings.favicon ? { icon: normalizeImageUrl(settings.favicon) } : undefined,
    openGraph: { siteName: settings.siteName, type: "website", locale: "en_US" },
  };
}

export const viewport: Viewport = {
  themeColor: "#3a1c0f",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  return (
    <html lang={locale} className={`${inter.variable} ${manrope.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        {children}
        <Toaster position="top-center" richColors closeButton toastOptions={{ className: "font-sans" }} />
      </body>
    </html>
  );
}
