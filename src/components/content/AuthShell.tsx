import SmartImage from "@/components/ui/SmartImage";

export default function AuthShell({ title, subtitle, image, children }: { title: string; subtitle: string; image: string; children: React.ReactNode }) {
  return (
    <section className="grid min-h-[calc(100vh-160px)] lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <SmartImage src={image} alt="" fill priority sizes="50vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/85 via-primary-dark/20 to-transparent" />
        <div className="absolute inset-x-10 bottom-10 text-white">
          <p className="font-display text-3xl font-extrabold">Elevated fashion for everyday style.</p>
          <p className="mt-2 text-white/80">Track orders, save favorites and check out faster.</p>
        </div>
      </div>
      <div className="flex items-center justify-center bg-cream/50 px-4 py-14">
        <div className="card w-full max-w-md p-7 sm:p-9">
          <h1 className="text-3xl font-extrabold">{title}</h1>
          <p className="mb-6 mt-1 text-sm text-muted">{subtitle}</p>
          {children}
        </div>
      </div>
    </section>
  );
}
