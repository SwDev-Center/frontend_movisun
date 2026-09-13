"use client";

import { motion, AnimatePresence } from "motion/react";
import { buildOrderUrl, waGeneralUrl } from "@/lib/utils";
import type { Advisor } from "@/lib/types";
import { useCart } from "@/context/CartContext";
import { WaIcon } from "@/components/ui/WaIcon";

export function FloatingWhatsApp({ advisors }: { advisors: Advisor[] }) {
  const { items, count } = useCart();
  const wa = advisors[0]?.wa ?? "";
  const href = count > 0 ? buildOrderUrl(items, wa) : waGeneralUrl(wa);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      // Nombre accesible siempre presente: en móvil solo se ve el icono
      // (que es aria-hidden), por eso el aria-label gobierna el anuncio.
      aria-label={count > 0 ? `Enviar pedido por WhatsApp (${count} productos)` : "Contactar por WhatsApp"}
      className="fixed bottom-5 right-5 z-50 flex items-center gap-2 bg-(--wa-btn) hover:bg-(--wa-btn-hover) text-white px-4 py-3 rounded-2xl shadow-2xl transition-all hover:scale-105"
    >
      <WaIcon size={19} />
      <span className="text-sm font-bold hidden sm:block">{count > 0 ? "Enviar pedido" : "WhatsApp"}</span>
      <AnimatePresence>
        {count > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="bg-white text-(--wa-btn) text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center"
          >
            {count}
          </motion.span>
        )}
      </AnimatePresence>
    </a>
  );
}