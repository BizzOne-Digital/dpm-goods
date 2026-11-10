import { Tag } from "lucide-react";

export default function AnnouncementBar({ text }: { text: string }) {
  return (
    <div className="bg-primary-dark text-white">
      <p className="container-x flex min-h-9 items-center justify-center gap-2 py-2 text-center text-[11.5px] font-medium tracking-wide sm:text-xs">
        <Tag className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span>{text}</span>
      </p>
    </div>
  );
}
