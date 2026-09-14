import { httpGet } from "@/api/http";
import type { EventsCatalog } from "@/lib/types";

export async function getEvents(): Promise<EventsCatalog> {
  return httpGet<EventsCatalog>("/api/v1/events", { revalidate: 120, tags: ["events"] });
}