"use client";

import { motion, type Variants } from "motion/react";
import { Tag } from "lucide-react";
import { PRIMARY } from "@/lib/constants";
import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/ui/ProductCard";

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

export function PromocionesView({ products }: { products: Product[] }) {
  return (
    <div className="pt-16 min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div
          className="relative rounded-3xl overflow-hidden mb-10 py-12 px-8 text-center"
          style={{ background: `linear-gradient(135deg, #071120 0%, ${PRIMARY} 100%)` }}
        >
          <div className="relative z-10">
            <Tag size={32} className="text-amber-400 mx-auto mb-3" />
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">Promociones</h1>
            <p className="text-blue-200/80 text-base max-w-sm mx-auto">
              Los mejores descuentos en tecnología de calidad. ¡Aprovecha antes de que se agoten!
            </p>
          </div>
        </div>
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={stagger}
        >
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </motion.div>
      </div>
    </div>
  );
}