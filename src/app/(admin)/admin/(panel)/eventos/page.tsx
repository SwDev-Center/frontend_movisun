import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Plus, Pencil, ChevronUp, ChevronDown, AlertCircle, Radio, Save, Zap } from "lucide-react";
import { PRIMARY } from "@/lib/constants";
import { fmt } from "@/lib/utils";
import { etiquetaDeFecha, fechaParaFormulario } from "@/lib/mappers";
import { listarEventos, listarOfertas, listarProductosSinOferta } from "@/lib/repo-admin";
import { BotonConfirmar } from "@/components/admin/BotonConfirmar";
import { OfertaNueva } from "@/components/admin/OfertaNueva";
import {
  borrarEvento,
  borrarOferta,
  guardarOferta,
  ordenarEvento,
} from "@/app/(admin)/admin/(panel)/eventos/actions";

export const metadata: Metadata = {
  title: "Eventos y ofertas",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const MENSAJES: Record<string, string> = {
  creado: "Evento creado.",
  editado: "Cambios guardados.",
  borrado: "Evento eliminado.",
  "oferta-creada": "Oferta relámpago creada.",
  "oferta-editada": "Oferta guardada.",
  "oferta-borrada": "Oferta eliminada.",
};

const campo =
  "px-3 py-2 rounded-xl border border-border bg-white text-foreground text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

export default async function EventosPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string; error?: string }>;
}) {
  const { estado, error } = await searchParams;
  const [eventos, ofertas, productosLibres] = await Promise.all([
    listarEventos(),
    listarOfertas(),
    listarProductosSinOferta(),
  ]);

  const ahora = new Date();
  const enVivo = (e: { starts_at: Date; duration_minutes: number }) =>
    ahora >= e.starts_at && ahora.getTime() < e.starts_at.getTime() + e.duration_minutes * 60_000;

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Eventos y ofertas</h1>
          <p className="text-sm text-muted-foreground">
            Lo que se ve en la página /eventos del sitio.
          </p>
        </div>
        <Link
          href="/admin/eventos/nuevo"
          className="ml-auto flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90"
          style={{ background: PRIMARY }}
        >
          <Plus size={15} aria-hidden="true" /> Nuevo evento
        </Link>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 mb-5 p-3 rounded-xl bg-red-50 border border-red-200"
        >
          <AlertCircle size={15} className="text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-sm text-red-700 font-medium">{error}</p>
        </div>
      )}

      {estado && MENSAJES[estado] && (
        <p
          role="status"
          className="mb-5 p-3 rounded-xl text-sm font-medium border bg-green-50 border-green-200 text-green-800"
        >
          {MENSAJES[estado]}
        </p>
      )}

      {/* ── Eventos en vivo ─────────────────────────────────────────────────── */}
      <h2 className="text-lg font-extrabold text-foreground mb-1">Eventos en vivo</h2>
      <p className="text-sm text-muted-foreground mb-4">
        El cartel rojo EN VIVO se enciende y se apaga solo según la hora de inicio y la duración.
      </p>

      {eventos.length === 0 ? (
        <p className="text-center py-10 text-muted-foreground text-sm">Todavía no hay eventos.</p>
      ) : (
        <ul className="space-y-3 mb-12">
          {eventos.map((e, i) => (
            <li key={e.id} className="bg-white rounded-2xl border border-border p-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative w-20 h-12 rounded-xl overflow-hidden bg-muted shrink-0">
                  <Image src={e.image} alt="" fill sizes="80px" className="object-cover" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold text-foreground">{e.title}</p>
                    {enVivo(e) && (
                      <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-600 text-white">
                        <Radio size={9} aria-hidden="true" /> EN VIVO
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {etiquetaDeFecha(e.starts_at, ahora)} · {e.duration_minutes} min ·{" "}
                    {e.viewers} espectadores
                  </p>
                </div>

                <div className="flex items-center gap-1 ml-auto">
                  <form action={ordenarEvento}>
                    <input type="hidden" name="id" value={e.id} />
                    <input type="hidden" name="direccion" value="arriba" />
                    <button
                      type="submit"
                      disabled={i === 0}
                      aria-label={`Subir ${e.title}`}
                      className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                      <ChevronUp size={15} aria-hidden="true" />
                    </button>
                  </form>
                  <form action={ordenarEvento}>
                    <input type="hidden" name="id" value={e.id} />
                    <input type="hidden" name="direccion" value="abajo" />
                    <button
                      type="submit"
                      disabled={i === eventos.length - 1}
                      aria-label={`Bajar ${e.title}`}
                      className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                      <ChevronDown size={15} aria-hidden="true" />
                    </button>
                  </form>
                  <Link
                    href={`/admin/eventos/${e.id}`}
                    aria-label={`Editar ${e.title}`}
                    className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  >
                    <Pencil size={15} aria-hidden="true" />
                  </Link>
                  <BotonConfirmar
                    accion={borrarEvento}
                    campos={{ id: e.id }}
                    etiqueta={`Eliminar ${e.title}`}
                    mensaje={`¿Eliminar el evento «${e.title}»?`}
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* ── Ofertas relámpago ───────────────────────────────────────────────── */}
      <h2 className="text-lg font-extrabold text-foreground mb-1">Ofertas relámpago</h2>
      <p className="text-sm text-muted-foreground mb-4">
        El descuento se aplica sobre el precio actual del producto. Al vencer desaparecen del
        sitio, pero siguen acá para darles una fecha nueva.
      </p>

      <div className="bg-white rounded-2xl border border-border p-5 mb-4">
        <OfertaNueva productos={productosLibres} minimo={fechaParaFormulario(ahora)} />
      </div>

      {ofertas.length === 0 ? (
        <p className="text-center py-10 text-muted-foreground text-sm">
          No hay ofertas relámpago.
        </p>
      ) : (
        <ul className="space-y-2">
          {ofertas.map((o) => {
            const precioOferta = Math.round(o.precio * (1 - o.extra_discount / 100));
            return (
              <li
                key={o.product_id}
                className={`bg-white rounded-2xl border p-3 ${
                  o.vencida ? "border-border opacity-70" : "border-amber-300"
                }`}
              >
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-muted shrink-0">
                    <Image src={o.imagen} alt="" fill sizes="40px" className="object-cover" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-foreground text-sm">{o.producto}</p>
                      {o.vencida ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                          Vencida · oculta en el sitio
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                          <Zap size={9} aria-hidden="true" /> Activa
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 tabular-nums">
                      {fmt(o.precio)} → <strong className="text-foreground">{fmt(precioOferta)}</strong>
                    </p>
                  </div>

                  <form action={guardarOferta} className="flex flex-wrap items-center gap-2">
                    <input type="hidden" name="productId" value={o.product_id} />

                    <label htmlFor={`desc-${o.product_id}`} className="sr-only">
                      Descuento extra de {o.producto}
                    </label>
                    <input
                      id={`desc-${o.product_id}`}
                      name="extraDiscount"
                      type="number"
                      required
                      min={1}
                      max={99}
                      defaultValue={o.extra_discount}
                      className={`${campo} w-20`}
                    />

                    <label htmlFor={`fin-${o.product_id}`} className="sr-only">
                      Fecha de fin de la oferta de {o.producto}
                    </label>
                    <input
                      id={`fin-${o.product_id}`}
                      name="endsAt"
                      type="datetime-local"
                      required
                      defaultValue={fechaParaFormulario(o.ends_at)}
                      className={campo}
                    />

                    <label htmlFor={`stock-${o.product_id}`} className="sr-only">
                      Unidades disponibles de {o.producto}
                    </label>
                    <input
                      id={`stock-${o.product_id}`}
                      name="stock"
                      type="number"
                      required
                      min={0}
                      defaultValue={o.stock}
                      className={`${campo} w-20`}
                    />

                    <button
                      type="submit"
                      aria-label={`Guardar la oferta de ${o.producto}`}
                      className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    >
                      <Save size={15} aria-hidden="true" />
                    </button>
                  </form>

                  <BotonConfirmar
                    accion={borrarOferta}
                    campos={{ productId: o.product_id }}
                    etiqueta={`Eliminar la oferta de ${o.producto}`}
                    mensaje={`¿Eliminar la oferta relámpago de «${o.producto}»?`}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
