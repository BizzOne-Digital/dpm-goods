"use client";

import { RefreshCw } from "lucide-react";

export default function AdminError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="card p-8 text-center" role="alert">
      <h1 className="text-xl font-extrabold">This section could not load</h1>
      <p className="mt-2 text-sm text-muted">Check the database connection and try again.</p>
      <button type="button" onClick={reset} className="btn-primary mt-5">
        <RefreshCw className="h-4 w-4" /> Retry
      </button>
    </div>
  );
}
