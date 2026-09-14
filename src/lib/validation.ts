import { z } from "zod";

// Validación de lo que llega desde los formularios del panel.
// Es la ÚNICA comprobación en tiempo de ejecución del proyecto: la base tiene
// restricciones equivalentes, pero acá los errores se pueden explicar en español.

export const MIMES_IMAGEN = ["image/jpeg", "image/png", "image/webp", "image/avif"] as const;
export const TAMANO_MAX_IMAGEN = 5 * 1024 * 1024; // 5 MB

/** Los campos numéricos opcionales llegan como "" cuando el usuario los deja vacíos. */
const vacioEsIndefinido = (v: unknown) => (v === "" || v === null || v === undefined ? undefined : v);

export const esquemaProducto = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "El nombre debe tener al menos 2 caracteres.")
      .max(120, "El nombre no puede pasar de 120 caracteres."),

    price: z.coerce
      .number({ error: "El precio debe ser un número." })
      .int("El precio no lleva decimales: los pesos colombianos se manejan enteros.")
      .min(0, "El precio no puede ser negativo.")
      .max(100_000_000, "El precio parece demasiado alto."),

    originalPrice: z.preprocess(
      vacioEsIndefinido,
      z.coerce
        .number({ error: "El precio anterior debe ser un número." })
        .int("El precio anterior no lleva decimales.")
        .positive("El precio anterior debe ser mayor que cero.")
        .optional()
    ),

    subcategoryId: z.coerce
      .number({ error: "Elegí una subcategoría." })
      .int()
      .positive("Elegí una subcategoría."),

    description: z
      .string()
      .trim()
      .min(10, "La descripción debe tener al menos 10 caracteres.")
      .max(1000, "La descripción no puede pasar de 1000 caracteres."),

    features: z
      .array(z.string().trim().min(1).max(60, "Cada característica debe ser corta (máx. 60)."))
      .min(1, "Agregá al menos una característica.")
      .max(12, "Máximo 12 características."),

    image: z.string().trim().min(1, "Falta la imagen del producto."),

    badge: z.preprocess(
      vacioEsIndefinido,
      z.enum(["Nuevo", "Más vendido", "Oferta"], { error: "Etiqueta no válida." }).optional()
    ),

    rating: z.coerce
      .number({ error: "La valoración debe ser un número." })
      .min(0, "La valoración va de 0 a 5.")
      .max(5, "La valoración va de 0 a 5."),

    reviews: z.coerce
      .number({ error: "La cantidad de reseñas debe ser un número." })
      .int("La cantidad de reseñas es un número entero.")
      .min(0, "La cantidad de reseñas no puede ser negativa."),

    colors: z.array(z.string().trim().min(1).max(30)).max(10, "Máximo 10 colores."),

    isNew: z.boolean(),
  })
  // El frontend calcula el descuento como 1 - price/originalPrice: si el precio
  // anterior no es mayor, saldría un descuento negativo o del 0 %.
  .refine((d) => d.originalPrice === undefined || d.originalPrice > d.price, {
    message: "El precio anterior tiene que ser mayor que el precio actual.",
    path: ["originalPrice"],
  });

export type DatosProducto = z.infer<typeof esquemaProducto>;

/** Convierte un textarea de "una por línea" en arreglo, sin vacíos. */
export function lineasALista(texto: FormDataEntryValue | null): string[] {
  return String(texto ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

/** Convierte un campo separado por comas en arreglo, sin vacíos. */
export function comasALista(texto: FormDataEntryValue | null): string[] {
  return String(texto ?? "")
    .split(",")
    .map((l) => l.trim())
    .filter(Boolean);
}

/** Primer mensaje de error legible de un ZodError. */
export function primerError(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Los datos no son válidos.";
}

// ─── Categorías y subcategorías ─────────────────────────────────────────────

/** Los 8 iconos disponibles (IconKey). La base valida los mismos con un check. */
export const ICONOS = [
  "watch",
  "headphones",
  "bluetooth",
  "battery",
  "zap",
  "cable",
  "speaker",
  "radio",
] as const;

/** Nombre legible de cada icono, para el desplegable del panel. */
export const NOMBRES_ICONOS: Record<(typeof ICONOS)[number], string> = {
  watch: "Reloj",
  headphones: "Audífonos",
  bluetooth: "Bluetooth",
  battery: "Batería",
  zap: "Carga rápida",
  cable: "Cable",
  speaker: "Parlante",
  radio: "Señal",
};

/**
 * Convierte un nombre en slug de URL: «Audio y Carga» → «audio-y-carga».
 * Se usa UNA sola vez, al crear la categoría. Renombrarla después no cambia
 * la URL, para no romper enlaces ya compartidos ni el posicionamiento.
 */
export function generarSlug(texto: string): string {
  const slug = texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // quita tildes: «Audífonos» → «Audifonos»
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .replace(/-+$/, "");
  return slug || "categoria";
}

export const esquemaCategoria = z.object({
  label: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres.")
    .max(60, "El nombre no puede pasar de 60 caracteres."),

  tagline: z
    .string()
    .trim()
    .min(2, "El lema debe tener al menos 2 caracteres.")
    .max(80, "El lema no puede pasar de 80 caracteres."),

  description: z
    .string()
    .trim()
    .min(10, "La descripción debe tener al menos 10 caracteres.")
    .max(300, "La descripción no puede pasar de 300 caracteres."),

  icon: z.enum(ICONOS, { error: "Elegí un icono de la lista." }),

  // Al color se le concatenan sufijos de opacidad para el degradado de la
  // portada, así que tiene que ser hex de 6 dígitos exactos.
  color: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/, "El color debe ser un hex de 6 dígitos, por ejemplo #1A2F5F."),

  coverImg: z.string().trim().min(1, "Falta la portada de la categoría."),
});

export type DatosCategoria = z.infer<typeof esquemaCategoria>;

export const esquemaSubcategoria = z.object({
  label: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres.")
    .max(40, "El nombre no puede pasar de 40 caracteres."),
  icon: z.enum(ICONOS, { error: "Elegí un icono de la lista." }),
});

export type DatosSubcategoria = z.infer<typeof esquemaSubcategoria>;

// ─── Eventos y ofertas relámpago ────────────────────────────────────────────

/**
 * Convierte lo que manda un <input type="datetime-local"> ("2026-09-14T19:00")
 * en una fecha real. El navegador manda la hora local sin zona, así que se
 * interpreta como hora de Colombia: el país no usa horario de verano, su
 * desfase es siempre −05:00.
 */
export function fechaDesdeFormulario(valor: FormDataEntryValue | null): Date | null {
  const texto = String(valor ?? "").trim();
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(texto)) return null;
  const fecha = new Date(`${texto}:00-05:00`);
  return Number.isNaN(fecha.getTime()) ? null : fecha;
}

export const esquemaEvento = z.object({
  title: z
    .string()
    .trim()
    .min(3, "El título debe tener al menos 3 caracteres.")
    .max(120, "El título no puede pasar de 120 caracteres."),

  description: z
    .string()
    .trim()
    .min(10, "La descripción debe tener al menos 10 caracteres.")
    .max(600, "La descripción no puede pasar de 600 caracteres."),

  startsAt: z.date({ error: "Poné la fecha y la hora de inicio." }),

  // De esto depende cuándo se apaga solo el cartel EN VIVO.
  durationMinutes: z.coerce
    .number({ error: "La duración debe ser un número." })
    .int("La duración va en minutos enteros.")
    .min(5, "La duración mínima son 5 minutos.")
    .max(600, "La duración máxima son 600 minutos (10 horas)."),

  url: z
    .string()
    .trim()
    .regex(/^https?:\/\/.+/, "El enlace del stream debe empezar con http:// o https://"),

  image: z.string().trim().min(1, "Falta la imagen del evento."),

  viewers: z.coerce
    .number({ error: "La cantidad de espectadores debe ser un número." })
    .int("La cantidad de espectadores es un número entero.")
    .min(0, "La cantidad de espectadores no puede ser negativa."),
});

export type DatosEvento = z.infer<typeof esquemaEvento>;

export const esquemaOferta = z.object({
  productId: z.coerce
    .number({ error: "Elegí un producto." })
    .int()
    .positive("Elegí un producto."),

  extraDiscount: z.coerce
    .number({ error: "El descuento debe ser un número." })
    .int("El descuento va en porcentaje entero.")
    .min(1, "El descuento mínimo es 1 %.")
    .max(99, "El descuento máximo es 99 %."),

  // Una oferta que ya terminó no se muestra en el sitio, así que no tiene
  // sentido guardarla con la fecha en el pasado.
  endsAt: z
    .date({ error: "Poné la fecha y la hora en que termina." })
    .refine((f) => f.getTime() > Date.now(), {
      message: "La oferta tiene que terminar en el futuro.",
    }),

  stock: z.coerce
    .number({ error: "Las unidades disponibles deben ser un número." })
    .int("Las unidades disponibles van en números enteros.")
    .min(0, "Las unidades disponibles no pueden ser negativas."),
});

export type DatosOferta = z.infer<typeof esquemaOferta>;
