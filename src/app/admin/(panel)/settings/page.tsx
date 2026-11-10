import ResourceForm from "@/components/admin/ResourceForm";

export const metadata = { title: "Website Settings" };

export default function SettingsPage() {
  return <ResourceForm resourceKey="settings" mode="settings" />;
}
