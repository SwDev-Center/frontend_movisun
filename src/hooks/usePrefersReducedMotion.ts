"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(callback: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener?.("change", callback);
  return () => mq.removeEventListener?.("change", callback);
}

function getSnapshot(): boolean {
  return window.matchMedia(QUERY).matches;
}

function getServerSnapshot(): boolean {
  return false;
}

/**
 * Lee la preferencia de usuario de "menos movimiento" sin romper la hidratación.
 *
 * framer-motion's `useReducedMotion` inicializa `prefersReducedMotion.current`
 * con matchMedia de forma síncrona en el primer render del cliente, mientras que
 * en el servidor devuelve `null` -> el HTML servido difiere del cliente y React
 * lanza un error de hidratación.
 *
 * Con `useSyncExternalStore` el primer render (en servidor y durante la
 * hidratación del cliente) usa `getServerSnapshot` (false), idéntico en ambos
 * lados; el valor real llega tras la hidratación sin llamar a setState.
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}