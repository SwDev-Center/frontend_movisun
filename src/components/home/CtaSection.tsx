"use client";

import { motion, type Variants } from "motion/react";
import { PRIMARY, EASE } from "@/lib/constants";
import type { Advisor } from "@/lib/types";
import { WaIcon } from "@/components/ui/WaIcon";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 44 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

export function CtaSection({ advisors }: { advisors: Advisor[] }) {
  return (
    <section className="py-20 px-4" style={{ background: `linear-gradient(135deg, #071120 0%, ${PRIMARY} 100%)` }}>
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="max-w-2xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight">¿Listo para tu próximo accesorio?</h2>
        <p className="text-blue-200/80 text-base mb-6">Escríbenos y te asesoramos para encontrar el producto ideal.</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {advisors.map((a) => (
            <a
              key={a.wa}
              href={`https://wa.me/${a.wa}?text=${encodeURIComponent(`Hola! Soy ${a.label} de Movisun Nariño. ¿En qué te puedo ayudar?`)}`}
              target="_blank"
              rel="noopener noreferrer"
              // Verde oscuro (--wa-btn, 5.0:1 con blanco) para cumplir AA.
              className="flex items-center gap-2.5 bg-(--wa-btn) hover:bg-(--wa-btn-hover) text-white font-bold py-3.5 px-7 rounded-2xl transition-colors text-sm"
            >
              <WaIcon size={17} /> {a.label}: +57 {a.phone}
            </a>
          ))}
        </div>
      </motion.div>
    </section>
  );
}