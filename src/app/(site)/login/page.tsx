import { Suspense } from "react";
import { redirect } from "next/navigation";
import AuthForm from "@/components/forms/AuthForm";
import AuthShell from "@/components/content/AuthShell";
import { getCustomerSession } from "@/lib/auth";
import { IMG } from "@/lib/demo-data";
import { getDictionary } from "@/lib/i18n/server";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({ title: "Sign In", path: "/login", noIndex: true });

export default async function LoginPage() {
  if (await getCustomerSession()) redirect("/account");
  const { t } = await getDictionary();
  return (
    <AuthShell title={t.account.welcome} subtitle="Sign in to your Universal UPMGoods account." image={IMG.authSide}>
      <Suspense>
        <AuthForm mode="login" />
      </Suspense>
    </AuthShell>
  );
}
