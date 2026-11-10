import ProfileForm from "@/components/account/ProfileForm";
import { requireCustomerPage } from "@/lib/auth";
import { getAccountUser } from "@/lib/account";
import { getDictionary } from "@/lib/i18n/server";

export const metadata = { title: "Profile" };

export default async function ProfilePage() {
  const session = await requireCustomerPage("/account/profile");
  const [{ t }, user] = await Promise.all([getDictionary(), getAccountUser(session.sub)]);
  return (
    <div>
      <h1 className="mb-6 text-3xl font-extrabold">{t.account.profile}</h1>
      <ProfileForm initial={{ name: user?.name ?? "", email: user?.email ?? "", phone: user?.phone ?? "" }} />
    </div>
  );
}
