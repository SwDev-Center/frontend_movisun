"use client";

import { motion } from "motion/react";
import { Radio, Clock, Play, Zap as Flash } from "lucide-react";
import { PRIMARY, EASE } from "@/lib/constants";
import { fmt, precioConDescuento, waGeneralUrl } from "@/lib/utils";
import type { EventsCatalog, Product, Advisor } from "@/lib/types";
import { useShop } from "@/context/ShopContext";
import { Countdown } from "@/components/ui/Countdown";
import { WaIcon } from "@/components/ui/WaIcon";
import { Reveal, RevealItem } from "@/components/ui/Reveal";
import { ProductImage } from "@/components/ui/ProductImage";

export function EventosView({
  events,
  products,
  advisors,
}: {
  events: EventsCatalog;
  products: Product[];
  advisors: Advisor[];
}) {
  const { addToCart, openProduct } = useShop();
  const wa = waGeneralUrl(advisors[0]?.wa ?? "");

  return (
    <div className="pt-16 min-h-screen bg-white flex flex-col">
      <div className="max-w-5xl mx-auto px-4 py-10 flex-1">
        {/* Eventos en Vivo */}
        <Reveal className="mb-14">
          <RevealItem>
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-white text-xs font-bold" style={{ background: "#dc2626" }}>
                <Radio size={12} className="animate-pulse" /> EN VIVO
              </div>
              {/* Reemplazó al h2: es el encabezado principal de la página de eventos. */}
          <h1 className="text-2xl font-extrabold text-foreground">Eventos en Vivo</h1>
            </div>
          </RevealItem>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {events.live.map((ev) => (
              <RevealItem key={ev.id}>
                <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.25, ease: EASE }} className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden group hover:shadow-lg transition-shadow h-full">
                  <div className="relative aspect-video overflow-hidden bg-muted">
                    <ProductImage src={ev.image} alt={ev.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 640px) 100vw, 33vw" />
                    {ev.live ? (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="absolute inset-0 bg-black/30" />
                        {/* Overlay con icono de play: enlace real al stream para
                            que también sea operable con teclado (no un simple div). */}
                        <a
                          href={ev.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Ver ${ev.title} en vivo`}
                          className="relative flex flex-col items-center gap-2"
                        >
                          <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                            <Play size={18} fill="white" className="text-white ml-0.5" aria-hidden="true" />
                          </div>
                          <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Radio size={8} className="animate-pulse" aria-hidden="true" /> EN VIVO · {ev.viewers} viendo
                          </span>
                        </a>
                      </div>
                    ) : (
                      <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full backdrop-blur flex items-center gap-1">
                        <Clock size={9} /> {ev.date}
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-foreground text-sm mb-1 leading-tight">{ev.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-3">{ev.desc}</p>
                    {/* Si el evento está en vivo se enlaza al stream externo (ev.url);
                        si es próximo, se agenda por WhatsApp (wa). */}
                    <a
                      href={ev.live ? ev.url : wa}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl text-xs font-bold text-white transition-colors ${
                        ev.live ? "bg-red-600 hover:bg-red-700" : "hover:opacity-90"
                      }`}
                      style={!ev.live ? { background: PRIMARY } : {}}
                    >
                      {ev.live ? (
                        <>
                          <Radio size={11} /> Ver ahora
                        </>
                      ) : (
                        <>
                          <WaIcon size={11} /> Notificarme
                        </>
                      )}
                    </a>
                  </div>
                </motion.div>
              </RevealItem>
            ))}
          </div>
        </Reveal>

        {/* Ventas Flash */}
        <Reveal>
          <RevealItem>
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-amber-950 text-xs font-bold bg-amber-500">
                <Flash size={12} aria-hidden="true" /> VENTAS FLASH
              </div>
              <h2 className="text-2xl font-extrabold text-foreground">Ofertas relámpago</h2>
            </div>
          </RevealItem>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {events.flash.map((flash) => {
              const product = products.find((p) => p.id === flash.productId)!;
              if (!product) return null;
              const flashPrice = precioConDescuento(product.price, flash.extraDiscount);
              return (
                <RevealItem key={flash.productId}>
                  <motion.div className="bg-white rounded-2xl border-2 border-amber-400 shadow-md overflow-hidden relative h-full flex flex-col">
                    <div className="absolute top-3 right-3 z-10 bg-amber-500 text-amber-950 text-xs font-bold px-2 py-0.5 rounded-full">
                      -{flash.extraDiscount}% EXTRA
                    </div>
                    {/* Imagen del producto: operable por teclado (Enter/Espacio)
                        igual que el resto de tarjetas del catálogo. */}
                    <div
                      className="relative aspect-square overflow-hidden bg-muted cursor-pointer shrink-0"
                      onClick={() => openProduct(product)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          openProduct(product);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      aria-label={`Ver ${product.name}`}
                    >
                      <ProductImage src={product.image} alt={product.name} fill className="object-cover hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">{product.subcategory}</p>
                      <h3 className="font-bold text-foreground text-sm leading-tight mb-2">{product.name}</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl font-extrabold" style={{ color: PRIMARY }}>
                          {fmt(flashPrice)}
                        </span>
                        <span className="text-sm line-through text-muted-foreground">{fmt(product.price)}</span>
                      </div>
                      <div className="flex items-center gap-2 mb-3 mt-auto">
                        <Countdown hours={flash.endsInHours} />
                        <span className="text-xs text-muted-foreground">· {flash.stock} disponibles</span>
                      </div>
                      <button
                        onClick={() => addToCart({ ...product, price: flashPrice })}
                        // Texto oscuro sobre ámbar: el blanco sobre amber-500
                        // solo alcanza 2.15:1, por debajo del mínimo AA.
                        className="w-full py-2.5 rounded-xl text-xs font-bold text-amber-950 bg-amber-500 hover:bg-amber-400 transition-colors"
                      >
                        Agregar al carrito
                      </button>
                    </div>
                  </motion.div>
                </RevealItem>
              );
            })}
          </div>
        </Reveal>
      </div>
    </div>
  );
}