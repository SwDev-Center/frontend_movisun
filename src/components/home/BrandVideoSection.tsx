"use client";

import { useState } from "react";
import { motion, type Variants } from "motion/react";
import { VolumeX, Volume2 } from "lucide-react";
import { BRAND_VIDEO_ID } from "@/lib/constants";
import { EASE } from "@/lib/constants";
import { waGeneralUrl } from "@/lib/utils";
import type { Advisor } from "@/lib/types";
import { ProductImage } from "@/components/ui/ProductImage";
import { WaIcon } from "@/components/ui/WaIcon";
import { IMG } from "@/assets/images";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 44 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};
const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

export function BrandVideoSection({ advisors }: { advisors: Advisor[] }) {
  const [muted, setMuted] = useState(true);
  const wa = waGeneralUrl(advisors[0]?.wa ?? "");

  return (
    <section className="relative overflow-hidden" style={{ height: "min(520px, 90vw)", background: "#07111f" }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <iframe
          src={`https://www.youtube.com/embed/${BRAND_VIDEO_ID}?autoplay=1&mute=1&loop=1&playlist=${BRAND_VIDEO_ID}&controls=0&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3`}
          title="Movisun Brand"
          allow="autoplay; encrypted-media"
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ width: "200%", height: "200%", border: "none", pointerEvents: "none" }}
        />
      </div>
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(to bottom, rgba(7,17,32,0.6) 0%, rgba(7,17,32,0.4) 50%, rgba(7,17,32,0.7) 100%)" }}
      />
      <div className="relative h-full flex flex-col items-center justify-center text-center px-6">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger}>
          <motion.div variants={fadeUp}>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full mb-6">
              <div className="relative w-5 h-5 bg-white rounded-md overflow-hidden p-0.5">
                <ProductImage src={IMG.movisunLogo} alt="Movisun" fill className="object-contain" />
              </div>
              <span className="text-white/80 text-xs font-semibold tracking-widest uppercase">Movisun Nariño</span>
            </div>
          </motion.div>
          <motion.h2 variants={fadeUp} className="text-3xl sm:text-5xl font-extrabold text-white mb-4 leading-tight tracking-tight">
            La tecnología
            <br />
            que mereces
          </motion.h2>
          <motion.p variants={fadeUp} className="text-blue-200/80 text-base sm:text-lg mb-8 max-w-md mx-auto leading-relaxed">
            Calidad premium, precios accesibles. Descubre por qué Nariño confía en Movisun.
          </motion.p>
          <motion.div variants={fadeUp} className="flex items-center justify-center gap-3">
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebe5d] text-white font-bold px-6 py-3.5 rounded-2xl transition-colors text-sm"
            >
              <WaIcon size={17} /> Contactar ahora
            </a>
            <button
              onClick={() => setMuted((m) => !m)}
              className="flex items-center justify-center w-11 h-11 bg-white/15 hover:bg-white/25 text-white rounded-xl backdrop-blur transition-colors"
            >
              {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}