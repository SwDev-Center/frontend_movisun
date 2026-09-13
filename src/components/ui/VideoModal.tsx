"use client";

import { motion } from "motion/react";
import { X } from "lucide-react";
import { HERO_VIDEO_ID, EASE } from "@/lib/constants";
import { useShop } from "@/context/ShopContext";

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.45, ease: EASE } },
};

export function VideoModal() {
  const { closeVideo } = useShop();
  return (
    <motion.div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      <div className="absolute inset-0 bg-black/88 backdrop-blur-sm" onClick={closeVideo} />
      <motion.div
        className="relative w-full max-w-3xl aspect-video rounded-2xl overflow-hidden shadow-2xl"
        initial={{ scale: 0.88, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.88, opacity: 0 }}
        transition={{ duration: 0.32, ease: EASE }}
      >
        <iframe
          src={`https://www.youtube.com/embed/${HERO_VIDEO_ID}?autoplay=1&rel=0`}
          title="Movisun"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
        <button
          onClick={closeVideo}
          className="absolute top-3 right-3 w-9 h-9 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center backdrop-blur transition-colors"
        >
          <X size={16} />
        </button>
      </motion.div>
    </motion.div>
  );
}