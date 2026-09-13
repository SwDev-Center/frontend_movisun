"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useMemo,
  type ReactNode,
} from "react";
import type { CartItem, Product } from "@/lib/types";

// Versioned so future schema changes can migrate/ignore stale carts.
const CART_STORAGE_KEY = "movisun.cart.v1";

type CartAction =
  | { type: "add"; item: CartItem }
  | { type: "update-qty"; id: number; qty: number }
  | { type: "remove"; id: number };

function cartReducer(state: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case "add": {
      const exists = state.find(
        (i) => i.id === action.item.id && i.selectedColor === action.item.selectedColor
      );
      if (exists) {
        return state.map((i) =>
          i.id === action.item.id && i.selectedColor === action.item.selectedColor
            ? { ...i, quantity: i.quantity + action.item.quantity }
            : i
        );
      }
      return [...state, action.item];
    }
    case "update-qty":
      return state.map((i) => (i.id === action.id ? { ...i, quantity: action.qty } : i));
    case "remove":
      return state.filter((i) => i.id !== action.id);
  }
}

function readInitialCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  total: number;
  addItem: (product: Product, qty?: number, color?: string) => void;
  updateQty: (id: number, qty: number) => void;
  removeItem: (id: number) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, dispatch] = useReducer(cartReducer, undefined, readInitialCart);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* storage unavailable — cart still works in-memory */
    }
  }, [items]);

  const addItem = useCallback((product: Product, qty = 1, color?: string) => {
    dispatch({ type: "add", item: { ...product, quantity: qty, selectedColor: color } });
  }, []);

  const updateQty = useCallback((id: number, qty: number) => {
    dispatch({ type: "update-qty", id, qty });
  }, []);

  const removeItem = useCallback((id: number) => {
    dispatch({ type: "remove", id });
  }, []);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((s, i) => s + i.quantity, 0);
    const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
    return { items, count, total, addItem, updateQty, removeItem };
  }, [items, addItem, updateQty, removeItem]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within <CartProvider>");
  return ctx;
}