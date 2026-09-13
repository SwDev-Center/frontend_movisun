"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, ChevronRight } from "lucide-react";
import { EASE } from "@/lib/constants";
import { ProductImage } from "@/components/ui/ProductImage";
import { IMG } from "@/assets/images";

const SLIDES = [
  {
    img: IMG.slideSmartwatches,
    headline: "Smartwatches de última generación",
    sub: "Monitorea tu salud y mantente conectado todo el día.",
    cta: "smartwatch",
  },
  {
    img: IMG.slideTws,
    headline: "Audífonos TWS con cancelación de ruido",
    sub: "Sonido inmersivo para cada momento de tu día.",
    cta: "audio",
  },
  {
    img: IMG.slideCharging,
    headline: "Carga rápida donde vayas",
    sub: "Power banks y cargadores GaN compactos y potentes.",
    cta: "audio",
  },
  {
    img: IMG.slideSpeakers,
    headline: "Parlantes Bluetooth 360°",
    sub: "Lleva la música a cualquier lugar. IPX7 resistente.",
    cta: "bluetooth",
  },
  {
    img: IMG.slideGaming,
    headline: "Diademas Gaming Premium",
    sub: "Sonido 7.1, micrófono ANC y RGB personalizable.",
    cta: "bluetooth",
  },
];

export function ImageCarousel() {
  const router = useRouter();
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const advance = useCallback(
    (dir: 1 | -1) => setIdx((i) => (i + dir + SLIDES.length) % SLIDES.length),
    []
  );

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => advance(1), 5000);
    return () => clearInterval(t);
  }, [paused, advance]);

  const slide = SLIDES[idx];

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ height: "min(580px, 80vw)" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <ProductImage src={slide.img} alt={slide.headline} fill sizes="100vw" className="object-cover" priority />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to right, rgba(7,17,32,0.85) 0%, rgba(26,47,95,0.6) 50%, rgba(0,0,0,0.1) 100%)" }}
          />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 flex flex-col justify-center px-8 sm:px-16 max-w-2xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <p className="text-blue-300 text-xs font-bold tracking-[0.2em] uppercase mb-3">Movisun Nariño</p>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight mb-3">{slide.headline}</h2>
            <p className="text-blue-100/80 text-sm sm:text-base mb-6 max-w-sm">{slide.sub}</p>
            <button
              onClick={() => router.push(`/catalogo/${slide.cta}`)}
              className="inline-flex items-center gap-2 bg-white text-sm font-bold px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors"
              style={{ color: "#1A2F5F" }}
            >
              Ver categoría <ArrowRight size={15} />
            </button>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            className={`rounded-full transition-all duration-300 ${i === idx ? "w-6 h-2 bg-white" : "w-2 h-2 bg-white/40"}`}
          />
        ))}
      </div>

      <button
        onClick={() => advance(-1)}
        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/15 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-white/25 transition-colors hidden sm:flex"
        aria-label="Anterior"
      >
        <ChevronRight size={18} className="rotate-180" />
      </button>
      <button
        onClick={() => advance(1)}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/15 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-white/25 transition-colors hidden sm:flex"
        aria-label="Siguiente"
      >
        <ChevronRight size={18} />
      </button>
    </section>
  );
}