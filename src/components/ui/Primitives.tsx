import Link from "next/link";
import { ArrowRight, ChevronRight, PackageOpen, Star } from "lucide-react";
import SmartImage from "@/components/ui/SmartImage";
import { cn } from "@/lib/utils";

export function SectionHeading({
  title,
  eyebrow,
  linkText,
  linkHref,
  centered,
  className,
}: {
  title: string;
  eyebrow?: string;
  linkText?: string;
  linkHref?: string;
  centered?: boolean;
  className?: string;
}) {
  if (centered) {
    return (
      <div className={cn("mb-8 flex items-center justify-center gap-4 text-center", className)}>
        <span className="hidden h-px w-14 bg-primary/60 sm:block" />
        <h2 className="text-2xl font-extrabold text-ink sm:text-3xl">{title}</h2>
        <span className="hidden h-px w-14 bg-primary/60 sm:block" />
      </div>
    );
  }
  return (
    <div className={cn("mb-6 flex flex-wrap items-end justify-between gap-3", className)}>
      <div>
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-extrabold text-ink sm:text-3xl">{title}</h2>
          <span className="hidden h-px w-12 bg-ink/70 sm:block" />
        </div>
      </div>
      {linkText && linkHref && (
        <Link href={linkHref} className="group inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-dark">
          {linkText}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}

export function StarRating({ value = 5, size = "h-4 w-4", className }: { value?: number; size?: string; className?: string }) {
  const rounded = Math.round(value);
  return (
    <div className={cn("flex items-center gap-0.5", className)} role="img" aria-label={`Rated ${value} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={cn(size, i < rounded ? "fill-primary text-primary" : "fill-beige text-beige")} aria-hidden="true" />
      ))}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  actionText,
  actionHref,
  icon: Icon = PackageOpen,
}: {
  title: string;
  description?: string;
  actionText?: string;
  actionHref?: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-line bg-cream/50 px-6 py-14 text-center">
      <span className="mb-4 grid h-14 w-14 place-items-center rounded-full bg-white text-primary shadow-sm">
        <Icon className="h-6 w-6" />
      </span>
      <h3 className="text-lg font-bold text-ink">{title}</h3>
      {description && <p className="mt-1 max-w-md text-sm text-muted">{description}</p>}
      {actionText && actionHref && (
        <Link href={actionHref} className="btn-primary mt-5">
          {actionText}
        </Link>
      )}
    </div>
  );
}

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-xs text-muted">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1">
            {item.href ? (
              <Link href={item.href} className="hover:text-primary">
                {item.label}
              </Link>
            ) : (
              <span className="text-ink" aria-current="page">
                {item.label}
              </span>
            )}
            {i < items.length - 1 && <ChevronRight className="h-3 w-3" aria-hidden="true" />}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** Interior page hero used by About, Services, Contact, etc. */
export function PageHero({
  eyebrow,
  title,
  description,
  image,
  breadcrumbs,
  children,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  image?: string;
  breadcrumbs?: { label: string; href?: string }[];
  children?: React.ReactNode;
  align?: "left" | "center";
}) {
  return (
    <section className="relative overflow-hidden bg-primary-dark text-white">
      {image && (
        <>
          <SmartImage src={image} alt="" fill priority sizes="100vw" className="object-cover opacity-35" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary-dark via-primary-dark/85 to-primary-dark/30" />
        </>
      )}
      <div className={cn("container-x relative py-14 sm:py-20", align === "center" && "text-center")}>
        {breadcrumbs && (
          <div className={cn("mb-5 [&_a]:text-white/70 [&_a:hover]:text-white [&_span]:text-white", align === "center" && "flex justify-center")}>
            <Breadcrumbs items={breadcrumbs} />
          </div>
        )}
        {eyebrow && (
          <p className={cn("eyebrow mb-3 text-primary-light", align === "center" && "justify-center")}>
            {eyebrow}
            <span className="h-px w-10 bg-primary-light" />
          </p>
        )}
        <h1 className="max-w-3xl animate-fade-up text-3xl font-extrabold sm:text-5xl" style={align === "center" ? { marginInline: "auto" } : undefined}>
          {title}
        </h1>
        {description && (
          <p className={cn("mt-4 max-w-2xl text-base text-white/80 sm:text-lg", align === "center" && "mx-auto")}>{description}</p>
        )}
        {children}
      </div>
    </section>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton", className)} />;
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>
          <Skeleton className="aspect-[4/5] w-full rounded-xl" />
          <Skeleton className="mt-3 h-4 w-3/4" />
          <Skeleton className="mt-2 h-4 w-1/3" />
          <Skeleton className="mt-3 h-10 w-full" />
        </div>
      ))}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700 ring-amber-200",
    paid: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    processing: "bg-sky-50 text-sky-700 ring-sky-200",
    shipped: "bg-indigo-50 text-indigo-700 ring-indigo-200",
    delivered: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    completed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    confirmed: "bg-sky-50 text-sky-700 ring-sky-200",
    cancelled: "bg-red-50 text-red-700 ring-red-200",
    refunded: "bg-zinc-100 text-zinc-700 ring-zinc-200",
    new: "bg-amber-50 text-amber-700 ring-amber-200",
    read: "bg-sky-50 text-sky-700 ring-sky-200",
    resolved: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  };
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ring-1 ring-inset", styles[status] ?? "bg-cream text-ink ring-line")}>
      {status}
    </span>
  );
}
