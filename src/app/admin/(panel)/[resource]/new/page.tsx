import { notFound } from "next/navigation";
import ResourceForm from "@/components/admin/ResourceForm";
import { getResource } from "@/lib/admin/resources";

export async function generateMetadata({ params }: { params: Promise<{ resource: string }> }) {
  const { resource } = await params;
  return { title: `New ${getResource(resource)?.singular ?? "item"}` };
}

export default async function ResourceNewPage({ params }: { params: Promise<{ resource: string }> }) {
  const { resource } = await params;
  const config = getResource(resource);
  if (!config || !config.canCreate) notFound();
  return <ResourceForm resourceKey={resource} />;
}
