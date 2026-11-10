"use client";

import { useRef, useState } from "react";
import { Copy, ImagePlus, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import SmartImage from "@/components/ui/SmartImage";
import { Pager, usePagedList } from "@/components/admin/SimpleList";
import { adminFetch, uploadImage } from "@/lib/admin/client";
import { ALLOWED_IMAGE_TYPES, UPLOAD_FOLDERS, type UploadFolder } from "@/lib/constants";
import { cn, formatBytes, formatDate } from "@/lib/utils";

type Media = { _id: string; folder: string; filename: string; mimeType: string; size: number; createdAt: string; url: string };

export default function MediaPage() {
  const [folder, setFolder] = useState<string>("");
  const list = usePagedList<Media>("/api/admin/media", { folder });
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    let okCount = 0;
    for (const file of Array.from(files)) {
      const r = await uploadImage(file, (folder || "misc") as UploadFolder);
      if ("error" in r) toast.error(`${file.name}: ${r.error}`);
      else okCount++;
    }
    setUploading(false);
    if (okCount) toast.success(`${okCount} image(s) uploaded`);
    list.reload();
  };

  const remove = async (m: Media) => {
    setBusy(m._id);
    const check = await adminFetch<{ references: number }>(`/api/admin/media/${m._id}`);
    const refs = check.success ? check.references : 0;
    const message = refs > 0 ? `This image is still used in ${refs} place(s). Deleting it will show a placeholder there. Delete anyway?` : `Delete ${m.filename}?`;
    if (!window.confirm(message)) {
      setBusy(null);
      return;
    }
    const res = await adminFetch(`/api/admin/media/${m._id}${refs > 0 ? "?force=1" : ""}`, { method: "DELETE" });
    setBusy(null);
    if (!res.success) return toast.error(res.message);
    toast.success("Image deleted");
    list.reload();
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">Media Library</h1>
          <p className="text-sm text-muted">
            Images stored in MongoDB (safe across deployments). <span className="font-semibold text-ink">{list.total}</span> files.
          </p>
        </div>
        <div>
          <input ref={fileRef} type="file" multiple accept={ALLOWED_IMAGE_TYPES.join(",")} className="sr-only" onChange={(e) => { upload(e.target.files); e.target.value = ""; }} aria-label="Upload images" />
          <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="btn-primary">
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />} Upload to {folder || "misc"}
          </button>
        </div>
      </div>

      <div className="no-scrollbar mb-4 flex gap-1.5 overflow-x-auto" role="tablist" aria-label="Filter by folder">
        {["", ...UPLOAD_FOLDERS].map((f) => (
          <button
            key={f || "all"}
            type="button"
            role="tab"
            aria-selected={folder === f}
            onClick={() => { list.setPage(() => 1); setFolder(f); }}
            className={cn("shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold capitalize", folder === f ? "border-primary bg-primary text-white" : "border-line bg-white hover:border-primary")}
          >
            {f || "All"}
          </button>
        ))}
      </div>

      {list.loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => <div key={i} className="skeleton aspect-square" />)}
        </div>
      ) : list.items.length === 0 ? (
        <div className="card p-14 text-center">
          <p className="font-semibold">No images in this folder yet.</p>
          <p className="mt-1 text-sm text-muted">Images uploaded from products, pages and settings appear here.</p>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {list.items.map((m) => (
            <li key={m._id} className={cn("card overflow-hidden", busy === m._id && "opacity-60")}>
              <div className="relative aspect-square bg-cream">
                <SmartImage src={m.url} alt={m.filename} fill sizes="200px" className="object-cover" />
              </div>
              <div className="space-y-0.5 p-2.5 text-xs">
                <p className="truncate font-semibold" title={m.filename}>{m.filename}</p>
                <p className="text-muted"><span className="capitalize">{m.folder}</span> · {m.mimeType.replace("image/", "").toUpperCase()} · {formatBytes(m.size)}</p>
                <p className="text-muted">{formatDate(m.createdAt)}</p>
                <div className="flex justify-end gap-1 pt-1">
                  <button
                    type="button"
                    onClick={() => navigator.clipboard?.writeText(m.url).then(() => toast.success("URL copied"))}
                    className="grid h-8 w-8 place-items-center rounded hover:bg-cream"
                    aria-label="Copy URL"
                    title="Copy URL"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                  <button type="button" onClick={() => remove(m)} disabled={busy === m._id} className="grid h-8 w-8 place-items-center rounded text-red-600 hover:bg-red-50" aria-label="Delete image" title="Delete">
                    {busy === m._id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      <Pager page={list.page} pages={list.pages} setPage={list.setPage} />
    </div>
  );
}
