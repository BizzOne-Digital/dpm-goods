"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { CartItem } from "@/types";

const STORAGE_KEY = "dpm_cart_v1";

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  ready: boolean;
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  addItem: (item: Omit<CartItem, "key" | "quantity">, quantity?: number) => void;
  updateQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export const cartKey = (productId: string, size?: string, color?: string) =>
  [productId, size ?? "", color ?? ""].join("::");

function readStorage(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((i) => i && i.productId && i.quantity > 0) : [];
  } catch {
    return [];
  }
}

function mergeCarts(a: CartItem[], b: CartItem[]): CartItem[] {
  const map = new Map<string, CartItem>();
  for (const item of [...a, ...b]) {
    const existing = map.get(item.key);
    map.set(item.key, existing ? { ...item, quantity: Math.max(existing.quantity, item.quantity) } : item);
  }
  return [...map.values()];
}

export function CartProvider({ signedIn, children }: { signedIn: boolean; children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const synced = useRef(false);

  // Load guest cart, then merge with the account cart after sign-in.
  useEffect(() => {
    const local = readStorage();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- browser storage only exists after mount (hydration-safe load)
    setItems(local);
    setReady(true);
    if (!signedIn) {
      synced.current = false;
      return;
    }
    let cancelled = false;
    fetch("/api/account/cart")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data?.success) return;
        const merged = mergeCarts(data.items ?? [], local);
        setItems(merged);
        synced.current = true;
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [signedIn]);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* storage unavailable */
    }
    if (signedIn && synced.current) {
      if (syncTimer.current) clearTimeout(syncTimer.current);
      syncTimer.current = setTimeout(() => {
        fetch("/api/account/cart", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items }),
        }).catch(() => undefined);
      }, 600);
    }
  }, [items, ready, signedIn]);

  const addItem = useCallback<CartContextValue["addItem"]>((item, quantity = 1) => {
    const key = cartKey(item.productId, item.size, item.color);
    setItems((prev) => {
      const existing = prev.find((i) => i.key === key);
      if (existing) {
        return prev.map((i) => (i.key === key ? { ...i, quantity: Math.min(i.quantity + quantity, 99) } : i));
      }
      return [...prev, { ...item, key, quantity: Math.min(quantity, 99) }];
    });
    setDrawerOpen(true);
  }, []);

  const updateQuantity = useCallback((key: string, quantity: number) => {
    setItems((prev) =>
      quantity <= 0 ? prev.filter((i) => i.key !== key) : prev.map((i) => (i.key === key ? { ...i, quantity: Math.min(quantity, 99) } : i))
    );
  }, []);

  const removeItem = useCallback((key: string) => setItems((prev) => prev.filter((i) => i.key !== key)), []);
  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      ready,
      count: items.reduce((n, i) => n + i.quantity, 0),
      subtotal: Math.round(items.reduce((n, i) => n + i.price * i.quantity, 0) * 100) / 100,
      drawerOpen,
      setDrawerOpen,
      addItem,
      updateQuantity,
      removeItem,
      clear,
    }),
    [items, ready, drawerOpen, addItem, updateQuantity, removeItem, clear]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
