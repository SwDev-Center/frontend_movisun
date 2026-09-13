"use client";

import { useRef } from "react";
import { motion } from "motion/react";
import { ShoppingCart, X, Minus, Plus } from "lucide-react";
import { PRIMARY, COLOR_HEX, EASE } from "@/lib/constants";
import { fmt, buildOrderUrl } from "@/lib/utils";
import type { Advisor } from "@/lib/types";
import { useShop } from "@/context/ShopContext";
import { useCart } from "@/context/CartContext";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { WaIcon } from "@/components/ui/WaIcon";
import { ProductImage } from "@/components/ui/ProductImage";

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.45, ease: EASE } },
};
const slideRight = {
  hidden: { opacity: 0, x: "100%" },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: EASE } },
  exit: { opacity: 0, x: "100%", transition: { duration: 0.28, ease: EASE } },
};

export function CartDrawer({ advisors }: { advisors: Advisor[] }) {
  const { closeCart } = useShop();
  const { items, count, total, updateQty, removeItem } = useCart();
  const salesWa = advisors[0]?.wa ?? "";
  // Trampa de foco + Escape: el panel es un diálogo accesible.
  const panelRef = useRef<HTMLDivElement>(null);
  useFocusTrap(panelRef, closeCart);

  return (
    <motion.div className="fixed inset-0 z-[60] flex justify-end" variants={fadeIn} initial="hidden" animate="visible" exit="hidden">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeCart} />
      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-title"
        tabIndex={-1}
        className="relative w-full max-w-sm bg-white h-full flex flex-col shadow-2xl outline-none"
        variants={slideRight}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div className="flex items-center gap-2.5">
            <ShoppingCart size={19} style={{ color: PRIMARY }} aria-hidden="true" />
            <h2 id="cart-drawer-title" className="font-extrabold text-lg text-foreground">Carrito</h2>
            {count > 0 && (
              <span
                className="text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: PRIMARY }}
              >
                {count}
              </span>
            )}
          </div>
          <button onClick={closeCart} aria-label="Cerrar carrito" className="w-9 h-9 rounded-full hover:bg-muted flex items-center justify-center transition-colors">
            <X size={17} aria-hidden="true" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-4 text-muted-foreground">
              <ShoppingCart size={52} strokeWidth={1} aria-hidden="true" />
              <div className="text-center">
                <p className="font-semibold text-sm">Tu carrito está vacío</p>
                <p className="text-xs mt-1">Agrega productos para comenzar</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <motion.div key={`${item.id}-${item.selectedColor ?? ""}`} layout className="flex gap-3 bg-muted rounded-2xl p-3.5">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-white shrink-0">
                    <ProductImage src={item.image} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      {item.subcategory}
                    </p>
                    <p className="text-sm font-bold text-foreground leading-tight line-clamp-2 mt-0.5">{item.name}</p>
                    {item.selectedColor && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <span
                          className="w-3 h-3 rounded-full border border-black/10"
                          style={{ background: COLOR_HEX[item.selectedColor] ?? item.selectedColor }}
                        />
                        <span className="text-[10px] text-muted-foreground">{item.selectedColor}</span>
                      </div>
                    )}
                    <p className="text-sm font-bold mt-1" style={{ color: PRIMARY }}>
                      {fmt(item.price)}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-border rounded-lg bg-white overflow-hidden">
                        <button
                          onClick={() => (item.quantity > 1 ? updateQty(item.id, item.quantity - 1) : removeItem(item.id))}
                          className="px-2 py-1.5"
                          style={{ color: PRIMARY }}
                          aria-label={item.quantity > 1 ? "Disminuir cantidad" : "Eliminar producto"}
                        >
                          <Minus size={11} aria-hidden="true" />
                        </button>
                        <span className="px-2 text-xs font-bold">{item.quantity}</span>
                        <button onClick={() => updateQty(item.id, item.quantity + 1)} className="px-2 py-1.5" style={{ color: PRIMARY }} aria-label="Aumentar cantidad">
                          <Plus size={11} aria-hidden="true" />
                        </button>
                      </div>
                      <button onClick={() => removeItem(item.id)} className="text-[11px] font-semibold text-red-500 hover:text-red-700 transition-colors">
                        Eliminar
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
        {items.length > 0 && (
          <div className="px-5 py-5 border-t border-border space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-semibold">{fmt(total)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Envío</span>
              <span className="text-emerald-600 font-semibold">Por WhatsApp</span>
            </div>
            <div className="h-px bg-border" />
            <div className="flex justify-between">
              <span className="font-extrabold">Total</span>
              <span className="text-2xl font-extrabold" style={{ color: PRIMARY }}>
                {fmt(total)}
              </span>
            </div>
            <a
              href={buildOrderUrl(items, salesWa)}
              target="_blank"
              rel="noopener noreferrer"
              // Verde oscuro (#15803D, 5.0:1 con texto blanco) para cumplir AA.
              className="flex items-center justify-center gap-2.5 w-full py-4 rounded-2xl font-bold text-sm text-white bg-(--wa-btn) hover:bg-(--wa-btn-hover) transition-colors"
            >
              <WaIcon size={18} /> Pedir por WhatsApp
            </a>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}