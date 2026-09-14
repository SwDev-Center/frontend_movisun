import { httpGet } from "@/api/http";
import type { HeroTile } from "@/lib/types";

export async function getHeroTiles(): Promise<HeroTile[]> {
  return httpGet<HeroTile[]>("/api/v1/hero", { revalidate: 600, tags: ["hero"] });
}
