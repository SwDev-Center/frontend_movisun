import type { EventsCatalog } from "@/lib/types";
import { IMG } from "@/assets/images";

// Datos simulados pendientes de la API real.
// NOTA: las URLs de los streams y las fechas (startsAt/date) son valores de
// ejemplo; cuando llegue la API real se reemplazarán por los verdaderos.
export const events: EventsCatalog = {
  live: [
    {
      id: 1,
      title: "Lanzamiento Smartwatch Ultra S20",
      desc: "Presentación en vivo del nuevo Smartwatch Ultra S20 con demostraciones en tiempo real y precios especiales de lanzamiento.",
      date: "Hoy, 7:00 PM",
      // ISO 8601 con zona horaria de Colombia (UTC-5), para el esquema Event.
      startsAt: "2026-09-13T19:00:00-05:00",
      // Enlace externo del stream (YouTube, etc.) al que redirige "Ver ahora".
      url: "https://www.youtube.com/watch?v=9PbNPvzUvSQ",
      live: true,
      image: IMG.eventLaunch,
      viewers: 248,
    },
    {
      id: 2,
      title: "Guía de Accesorios para Gaming",
      desc: "Descubre la combinación perfecta de diademas, teclado y mouse para llevar tu gaming al siguiente nivel.",
      date: "Mañana, 8:00 PM",
      startsAt: "2026-09-14T20:00:00-05:00",
      url: "https://www.youtube.com/watch?v=ScMzIvxBSi4",
      live: false,
      image: IMG.eventGaming,
      viewers: 0,
    },
    {
      id: 3,
      title: "Cargadores GaN — Lo que necesitas saber",
      desc: "Sesión informativa sobre la tecnología GaN y por qué debes actualizar tu cargador ahora.",
      date: "Viernes, 6:00 PM",
      startsAt: "2026-09-18T18:00:00-05:00",
      url: "https://www.youtube.com/watch?v=9PbNPvzUvSQ",
      live: false,
      image: IMG.eventGaN,
      viewers: 0,
    },
  ],
  flash: [
    { productId: 1, extraDiscount: 15, endsInHours: 3.5, stock: 8 },
    { productId: 4, extraDiscount: 20, endsInHours: 6, stock: 12 },
    { productId: 12, extraDiscount: 10, endsInHours: 1.5, stock: 5 },
  ],
};