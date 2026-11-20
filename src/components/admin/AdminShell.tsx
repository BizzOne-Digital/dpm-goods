"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BadgePercent,
  CalendarCheck,
  ChevronsLeft,
  ExternalLink,
  FileText,
  FolderTree,
  Globe,
  HelpCircle,
  Image as ImageIcon,
  LayoutDashboard,
  LayoutTemplate,
  LogOut,
  Mail,
  Menu,
  MessageSquareQuote,
  MessagesSquare,
  Package,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Users,
  UsersRound,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", Icon: Package },
  { href: "/admin/categories", label: "Categories", Icon: FolderTree },
  { href: "/admin/orders", label: "Orders", Icon: ShoppingBag },
  { href: "/admin/customers", label: "Customers", Icon: Users },
  { href: "/admin/bookings", label: "Bookings", Icon: CalendarCheck },
  { href: "/admin/messages", label: "Messages", Icon: MessagesSquare },
  { href: "/admin/blog", label: "Blog", Icon: FileText },
  { href: "/admin/testimonials", label: "Testimonials", Icon: MessageSquareQuote },
  { href: "/admin/team", label: "Team", Icon: UsersRound },
  { href: "/admin/faqs", label: "FAQs", Icon: HelpCircle },
  { href: "/admin/pages", label: "Pages", Icon: LayoutTemplate },
  { href: "/admin/promotions", label: "Promotions", Icon: BadgePercent },
  { href: "/admin/newsletter", label: "Newsletter", Icon: Mail },
  { href: "/admin/media", label: "Media", Icon: ImageIcon },
  { href: "/admin/settings", label: "Website Settings", Icon: Globe },
  { href: "/admin/account", label: "Admin Settings", Icon: ShieldCheck },
];

export default function AdminShell({ adminName, children }: { adminName: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem("dpm_admin_collapsed") === "1");
    } catch {
      /* ignore */
    }
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((c) => {
      try {
        localStorage.setItem("dpm_admin_collapsed", c ? "0" : "1");
      } catch {
        /* ignore */
      }
      return !c;
    });
  };

  const logout = async () => {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    toast.success("Signed out");
    router.replace("/admin/login");
    router.refresh();
  };

  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  const nav = (compact: boolean) => (
    <nav aria-label="Admin" className="flex-1 overflow-y-auto px-2 py-3">
      <ul className="space-y-0.5">
        {NAV.map(({ href, label, Icon }) => (
          <li key={href}>
            <Link
              href={href}
              title={compact ? label : undefined}
              aria-current={isActive(href) ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-[13.5px] font-medium transition",
                isActive(href) ? "bg-primary text-white" : "text-white/75 hover:bg-white/10 hover:text-white",
                compact && "justify-center px-0"
              )}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
              {!compact && label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );

  const footer = (compact: boolean) => (
    <div className="space-y-1 border-t border-white/10 p-2">
      <a href="/" target="_blank" rel="noopener noreferrer" className={cn("flex items-center gap-3 rounded-md px-3 py-2 text-[13px] text-white/75 hover:bg-white/10 hover:text-white", compact && "justify-center px-0")} title="View website">
        <ExternalLink className="h-4 w-4" /> {!compact && "View website"}
      </a>
      <button type="button" onClick={logout} className={cn("flex w-full items-center gap-3 rounded-md px-3 py-2 text-[13px] text-red-200 hover:bg-red-500/20", compact && "justify-center px-0")} title="Logout">
        <LogOut className="h-4 w-4" /> {!compact && "Logout"}
      </button>
    </div>
  );

  const brand = (compact: boolean) => (
    <div className={cn("flex h-16 items-center border-b border-white/10 px-4", compact ? "justify-center" : "justify-between")}>
      {compact ? (
        <span className="font-display text-lg font-extrabold text-white">D</span>
      ) : (
        <Link href="/admin" className="leading-none">
          <span className="font-display text-xl font-extrabold text-white">
            Universal <span className="text-primary-light">UPM Goods</span>
          </span>
          <span className="mt-1 block text-[10px] uppercase tracking-widest text-white/50">Admin</span>
        </Link>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f6f3f0]">
      {/* Desktop sidebar */}
      <aside className={cn("fixed inset-y-0 left-0 z-40 hidden flex-col bg-ink transition-[width] lg:flex", collapsed ? "w-[72px]" : "w-64")}>
        {brand(collapsed)}
        {nav(collapsed)}
        <button type="button" onClick={toggleCollapsed} className="mx-2 mb-1 flex items-center justify-center gap-2 rounded-md py-2 text-xs text-white/60 hover:bg-white/10 hover:text-white" aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
          <ChevronsLeft className={cn("h-4 w-4 transition", collapsed && "rotate-180")} /> {!collapsed && "Collapse"}
        </button>
        {footer(collapsed)}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Admin menu">
          <button type="button" className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} aria-label="Close menu" />
          <aside className="absolute inset-y-0 left-0 flex w-72 animate-slide-in flex-col bg-ink">
            <div className="flex items-center justify-between pr-2">
              {brand(false)}
              <button type="button" onClick={() => setOpen(false)} className="grid h-10 w-10 place-items-center text-white" aria-label="Close menu">
                <X className="h-5 w-5" />
              </button>
            </div>
            {nav(false)}
            {footer(false)}
          </aside>
        </div>
      )}

      <div className={cn("transition-[padding]", collapsed ? "lg:pl-[72px]" : "lg:pl-64")}>
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line bg-white px-4 sm:px-6">
          <button type="button" onClick={() => setOpen(true)} className="grid h-10 w-10 place-items-center rounded-md hover:bg-cream lg:hidden" aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
          <p className="hidden text-sm text-muted lg:block">Direct Primary Merchandises LLC</p>
          <div className="flex items-center gap-3">
            <Link href="/admin/settings" className="grid h-9 w-9 place-items-center rounded-full hover:bg-cream" aria-label="Website settings">
              <Settings className="h-4 w-4" />
            </Link>
            <span className="flex items-center gap-2 text-sm font-semibold">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-white">{adminName.charAt(0).toUpperCase()}</span>
              <span className="hidden sm:inline">{adminName}</span>
            </span>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      </div>
    </div>
  );
}
