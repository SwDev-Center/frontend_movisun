"use client";

import { useEffect, useState } from "react";

/** Counts down from `hours` since mount, returning remaining h/m/s. */
export function useCountdown(hours: number) {
  const [left, setLeft] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    const target = Date.now() + hours * 3600000;
    const update = () => {
      const diff = Math.max(0, target - Date.now());
      setLeft({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [hours]);

  return left;
}