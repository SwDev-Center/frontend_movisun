"use client";

import { useEffect, type RefObject } from "react";

// Selector de elementos enfocables por teclado (CSS.escape no necesario aquí).
const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Gestión de foco para diálogos modales (WCAG 2.1.2 / 2.4.3):
 * - mueve el foco al primer elemento enfocable al abrir
 * - cicla Tab / Shift+Tab dentro del diálogo (sin trampas de foco)
 * - cierra con Escape
 * - restaura el foco al elemento que abrió el diálogo al cerrarlo
 */
export function useFocusTrap(
  ref: RefObject<HTMLElement | null>,
  onClose: () => void,
  open = true
) {
  useEffect(() => {
    if (!open || !ref.current) return;
    const container = ref.current;
    const previouslyFocused = document.activeElement as HTMLElement | null;

    const getFocusables = () =>
      Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement
      );

    // Al abrir, enfocar el primer control del diálogo (o el propio panel).
    const first = getFocusables()[0];
    (first ?? container)?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const focusables = getFocusables();
      if (focusables.length === 0) return;
      const current = document.activeElement as HTMLElement | null;
      const firstEl = focusables[0];
      const lastEl = focusables[focusables.length - 1];
      // Ciclar el foco: última→primera con Tab, primera→última con Shift+Tab.
      if (e.shiftKey && (current === firstEl || current === container)) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && (current === lastEl || current === container)) {
        e.preventDefault();
        firstEl.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      // Al cerrar, restaurar el foco al elemento que abrió el diálogo.
      previouslyFocused?.focus();
    };
  }, [ref, onClose, open]);
}