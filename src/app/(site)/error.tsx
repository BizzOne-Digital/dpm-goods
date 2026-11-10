"use client";

import Link from "next/link";
import { useEffect } from "react";
import { RefreshCw } from "lucide-react";

export default function SiteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="container-x flex flex-col items-center py-24 text-center" role="alert">
      <h1 className="text-3xl font-extrabold">Something went wrong</h1>
      <p className="mt-2 max-w-md text-muted">We couldn&apos;t load this page. Please try again in a moment.</p>
      <div className="mt-8 flex gap-3">
        <button type="button" onClick={reset} className="btn-primary">
          <RefreshCw className="h-4 w-4" /> Try again
        </button>
        <Link href="/" className="btn-outline">Back to Home</Link>
      </div>
    </section>
  );
}
