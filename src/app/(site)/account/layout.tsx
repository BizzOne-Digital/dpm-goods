import { redirect } from "next/navigation";
import AccountNav from "@/components/account/AccountNav";
import { requireCustomerPage } from "@/lib/auth";
import { getAccountUser } from "@/lib/account";
import { isDbConfigured } from "@/lib/mongodb";
import { getDictionary } from "@/lib/i18n/server";

export const metadata = { robots: { index: false, follow: false } };

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const session = await requireCustomerPage("/account");
  if (!isDbConfigured()) redirect("/login");
  const [user, { t }] = await Promise.all([getAccountUser(session.sub), getDictionary()]);
  if (!user) redirect("/api/auth/logout?next=/login");

  return (
    <div className="bg-cream/50">
      <div className="container-x grid gap-8 py-10 lg:grid-cols-[260px_1fr] lg:py-14">
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="card mb-4 flex items-center gap-3 p-4">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-primary font-display text-lg font-extrabold text-white">
              {user.name.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="truncate font-bold">{user.name}</p>
              <p className="truncate text-xs text-muted">{user.email}</p>
            </div>
          </div>
          <AccountNav labels={{ overview: t.account.overview, profile: t.account.profile, orders: t.account.orders, addresses: t.account.addresses, wishlist: t.account.wishlist, signOut: t.account.signOut }} />
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
