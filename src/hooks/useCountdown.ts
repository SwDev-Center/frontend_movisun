"use client";

import { useEffect, useState } from "react";

/** Counts down from `hours` since mount, returning remaining h/m/s. */
function repartir(ms: number) {
  const diff = Math.max(0, ms);
  return {
    h: Math.floor(diff / 3600000),
    m: Math.floor((diff % 3600000) / 60000),
    s: Math.floor((diff % 60000) / 1000),
  };
}

export function useCountdown(hours: number) {
  // Se arranca con el valor que sale de `hours` en vez de en cero: así el
  // primer pintado ya muestra el tiempo correcto en lugar de 00h 00m 00s.
  // Se deriva del prop, no del reloj, así que servidor y cliente coinciden.
  const [left, setLeft] = useState(() => repartir(hours * 3600000));

  useEffect(() => {
    const target = Date.now() + hours * 3600000;
    const update = () => setLeft(repartir(target - Date.now()));
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [hours]);

  return left;
}