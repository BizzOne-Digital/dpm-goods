"use client";

import { useState } from "react";
import { Loader2, MapPin, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/ui/Primitives";
import { useI18n } from "@/components/providers/I18nProvider";
import type { Address } from "@/types";

const BLANK: Address = { label: "Home", firstName: "", lastName: "", address: "", apartment: "", city: "", state: "", zip: "", country: "United States", phone: "", isDefault: false };

export default function AddressBook({ initial }: { initial: Address[] }) {
  const { t } = useI18n();
  const [list, setList] = useState<Address[]>(initial);
  const [editing, setEditing] = useState<{ index: number; value: Address } | null>(null);
  const [saving, setSaving] = useState(false);

  const persist = async (next: Address[]) => {
    setSaving(true);
    try {
      const res = await fetch("/api/account/addresses", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ addresses: next }) });
      const data = await res.json();
      if (data.success) {
        setList(data.addresses);
        setEditing(null);
        toast.success(t.account.saved);
      } else toast.error(data.message);
    } catch {
      toast.error(t.common.error);
    } finally {
      setSaving(false);
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    let next = [...list];
    if (editing.index === -1) next.push(editing.value);
    else next[editing.index] = editing.value;
    if (editing.value.isDefault || next.length === 1) next = next.map((a, i) => ({ ...a, isDefault: i === (editing.index === -1 ? next.length - 1 : editing.index) }));
    persist(next);
  };

  const field = (key: keyof Address, label: string, className = "", required = true) => (
    <div className={className}>
      <label htmlFor={`ad-${key}`} className="label">{label}</label>
      <input
        id={`ad-${key}`}
        required={required}
        value={(editing?.value[key] as string) ?? ""}
        onChange={(e) => setEditing((s) => (s ? { ...s, value: { ...s.value, [key]: e.target.value } } : s))}
        className="input h-11"
      />
    </div>
  );

  return (
    <div className="space-y-6">
      {list.length === 0 && !editing && <EmptyState icon={MapPin} title="No saved addresses yet." description="Save an address for faster checkout." />}
      <ul className="grid gap-4 md:grid-cols-2">
        {list.map((a, i) => (
          <li key={a._id ?? i} className="card p-5">
            <div className="flex items-start justify-between gap-3">
              <p className="font-bold">
                {a.label}
                {a.isDefault && <span className="ml-2 rounded bg-primary px-2 py-0.5 text-[10px] font-bold uppercase text-white">Default</span>}
              </p>
              <div className="flex gap-1">
                {!a.isDefault && (
                  <button type="button" onClick={() => persist(list.map((x, j) => ({ ...x, isDefault: j === i })))} className="grid h-8 w-8 place-items-center rounded hover:bg-cream" aria-label="Set as default">
                    <Star className="h-4 w-4" />
                  </button>
                )}
                <button type="button" onClick={() => setEditing({ index: i, value: { ...a } })} className="grid h-8 w-8 place-items-center rounded hover:bg-cream" aria-label="Edit address">
                  <Pencil className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => persist(list.filter((_, j) => j !== i))} className="grid h-8 w-8 place-items-center rounded text-red-600 hover:bg-red-50" aria-label="Delete address">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <address className="mt-2 text-sm not-italic leading-relaxed text-ink/80">
              {a.firstName} {a.lastName}
              <br />
              {a.address}
              {a.apartment ? `, ${a.apartment}` : ""}
              <br />
              {a.city}, {a.state} {a.zip}, {a.country}
              {a.phone && (
                <>
                  <br />
                  {a.phone}
                </>
              )}
            </address>
          </li>
        ))}
      </ul>

      {editing ? (
        <form onSubmit={submit} className="card grid gap-4 p-6 sm:grid-cols-2">
          {field("label", "Label (Home, Work)")}
          {field("phone", t.checkout.phone, "", false)}
          {field("firstName", t.checkout.firstName)}
          {field("lastName", t.checkout.lastName)}
          {field("address", t.checkout.address, "sm:col-span-2")}
          {field("apartment", t.checkout.apartment, "sm:col-span-2", false)}
          {field("city", t.checkout.city)}
          {field("state", t.checkout.state)}
          {field("zip", t.checkout.zip)}
          {field("country", t.checkout.country)}
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input type="checkbox" checked={Boolean(editing.value.isDefault)} onChange={(e) => setEditing({ ...editing, value: { ...editing.value, isDefault: e.target.checked } })} className="h-4 w-4 accent-[var(--primary)]" />
            Set as default address
          </label>
          <div className="flex gap-2 sm:col-span-2">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />} {t.account.save}
            </button>
            <button type="button" onClick={() => setEditing(null)} className="btn-outline">Cancel</button>
          </div>
        </form>
      ) : (
        <button type="button" onClick={() => setEditing({ index: -1, value: { ...BLANK } })} className="btn-primary">
          <Plus className="h-4 w-4" aria-hidden="true" /> {t.account.addAddress}
        </button>
      )}
    </div>
  );
}
