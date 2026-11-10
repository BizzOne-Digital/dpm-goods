import "server-only";
import { connectDB } from "@/lib/mongodb";
import { isValidObjectId, toPlain } from "@/lib/utils";
import { Order, User } from "@/models";
import type { Address, Order as OrderType } from "@/types";

export type AccountUser = { _id: string; name: string; email: string; phone?: string; addresses: Address[]; createdAt: string };

export async function getAccountUser(userId: string): Promise<AccountUser | null> {
  if (!isValidObjectId(userId)) return null;
  await connectDB();
  const user = await User.findOne({ _id: userId, active: true }).select("name email phone addresses createdAt").lean();
  return user ? toPlain<AccountUser>(user) : null;
}

export async function getCustomerOrders(userId: string, limit = 50): Promise<OrderType[]> {
  if (!isValidObjectId(userId)) return [];
  await connectDB();
  const orders = await Order.find({ user: userId }).sort({ createdAt: -1 }).limit(limit).lean();
  return toPlain<OrderType[]>(orders);
}

export async function getCustomerOrder(userId: string, orderId: string): Promise<OrderType | null> {
  if (!isValidObjectId(userId) || !isValidObjectId(orderId)) return null;
  await connectDB();
  const order = await Order.findOne({ _id: orderId, user: userId }).lean();
  return order ? toPlain<OrderType>(order) : null;
}
