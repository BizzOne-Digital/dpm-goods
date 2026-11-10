import Link from "next/link";
import SmartImage from "@/components/ui/SmartImage";
import { cn } from "@/lib/utils";

type LogoProps = {
  logo?: string;
  siteName?: string;
  companyName?: string;
  variant?: "dark" | "light";
  className?: string;
};

/** Text logo by default; switches to the uploaded logo once set in Website Settings. */
export default function Logo({
  logo,
  siteName = "DPM Goods",
  companyName = "Direct Primary Merchandises LLC",
  variant = "dark",
  className,
}: LogoProps) {
  if (logo) {
    return (
      <Link
        href="/"
        className={cn("relative block h-14 w-[104px] sm:h-16 sm:w-[118px]", variant === "light" && "h-16 w-[140px] rounded-lg bg-white px-2", className)}
        aria-label={`${siteName} home`}
      >
        <SmartImage src={logo} alt={siteName} fill sizes="140px" className={cn("object-contain object-left", variant === "light" && "object-center p-1.5")} priority />
      </Link>
    );
  }

  const [first, ...rest] = siteName.split(" ");
  return (
    <Link href="/" className={cn("group inline-flex flex-col leading-none", className)} aria-label={`${siteName} home`}>
      <span className="font-display text-[26px] font-extrabold tracking-tight sm:text-[28px]">
        <span className={variant === "light" ? "text-white" : "text-ink"}>{first}</span>{" "}
        <span className={variant === "light" ? "text-primary-light" : "text-primary"}>{rest.join(" ")}</span>
      </span>
      <span className={cn("mt-1 text-[10px] font-medium tracking-wide", variant === "light" ? "text-white/70" : "text-muted")}>
        {companyName}
      </span>
    </Link>
  );
}
