import { notFound } from "next/navigation";
import { getCategoryById } from "@/api/categories";
import { getProductsByCategory } from "@/api/products";
import { CatalogView } from "@/components/catalog/CatalogView";

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

  return <CatalogView category={category} products={products} initialSub={sub ?? null} />;
}