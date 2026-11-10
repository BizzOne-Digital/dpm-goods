"use client";

import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, GripVertical, ImagePlus, Loader2, RefreshCw, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import SmartImage from "@/components/ui/SmartImage";
import { uploadImage } from "@/lib/admin/client";
import { ALLOWED_IMAGE_TYPES, type UploadFolder } from "@/lib/constants";
import { cn } from "@/lib/utils";

type Props = {
  value: string[];
  onChange: (urls: string[]) => void;
  featured?: string;
  onFeaturedChange?: (url: string) => void;
  folder: UploadFolder;
  label?: string;
  max?: number;
};

/** Multi-image manager: upload (multiple), replace, remove, set featured, drag-and-drop reorder. */
export default function GalleryField({ value, onChange, featured, onFeaturedChange, folder, label = "Images", max = 12 }: Props) {
  const addRef = useRef<HTMLInputElement>(null);
  const replaceRef = useRef<HTMLInputElement>(null);
  const [replaceIndex, setReplaceIndex] = useState<number | null>(null);
  const [uploading, setUploading] = useState(0);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const images = value ?? [];
  const featuredUrl = featured && images.includes(featured) ? featured : images[0];

  const addFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const list = Array.from(files).slice(0, Math.max(max - images.length, 0));
    if (!list.length) {
      toast.error(`You can add up to ${max} images.`);
      return;
    }
    setUploading(list.length);
    const urls: string[] = [];
    for (const file of list) {
      const result = await uploadImage(file, folder);
      if ("error" in result) toast.error(`${file.name}: ${result.error}`);
      else urls.push(result.url);
      setUploading((n) => n - 1);
    }
    if (urls.length) {
      const next = [...images, ...urls];
      onChange(next);
      if (!featuredUrl) onFeaturedChange?.(next[0]);
      toast.success(`${urls.length} image(s) uploaded. Save to apply changes.`);
    }
  };

  const replaceFile = async (file?: File) => {
    if (!file || replaceIndex === null) return;
    setUploading(1);
    const result = await uploadImage(file, folder);
    setUploading(0);
    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    const old = images[replaceIndex];
    const next = images.map((u, i) => (i === replaceIndex ? result.url : u));
    onChange(next);
    if (old === featuredUrl) onFeaturedChange?.(result.url);
    setReplaceIndex(null);
    toast.success("Image replaced. Save to apply changes.");
  };

  const remove = (index: number) => {
    const removed = images[index];
    const next = images.filter((_, i) => i !== index);
    onChange(next);
    if (removed === featuredUrl) onFeaturedChange?.(next[0] ?? "");
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= images.length || from === to) return;
    const next = [...images];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="label mb-0">{label}</p>
        <span className="text-xs text-muted">
          {images.length}/{max} · drag to reorder
        </span>
      </div>
      <input ref={addRef} type="file" multiple accept={ALLOWED_IMAGE_TYPES.join(",")} className="sr-only" onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} aria-label="Add images" />
      <input ref={replaceRef} type="file" accept={ALLOWED_IMAGE_TYPES.join(",")} className="sr-only" onChange={(e) => { replaceFile(e.target.files?.[0]); e.target.value = ""; }} aria-label="Replace image" />

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((url, i) => (
          <li
            key={url + i}
            draggable
            onDragStart={() => setDragIndex(i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (dragIndex !== null) move(dragIndex, i);
              setDragIndex(null);
            }}
            onDragEnd={() => setDragIndex(null)}
            className={cn("group relative overflow-hidden rounded-lg border bg-white", url === featuredUrl ? "border-primary ring-2 ring-primary/30" : "border-line", dragIndex === i && "opacity-50")}
          >
            <div className="relative aspect-square bg-cream">
              <SmartImage src={url} alt={`Image ${i + 1}`} fill sizes="200px" className="object-cover" />
              <span className="absolute left-1.5 top-1.5 grid h-7 w-7 cursor-grab place-items-center rounded bg-white/90 text-muted shadow-sm" aria-hidden="true">
                <GripVertical className="h-4 w-4" />
              </span>
              {url === featuredUrl && <span className="absolute right-1.5 top-1.5 rounded bg-primary px-1.5 py-0.5 text-[10px] font-bold text-white">Featured</span>}
            </div>
            <div className="flex items-center justify-between gap-1 p-1.5">
              <div className="flex">
                <button type="button" onClick={() => move(i, i - 1)} disabled={i === 0} className="grid h-8 w-8 place-items-center rounded hover:bg-cream disabled:opacity-30" aria-label="Move left">
                  <ArrowLeft className="h-3.5 w-3.5" />
                </button>
                <button type="button" onClick={() => move(i, i + 1)} disabled={i === images.length - 1} className="grid h-8 w-8 place-items-center rounded hover:bg-cream disabled:opacity-30" aria-label="Move right">
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="flex">
                <button type="button" onClick={() => onFeaturedChange?.(url)} className={cn("grid h-8 w-8 place-items-center rounded hover:bg-cream", url === featuredUrl && "text-primary")} aria-label="Set as featured image" title="Set featured">
                  <Star className={cn("h-3.5 w-3.5", url === featuredUrl && "fill-primary")} />
                </button>
                <button type="button" onClick={() => { setReplaceIndex(i); replaceRef.current?.click(); }} className="grid h-8 w-8 place-items-center rounded hover:bg-cream" aria-label="Replace image" title="Replace">
                  <RefreshCw className="h-3.5 w-3.5" />
                </button>
                <button type="button" onClick={() => remove(i)} className="grid h-8 w-8 place-items-center rounded text-red-600 hover:bg-red-50" aria-label="Remove image" title="Remove">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </li>
        ))}
        {images.length < max && (
          <li>
            <button
              type="button"
              disabled={uploading > 0}
              onClick={() => addRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
              }}
              className="flex aspect-square w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-line text-sm text-muted transition hover:border-primary hover:bg-cream/50 hover:text-primary"
            >
              {uploading > 0 ? <Loader2 className="h-6 w-6 animate-spin text-primary" /> : <ImagePlus className="h-6 w-6" />}
              <span className="font-semibold">{uploading > 0 ? `Uploading ${uploading}...` : "Add images"}</span>
            </button>
          </li>
        )}
      </ul>
    </div>
  );
}
