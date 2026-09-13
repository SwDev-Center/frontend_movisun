"use client";

import type { ReactNode } from "react";
import { useShop } from "@/context/ShopContext";

/**
 * Envoltura global del contenido estático (Header + main + Footer).
 *
 * Cuando un overlay está abierto (carrito, producto o video) se marca como
 * `inert`: el navegador lo excluye del foco, del tab y de los lectores de
 * pantalla, por lo que el fondo no interfiere con los diálogos (WCAG 2.1.2).
 */
export function AppShell({ children }: { children: ReactNode }) {
  const { cartOpen, selectedProduct, videoOpen } = useShop();
  const overlayOpen = cartOpen || !!selectedProduct || videoOpen;

  return (
    <div inert={overlayOpen ? true : undefined} className="flex min-h-screen flex-col">
      {children}
    </div>
  );
}