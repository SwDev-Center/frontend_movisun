import { httpGet } from "@/api/http";
import type { Product } from "@/lib/types";

export async function getProducts(): Promise<Product[]> {
  return httpGet<Product[]>("/api/v1/products", { revalidate: 120, tags: ["products"] });
}

export async function getProductById(id: number): Promise<Product | null> {
  const all = await getProducts();
  return all.find((p) => p.id === id) ?? null;
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  const all = await getProducts();
  return all.filter((p) => p.category === category);
}

export async function getNewProducts(): Promise<Product[]> {
  const all = await getProducts();
  return all.filter((p) => p.isNew || p.badge === "Nuevo");
}

/** Todo lo que está rebajado hoy: con precio anterior, con oferta relámpago
 *  vigente, o las dos cosas. Es lo que alimenta /promociones. */
export async function getDiscountedProducts(): Promise<Product[]> {
  const all = await getProducts();
  return all.filter((p) => p.originalPrice || p.flash);
}