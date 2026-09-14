"use client";

import { motion } from "motion/react";
import { Plus } from "lucide-react";
import { PRIMARY, COLOR_HEX, EASE } from "@/lib/constants";
import { fmt, discountOf, precioFinal, conPrecioFinal } from "@/lib/utils";
import type { Product } from "@/lib/types";
import { useShop } from "@/context/ShopContext";
import { ProductImage } from "@/components/ui/ProductImage";
import { Badge } from "@/components/ui/Badge";
import { Stars } from "@/components/ui/Stars";
import { Countdown } from "@/components/ui/Countdown";

const fadeUp = {
  hidden: { opacity: 0, y: 44 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

export function ProductCard({ product }: { product: Product }) {
  const { openProduct, addToCart } = useShop();
  const disc = discountOf(product);
  // Con oferta relámpago vigente manda ese precio, y el normal queda tachado.
  const precio = precioFinal(product);
  const enOferta = Boolean(product.flash);

  return (
    <motion.div
      variants={fadeUp}
      className="bg-white rounded-2xl border border-border shadow-sm hover:shadow-lg transition-all cursor-pointer group overflow-hidden"
      whileHover={{ y: -3, transition: { duration: 0.22, ease: EASE } }}
    >
      {/* Botón real que abre el producto: evita anidar controles interactivos
          dentro de un div con role="button" (nested-interactive, WCAG 2.2). */}
      <button
        onClick={() => openProduct(product)}
        aria-label={`Ver ${product.name}`}
        className="block w-full text-left cursor-pointer"
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
            {/* Con oferta relámpago se muestra solo ese descuento: el de
                originalPrice quedaría corto y confundiría. */}
            {product.flash ? (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500 text-amber-950">
                -{product.flash.extraDiscount}% EXTRA
              </span>
            ) : (
              disc && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-600 text-white">
                  -{disc}%
                </span>
              )
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
        <div className="p-3.5 pb-1">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
            {product.subcategory}
          </p>
          <h3 className="text-sm font-bold text-foreground leading-tight line-clamp-2 mb-2">{product.name}</h3>
          <div className="flex items-center gap-1.5 mb-2">
            <Stars rating={product.rating} />
            <span className="text-[10px] text-muted-foreground">({product.reviews})</span>
          </div>
        </div>
      </button>
      <div className="px-3.5 pb-3.5 pt-0.5">
        {product.flash && (
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-2">
            <Countdown hours={product.flash.endsInHours} />
            <span className="text-[10px] text-muted-foreground">
              {product.flash.stock} disponibles
            </span>
          </div>
        )}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-base font-extrabold" style={{ color: PRIMARY }}>
              {fmt(precio)}
            </p>
            {enOferta ? (
              <p className="text-xs text-muted-foreground line-through">{fmt(product.price)}</p>
            ) : (
              product.originalPrice && (
                <p className="text-xs text-muted-foreground line-through">
                  {fmt(product.originalPrice)}
                </p>
              )
            )}
          </div>
          <button
            onClick={() => addToCart(conPrecioFinal(product))}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm hover:opacity-90 active:scale-95 transition-all"
            style={{ background: PRIMARY }}
            aria-label={`Agregar ${product.name} al carrito`}
          >
            <Plus size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}