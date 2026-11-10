"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Heart, Menu, Search, ShoppingCart, User, X } from "lucide-react";
import Logo from "@/components/ui/Logo";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";
import { useI18n } from "@/components/providers/I18nProvider";
import { useCart } from "@/components/providers/CartProvider";
import { useWishlist } from "@/components/providers/WishlistProvider";
import { useStoreConfig } from "@/components/providers/SiteProviders";
import type { Dictionary } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

type NavItem = { label: string; href: string; children?: { label: string; href: string }[] };

function buildNav(t: Dictionary): NavItem[] {
  return [
    { label: t.nav.home, href: "/" },
    {
      label: t.nav.shop,
      href: "/shop",
      children: [
        { label: t.nav.allProducts, href: "/shop" },
        { label: t.nav.newArrivals, href: "/shop?new=1&sort=newest" },
        { label: t.nav.bestSellers, href: "/shop?best=1" },
        { label: t.nav.sale, href: "/shop?sale=1" },
        { label: t.nav.jeans, href: "/jeans" },
        { label: t.nav.dresses, href: "/dresses" },
        { label: t.nav.accessories, href: "/accessories" },
      ],
    },
    {
      label: t.nav.men,
      href: "/men",
      children: [
        { label: t.nav.menClothing, href: "/men" },
        { label: t.nav.sneakers, href: "/sneakers?gender=men" },
        { label: t.nav.jeans, href: "/jeans?gender=men" },
        { label: t.nav.accessories, href: "/accessories?gender=men" },
      ],
    },
    {
      label: t.nav.women,
      href: "/women",
      children: [
        { label: t.nav.womenClothing, href: "/women" },
        { label: t.nav.dresses, href: "/dresses" },
        { label: t.nav.sneakers, href: "/sneakers?gender=women" },
        { label: t.nav.accessories, href: "/accessories?gender=women" },
      ],
    },
    { label: t.nav.sneakers, href: "/sneakers" },
    {
      label: t.nav.about,
      href: "/about",
      children: [
        { label: t.nav.about, href: "/about" },
        { label: t.nav.services, href: "/services" },
        { label: t.nav.pricing, href: "/pricing" },
        { label: t.nav.team, href: "/team" },
        { label: t.nav.testimonials, href: "/testimonials" },
        { label: t.nav.faq, href: "/faq" },
        { label: t.nav.booking, href: "/booking" },
      ],
    },
    { label: t.nav.blog, href: "/blog" },
    { label: t.nav.contact, href: "/contact" },
  ];
}

export default function Header({ logo, siteName, companyName }: { logo?: string; siteName: string; companyName: string }) {
  const { t } = useI18n();
  const { count, setDrawerOpen } = useCart();
  const wishlist = useWishlist();
  const { signedIn } = useStoreConfig();
  const pathname = usePathname();
  const router = useRouter();
  const nav = buildNav(t);

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const searchInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menus when the route changes (state adjusted during render, no effect needed).
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setMobileOpen(false);
    setSearchOpen(false);
  }

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (searchOpen) searchInput.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSearchOpen(false);
        setMobileOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [searchOpen]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/shop?q=${encodeURIComponent(q)}` : "/shop");
    setSearchOpen(false);
  };

  const iconBtn = "relative grid h-10 w-10 place-items-center rounded-full text-ink transition hover:bg-cream hover:text-primary";

  return (
    <header className={cn("sticky top-0 z-40 border-b bg-white transition-shadow", scrolled ? "border-line shadow-[0_6px_24px_-12px_rgba(58,28,15,0.25)]" : "border-transparent")}>
      <div className="container-x flex h-[72px] items-center justify-between gap-4 lg:h-20">
        <div className="flex items-center gap-2">
          <button type="button" className={cn(iconBtn, "lg:hidden")} aria-label={t.nav.menu} aria-expanded={mobileOpen} onClick={() => setMobileOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
          <Logo logo={logo} siteName={siteName} companyName={companyName} />
        </div>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1 xl:gap-2">
            {nav.map((item) => (
              <li key={item.href + item.label} className="group relative">
                <Link
                  href={item.href}
                  className={cn(
                    "relative inline-flex items-center gap-1 px-2.5 py-3 text-[13.5px] font-semibold text-ink transition-colors hover:text-primary xl:px-3",
                    isActive(item.href) && "text-primary after:absolute after:inset-x-2.5 after:bottom-1.5 after:h-0.5 after:rounded-full after:bg-primary"
                  )}
                  aria-haspopup={item.children ? "true" : undefined}
                >
                  {item.label}
                  {item.children && <ChevronDown className="h-3.5 w-3.5 transition-transform group-hover:rotate-180" aria-hidden="true" />}
                </Link>
                {item.children && (
                  <div className="invisible absolute left-1/2 top-full z-50 w-56 -translate-x-1/2 translate-y-2 pt-2 opacity-0 transition-all duration-200 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                    <ul className="card overflow-hidden p-1.5 shadow-xl">
                      {item.children.map((child) => (
                        <li key={child.href + child.label}>
                          <Link href={child.href} className="block rounded-md px-3 py-2 text-sm text-ink transition hover:bg-cream hover:text-primary">
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-0.5 sm:gap-1">
          <div className="hidden md:block">
            <LanguageSwitcher />
          </div>
          <button type="button" className={iconBtn} aria-label={t.nav.search} onClick={() => setSearchOpen((v) => !v)}>
            <Search className="h-5 w-5" />
          </button>
          <Link href={signedIn ? "/account" : "/login"} className={cn(iconBtn, "hidden sm:grid")} aria-label={t.nav.account}>
            <User className="h-5 w-5" />
          </Link>
          <Link href="/wishlist" className={cn(iconBtn, "hidden sm:grid")} aria-label={`${t.nav.wishlist} (${wishlist.items.length})`}>
            <Heart className="h-5 w-5" />
            {wishlist.items.length > 0 && (
              <span className="absolute right-0.5 top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-ink px-1 text-[10px] font-bold text-white">
                {wishlist.items.length}
              </span>
            )}
          </Link>
          <button type="button" className={iconBtn} aria-label={`${t.nav.cart} (${count})`} onClick={() => setDrawerOpen(true)}>
            <ShoppingCart className="h-5 w-5" />
            <span className="absolute right-0 top-0 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
              {count}
            </span>
          </button>
        </div>
      </div>

      {searchOpen && (
        <div className="absolute inset-x-0 top-full animate-fade-in border-t border-line bg-white shadow-lg">
          <form onSubmit={submitSearch} className="container-x flex items-center gap-3 py-4" role="search">
            <Search className="h-5 w-5 shrink-0 text-muted" aria-hidden="true" />
            <label htmlFor="site-search" className="sr-only">
              {t.nav.search}
            </label>
            <input
              id="site-search"
              ref={searchInput}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.nav.searchPlaceholder}
              className="h-11 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted"
            />
            <button type="submit" className="btn-primary hidden sm:inline-flex">
              {t.nav.search}
            </button>
            <button type="button" className={iconBtn} aria-label={t.nav.close} onClick={() => setSearchOpen(false)}>
              <X className="h-5 w-5" />
            </button>
          </form>
        </div>
      )}

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label={t.nav.menu}>
          <button type="button" className="absolute inset-0 animate-fade-in bg-ink/50" aria-label={t.nav.close} onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-[86%] max-w-sm animate-slide-in flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-line px-4 py-4">
              <Logo logo={logo} siteName={siteName} companyName={companyName} />
              <button type="button" className={iconBtn} aria-label={t.nav.close} onClick={() => setMobileOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-2 py-3">
              <ul>
                {nav.map((item) => (
                  <li key={item.href + item.label} className="border-b border-line/60 last:border-0">
                    <div className="flex items-center">
                      <Link href={item.href} className={cn("flex-1 px-3 py-3.5 text-[15px] font-semibold", isActive(item.href) ? "text-primary" : "text-ink")}>
                        {item.label}
                      </Link>
                      {item.children && (
                        <button
                          type="button"
                          className="grid h-11 w-11 place-items-center text-muted"
                          aria-label={`${item.label} submenu`}
                          aria-expanded={expanded === item.label}
                          onClick={() => setExpanded((v) => (v === item.label ? null : item.label))}
                        >
                          <ChevronDown className={cn("h-4 w-4 transition-transform", expanded === item.label && "rotate-180")} />
                        </button>
                      )}
                    </div>
                    {item.children && expanded === item.label && (
                      <ul className="mb-2 ml-3 border-l border-line pl-3">
                        {item.children.map((c) => (
                          <li key={c.href + c.label}>
                            <Link href={c.href} className="block px-3 py-2.5 text-sm text-muted hover:text-primary">
                              {c.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
            <div className="space-y-3 border-t border-line p-4">
              <div className="grid grid-cols-2 gap-2">
                <Link href={signedIn ? "/account" : "/login"} className="btn-outline">
                  <User className="h-4 w-4" /> {t.nav.account}
                </Link>
                <Link href="/wishlist" className="btn-outline">
                  <Heart className="h-4 w-4" /> {t.nav.wishlist}
                </Link>
              </div>
              <LanguageSwitcher full />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
