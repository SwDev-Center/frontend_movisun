import { httpGet } from "@/api/http";
import type { Advisor } from "@/lib/types";

export async function getAdvisors(): Promise<Advisor[]> {
  return httpGet<Advisor[]>("/api/v1/advisors", { revalidate: 600 });
}

export async function getSalesAdvisor(): Promise<Advisor | null> {
  const all = await getAdvisors();
  return all[0] ?? null;
}