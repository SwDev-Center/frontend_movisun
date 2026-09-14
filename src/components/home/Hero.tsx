"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Play } from "lucide-react";
import { HERO_BG, EASE } from "@/lib/constants";
import { useShop } from "@/context/ShopContext";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { ProductImage } from "@/components/ui/ProductImage";
import { IMG } from "@/assets/images";
import type { HeroTile } from "@/lib/types";

// Composición de cada esquina: posición, tamaño, brillos y ritmo de flotación,
// replicando el mockup de Figma. Es diseño, no contenido: la imagen, el texto
// y el enlace de cada pieza se administran desde /admin/inicio.
// El orden del arreglo corresponde a los slots 1 a 4.
const DISENO = [
  {
    cls: "top-[12%] left-[9%]",
    fromX: -55,
    enterDelay: 0.4,
    dur: 5.6,
    bobDelay: 0,
    amp: 20,
    size: "w-[250px] h-[250px]",
    glowOuter: "w-[270px] h-[270px]",
    glowInner: "w-[130px] h-[130px]",
    shadow: "rgba(180,210,255,0.22)",
  },
  {
    cls: "bottom-[9%] left-[11%]",
    fromX: -55,
    enterDelay: 0.65,
    dur: 4.9,
    bobDelay: 1.6,
    amp: 18,
    size: "w-[235px] h-[235px]",
    glowOuter: "w-[250px] h-[250px]",
    glowInner: "w-[120px] h-[120px]",
    shadow: "rgba(255,255,255,0.10)",
  },
  {
    cls: "top-[10%] right-[9%]",
    fromX: 55,
    enterDelay: 0.52,
    dur: 5.2,
    bobDelay: 0.7,
    amp: 22,
    size: "w-[255px] h-[255px]",
    glowOuter: "w-[280px] h-[210px]",
    glowInner: "w-[130px] h-[95px]",
    shadow: "rgba(255,255,255,0.10)",
  },
  {
    cls: "bottom-[10%] right-[11%]",
    fromX: 55,
    enterDelay: 0.78,
    dur: 4.5,
    bobDelay: 1.0,
    amp: 16,
    size: "w-[230px] h-[230px]",
    glowOuter: "w-[250px] h-[250px]",
    glowInner: "w-[120px] h-[120px]",
    shadow: "rgba(255,255,255,0.10)",
  },
];

export function Hero({ tiles }: { tiles: HeroTile[] }) {
  const { openVideo } = useShop();
  // Sin animaciones de flotación ni pulso para quien prefiere menos movimiento.
  const reduceMotion = usePrefersReducedMotion();

  // Se combina lo que manda el panel con la composición de cada esquina.
  // Si falta una pieza en la base, esa esquina simplemente no se dibuja.
  const floaters = tiles
    .filter((t) => t.slot >= 1 && t.slot <= DISENO.length)
    .map((t) => ({ ...DISENO[t.slot - 1], ...t }));

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{ background: HERO_BG }}>
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.8) 1px, transparent 1px)",
          backgroundSize: "38px 38px",
        }}
      />
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-24 w-[600px] h-[600px] rounded-full opacity-[0.12]" style={{ background: "radial-gradient(circle, #4a7fd4, transparent 70%)" }} />
        <div className="absolute -bottom-32 -right-16 w-[500px] h-[500px] rounded-full opacity-[0.10]" style={{ background: "radial-gradient(circle, #2260b0, transparent 70%)" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[360px] h-[360px] rounded-full opacity-[0.06]" style={{ background: "radial-gradient(circle, #93c5fd, transparent 70%)" }} />
      </div>

      {floaters.map((f) => (
        <motion.div
          key={f.slot}
          className={`hidden xl:block absolute ${f.cls}`}
          style={{ zIndex: 2 }}
          initial={{ opacity: 0, x: f.fromX }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.95, delay: f.enterDelay, ease: EASE }}
        >
          {/* Con "reducir movimiento" el producto se muestra estático (2.3.3):
              la imagen siempre es visible, solo se desactiva la flotación. */}
          <motion.div
            animate={reduceMotion ? { y: 0 } : { y: [0, -f.amp, 0] }}
            transition={reduceMotion ? { duration: 0 } : { duration: f.dur, repeat: Infinity, ease: "easeInOut", delay: f.bobDelay }}
          >
            {/* Cada pieza es un enlace real: el texto alternativo de la imagen
                es lo que nombra el destino para un lector de pantalla. */}
            <Link
              href={f.href}
              className="block rounded-3xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              <div className="relative">
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl opacity-[0.22] pointer-events-none bg-white ${f.glowOuter}`} />
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-xl opacity-[0.18] pointer-events-none bg-white ${f.glowInner}`} />
                <div className={`relative ${f.size} transition-transform duration-300 hover:scale-105`}>
                  <ProductImage
                    src={f.image}
                    alt={f.alt}
                    fill
                    className="object-contain"
                    style={{ filter: `drop-shadow(0 8px 32px ${f.shadow})` }}
                    priority
                  />
                </div>
              </div>
            </Link>
          </motion.div>
        </motion.div>
      ))}

      <div className="relative z-10 flex flex-col items-center text-center px-8 pt-24 pb-16 lg:pt-14 lg:pb-0 w-full lg:max-w-[380px]">
        <motion.div initial={{ opacity: 0, scale: 0.78 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, ease: EASE }} className="mb-6">
          <div className="relative w-24 h-24 bg-white rounded-3xl overflow-hidden p-2.5 shadow-2xl mx-auto mb-5">
            <ProductImage src={IMG.movisunLogo} alt="Movisun" fill className="object-contain" />
          </div>
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-1.5 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse motion-reduce:animate-none" />
            <span className="text-blue-200 text-xs font-semibold tracking-[0.25em] uppercase">Movisun Nariño</span>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: EASE }}
          className="text-4xl sm:text-5xl xl:text-6xl font-extrabold leading-[1.04] tracking-tight mb-4 text-white"
        >
          Tecnología
          <span className="block text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(90deg, #7ab8ff, #c3d9ff)" }}>
            premium
          </span>
          en tus manos
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: EASE }}
          className="text-blue-100/75 text-base leading-relaxed mb-8 max-w-[320px]"
        >
          Smartwatches, audio premium, cargadores rápidos y accesorios Bluetooth. Entrega en todo Nariño.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.42, ease: EASE }}
          className="flex flex-wrap justify-center gap-3 mb-28"
        >
          <Link href="/catalogo/smartwatch" className="flex items-center gap-1.5 bg-white font-bold text-xs py-2.5 px-5 rounded-xl hover:bg-blue-50 transition-colors shadow-lg" style={{ color: "#1A2F5F" }}>
            Explorar catálogo <ArrowRight size={14} />
          </Link>
          <button
            onClick={openVideo}
            className="flex items-center gap-2 border border-white/25 bg-white/10 backdrop-blur text-white font-semibold text-xs py-2.5 px-4 rounded-xl hover:bg-white/20 transition-colors"
          >
            <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
              <Play size={9} fill="white" />
            </div>
            Ver presentación
          </button>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="absolute bottom-5 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
      >
        <p className="text-blue-300/60 text-[10px] tracking-[0.25em] uppercase">Desliza</p>
        {!reduceMotion && (
        <motion.div animate={{ y: [0, 7, 0] }} transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }} className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center pt-1.5">
          <div className="w-1 h-2 bg-white/40 rounded-full" />
        </motion.div>
        )}
      </motion.div>
    </section>
  );
}