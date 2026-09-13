// ─── Domain types ⭐ THE CONTRACT ─────────────────────────────────────────────
// Single source of truth. The real API (under construction) and the mock API
// (src/app/api/v1) both conform to these types. Never store JSX/React-renderable
// data here — icon lookups happen in components keyed by IconKey.

export type IconKey =
  | "watch"
  | "headphones"
  | "bluetooth"
  | "battery"
  | "zap"
  | "cable"
  | "speaker"
  | "radio";

export interface Subcategory {
  label: string;
  icon: IconKey;
}

export interface Category {
  id: string;
  label: string;
  tagline: string;
  description: string;
  icon: IconKey;
  color: string;
  coverImg: string;
  heroImg: string;
  subcategories: Subcategory[];
}

export type ProductBadge = "Nuevo" | "Más vendido" | "Oferta";

export interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  subcategory: string;
  description: string;
  features: string[];
  image: string;
  badge?: ProductBadge;
  rating: number;
  reviews: number;
  colors?: string[];
  isNew?: boolean;
  addedDaysAgo?: number;
}

export interface CartItem extends Product {
  quantity: number;
  selectedColor?: string;
}

export interface LiveEvent {
  id: number;
  title: string;
  desc: string;
  /** Display string, e.g. "Hoy, 7:00 PM". */
  date: string;
  /** Fecha de inicio en ISO 8601 (p. ej. 2026-09-13T19:00:00-05:00).
   *  Se usa únicamente para el esquema Event (JSON-LD), no para el UI. */
  startsAt: string;
  /** Enlace externo donde se emite el stream; la página redirige a él. */
  url: string;
  live: boolean;
  image: string;
  viewers: number;
}

export interface FlashSale {
  productId: number;
  extraDiscount: number;
  endsInHours: number;
  stock: number;
}

export interface EventsCatalog {
  live: LiveEvent[];
  flash: FlashSale[];
}

export interface Advisor {
  name: string;
  label: string;
  phone: string;
  wa: string;
}

export interface NavChild {
  label: string;
  href: string;
}

export type NavItem = {
  id: string;
  label: string;
  href?: string;
  children?: NavChild[];
};