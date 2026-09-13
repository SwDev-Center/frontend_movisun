// URL pública del sitio. Se usa para sitemap, canonical, Open Graph y JSON-LD.
// En producción debe apuntar al dominio real (configúrala con NEXT_PUBLIC_SITE_URL en .env).
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// Nombre de la marca, usado en la metadata y los esquemas de datos estructurados.
export const SITE_NAME = "Movisun Nariño";