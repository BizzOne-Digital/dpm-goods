import Link from "next/link";
import { AlertTriangle, CalendarCheck, DollarSign, FileText, Mail, Package, ShoppingBag, Timer, Users } from "lucide-react";
import SmartImage from "@/components/ui/SmartImage";
import { StatusBadge } from "@/components/ui/Primitives";
import { getDashboardData } from "@/lib/admin/dashboard";
import { isDbConfigured } from "@/lib/mongodb";
import { formatDate, formatPrice } from "@/lib/utils";

export const metadata = { title: "Dashboard" };

export default async function AdminDashboard() {
  if (!isDbConfigured()) {
    return <p className="card p-6 text-sm">Connect MongoDB (MONGODB_URI) to see live dashboard data.</p>;
  }
  const data = await getDashboardData();
  const s = data.stats;
  const maxRevenue = Math.max(...data.days.map((d) => d.revenue), 1);

  const cards = [
    { label: "Total Products", value: s.totalProducts, Icon: Package, href: "/admin/products" },
    { label: "Total Orders", value: s.totalOrders, Icon: ShoppingBag, href: "/admin/orders" },
    { label: "Revenue (paid)", value: formatPrice(s.revenue), Icon: DollarSign, href: "/admin/orders", sub: `${formatPrice(s.revenue30)} last 30 days` },
    { label: "Pending Orders", value: s.pendingOrders, Icon: Timer, href: "/admin/orders?status=pending", warn: s.pendingOrders > 0 },
    { label: "Customers", value: s.customers, Icon: Users, href: "/admin/customers" },
    { label: "Bookings", value: s.bookings, Icon: CalendarCheck, href: "/admin/bookings", sub: `${s.pendingBookings} awaiting confirmation`, warn: s.pendingBookings > 0 },
    { label: "Blog Posts", value: s.blogPosts, Icon: FileText, href: "/admin/blog" },
    { label: "Subscribers", value: s.subscribers, Icon: Mail, href: "/admin/newsletter" },
  ];

  const alerts = [
    s.pendingOrders > 0 && { text: `${s.pendingOrders} order(s) pending. Confirm payment and move to processing.`, href: "/admin/orders?status=pending" },
    data.lowStock.length > 0 && { text: `${data.lowStock.length} product(s) at 5 units or fewer. Restock or update supplier inventory.`, href: "/admin/products" },
    s.pendingBookings > 0 && { text: `${s.pendingBookings} booking request(s) need confirmation.`, href: "/admin/bookings" },
  ].filter(Boolean) as { text: string; href: string }[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">Dashboard</h1>
        <p className="text-sm text-muted">Store performance and items that need attention.</p>
      </div>

      {alerts.length > 0 && (
        <ul className="space-y-2" aria-label="Needs attention">
          {alerts.map((a) => (
            <li key={a.text}>
              <Link href={a.href} className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900 hover:bg-amber-100">
                <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" /> {a.text}
              </Link>
            </li>
          ))}
        </ul>
      )}

      <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map(({ label, value, Icon, href, sub, warn }) => (
          <li key={label}>
            <Link href={href} className="card block p-5 transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">{label}</p>
                <span className={`grid h-9 w-9 place-items-center rounded-lg ${warn ? "bg-amber-50 text-amber-700" : "bg-cream text-primary"}`}>
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
              </div>
              <p className="mt-3 font-display text-2xl font-extrabold">{value}</p>
              {sub && <p className="mt-1 text-xs text-muted">{sub}</p>}
            </Link>
          </li>
        ))}
      </ul>

      <section className="card p-5" aria-labelledby="sales-chart">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="sales-chart" className="font-bold">Sales, last 14 days</h2>
          <p className="text-xs text-muted">Excludes cancelled and refunded orders</p>
        </div>
        <div className="flex h-44 items-end gap-1.5" role="img" aria-label={`Daily revenue for the last 14 days. Peak ${formatPrice(maxRevenue)}.`}>
          {data.days.map((d) => (
            <div key={d.date} className="group relative flex h-full flex-1 flex-col justify-end">
              <div className="w-full rounded-t bg-primary/85 transition group-hover:bg-primary" style={{ height: `${Math.max((d.revenue / maxRevenue) * 100, d.revenue ? 4 : 1)}%` }} />
              <span className="pointer-events-none absolute -top-8 left-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded bg-ink px-2 py-1 text-[10px] text-white group-hover:block">
                {formatPrice(d.revenue)} · {d.orders} orders
              </span>
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-[10px] text-muted">
          <span>{formatDate(data.days[0]?.date)}</span>
          <span>{formatDate(data.days[data.days.length - 1]?.date)}</span>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <section className="card overflow-hidden" aria-labelledby="recent-orders">
          <div className="flex items-center justify-between border-b border-line p-4">
            <h2 id="recent-orders" className="font-bold">Recent orders</h2>
            <Link href="/admin/orders" className="text-sm font-semibold text-primary">View all</Link>
          </div>
          {data.recentOrders.length === 0 ? (
            <p className="p-6 text-center text-sm text-muted">No orders yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-sm">
                <tbody className="divide-y divide-line">
                  {data.recentOrders.map((o) => {
                    const addr = (o.shippingAddress ?? {}) as Record<string, string>;
                    return (
                      <tr key={o._id} className="hover:bg-cream/40">
                        <td className="px-4 py-3">
                          <Link href={`/admin/orders/${o._id}`} className="font-mono text-xs font-semibold hover:text-primary">{String(o.orderNumber)}</Link>
                          <p className="text-xs text-muted">{addr.firstName} {addr.lastName}</p>
                        </td>
                        <td className="px-4 py-3 text-muted">{formatDate(o.createdAt as string)}</td>
                        <td className="px-4 py-3"><StatusBadge status={String(o.status)} /></td>
                        <td className="px-4 py-3 text-right font-semibold">{formatPrice(Number(o.total), String(o.currency || "USD"))}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="card overflow-hidden" aria-labelledby="low-stock">
          <div className="flex items-center justify-between border-b border-line p-4">
            <h2 id="low-stock" className="font-bold">Low stock</h2>
            <Link href="/admin/products" className="text-sm font-semibold text-primary">Products</Link>
          </div>
          {data.lowStock.length === 0 ? (
            <p className="p-6 text-center text-sm text-muted">All products are well stocked.</p>
          ) : (
            <ul className="divide-y divide-line">
              {data.lowStock.map((p) => (
                <li key={p._id}>
                  <Link href={`/admin/products/${p._id}/edit`} className="flex items-center gap-3 px-4 py-2.5 hover:bg-cream/40">
                    <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-cream">
                      <SmartImage src={p.featuredImage as string} alt="" fill sizes="40px" className="object-cover" />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">{String(p.name)}</span>
                    <span className={`rounded px-2 py-0.5 text-xs font-bold ${Number(p.stock) === 0 ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-800"}`}>{String(p.stock)} left</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card overflow-hidden" aria-labelledby="recent-bookings">
          <div className="flex items-center justify-between border-b border-line p-4">
            <h2 id="recent-bookings" className="font-bold">Recent bookings</h2>
            <Link href="/admin/bookings" className="text-sm font-semibold text-primary">View all</Link>
          </div>
          {data.recentBookings.length === 0 ? (
            <p className="p-6 text-center text-sm text-muted">No bookings found.</p>
          ) : (
            <ul className="divide-y divide-line">
              {data.recentBookings.map((b) => (
                <li key={b._id}>
                  <Link href={`/admin/bookings/${b._id}/edit`} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-cream/40">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{String(b.name)}</p>
                      <p className="truncate text-xs text-muted">{String(b.bookingType)} · {String(b.date)} {String(b.time)}</p>
                    </div>
                    <StatusBadge status={String(b.status)} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card overflow-hidden" aria-labelledby="recent-customers">
          <div className="flex items-center justify-between border-b border-line p-4">
            <h2 id="recent-customers" className="font-bold">New customers</h2>
            <Link href="/admin/customers" className="text-sm font-semibold text-primary">View all</Link>
          </div>
          {data.recentCustomers.length === 0 ? (
            <p className="p-6 text-center text-sm text-muted">No customer registrations yet.</p>
          ) : (
            <ul className="divide-y divide-line">
              {data.recentCustomers.map((c) => (
                <li key={c._id} className="flex items-center gap-3 px-4 py-3">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-cream text-sm font-bold text-primary">{String(c.name).charAt(0)}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{String(c.name)}</p>
                    <p className="truncate text-xs text-muted">{String(c.email)}</p>
                  </div>
                  <span className="text-xs text-muted">{formatDate(c.createdAt as string)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
