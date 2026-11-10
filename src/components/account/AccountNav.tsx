"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Heart, LayoutDashboard, LogOut, MapPin, Package, UserRound } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Labels = { overview: string; profile: string; orders: string; addresses: string; wishlist: string; signOut: string };

export default function AccountNav({ labels }: { labels: Labels }) {
  const pathname = usePathname();
  const router = useRouter();
  const items = [
    { href: "/account", label: labels.overview, Icon: LayoutDashboard },
    { href: "/account/profile", label: labels.profile, Icon: UserRound },
    { href: "/account/orders", label: labels.orders, Icon: Package },
    { href: "/account/addresses", label: labels.addresses, Icon: MapPin },
    { href: "/account/wishlist", label: labels.wishlist, Icon: Heart },
  ];

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success(labels.signOut);
    router.replace("/");
    router.refresh();
  };

  return (
    <nav aria-label="Account" className="card p-2">
      <ul className="no-scrollbar flex gap-1 overflow-x-auto lg:flex-col">
        {items.map(({ href, label, Icon }) => {
          const active = href === "/account" ? pathname === href : pathname.startsWith(href);
          return (
            <li key={href} className="shrink-0">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn("flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition", active ? "bg-primary text-white" : "text-ink hover:bg-cream")}
              >
                <Icon className="h-4 w-4" aria-hidden="true" /> {label}
              </Link>
            </li>
          );
        })}
        <li className="shrink-0">
          <button type="button" onClick={logout} className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-red-700 hover:bg-red-50">
            <LogOut className="h-4 w-4" aria-hidden="true" /> {labels.signOut}
          </button>
        </li>
      </ul>
    </nav>
  );
}
