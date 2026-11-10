"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { WishlistItem } from "@/types";

const STORAGE_KEY = "dpm_wishlist_v1";

type WishlistContextValue = {
  items: WishlistItem[];
  ready: boolean;
  has: (productId: string) => boolean;
  toggle: (item: WishlistItem) => boolean;
  remove: (productId: string) => void;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);

function readStorage(): WishlistItem[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed.filter((i) => i?.productId) : [];
  } catch {
    return [];
  }
}

export function WishlistProvider({ signedIn, children }: { signedIn: boolean; children: React.ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [ready, setReady] = useState(false);
  const synced = useRef(false);

  useEffect(() => {
    const local = readStorage();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- browser storage only exists after mount (hydration-safe load)
    setItems(local);
    setReady(true);
    if (!signedIn) return;
    fetch("/api/account/wishlist")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data?.success) return;
        const remote: WishlistItem[] = data.items ?? [];
        const merged = [...remote];
        for (const item of local) if (!merged.some((m) => m.productId === item.productId)) merged.push(item);
        setItems(merged);
        synced.current = true;
      })
      .catch(() => undefined);
  }, [signedIn]);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
    if (signedIn && synced.current) {
      fetch("/api/account/wishlist", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productIds: items.map((i) => i.productId) }),
      }).catch(() => undefined);
    }
  }, [items, ready, signedIn]);

  const has = useCallback((id: string) => items.some((i) => i.productId === id), [items]);

  const toggle = useCallback(
    (item: WishlistItem) => {
      const exists = items.some((i) => i.productId === item.productId);
      setItems((prev) => (exists ? prev.filter((i) => i.productId !== item.productId) : [...prev, item]));
      return !exists;
    },
    [items]
  );

  const remove = useCallback((id: string) => setItems((prev) => prev.filter((i) => i.productId !== id)), []);

  const value = useMemo(() => ({ items, ready, has, toggle, remove }), [items, ready, has, toggle, remove]);
  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used inside WishlistProvider");
  return ctx;
}
