import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { fechaParaFormulario } from "@/lib/mappers";
import { EventoForm } from "@/components/admin/EventoForm";

export const metadata: Metadata = {
  title: "Nuevo evento",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function NuevoEventoPage() {
  // Por defecto, dentro de una hora: es lo más probable y evita crear un evento
  // que ya empezó sin darse cuenta. La página es force-dynamic, así que leer la
  // hora en el render es justamente lo que se busca.
  const enUnaHora = new Date();
  enUnaHora.setHours(enUnaHora.getHours() + 1);

  return (
    <>
      <Link
        href="/admin/eventos"
        className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors mb-3"
      >
        <ChevronLeft size={13} aria-hidden="true" /> Eventos
      </Link>
      <h1 className="text-2xl font-extrabold text-foreground mb-6">Nuevo evento</h1>

      <EventoForm inicioValor={fechaParaFormulario(enUnaHora)} />
    </>
  );
}
