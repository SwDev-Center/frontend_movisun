import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryById } from "@/api/categories";
import { getProductsByCategory } from "@/api/products";
import { CatalogView } from "@/components/catalog/CatalogView";
import { JsonLd } from "@/components/ui/JsonLd";
import { SITE_URL } from "@/lib/site";

// Metadata por categoría, derivada de los datos reales de la API.
// Si la categoría no existe devolvemos {} para que Next.js sirva la página
// 404 (/not-found) con su metadata noindex.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ categoria: string }>;
}): Promise<Metadata> {
  const { categoria } = await params;
  const category = await getCategoryById(categoria);
  if (!category) return {};

  const title = `${category.label} — Smartwatches, audio y accesorios`;
  return {
    title: category.label,
    description: category.description,
    alternates: { canonical: `/catalogo/${category.id}` },
    openGraph: {
      title,
      description: category.description,
      url: `/catalogo/${category.id}`,
      type: "website",
      images: [{ url: category.coverImg, alt: category.label }],
    },
  };
}

export default async function CatalogPage({
  params,
  searchParams,
}: {
  params: Promise<{ categoria: string }>;
  searchParams: Promise<{ sub?: string | string[] }>;
}) {
  const [{ categoria }, sp] = await Promise.all([params, searchParams]);
  const [category, products] = await Promise.all([getCategoryById(categoria), getProductsByCategory(categoria)]);

  if (!category) notFound();

  const rawSub = sp.sub;
  const sub = Array.isArray(rawSub) ? rawSub[0] : rawSub;

  // Migas de pan (BreadcrumbList) para que los buscadores entiendan la
  // jerarquía: Inicio > Categoría.
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: category.label, item: `${SITE_URL}/catalogo/${category.id}` },
    ],
  };

  return (
    <>
      <JsonLd data={breadcrumb} />
      <CatalogView category={category} products={products} initialSub={sub ?? null} />
    </>
  );
}