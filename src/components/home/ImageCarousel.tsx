"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, ChevronRight } from "lucide-react";
import { EASE } from "@/lib/constants";
import { ProductImage } from "@/components/ui/ProductImage";
import type { HomeSlide } from "@/lib/types";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

// Las diapositivas se administran desde /admin/inicio. La cantidad es libre:
// con una sola no rota ni muestra flechas, y con ninguna el carrusel no existe.
export function ImageCarousel({ slides }: { slides: HomeSlide[] }) {
  const router = useRouter();
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  // Si el usuario prefiere menos movimiento no se avanza solo (WCAG 2.2.2).
  const reduceMotion = usePrefersReducedMotion();
  const total = slides.length;
  const advance = useCallback(
    (dir: 1 | -1) => setIdx((i) => (i + dir + total) % total),
    [total]
  );

  useEffect(() => {
    if (paused || reduceMotion || total < 2) return;
    const t = setInterval(() => advance(1), 5000);
    return () => clearInterval(t);
  }, [paused, reduceMotion, advance, total]);

  // Sin diapositivas no se dibuja nada. Va después de los hooks, que no pueden
  // quedar detrás de un return condicional.
  if (total === 0) return null;

  // Si se borró la última mientras estaba visible, el índice puede quedar fuera.
  const slide = slides[Math.min(idx, total - 1)];

  return (
    <section
      aria-roledescription="carrusel"
      aria-label="Categorías destacadas"
      className="relative w-full overflow-hidden"
      style={{ height: "min(580px, 80vw)" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      // Pausar también con el foco del teclado, no solo con el mouse.
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
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
          <ProductImage src={slide.image} alt={slide.headline} fill sizes="100vw" className="object-cover" priority />
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
              onClick={() => router.push(slide.href)}
              className="inline-flex items-center gap-2 bg-white text-sm font-bold px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors"
              style={{ color: "#1A2F5F" }}
            >
              {slide.ctaLabel} <ArrowRight size={15} aria-hidden="true" />
            </button>
          </motion.div>
        </AnimatePresence>
      </div>

      {total > 1 && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-1">
          {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            aria-label={`Ir a la diapositiva ${i + 1}`}
            aria-current={i === idx ? "true" : undefined}
            className="flex items-center justify-center p-2"
          >
            <span
              aria-hidden="true"
              className={`block rounded-full transition-all duration-300 ${i === idx ? "w-6 h-2 bg-white" : "w-2 h-2 bg-white/60"}`}
            />
          </button>
        ))}
      </div>
      )}

      {total > 1 && (
        <>
          <button
            onClick={() => advance(-1)}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/15 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-white/25 transition-colors hidden sm:flex"
            aria-label="Diapositiva anterior"
          >
            <ChevronRight size={18} className="rotate-180" aria-hidden="true" />
          </button>
          <button
            onClick={() => advance(1)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/15 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-white/25 transition-colors hidden sm:flex"
            aria-label="Diapositiva siguiente"
          >
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        </>
      )}
    </section>
  );
}