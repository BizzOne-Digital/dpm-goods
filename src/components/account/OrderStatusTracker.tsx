import { Check, CircleX } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = ["pending", "paid", "processing", "shipped", "delivered"];

export default function OrderStatusTracker({ status }: { status: string }) {
  if (status === "cancelled" || status === "refunded") {
    return (
      <p className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm font-semibold capitalize text-red-700">
        <CircleX className="h-5 w-5" aria-hidden="true" /> Order {status}
      </p>
    );
  }
  const current = Math.max(STEPS.indexOf(status), 0);
  return (
    <ol className="grid grid-cols-5 gap-1" aria-label="Order progress">
      {STEPS.map((step, i) => {
        const done = i <= current;
        return (
          <li key={step} className="flex flex-col items-center text-center" aria-current={i === current ? "step" : undefined}>
            <div className="flex w-full items-center">
              <span className={cn("h-0.5 flex-1", i === 0 ? "bg-transparent" : done ? "bg-primary" : "bg-line")} />
              <span className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold", done ? "bg-primary text-white" : "bg-beige text-muted")}>
                {done ? <Check className="h-4 w-4" aria-hidden="true" /> : i + 1}
              </span>
              <span className={cn("h-0.5 flex-1", i === STEPS.length - 1 ? "bg-transparent" : i < current ? "bg-primary" : "bg-line")} />
            </div>
            <span className={cn("mt-2 text-[11px] font-semibold capitalize sm:text-xs", done ? "text-ink" : "text-muted")}>{step}</span>
          </li>
        );
      })}
    </ol>
  );
}
