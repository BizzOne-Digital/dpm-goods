import AddressBook from "@/components/account/AddressBook";
import { requireCustomerPage } from "@/lib/auth";
import { getAccountUser } from "@/lib/account";
import { getDictionary } from "@/lib/i18n/server";

export const metadata = { title: "Addresses" };

export default async function AddressesPage() {
  const session = await requireCustomerPage("/account/addresses");
  const [{ t }, user] = await Promise.all([getDictionary(), getAccountUser(session.sub)]);
  return (
    <div>
      <h1 className="mb-6 text-3xl font-extrabold">{t.account.addresses}</h1>
      <AddressBook initial={user?.addresses ?? []} />
    </div>
  );
}
