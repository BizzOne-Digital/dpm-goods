"use client";

import { useState } from "react";
import { X } from "lucide-react";

export default function TagsInput({ id, value, onChange, placeholder = "Type and press Enter" }: { id?: string; value: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  const [draft, setDraft] = useState("");
  const tags = value ?? [];

  const commit = () => {
    const parts = draft.split(",").map((s) => s.trim()).filter(Boolean);
    if (parts.length) onChange([...new Set([...tags, ...parts])]);
    setDraft("");
  };

  return (
    <div className="flex min-h-11 flex-wrap items-center gap-1.5 rounded-md border border-line bg-white px-2 py-1.5 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
      {tags.map((tag) => (
        <span key={tag} className="inline-flex items-center gap-1 rounded bg-cream px-2 py-1 text-xs font-medium">
          {tag}
          <button type="button" onClick={() => onChange(tags.filter((t) => t !== tag))} aria-label={`Remove ${tag}`} className="text-muted hover:text-red-600">
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        id={id}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            commit();
          } else if (e.key === "Backspace" && !draft && tags.length) {
            onChange(tags.slice(0, -1));
          }
        }}
        onBlur={commit}
        placeholder={tags.length ? "" : placeholder}
        className="min-w-24 flex-1 bg-transparent px-1 text-sm outline-none"
      />
    </div>
  );
}
