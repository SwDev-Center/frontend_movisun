import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MOSTRAR_EVENTOS } from "@/lib/features";
import { getEvents } from "@/api/events";
import { getProducts } from "@/api/products";
import { getAdvisors } from "@/api/advisors";
import { EventosView } from "@/components/eventos/EventosView";
import { JsonLd } from "@/components/ui/JsonLd";
import { SITE_NAME, SITE_URL } from "@/lib/site";

// Metadata estática de la página de eventos.
export const metadata: Metadata = {
  title: "Eventos en vivo y ofertas relámpago",
  description:
    "Eventos en vivo de Movisun Nariño: lanzamientos de smartwatches, guías de accesorios y ofertas relámpago con descuentos extra.",
  alternates: { canonical: "/eventos" },
  openGraph: {
    title: "Eventos en vivo y ofertas relámpago | Movisun Nariño",
    description:
      "Lanzamientos, guías de producto y ofertas relámpago con descuentos extra.",
    url: "/eventos",
    type: "website",
    images: [{ url: "/img/unsplash-gaming.jpg", width: 1200, height: 630, alt: "Eventos Movisun Nariño" }],
  },
};

export default async function EventosPage() {
  // Sección apagada en src/lib/features.ts: la página no existe para nadie,
  // ni siquiera escribiendo la dirección.
  if (!MOSTRAR_EVENTOS) notFound();

  const [events, products, advisors] = await Promise.all([getEvents(), getProducts(), getAdvisors()]);

  // Esquema Event por cada evento en vivo. Usamos OnlineEventAttendanceMode
  // porque los eventos no se emiten en esta página: redirigen a un stream
  // externo (url), que también se usa como startDate/ubicación virtual.
  const eventSchema = events.live.map((ev) => ({
    "@context": "https://schema.org",
    "@type": "Event",
    name: ev.title,
    description: ev.desc,
    image: `${SITE_URL}${ev.image}`,
    url: ev.url,
    startDate: ev.startsAt,
    eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    location: { "@type": "VirtualLocation", url: ev.url },
    organizer: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
  }));

  return (
    <>
      <JsonLd data={eventSchema} />
      <EventosView events={events} products={products} advisors={advisors} />
    </>
  );
}