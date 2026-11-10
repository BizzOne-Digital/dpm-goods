import "server-only";
import { connectDB } from "@/lib/mongodb";
import { toPlain } from "@/lib/utils";
import { BlogPost, Booking, NewsletterSubscriber, Order, Product, User } from "@/models";

export async function getDashboardData() {
  await connectDB();
  const since30 = new Date(Date.now() - 30 * 86400000);
  const since14 = new Date(Date.now() - 13 * 86400000);
  since14.setHours(0, 0, 0, 0);

  const [
    totalProducts,
    totalOrders,
    revenueAgg,
    revenue30Agg,
    pendingOrders,
    customers,
    bookings,
    pendingBookings,
    blogPosts,
    subscribers,
    recentOrders,
    recentBookings,
    lowStock,
    recentCustomers,
    salesByDay,
    statusBreakdown,
  ] = await Promise.all([
    Product.countDocuments(),
    Order.countDocuments(),
    Order.aggregate([{ $match: { status: { $in: ["paid", "processing", "shipped", "delivered"] } } }, { $group: { _id: null, total: { $sum: "$total" } } }]),
    Order.aggregate([{ $match: { status: { $in: ["paid", "processing", "shipped", "delivered"] }, createdAt: { $gte: since30 } } }, { $group: { _id: null, total: { $sum: "$total" }, count: { $sum: 1 } } }]),
    Order.countDocuments({ status: "pending" }),
    User.countDocuments(),
    Booking.countDocuments(),
    Booking.countDocuments({ status: "pending" }),
    BlogPost.countDocuments(),
    NewsletterSubscriber.countDocuments({ active: true }),
    Order.find().select("orderNumber email total currency status createdAt shippingAddress.firstName shippingAddress.lastName").sort({ createdAt: -1 }).limit(6).lean(),
    Booking.find().select("name bookingType date time status").sort({ createdAt: -1 }).limit(5).lean(),
    Product.find({ stock: { $lte: 5 } }).select("name stock featuredImage sku").sort({ stock: 1 }).limit(6).lean(),
    User.find().select("name email createdAt").sort({ createdAt: -1 }).limit(5).lean(),
    Order.aggregate([
      { $match: { createdAt: { $gte: since14 }, status: { $nin: ["cancelled", "refunded"] } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, revenue: { $sum: "$total" }, orders: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    Order.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
  ]);

  // Fill missing days so the chart has a continuous 14-day axis.
  const byDay = new Map(salesByDay.map((d: { _id: string; revenue: number; orders: number }) => [d._id, d]));
  const days = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date(since14.getTime() + i * 86400000);
    const key = d.toISOString().slice(0, 10);
    const row = byDay.get(key) as { revenue: number; orders: number } | undefined;
    return { date: key, revenue: row?.revenue ?? 0, orders: row?.orders ?? 0 };
  });

  return toPlain<{
    stats: Record<string, number>;
    recentOrders: Array<Record<string, unknown> & { _id: string }>;
    recentBookings: Array<Record<string, unknown> & { _id: string }>;
    lowStock: Array<Record<string, unknown> & { _id: string }>;
    recentCustomers: Array<Record<string, unknown> & { _id: string }>;
    days: { date: string; revenue: number; orders: number }[];
    statusBreakdown: { _id: string; count: number }[];
  }>({
    stats: {
      totalProducts,
      totalOrders,
      revenue: revenueAgg[0]?.total ?? 0,
      revenue30: revenue30Agg[0]?.total ?? 0,
      orders30: revenue30Agg[0]?.count ?? 0,
      pendingOrders,
      customers,
      bookings,
      pendingBookings,
      blogPosts,
      subscribers,
    },
    recentOrders,
    recentBookings,
    lowStock,
    recentCustomers,
    days,
    statusBreakdown,
  });
}
