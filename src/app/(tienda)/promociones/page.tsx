import type { Metadata } from "next";
import { getDiscountedProducts } from "@/api/products";
import { PromocionesView } from "@/components/promociones/PromocionesView";

// Metadata SEO de la página de promociones.
export const metadata: Metadata = {
  title: "Promociones",
  description:
    "Descuentos en smartwatches, audio, cargadores y accesorios Bluetooth: precios exclusivos y ofertas por tiempo limitado en Movisun Nariño.",
  alternates: { canonical: "/promociones" },
  openGraph: {
    title: "Promociones | Movisun Nariño",
    description: "Las mejores ofertas en tecnología: precios exclusivos y descuentos por tiempo limitado.",
    url: "/promociones",
    type: "website",
    images: [{ url: "/img/unsplash-watch.jpg", width: 1200, height: 630, alt: "Promociones Movisun Nariño" }],
  },
};

export default async function PromocionesPage() {
  const products = await getDiscountedProducts();
  return <PromocionesView products={products} />;
}