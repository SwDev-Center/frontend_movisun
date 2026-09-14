"use client";

import { useEffect, useState } from "react";
import { motion, type Variants } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PRIMARY, EASE } from "@/lib/constants";
import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/ui/ProductCard";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 44 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

export function NewProductsCarousel({ products }: { products: Product[] }) {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const visible = 2;
  // Con "reducir movimiento" no se avanza automáticamente (WCAG 2.2.2).
  const reduceMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (paused || reduceMotion || products.length <= visible) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % (products.length - visible + 1)), 3500);
    return () => clearInterval(t);
  }, [paused, reduceMotion, products.length]);

  const maxIdx = Math.max(0, products.length - visible);

  return (
    <section aria-roledescription="carrusel" aria-label="Productos nuevos" className="py-16 px-4 bg-white">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={fadeUp}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <p className="text-xs font-bold tracking-[0.25em] uppercase mb-1" style={{ color: PRIMARY }}>
              Recién llegados
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">Productos nuevos</h2>
          </div>
          {maxIdx > 0 && (
            <div className="flex gap-2">
              <button
                onClick={() => setIdx((i) => Math.max(0, i - 1))}
                className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-40"
                disabled={idx === 0}
                aria-label="Anterior"
              >
                <ChevronLeft size={16} aria-hidden="true" />
              </button>
              <button
                onClick={() => setIdx((i) => Math.min(maxIdx, i + 1))}
                className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-40"
                disabled={idx >= maxIdx}
                aria-label="Siguiente"
              >
                <ChevronRight size={16} aria-hidden="true" />
              </button>
            </div>
          )}
        </motion.div>

        <div className="overflow-hidden" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
          <motion.div
            className="flex gap-4"
            animate={{ x: `-${idx * (100 / visible)}%` }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            {products.map((p) => (
              <div key={p.id} className="shrink-0" style={{ width: `calc(${100 / visible}% - 8px)` }}>
                <ProductCard product={p} />
              </div>
            ))}
          </motion.div>
        </div>

        {maxIdx > 0 && (
          <div className="flex justify-center gap-1 mt-5">
            {Array.from({ length: maxIdx + 1 }).map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                aria-label={`Ir a la diapositiva ${i + 1}`}
                aria-current={i === idx ? "true" : undefined}
                className="flex items-center justify-center p-2"
              >
                <span
                  aria-hidden="true"
                  className={`block rounded-full transition-all ${i === idx ? "w-5 h-2" : "w-2 h-2 bg-gray-300"}`}
                  style={i === idx ? { background: PRIMARY } : {}}
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}