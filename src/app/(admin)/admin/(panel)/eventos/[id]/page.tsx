import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { etiquetaDeFecha, fechaParaFormulario } from "@/lib/mappers";
import { buscarEvento } from "@/lib/repo-admin";
import { EventoForm } from "@/components/admin/EventoForm";

export const metadata: Metadata = {
  title: "Editar evento",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function EditarEventoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numero = Number(id);

  if (!Number.isInteger(numero) || numero <= 0) notFound();

  const evento = await buscarEvento(numero);
  if (!evento) notFound();

  return (
    <>
      <Link
        href="/admin/eventos"
        className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors mb-3"
      >
        <ChevronLeft size={13} aria-hidden="true" /> Eventos
      </Link>
      <h1 className="text-2xl font-extrabold text-foreground mb-1">{evento.title}</h1>
      <p className="text-sm text-muted-foreground mb-6">
        En el sitio se lee: «{etiquetaDeFecha(evento.starts_at)}»
      </p>

      <EventoForm evento={evento} inicioValor={fechaParaFormulario(evento.starts_at)} />
    </>
  );
}
