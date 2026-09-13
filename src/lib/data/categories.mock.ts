import type { Category } from "@/lib/types";
import { IMG } from "@/assets/images";

export const categories: Category[] = [
  {
    id: "smartwatch",
    label: "Smartwatch",
    tagline: "Mide cada momento",
    description: "Relojes inteligentes con salud avanzada, GPS y larga autonomía.",
    icon: "watch",
    color: "#1A2F5F",
    coverImg: IMG.catSmartwatch,
    heroImg: IMG.prodWatchProX9,
    subcategories: [
      { label: "Sumergible", icon: "watch" },
      { label: "No sumergible", icon: "watch" },
      { label: "Con chip", icon: "radio" },
    ],
  },
  {
    id: "audio",
    label: "Audio y Carga",
    tagline: "Sonido y energía",
    description: "Manos libres, cargadores rápidos, baterías y cables premium.",
    icon: "headphones",
    color: "#0d3b6e",
    coverImg: IMG.catAudio,
    heroImg: IMG.productAudi1,
    subcategories: [
      { label: "Manos libres", icon: "headphones" },
      { label: "Cargadores", icon: "zap" },
      { label: "Power Bank", icon: "battery" },
      { label: "Cables", icon: "cable" },
      { label: "Pilas", icon: "battery" },
    ],
  },
  {
    id: "bluetooth",
    label: "Bluetooth y Parlantes",
    tagline: "Sonido sin límites",
    description: "Parlantes, diademas inalámbricas y accesorios Bluetooth premium.",
    icon: "bluetooth",
    color: "#122650",
    coverImg: IMG.bluetoothCover,
    heroImg: IMG.bluetoothCover,
    subcategories: [
      { label: "Diademas", icon: "headphones" },
      { label: "Parlantes", icon: "speaker" },
      { label: "Audífonos", icon: "headphones" },
      { label: "Localizador", icon: "bluetooth" },
      { label: "Intercomunicadores", icon: "radio" },
      { label: "Gamer", icon: "headphones" },
    ],
  },
];