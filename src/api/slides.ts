import { httpGet } from "@/api/http";
import type { HomeSlide } from "@/lib/types";

export async function getHomeSlides(): Promise<HomeSlide[]> {
  return httpGet<HomeSlide[]>("/api/v1/slides", { revalidate: 600, tags: ["slides"] });
}
