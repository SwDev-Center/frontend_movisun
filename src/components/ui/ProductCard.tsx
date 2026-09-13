"use client";

import { motion } from "motion/react";
import { Plus } from "lucide-react";
import { PRIMARY, COLOR_HEX, EASE } from "@/lib/constants";
import { fmt, discountOf } from "@/lib/utils";
import type { Product } from "@/lib/types";
import { useShop } from "@/context/ShopContext";
import { ProductImage } from "@/components/ui/ProductImage";
import { Badge } from "@/components/ui/Badge";
import { Stars } from "@/components/ui/Stars";

const fadeUp = {
  hidden: { opacity: 0, y: 44 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

export function ProductCard({ product }: { product: Product }) {
  const { openProduct, addToCart } = useShop();
  const disc = discountOf(product);

  return (
    <motion.div
      variants={fadeUp}
      className="bg-white rounded-2xl border border-border shadow-sm hover:shadow-lg transition-all cursor-pointer group overflow-hidden"
      whileHover={{ y: -3, transition: { duration: 0.22, ease: EASE } }}
      onClick={() => openProduct(product)}
    >
      <div className="relative aspect-square bg-muted overflow-hidden">
        <ProductImage
          src={product.image}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
        <div className="absolute top-2 left-2 flex gap-1">
          {product.badge && <Badge text={product.badge} />}
          {disc && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-600 text-white">
              -{disc}%
            </span>
          )}
        </div>
        {product.colors && product.colors.length > 0 && (
          <div className="absolute bottom-2 left-2 flex gap-1">
            {product.colors.slice(0, 4).map((c) => (
              <span
                key={c}
                className="w-3.5 h-3.5 rounded-full border border-white shadow-sm"
                style={{ background: COLOR_HEX[c] ?? c }}
                title={c}
              />
            ))}
          </div>
        )}
      </div>
      <div className="p-3.5">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
          {product.subcategory}
        </p>
        <h3 className="text-sm font-bold text-foreground leading-tight line-clamp-2 mb-2">{product.name}</h3>
        <div className="flex items-center gap-1.5 mb-3">
          <Stars rating={product.rating} />
          <span className="text-[10px] text-muted-foreground">({product.reviews})</span>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-base font-extrabold" style={{ color: PRIMARY }}>
              {fmt(product.price)}
            </p>
            {product.originalPrice && (
              <p className="text-xs text-muted-foreground line-through">{fmt(product.originalPrice)}</p>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              addToCart(product);
            }}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-sm hover:opacity-90 active:scale-95 transition-all"
            style={{ background: PRIMARY }}
            aria-label="Agregar"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}