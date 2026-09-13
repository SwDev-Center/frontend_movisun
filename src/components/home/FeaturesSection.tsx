"use client";

import { motion, type Variants } from "motion/react";
import { CheckCircle, Package } from "lucide-react";
import { PRIMARY, EASE } from "@/lib/constants";
import { WaIcon } from "@/components/ui/WaIcon";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 44 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};
const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const FEATURES = [
  {
    icon: <CheckCircle size={26} />,
    title: "Calidad garantizada",
    desc: "Todos nuestros productos tienen garantía y soporte post-venta.",
  },
  {
    icon: <WaIcon size={26} />,
    title: "Pedidos por WhatsApp",
    desc: "Realiza tu pedido de forma rápida y sencilla directo al WhatsApp.",
  },
  {
    icon: <Package size={26} />,
    title: "Envíos a Nariño",
    desc: "Hacemos llegar tu pedido a cualquier municipio de Nariño.",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-20 px-4" style={{ background: "#f5f7fc" }}>
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={fadeUp}
          className="text-center mb-12"
        >
          <p className="text-xs font-bold tracking-[0.25em] uppercase mb-2" style={{ color: PRIMARY }}>
            Por qué elegirnos
          </p>
          <h2 className="text-3xl font-extrabold text-foreground">Movisun, tu aliado tecnológico</h2>
        </motion.div>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={stagger}
          className="grid grid-cols-1 sm:grid-cols-3 gap-8"
        >
          {FEATURES.map((f) => (
            <motion.div key={f.title} variants={fadeUp} className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 text-white" style={{ background: PRIMARY }}>
                {f.icon}
              </div>
              <h3 className="font-extrabold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}