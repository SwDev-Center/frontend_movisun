"use client";

import Link from "next/link";
import { motion, type Variants } from "motion/react";
import { ArrowRight } from "lucide-react";
import { EASE } from "@/lib/constants";
import type { Category } from "@/lib/types";
import { CATEGORY_ICONS } from "@/components/ui/categoryIcons";
import { ProductImage } from "@/components/ui/ProductImage";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 44 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};
const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

export function CategoryCardsSection({ categories }: { categories: Category[] }) {
  return (
    <section className="py-24 px-4 bg-white">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeUp}
          className="text-center mb-14"
        >
          <p className="text-xs font-bold tracking-[0.25em] uppercase mb-3" style={{ color: "#1A2F5F" }}>
            Nuestras categorías
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">Encuentra lo que necesitas</h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={stagger}
          className="grid grid-cols-1 sm:grid-cols-3 gap-5"
        >
          {categories.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.icon];
            return (
              <motion.div key={cat.id} variants={fadeUp} whileHover={{ y: -4 }} transition={{ duration: 0.3, ease: EASE }}>
                <Link
                  href={`/catalogo/${cat.id}`}
                  className="relative overflow-hidden rounded-3xl text-left group cursor-pointer block"
                  style={{ aspectRatio: "4/5" }}
                >
                  <div className="absolute inset-0">
                    <ProductImage src={cat.coverImg} alt={cat.label} fill className="object-cover group-hover:scale-105 transition-transform duration-700" sizes="(max-width: 640px) 100vw, 33vw" />
                  </div>
                  <div
                    className="absolute inset-0"
                    style={{ background: `linear-gradient(to top, ${cat.color}f2 30%, ${cat.color}80 60%, transparent 100%)` }}
                  />
                  <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
                    <div className="mb-2 opacity-70">
                      <Icon size={24} />
                    </div>
                    <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/65 mb-1">{cat.tagline}</p>
                    <h3 className="text-xl font-extrabold leading-tight mb-2">{cat.label}</h3>
                    <p className="text-sm text-white/70 leading-relaxed mb-4 hidden sm:block">{cat.description}</p>
                    <div className="flex items-center gap-1.5 text-sm font-bold group-hover:gap-3 transition-all">
                      Explorar <ArrowRight size={15} />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}