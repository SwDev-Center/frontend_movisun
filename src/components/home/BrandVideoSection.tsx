"use client";

import { useRef, useState } from "react";
import { motion, type Variants, useReducedMotion } from "motion/react";
import { VolumeX, Volume2, Pause, Play } from "lucide-react";
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
  // Con "reducir movimiento" el video arranca pausado (2.2.2/2.3.3).
  const reduceMotion = useReducedMotion();
  const [playing, setPlaying] = useState(() => !reduceMotion);
  const [soundOn, setSoundOn] = useState(false);
  const wa = waGeneralUrl(advisors[0]?.wa ?? "");

  // Ref al iframe de fondo para enviarle comandos de la API de YouTube
  // (pausa/reanudar y silenciar/activar sonido) mediante postMessage.
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const sendCommand = (func: string) => {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "command", func, args: [] }),
      "https://www.youtube.com"
    );
  };

  const togglePlay = () => {
    if (playing) sendCommand("pauseVideo");
    else sendCommand("playVideo");
    setPlaying((p) => !p);
  };

  const toggleSound = () => {
    if (soundOn) sendCommand("mute");
    else sendCommand("unMute");
    setSoundOn((s) => !s);
  };

  const autoplay = reduceMotion ? 0 : 1;

  return (
    <section className="relative overflow-hidden" style={{ height: "min(520px, 90vw)", background: "#07111f" }}>
      {/* Video de fondo: decorativo, oculto para lectores de pantalla.
          La pausa/sonido se controla con los botones superpuestos. */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <iframe
          ref={iframeRef}
          src={`https://www.youtube.com/embed/${BRAND_VIDEO_ID}?autoplay=${autoplay}&mute=1&loop=1&playlist=${BRAND_VIDEO_ID}&controls=0&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3&enablejsapi=1`}
          title="Video corporativo de fondo Movisun"
          allow="autoplay; encrypted-media"
          tabIndex={-1}
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
                {/* El logo es decorativo: el texto "Movisun Nariño" ya lo nombra. */}
                <ProductImage src={IMG.movisunLogo} alt="" fill className="object-contain" />
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
              // Verde oscuro (--wa-btn, 5.0:1) para cumplir el contraste AA.
              className="inline-flex items-center gap-2 bg-(--wa-btn) hover:bg-(--wa-btn-hover) text-white font-bold px-6 py-3.5 rounded-2xl transition-colors text-sm"
            >
              <WaIcon size={17} /> Contactar ahora
            </a>
            <div className="flex gap-2">
              <button
                onClick={togglePlay}
                aria-label={playing ? "Pausar video" : "Reproducir video"}
                aria-pressed={!playing}
                className="flex items-center justify-center w-11 h-11 bg-white/15 hover:bg-white/25 text-white rounded-xl backdrop-blur transition-colors"
              >
                {playing ? <Pause size={18} aria-hidden="true" /> : <Play size={18} aria-hidden="true" />}
              </button>
              <button
                onClick={toggleSound}
                aria-label={soundOn ? "Silenciar video" : "Activar sonido"}
                aria-pressed={soundOn}
                className="flex items-center justify-center w-11 h-11 bg-white/15 hover:bg-white/25 text-white rounded-xl backdrop-blur transition-colors"
              >
                {soundOn ? <Volume2 size={18} aria-hidden="true" /> : <VolumeX size={18} aria-hidden="true" />}
              </button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}