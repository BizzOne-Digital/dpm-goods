"use client";

import { useId, useRef, useState } from "react";
import { ImagePlus, Loader2, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import SmartImage from "@/components/ui/SmartImage";
import { uploadImage } from "@/lib/admin/client";
import { ALLOWED_IMAGE_TYPES, type UploadFolder } from "@/lib/constants";
import { cn } from "@/lib/utils";

type ImageUploadFieldProps = {
  value?: string;
  folder: UploadFolder;
  onChange: (url: string) => void;
  label?: string;
  help?: string;
};

/**
 * Uploads to MongoDB via /api/upload and stores ONLY the returned URL.
 * Replace: the new image uploads first; the old one is removed server-side after the document saves.
 * Remove: clears the URL; the stored file is deleted when the document is saved.
 */
export default function ImageUploadField({ value, folder, onChange, label, help }: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const id = useId();
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);

  const handleFile = async (file?: File | null) => {
    if (!file) return;
    setUploading(true);
    const result = await uploadImage(file, folder);
    setUploading(false);
    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    onChange(result.url);
    toast.success("Image uploaded. Save to apply changes.");
  };

  return (
    <div>
      {label && (
        <label htmlFor={id} className="label">
          {label}
        </label>
      )}
      <input
        id={id}
        ref={inputRef}
        type="file"
        accept={ALLOWED_IMAGE_TYPES.join(",")}
        className="sr-only"
        disabled={uploading}
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      {value ? (
        <div className="flex flex-wrap items-center gap-4 rounded-lg border border-line bg-cream/40 p-3">
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md bg-white ring-1 ring-line">
            <SmartImage src={value} alt={label ?? "Uploaded image"} fill sizes="96px" className="object-cover" />
            {uploading && (
              <div className="absolute inset-0 grid place-items-center bg-white/70">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-muted" title={value}>
              {value}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button type="button" disabled={uploading} onClick={() => inputRef.current?.click()} className="btn-outline min-h-9 px-3 text-xs">
                <RefreshCw className="h-3.5 w-3.5" /> Replace
              </button>
              <button
                type="button"
                disabled={uploading}
                onClick={() => {
                  onChange("");
                  toast.message("Image removed. Save to apply changes.");
                }}
                className="btn min-h-9 border border-red-200 bg-white px-3 text-xs text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-3.5 w-3.5" /> Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            handleFile(e.dataTransfer.files?.[0]);
          }}
          className={cn(
            "flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 text-sm transition",
            dragging ? "border-primary bg-cream" : "border-line bg-white hover:border-primary hover:bg-cream/50",
            uploading && "cursor-wait opacity-70"
          )}
        >
          {uploading ? <Loader2 className="h-6 w-6 animate-spin text-primary" /> : <ImagePlus className="h-6 w-6 text-primary" />}
          <span className="font-semibold">{uploading ? "Uploading..." : "Click or drop an image"}</span>
          <span className="text-xs text-muted">JPG, PNG, WebP or GIF up to 8 MB</span>
        </button>
      )}
      {help && <p className="mt-1.5 text-xs text-muted">{help}</p>}
    </div>
  );
}
