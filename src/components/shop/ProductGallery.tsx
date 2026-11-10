"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import SmartImage from "@/components/ui/SmartImage";
import { cn } from "@/lib/utils";

export default function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const list = images.length ? images : [""];
  const [active, setActive] = useState(0);
  const go = (dir: number) => setActive((i) => (i + dir + list.length) % list.length);

  return (
    <div className="flex flex-col-reverse gap-3 md:flex-row">
      {list.length > 1 && (
        <ul className="no-scrollbar flex gap-2.5 overflow-x-auto md:max-h-[640px] md:flex-col md:overflow-y-auto" aria-label="Product images">
          {list.map((img, i) => (
            <li key={img + i} className="shrink-0">
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Show image ${i + 1}`}
                aria-current={active === i}
                className={cn("relative block h-24 w-20 overflow-hidden rounded-lg bg-cream ring-2 transition", active === i ? "ring-primary" : "ring-transparent hover:ring-line")}
              >
                <SmartImage src={img} alt="" fill sizes="80px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="group relative aspect-[4/5] flex-1 overflow-hidden rounded-2xl bg-cream">
        <SmartImage
          key={list[active]}
          src={list[active]}
          alt={`${name} - image ${active + 1}`}
          fill
          priority
          sizes="(min-width: 1024px) 45vw, 100vw"
          className="animate-fade-in object-cover transition duration-700 group-hover:scale-105"
        />
        {list.length > 1 && (
          <>
            <button type="button" onClick={() => go(-1)} className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 shadow transition hover:bg-white" aria-label="Previous image">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button type="button" onClick={() => go(1)} className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 shadow transition hover:bg-white" aria-label="Next image">
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
