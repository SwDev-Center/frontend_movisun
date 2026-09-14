import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { getCategories } from "@/api/categories";
import { MOSTRAR_EVENTOS } from "@/lib/features";

// Sitemap.xml generado bajo demanda. Incluye las rutas estáticas y una
// entrada por cada categoría real tomada de la API.
// Es dinámico (force-dynamic) porque getCategories() hace fetch a los route
// handlers de mock, que no están disponibles durante el build (no hay servidor).
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const categories = await getCategories();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: new Date(), priority: 1 },
    // Solo si la sección está publicada: no tiene sentido ofrecerle a Google
    // una dirección que responde 404.
    ...(MOSTRAR_EVENTOS
      ? [{ url: `${SITE_URL}/eventos`, lastModified: new Date(), priority: 0.7 }]
      : []),
    { url: `${SITE_URL}/promociones`, lastModified: new Date(), priority: 0.8 },
    { url: `${SITE_URL}/distribuidores`, lastModified: new Date(), priority: 0.5 },
    { url: `${SITE_URL}/distribuidores/contacto`, lastModified: new Date(), priority: 0.4 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${SITE_URL}/catalogo/${c.id}`,
    lastModified: new Date(),
    priority: 0.8,
  }));

  return [...staticRoutes, ...categoryRoutes];
}