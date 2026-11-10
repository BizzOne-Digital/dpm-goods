import { notFound } from "next/navigation";
import ResourceForm from "@/components/admin/ResourceForm";
import { getResource } from "@/lib/admin/resources";
import { isValidObjectId } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ resource: string }> }) {
  const { resource } = await params;
  return { title: `Edit ${getResource(resource)?.singular ?? "item"}` };
}

export default async function ResourceEditPage({ params }: { params: Promise<{ resource: string; id: string }> }) {
  const { resource, id } = await params;
  if (!getResource(resource) || !isValidObjectId(id)) notFound();
  return <ResourceForm resourceKey={resource} id={id} />;
}
