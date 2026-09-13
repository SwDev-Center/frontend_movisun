import { httpGet } from "@/api/http";
import type { Category } from "@/lib/types";

export async function getCategories(): Promise<Category[]> {
  return httpGet<Category[]>("/api/v1/categories", { revalidate: 600 });
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const all = await getCategories();
  return all.find((c) => c.id === id) ?? null;
}