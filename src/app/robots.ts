import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Configuración del robots.txt generada por Next.js.
// Permite indexar todo el sitio salvo los endpoints de la API y
// anuncia la ubicación del sitemap.xml.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/api/",
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}