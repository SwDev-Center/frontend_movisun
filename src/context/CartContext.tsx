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
  | { type: "remove"; id: number }
  | { type: "hydrate"; items: CartItem[] };

/**
 * `hidratado` distingue el estado vacío inicial (que es el que también pinta el
 * servidor) del carrito ya leído de localStorage. Vive acá dentro y no en un
 * useState aparte por dos razones: `react-hooks/set-state-in-effect` prohíbe
 * llamar a un setState desde un efecto, y así la bandera y los ítems cambian
 * siempre en el MISMO commit, que es lo que vuelve seguro persistirlos.
 */
interface CartState {
  items: CartItem[];
  hidratado: boolean;
}

const ESTADO_INICIAL: CartState = { items: [], hidratado: false };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "add": {
      const exists = state.items.find(
        (i) => i.id === action.item.id && i.selectedColor === action.item.selectedColor
      );
      const items = exists
        ? state.items.map((i) =>
            i.id === action.item.id && i.selectedColor === action.item.selectedColor
              ? { ...i, quantity: i.quantity + action.item.quantity }
              : i
          )
        : [...state.items, action.item];
      return { ...state, items };
    }
    case "update-qty":
      return {
        ...state,
        items: state.items.map((i) => (i.id === action.id ? { ...i, quantity: action.qty } : i)),
      };
    case "remove":
      return { ...state, items: state.items.filter((i) => i.id !== action.id) };
    // Carga lo guardado en el navegador. Es idempotente a propósito: en modo
    // estricto React ejecuta el efecto dos veces y el resultado es el mismo.
    case "hydrate":
      return { items: action.items, hidratado: true };
  }
}

function leerCarritoGuardado(): CartItem[] {
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
  // El carrito arranca VACÍO, igual que en el servidor, y lo guardado se lee
  // recién después del montaje. Leerlo durante el render (como hacía el
  // inicializador del reducer) hacía que el primer render del cliente no
  // coincidiera con el HTML del servidor: error de hidratación, visible en la
  // insignia del carrito del header y en el botón flotante de WhatsApp.
  const [{ items, hidratado }, dispatch] = useReducer(cartReducer, ESTADO_INICIAL);

  useEffect(() => {
    dispatch({ type: "hydrate", items: leerCarritoGuardado() });
  }, []);

  useEffect(() => {
    // Sin esta guarda se persistiría el [] del primer render y se borraría el
    // carrito del visitante antes de alcanzar a leerlo.
    if (!hidratado) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* storage unavailable — cart still works in-memory */
    }
  }, [items, hidratado]);

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
