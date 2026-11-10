"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export default function QuantityControl({
  value,
  onChange,
  min = 1,
  max = 99,
  size = "md",
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  size?: "sm" | "md";
}) {
  const btn = cn("grid place-items-center text-ink transition hover:bg-cream disabled:opacity-40", size === "sm" ? "h-8 w-8" : "h-11 w-11");
  return (
    <div className="inline-flex items-center rounded-md border border-line bg-white" role="group" aria-label="Quantity">
      <button type="button" className={btn} onClick={() => onChange(value - 1)} disabled={value <= min} aria-label="Decrease quantity">
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className={cn("min-w-8 text-center font-semibold tabular-nums", size === "sm" ? "text-sm" : "text-base")} aria-live="polite">
        {value}
      </span>
      <button type="button" className={btn} onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Increase quantity">
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
