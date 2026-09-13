"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Play } from "lucide-react";
import { HERO_BG, EASE } from "@/lib/constants";
import { useShop } from "@/context/ShopContext";
import { ProductImage } from "@/components/ui/ProductImage";
import { IMG } from "@/assets/images";

export function Hero() {
  const { openVideo } = useShop();

  const floaters = [
    { img: IMG.heroWatch, alt: "Smartwatch", cls: "top-[12%] left-[9%]", delay: 0.4, size: "w-[250px] h-[250px]", dur: 5.6 },
    { img: IMG.heroHeadphones, alt: "Diadema", cls: "bottom-[9%] left-[11%]", delay: 0.65, size: "w-[235px] h-[235px]", dur: 4.9 },
    { img: IMG.heroSpeaker, alt: "Parlante", cls: "top-[10%] right-[9%]", delay: 0.52, size: "w-[255px] h-[255px]", dur: 5.2 },
    { img: IMG.heroEarbuds, alt: "Earbuds", cls: "bottom-[10%] right-[11%]", delay: 0.78, size: "w-[230px] h-[230px]", dur: 4.5 },
  ];

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
          key={f.alt}
          className={`hidden lg:block absolute ${f.cls}`}
          style={{ zIndex: 2 }}
          initial={{ opacity: 0, x: f.cls.includes("left") ? -55 : 55 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.95, delay: f.delay, ease: EASE }}
        >
          <motion.div animate={{ y: [0, -18, 0] }} transition={{ duration: f.dur, repeat: Infinity, ease: "easeInOut", delay: (f.delay - 0.3) * 3 }}>
            <div className="relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[130%] h-[130%] rounded-full blur-3xl opacity-[0.22] pointer-events-none bg-white" />
              <div className={`relative ${f.size}`}>
                <ProductImage
                  src={f.img}
                  alt={f.alt}
                  fill
                  className="object-contain"
                  style={{ filter: "drop-shadow(0 8px 32px rgba(180,210,255,0.22))" }}
                  priority
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      ))}

      <div className="relative z-10 flex flex-col items-center text-center px-8 pt-24 pb-16 lg:pt-14 lg:pb-0 w-full lg:max-w-[380px]">
        <motion.div initial={{ opacity: 0, scale: 0.78 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, ease: EASE }} className="mb-6">
          <div className="relative w-24 h-24 bg-white rounded-3xl overflow-hidden p-2.5 shadow-2xl mx-auto mb-5">
            <ProductImage src={IMG.movisunLogo} alt="Movisun" fill className="object-contain" />
          </div>
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-1.5 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse" />
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
        <p className="text-blue-300/35 text-[10px] tracking-[0.25em] uppercase">Desliza</p>
        <motion.div animate={{ y: [0, 7, 0] }} transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }} className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center pt-1.5">
          <div className="w-1 h-2 bg-white/40 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
}