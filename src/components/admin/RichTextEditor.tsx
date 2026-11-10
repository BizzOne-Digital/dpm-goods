"use client";
/* eslint-disable react-hooks/refs -- editor refs are only read inside click/input handlers, never during render */

import { useEffect, useRef, useState } from "react";
import { Bold, Code2, Heading2, Heading3, ImagePlus, Italic, Link2, List, ListOrdered, Loader2, Quote, Undo2 } from "lucide-react";
import { toast } from "sonner";
import { uploadImage } from "@/lib/admin/client";
import { cn } from "@/lib/utils";

/**
 * Lightweight WYSIWYG editor (contentEditable). Output is sanitized server-side before rendering.
 * Inline images upload to MongoDB storage ("pages" folder).
 */
export default function RichTextEditor({ value, onChange, id }: { value: string; onChange: (html: string) => void; id?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<"visual" | "html">("visual");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (mode === "visual" && ref.current && ref.current.innerHTML !== value) ref.current.innerHTML = value || "";
  }, [value, mode]);

  const exec = (command: string, arg?: string) => {
    ref.current?.focus();
    document.execCommand(command, false, arg);
    onChange(ref.current?.innerHTML ?? "");
  };

  const addLink = () => {
    const url = window.prompt("Link URL (https://...)");
    if (url && /^(https?:\/\/|\/|mailto:)/.test(url)) exec("createLink", url);
  };

  const addImage = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    const result = await uploadImage(file, "pages");
    setUploading(false);
    if ("error" in result) return toast.error(result.error);
    exec("insertImage", result.url);
  };

  const tools = [
    { icon: Heading2, label: "Heading", run: () => exec("formatBlock", "<h2>") },
    { icon: Heading3, label: "Subheading", run: () => exec("formatBlock", "<h3>") },
    { icon: Bold, label: "Bold", run: () => exec("bold") },
    { icon: Italic, label: "Italic", run: () => exec("italic") },
    { icon: List, label: "Bulleted list", run: () => exec("insertUnorderedList") },
    { icon: ListOrdered, label: "Numbered list", run: () => exec("insertOrderedList") },
    { icon: Quote, label: "Quote", run: () => exec("formatBlock", "<blockquote>") },
    { icon: Link2, label: "Link", run: addLink },
    { icon: Undo2, label: "Clear formatting", run: () => exec("removeFormat") },
  ];

  return (
    <div className="overflow-hidden rounded-md border border-line focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-line bg-cream/60 p-1" role="toolbar" aria-label="Formatting">
        {mode === "visual" &&
          tools.map(({ icon: Icon, label, run }) => (
            <button key={label} type="button" onMouseDown={(e) => e.preventDefault()} onClick={run} className="grid h-8 w-8 place-items-center rounded text-ink hover:bg-white" aria-label={label} title={label}>
              <Icon className="h-4 w-4" />
            </button>
          ))}
        {mode === "visual" && (
          <>
            <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="sr-only" onChange={(e) => { addImage(e.target.files?.[0]); e.target.value = ""; }} aria-label="Insert image" />
            <button type="button" onClick={() => fileRef.current?.click()} className="grid h-8 w-8 place-items-center rounded hover:bg-white" aria-label="Insert image" title="Insert image">
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
            </button>
          </>
        )}
        <button
          type="button"
          onClick={() => setMode((m) => (m === "visual" ? "html" : "visual"))}
          className={cn("ml-auto flex h-8 items-center gap-1.5 rounded px-2 text-xs font-semibold hover:bg-white", mode === "html" && "bg-white text-primary")}
        >
          <Code2 className="h-4 w-4" /> HTML
        </button>
      </div>
      {mode === "visual" ? (
        <div
          id={id}
          ref={ref}
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-multiline="true"
          onInput={(e) => onChange((e.target as HTMLDivElement).innerHTML)}
          className="prose-dpm min-h-[220px] bg-white px-4 py-3 text-sm outline-none"
        />
      ) : (
        <textarea id={id} value={value} onChange={(e) => onChange(e.target.value)} className="block min-h-[220px] w-full bg-white px-4 py-3 font-mono text-xs outline-none" />
      )}
    </div>
  );
}
