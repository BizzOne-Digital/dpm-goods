import Link from "next/link";

export default function RootNotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-cream px-4 text-center">
      <div>
        <p className="font-display text-7xl font-extrabold text-beige">404</p>
        <h1 className="mt-3 text-2xl font-extrabold">Page not found</h1>
        <Link href="/" className="btn-primary mt-6">Back to Home</Link>
      </div>
    </main>
  );
}
