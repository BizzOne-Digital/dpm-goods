import { notFound } from "next/navigation";
import ResourceTable from "@/components/admin/ResourceTable";
import { getResource } from "@/lib/admin/resources";

export async function generateMetadata({ params }: { params: Promise<{ resource: string }> }) {
  const { resource } = await params;
  return { title: getResource(resource)?.label ?? "Admin" };
}

export default async function ResourceListPage({ params }: { params: Promise<{ resource: string }> }) {
  const { resource } = await params;
  if (!getResource(resource)) notFound();
  return <ResourceTable resourceKey={resource} />;
}
