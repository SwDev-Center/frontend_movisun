import { getEvents } from "@/api/events";
import { getProducts } from "@/api/products";
import { getAdvisors } from "@/api/advisors";
import { EventosView } from "@/components/eventos/EventosView";

export default async function EventosPage() {
  const [events, products, advisors] = await Promise.all([getEvents(), getProducts(), getAdvisors()]);
  return <EventosView events={events} products={products} advisors={advisors} />;
}