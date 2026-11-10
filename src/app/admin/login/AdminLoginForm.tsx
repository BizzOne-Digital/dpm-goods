"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Lock } from "lucide-react";
import { toast } from "sonner";

export default function AdminLoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const body = Object.fromEntries(new FormData(e.currentTarget).entries());
      const res = await fetch("/api/admin/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!data.success) {
        setError(data.message);
        return;
      }
      toast.success("Welcome back");
      router.replace("/admin");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="admin-email" className="label">Email</label>
        <input id="admin-email" name="email" type="email" required autoComplete="username" className="input h-11" />
      </div>
      <div>
        <label htmlFor="admin-password" className="label">Password</label>
        <input id="admin-password" name="password" type="password" required autoComplete="current-password" className="input h-11" />
      </div>
      {error && (
        <p className="rounded-md bg-red-50 p-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
      <button type="submit" disabled={loading} className="btn-primary h-11 w-full">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />} Sign in
      </button>
    </form>
  );
}
