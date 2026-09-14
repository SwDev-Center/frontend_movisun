import type {
  Advisor,
  Category,
  FlashSale,
  IconKey,
  LiveEvent,
  Product,
  ProductBadge,
} from "@/lib/types";

// Traducción fila de PostgreSQL → DTO del contrato (src/lib/types.ts).
// Las columnas son snake_case y el contrato camelCase; además los campos
// opcionales se OMITEN cuando no hay valor, para que la respuesta sea idéntica
// a la que servían los mocks.

const MS_POR_DIA = 86_400_000;
const MS_POR_HORA = 3_600_000;

export interface ProductRow {
  id: number;
  name: string;
  price: number;
  original_price: number | null;
  category: string;
  subcategory: string;
  description: string;
  features: string[];
  image: string;
  badge: string | null;
  rating: string | number;
  reviews: number;
  colors: string[] | null;
  is_new: boolean;
  created_at: Date;
}

export function toProduct(r: ProductRow): Product {
  // El orden de las claves replica el de los mocks para que las respuestas
  // sean comparables carácter a carácter.
  return {
    id: r.id,
    name: r.name,
    price: r.price,
    ...(r.original_price !== null ? { originalPrice: r.original_price } : {}),
    category: r.category,
    subcategory: r.subcategory,
    description: r.description,
    features: r.features,
    image: r.image,
    ...(r.badge !== null ? { badge: r.badge as ProductBadge } : {}),
    // pg devuelve numeric como string para no perder precisión.
    rating: Number(r.rating),
    reviews: r.reviews,
    ...(r.colors !== null && r.colors.length > 0 ? { colors: r.colors } : {}),
    isNew: r.is_new,
    // Derivado, no almacenado: así no se desfasa cuando la respuesta se cachea.
    addedDaysAgo: Math.max(0, Math.floor((Date.now() - r.created_at.getTime()) / MS_POR_DIA)),
  };
}

export interface CategoryRow {
  id: string;
  label: string;
  tagline: string;
  description: string;
  icon: string;
  color: string;
  cover_img: string;
  hero_img: string;
  subcategories: { label: string; icon: string }[] | null;
}

export function toCategory(r: CategoryRow): Category {
  return {
    id: r.id,
    label: r.label,
    tagline: r.tagline,
    description: r.description,
    icon: r.icon as IconKey,
    color: r.color,
    coverImg: r.cover_img,
    heroImg: r.hero_img,
    subcategories: (r.subcategories ?? []).map((s) => ({
      label: s.label,
      icon: s.icon as IconKey,
    })),
  };
}

// Colombia no usa horario de verano, así que su desfase es siempre −05:00.
const ZONA = "America/Bogota";

/** Día calendario en Colombia, sin importar dónde corra el servidor. */
function diaEnBogota(fecha: Date): number {
  const partes = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: ZONA,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
      .formatToParts(fecha)
      .map((p) => [p.type, p.value])
  );
  // Número de día absoluto, para restar dos fechas sin preocuparse por los meses.
  return Date.UTC(Number(partes.year), Number(partes.month) - 1, Number(partes.day)) / 86_400_000;
}

/** "7:00 PM" en hora de Colombia. */
function horaEnBogota(fecha: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: ZONA,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    // Intl separa la hora del AM/PM con un espacio fino; se normaliza a uno normal.
  })
    .format(fecha)
    .replace(/\u202f/g, " ");
}

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

/**
 * Texto de la fecha tal como se muestra: "Hoy, 7:00 PM", "Mañana, 8:00 PM",
 * "Viernes, 6:00 PM" o "18 sep, 6:00 PM".
 *
 * Se calcula en cada respuesta y no se almacena: un "Hoy" guardado en la base
 * sería mentira al día siguiente.
 */
export function etiquetaDeFecha(fecha: Date, ahora = new Date()): string {
  const dias = diaEnBogota(fecha) - diaEnBogota(ahora);
  const hora = horaEnBogota(fecha);

  if (dias === 0) return `Hoy, ${hora}`;
  if (dias === 1) return `Mañana, ${hora}`;

  if (dias > 1 && dias < 7) {
    const dia = new Intl.DateTimeFormat("es-CO", { timeZone: ZONA, weekday: "long" }).format(fecha);
    return `${dia.charAt(0).toUpperCase()}${dia.slice(1)}, ${hora}`;
  }

  // Intl en es-CO devuelve "13 de sept"; el sitio usa el estilo corto "13 sep".
  const partes = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", { timeZone: ZONA, month: "2-digit", day: "numeric" })
      .formatToParts(fecha)
      .map((p) => [p.type, p.value])
  );
  const mes = MESES[Number(partes.month) - 1];
  return `${Number(partes.day)} ${mes}, ${hora}`;
}

/** Valor para un <input type="datetime-local">: "2026-09-14T19:00" en hora de Colombia. */
export function fechaParaFormulario(fecha: Date): string {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: ZONA,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
      .formatToParts(fecha)
      .map((x) => [x.type, x.value])
  );
  // en-CA con hour12:false puede devolver "24" a medianoche.
  const hora = p.hour === "24" ? "00" : p.hour;
  return `${p.year}-${p.month}-${p.day}T${hora}:${p.minute}`;
}

export interface LiveEventRow {
  id: number;
  title: string;
  description: string;
  starts_at: Date;
  duration_minutes: number;
  url: string;
  image: string;
  viewers: number;
}

export function toLiveEvent(r: LiveEventRow, ahora = new Date()): LiveEvent {
  const inicio = r.starts_at.getTime();
  const fin = inicio + r.duration_minutes * 60_000;

  return {
    id: r.id,
    title: r.title,
    desc: r.description,
    // Derivados, no almacenados: ver etiquetaDeFecha.
    date: etiquetaDeFecha(r.starts_at, ahora),
    startsAt: r.starts_at.toISOString(),
    url: r.url,
    // El cartel EN VIVO se enciende y se apaga solo con el horario del evento.
    live: ahora.getTime() >= inicio && ahora.getTime() < fin,
    image: r.image,
    viewers: r.viewers,
  };
}

export interface FlashSaleRow {
  product_id: number;
  extra_discount: number;
  ends_at: Date;
  stock: number;
}

export function toFlashSale(r: FlashSaleRow): FlashSale {
  const horas = (r.ends_at.getTime() - Date.now()) / MS_POR_HORA;
  return {
    productId: r.product_id,
    extraDiscount: r.extra_discount,
    // Derivado igual que addedDaysAgo. Nunca negativo: una oferta vencida
    // muestra el contador en cero, no un número al revés.
    endsInHours: Math.max(0, Math.round(horas * 10) / 10),
    stock: r.stock,
  };
}

export type AdvisorRow = Advisor;
