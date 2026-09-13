"use client";

import { AnimatePresence } from "motion/react";
import type { Advisor } from "@/lib/types";
import { useShop } from "@/context/ShopContext";
import { VideoModal } from "@/components/ui/VideoModal";
import { ProductModal } from "@/components/ui/ProductModal";
import { CartDrawer } from "@/components/ui/CartDrawer";
import { Toast } from "@/components/ui/Toast";
import { FloatingWhatsApp } from "@/components/ui/FloatingWhatsApp";

/** Global overlays rendered once at the root layout. */
export function Overlays({ advisors }: { advisors: Advisor[] }) {
  const { videoOpen, selectedProduct, cartOpen } = useShop();

  return (
    <>
      <AnimatePresence>{videoOpen && <VideoModal key="video" />}</AnimatePresence>
      <AnimatePresence>{selectedProduct && <ProductModal key="product" />}</AnimatePresence>
      <AnimatePresence>{cartOpen && <CartDrawer key="cart" advisors={advisors} />}</AnimatePresence>
      <Toast />
      <FloatingWhatsApp advisors={advisors} />
    </>
  );
}