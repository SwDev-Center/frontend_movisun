"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import type { Product } from "@/lib/types";
import { useCart } from "@/context/CartContext";

interface ShopContextValue {
  cartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  selectedProduct: Product | null;
  openProduct: (p: Product) => void;
  closeProduct: () => void;
  videoOpen: boolean;
  openVideo: () => void;
  closeVideo: () => void;
  toast: string | null;
  /** Adds to cart AND shows the confirmation toast (mockup behavior). */
  addToCart: (p: Product, qty?: number, color?: string) => void;
}

const ShopContext = createContext<ShopContextValue | null>(null);

const TOAST_DURATION = 2400;

export function ShopProvider({ children }: { children: ReactNode }) {
  const { addItem: addToCartRaw } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [videoOpen, setVideoOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const addToCart = useCallback(
    (p: Product, qty = 1, color?: string) => {
      addToCartRaw(p, qty, color);
      setToast(p.name.length > 26 ? `${p.name.slice(0, 26)}…` : p.name);
      if (toastTimer.current) clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => setToast(null), TOAST_DURATION);
    },
    [addToCartRaw]
  );

  const value = useMemo<ShopContextValue>(
    () => ({
      cartOpen,
      openCart: () => setCartOpen(true),
      closeCart: () => setCartOpen(false),
      selectedProduct,
      openProduct: setSelectedProduct,
      closeProduct: () => setSelectedProduct(null),
      videoOpen,
      openVideo: () => setVideoOpen(true),
      closeVideo: () => setVideoOpen(false),
      toast,
      addToCart,
    }),
    [cartOpen, selectedProduct, videoOpen, toast, addToCart]
  );

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop(): ShopContextValue {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error("useShop must be used within <ShopProvider>");
  return ctx;
}