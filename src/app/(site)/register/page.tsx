import { Suspense } from "react";
import { redirect } from "next/navigation";
import AuthForm from "@/components/forms/AuthForm";
import AuthShell from "@/components/content/AuthShell";
import { getCustomerSession } from "@/lib/auth";
import { IMG } from "@/lib/demo-data";
import { getDictionary } from "@/lib/i18n/server";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({ title: "Create Account", path: "/register", noIndex: true });

export default async function RegisterPage() {
  if (await getCustomerSession()) redirect("/account");
  const { t } = await getDictionary();
  return (
    <AuthShell title={t.account.register} subtitle="Join DPM Goods for faster checkout and order tracking." image={IMG.authSide}>
      <Suspense>
        <AuthForm mode="register" />
      </Suspense>
    </AuthShell>
  );
}
