import { notFound } from "next/navigation";
import { isValidObjectId } from "@/lib/utils";
import OrderDetailAdmin from "./OrderDetailAdmin";

export const metadata = { title: "Order" };

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isValidObjectId(id)) notFound();
  return <OrderDetailAdmin id={id} />;
}
