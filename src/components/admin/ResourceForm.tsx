"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ExternalLink, Loader2, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import ImageUploadField from "@/components/admin/ImageUploadField";
import GalleryField from "@/components/admin/GalleryField";
import RichTextEditor from "@/components/admin/RichTextEditor";
import TagsInput from "@/components/admin/TagsInput";
import { Skeleton } from "@/components/ui/Primitives";
import { adminFetch } from "@/lib/admin/client";
import { getResource, SETTINGS_CONFIG, type FieldDef, type ResourceConfig } from "@/lib/admin/resources";
import { cn } from "@/lib/utils";

type Doc = Record<string, unknown>;

const getPath = (obj: Doc, path: string): unknown => path.split(".").reduce<unknown>((acc, k) => (acc && typeof acc === "object" ? (acc as Doc)[k] : undefined), obj);

function toFormValue(f: FieldDef, raw: unknown): unknown {
  if (raw === undefined || raw === null) {
    if (f.defaultValue !== undefined) return f.defaultValue;
    if (f.type === "boolean") return false;
    if (f.type === "tags" || f.type === "gallery") return [];
    if (f.type === "json") return "{}";
    return "";
  }
  if (f.type === "date") return typeof raw === "string" ? raw.slice(0, 10) : "";
  if (f.type === "json") return JSON.stringify(raw, null, 2);
  return raw;
}

export default function ResourceForm({ resourceKey, id, mode = "resource" }: { resourceKey: string; id?: string; mode?: "resource" | "settings" }) {
  const router = useRouter();
  const config: ResourceConfig | undefined = mode === "settings" ? SETTINGS_CONFIG : getResource(resourceKey);
  const endpoint = mode === "settings" ? "/api/admin/settings" : id ? `/api/admin/${resourceKey}/${id}` : `/api/admin/${resourceKey}`;
  const isEdit = mode === "settings" || Boolean(id);

  const [values, setValues] = useState<Doc>({});
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [categoryOptions, setCategoryOptions] = useState<{ value: string; label: string }[]>([]);
  const [dirty, setDirty] = useState(false);

  const featuredFields = useMemo(() => (config?.fields ?? []).filter((f) => f.type === "gallery" && f.featuredField).map((f) => f.featuredField!), [config]);

  useEffect(() => {
    if (!config) return;
    const init = (doc: Doc) => {
      const next: Doc = {};
      for (const f of config.fields) next[f.name] = toFormValue(f, getPath(doc, f.name));
      for (const ff of featuredFields) next[ff] = (doc[ff] as string) ?? "";
      setValues(next);
    };
    if (!isEdit) {
      init({});
      return;
    }
    adminFetch<{ item: Doc }>(endpoint).then((res) => {
      if (res.success) init(res.item);
      else toast.error(res.message);
      setLoading(false);
    });
  }, [config, endpoint, isEdit, featuredFields]);

  useEffect(() => {
    if (!config?.fields.some((f) => f.optionsFrom === "categories")) return;
    adminFetch<{ items: { slug: string; name: string }[] }>("/api/admin/categories?limit=200").then((res) => {
      if (res.success) setCategoryOptions(res.items.map((c) => ({ value: c.slug, label: c.name })));
    });
  }, [config]);

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  if (!config) return <p className="text-sm text-red-600">Unknown section.</p>;

  const set = (name: string, value: unknown) => {
    setValues((v) => ({ ...v, [name]: value }));
    setDirty(true);
    if (errors[name]) setErrors((e) => ({ ...e, [name]: "" }));
  };

  const save = async (andBack: boolean) => {
    setSaving(true);
    setErrors({});
    const res = await adminFetch<{ item: Doc }>(endpoint, { method: isEdit ? "PUT" : "POST", body: JSON.stringify(values) });
    setSaving(false);
    if (!res.success) {
      setErrors(res.errors ?? {});
      toast.error(res.message);
      return;
    }
    setDirty(false);
    toast.success(`${config.singular} saved`);
    if (mode === "settings") {
      router.refresh();
      return;
    }
    if (andBack) router.push(`/admin/${resourceKey}`);
    else if (!id) router.replace(`/admin/${resourceKey}/${String(res.item._id)}/edit`);
    else router.refresh();
  };

  const remove = async () => {
    if (!id || !window.confirm(`Delete this ${config.singular.toLowerCase()}? This cannot be undone.`)) return;
    setDeleting(true);
    const res = await adminFetch(endpoint, { method: "DELETE" });
    setDeleting(false);
    if (!res.success) return toast.error(res.message);
    toast.success(`${config.singular} deleted`);
    setDirty(false);
    router.push(`/admin/${resourceKey}`);
  };

  const renderField = (f: FieldDef) => {
    const fid = `f-${f.name.replace(/\./g, "-")}`;
    const v = values[f.name];
    const err = errors[f.name];
    const labelEl = (
      <label htmlFor={fid} className="label">
        {f.label}
        {f.required && <span className="text-primary"> *</span>}
      </label>
    );

    let control: React.ReactNode;
    switch (f.type) {
      case "textarea":
        control = <textarea id={fid} rows={4} value={(v as string) ?? ""} maxLength={f.max} onChange={(e) => set(f.name, e.target.value)} className="input" aria-invalid={Boolean(err)} />;
        break;
      case "richtext":
        control = <RichTextEditor id={fid} value={(v as string) ?? ""} onChange={(html) => set(f.name, html)} />;
        break;
      case "number":
        control = <input id={fid} type="number" step="any" min={0} value={(v as number | string) ?? ""} onChange={(e) => set(f.name, e.target.value)} className="input" aria-invalid={Boolean(err)} />;
        break;
      case "boolean":
        return (
          <div key={f.name} className={cn(f.half ? "" : "md:col-span-2")}>
            <label htmlFor={fid} className="flex cursor-pointer items-center justify-between gap-3 rounded-md border border-line bg-white px-4 py-3">
              <span className="text-sm font-medium">{f.label}</span>
              <span className="relative inline-flex">
                <input id={fid} type="checkbox" className="peer sr-only" checked={Boolean(v)} onChange={(e) => set(f.name, e.target.checked)} />
                <span className="h-6 w-11 rounded-full bg-beige transition peer-checked:bg-primary peer-focus-visible:ring-2 peer-focus-visible:ring-primary/40" />
                <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition peer-checked:translate-x-5" />
              </span>
            </label>
          </div>
        );
      case "select": {
        const options = f.optionsFrom === "categories" ? categoryOptions : f.options ?? [];
        control = (
          <select id={fid} value={(v as string) ?? ""} onChange={(e) => set(f.name, e.target.value)} className="input" aria-invalid={Boolean(err)}>
            <option value="">Select...</option>
            {options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
            {typeof v === "string" && v && !options.some((o) => o.value === v) && <option value={v}>{v}</option>}
          </select>
        );
        break;
      }
      case "tags":
        control = <TagsInput id={fid} value={(v as string[]) ?? []} onChange={(t) => set(f.name, t)} />;
        break;
      case "image":
        return (
          <div key={f.name} className={cn(f.half ? "" : "md:col-span-2")}>
            <ImageUploadField label={f.label} value={(v as string) || ""} folder={f.folder ?? "misc"} onChange={(url) => set(f.name, url)} help={f.help} />
            {err && <p className="mt-1 text-xs text-red-600">{err}</p>}
          </div>
        );
      case "gallery":
        return (
          <div key={f.name} className="md:col-span-2">
            <GalleryField
              label={f.label}
              value={(v as string[]) ?? []}
              onChange={(urls) => set(f.name, urls)}
              featured={f.featuredField ? (values[f.featuredField] as string) : undefined}
              onFeaturedChange={f.featuredField ? (url) => set(f.featuredField!, url) : undefined}
              folder={f.folder ?? "products"}
            />
            {err && <p className="mt-1 text-xs text-red-600">{err}</p>}
          </div>
        );
      case "date":
        control = <input id={fid} type="date" value={(v as string) ?? ""} onChange={(e) => set(f.name, e.target.value)} className="input" />;
        break;
      case "json":
        control = <textarea id={fid} rows={8} value={(v as string) ?? "{}"} onChange={(e) => set(f.name, e.target.value)} className="input font-mono text-xs" spellCheck={false} aria-invalid={Boolean(err)} />;
        break;
      default:
        control = <input id={fid} type={f.type === "email" ? "email" : "text"} value={(v as string) ?? ""} maxLength={f.max} onChange={(e) => set(f.name, e.target.value)} className="input" aria-invalid={Boolean(err)} />;
    }

    return (
      <div key={f.name} className={cn(f.half ? "" : "md:col-span-2")}>
        {labelEl}
        {control}
        {f.help && <p className="mt-1 text-xs text-muted">{f.help}</p>}
        {err && <p className="mt-1 text-xs text-red-600">{err}</p>}
      </div>
    );
  };

  // Group fields into card sections.
  const sections: { title: string; fields: FieldDef[] }[] = [];
  for (const f of config.fields) {
    if (f.section || !sections.length) sections.push({ title: f.section ?? "Details", fields: [] });
    sections[sections.length - 1].fields.push(f);
  }

  const previewUrl = mode === "resource" && id ? config.previewPath?.(values) : null;

  return (
    <div className="pb-24">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          {mode === "resource" && (
            <Link href={`/admin/${resourceKey}`} className="mb-2 inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-primary">
              <ArrowLeft className="h-4 w-4" /> {config.label}
            </Link>
          )}
          <h1 className="text-2xl font-extrabold">{mode === "settings" ? config.label : `${id ? "Edit" : "New"} ${config.singular}`}</h1>
          <p className="text-sm text-muted">{config.description}</p>
        </div>
        {previewUrl && (
          <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="btn-outline min-h-9 text-xs">
            <ExternalLink className="h-3.5 w-3.5" /> View on site
          </a>
        )}
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            save(false);
          }}
          className="space-y-6"
        >
          {sections.map((s, i) => (
            <fieldset key={s.title + i} className="card p-5 sm:p-6">
              <legend className="sr-only">{s.title}</legend>
              <h2 className="mb-4 text-base font-bold">{s.title}</h2>
              <div className="grid gap-4 md:grid-cols-2">{s.fields.map(renderField)}</div>
            </fieldset>
          ))}

          <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 backdrop-blur lg:left-64">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
              <div>
                {id && mode === "resource" && (
                  <button type="button" onClick={remove} disabled={deleting} className="btn min-h-10 border border-red-200 text-red-700 hover:bg-red-50">
                    {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    <span className="hidden sm:inline">Delete</span>
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                {dirty && <span className="hidden text-xs text-amber-700 sm:inline">Unsaved changes</span>}
                {mode === "resource" && (
                  <button type="button" disabled={saving} onClick={() => save(true)} className="btn-outline min-h-10">
                    Save &amp; close
                  </button>
                )}
                <button type="submit" disabled={saving} className="btn-primary min-h-10">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save
                </button>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
