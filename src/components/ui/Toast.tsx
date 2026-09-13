"use client";

import { motion, AnimatePresence } from "motion/react";
import { CheckCircle } from "lucide-react";
import { WHATSAPP_GREEN } from "@/lib/constants";
import { useShop } from "@/context/ShopContext";

export function Toast() {
  const { toast } = useShop();
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-foreground text-white text-xs font-semibold px-4 py-2.5 rounded-2xl shadow-xl whitespace-nowrap"
        >
          <CheckCircle size={13} style={{ color: WHATSAPP_GREEN }} /> Agregado: {toast}
        </motion.div>
      )}
    </AnimatePresence>
  );
}