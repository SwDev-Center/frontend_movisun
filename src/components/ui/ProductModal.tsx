"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { X, Minus, Plus, CheckCircle } from "lucide-react";
import { PRIMARY, COLOR_HEX, EASE } from "@/lib/constants";
import { fmt, discountOf } from "@/lib/utils";
import { useShop } from "@/context/ShopContext";
import { ProductImage } from "@/components/ui/ProductImage";
import { Badge } from "@/components/ui/Badge";
import { Stars } from "@/components/ui/Stars";

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.45, ease: EASE } },
};
const slideUp = {
  hidden: { opacity: 0, y: "100%" },
  visible: { opacity: 1, y: 0, transition: { duration: 0.44, ease: EASE } },
  exit: { opacity: 0, y: "100%", transition: { duration: 0.32, ease: EASE } },
};

export function ProductModal() {
  const { selectedProduct: product, closeProduct, addToCart } = useShop();
  const [qty, setQty] = useState(1);
  const [color, setColor] = useState<string | undefined>(product?.colors?.[0]);
  const disc = product ? discountOf(product) : null;

  if (!product) return null;

  const handleAdd = () => {
    addToCart(product, qty, color);
    closeProduct();
  };

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center"
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={closeProduct} />
      <motion.div
        className="relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl max-h-[92vh] overflow-y-auto"
        variants={slideUp}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <div className="relative aspect-[4/3] bg-muted overflow-hidden">
          <ProductImage src={product.image} alt={product.name} fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
          <button
            onClick={closeProduct}
            className="absolute top-4 right-4 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors backdrop-blur"
          >
            <X size={17} />
          </button>
          <div className="absolute top-4 left-4 flex gap-1.5">
            {product.badge && <Badge text={product.badge} />}
            {disc && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-600 text-white">
                -{disc}%
              </span>
            )}
          </div>
        </div>
        <div className="p-6">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-1">
            {product.subcategory}
          </p>
          <h2 className="text-2xl font-extrabold text-foreground mb-2 leading-tight">{product.name}</h2>
          <div className="flex items-center gap-2 mb-4">
            <Stars rating={product.rating} />
            <span className="text-xs text-muted-foreground">
              {product.rating} · {product.reviews} reseñas
            </span>
          </div>
          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-3xl font-extrabold" style={{ color: PRIMARY }}>
              {fmt(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-base text-muted-foreground line-through">{fmt(product.originalPrice)}</span>
            )}
          </div>
          <p className="text-sm text-foreground/70 leading-relaxed mb-5">{product.description}</p>

          {product.colors && product.colors.length > 0 && (
            <div className="mb-5">
              <p className="text-sm font-bold text-foreground mb-3">
                Color: <span className="font-semibold text-muted-foreground">{color}</span>
              </p>
              <div className="flex flex-wrap gap-2.5">
                {product.colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    title={c}
                    className={`relative flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 text-xs font-semibold transition-all ${
                      color === c ? "border-primary shadow-sm" : "border-border hover:border-muted-foreground"
                    }`}
                    style={color === c ? { borderColor: PRIMARY } : {}}
                  >
                    <span
                      className="w-4 h-4 rounded-full border border-black/10 shrink-0"
                      style={{ background: COLOR_HEX[c] ?? c }}
                    />
                    {c}
                    {color === c && (
                      <span
                        className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center text-white"
                        style={{ background: PRIMARY }}
                      >
                        <CheckCircle size={10} />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mb-6">
            <p className="text-sm font-bold text-foreground mb-3">Características</p>
            <div className="grid grid-cols-1 gap-2">
              {product.features.map((f) => (
                <div key={f} className="flex items-center gap-2.5">
                  <CheckCircle size={13} className="shrink-0" style={{ color: PRIMARY }} />
                  <span className="text-sm text-foreground/70">{f}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center border border-border rounded-xl overflow-hidden">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="px-3 py-3 hover:bg-muted transition-colors"
                style={{ color: PRIMARY }}
              >
                <Minus size={14} />
              </button>
              <span className="w-8 text-center font-bold text-sm">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="px-3 py-3 hover:bg-muted transition-colors" style={{ color: PRIMARY }}>
                <Plus size={14} />
              </button>
            </div>
            <button
              onClick={handleAdd}
              className="flex-1 py-3.5 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 active:scale-[.98]"
              style={{ background: PRIMARY }}
            >
              Agregar — {fmt(product.price * qty)}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}