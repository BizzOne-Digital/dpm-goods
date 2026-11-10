"use client";

import { useEffect } from "react";
import { useCart } from "@/components/providers/CartProvider";

/** Clears the cart after returning from a hosted payment page. */
export default function ClearCartOnMount() {
  const { clear, ready } = useCart();
  useEffect(() => {
    if (ready) clear();
  }, [ready, clear]);
  return null;
}
