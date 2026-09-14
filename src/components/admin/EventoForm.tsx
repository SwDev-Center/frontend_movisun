"use client";

import { useActionState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { PRIMARY } from "@/lib/constants";
import {
  guardarEvento,
  type EstadoFormulario,
} from "@/app/(admin)/admin/(panel)/eventos/actions";
import type { FilaEvento } from "@/lib/repo-admin";

// Alta y edición de eventos en vivo.
//
// No se pide ni el texto de la fecha ni si está en vivo: los dos se calculan
// solos a partir de la fecha de inicio y la duración.

const campo =
  "w-full px-3 py-2 rounded-xl border border-border bg-white text-foreground text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";
const etiqueta = "block text-sm font-bold text-foreground mb-1.5";
const ayuda = "text-xs text-muted-foreground mt-1";

export function EventoForm({
  evento,
  inicioValor,
}: {
  evento?: FilaEvento | null;
  /** Fecha de inicio ya formateada en hora de Colombia para el input. */
  inicioValor: string;
}) {
  const [estado, accion, enviando] = useActionState<EstadoFormulario, FormData>(
    guardarEvento,
    {}
  );

  const editando = Boolean(evento);

  return (
    <form action={accion} className="space-y-6">
      {estado.error && (
        <div
          role="alert"
          className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200"
        >
          <AlertCircle size={15} className="text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-sm text-red-700 font-medium">{estado.error}</p>
        </div>
      )}

      {evento && <input type="hidden" name="id" value={evento.id} />}
      <input type="hidden" name="imagenActual" value={evento?.image ?? ""} />

      <fieldset className="bg-white rounded-2xl border border-border p-5 space-y-4">
        <legend className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-2">
          Evento
        </legend>

        <div>
          <label htmlFor="title" className={etiqueta}>
            Título
          </label>
          <input
            id="title"
            name="title"
            required
            maxLength={120}
            defaultValue={evento?.title ?? ""}
            className={campo}
          />
        </div>

        <div>
          <label htmlFor="description" className={etiqueta}>
            Descripción
          </label>
          <textarea
            id="description"
            name="description"
            required
            rows={3}
            maxLength={600}
            defaultValue={evento?.description ?? ""}
            className={campo}
          />
        </div>

        <div>
          <label htmlFor="url" className={etiqueta}>
            Enlace del stream
          </label>
          <input
            id="url"
            name="url"
            type="url"
            required
            placeholder="https://www.youtube.com/watch?v=..."
            aria-describedby="ayuda-url"
            defaultValue={evento?.url ?? ""}
            className={campo}
          />
          <p id="ayuda-url" className={ayuda}>
            El sitio no incrusta el video: el botón «Ver ahora» lleva acá.
          </p>
        </div>
      </fieldset>

      <fieldset className="bg-white rounded-2xl border border-border p-5 space-y-4">
        <legend className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-2">
          Cuándo
        </legend>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="startsAt" className={etiqueta}>
              Empieza
            </label>
            <input
              id="startsAt"
              name="startsAt"
              type="datetime-local"
              required
              aria-describedby="ayuda-inicio"
              defaultValue={inicioValor}
              className={campo}
            />
            <p id="ayuda-inicio" className={ayuda}>
              Hora de Colombia. El texto que se ve en el sitio («Hoy, 7:00 PM») sale de acá.
            </p>
          </div>

          <div>
            <label htmlFor="durationMinutes" className={etiqueta}>
              Duración (minutos)
            </label>
            <input
              id="durationMinutes"
              name="durationMinutes"
              type="number"
              required
              min={5}
              max={600}
              step={5}
              aria-describedby="ayuda-duracion"
              defaultValue={evento?.duration_minutes ?? 60}
              className={campo}
            />
            <p id="ayuda-duracion" className={ayuda}>
              Mientras dure, el sitio muestra el cartel rojo EN VIVO. Después se apaga solo.
            </p>
          </div>
        </div>

        <div>
          <label htmlFor="viewers" className={etiqueta}>
            Espectadores
          </label>
          <input
            id="viewers"
            name="viewers"
            type="number"
            required
            min={0}
            step={1}
            aria-describedby="ayuda-viewers"
            defaultValue={evento?.viewers ?? 0}
            className={`${campo} sm:max-w-[12rem]`}
          />
          <p id="ayuda-viewers" className={ayuda}>
            Se muestra junto al cartel EN VIVO. No se actualiza solo: es el número que pongas acá.
          </p>
        </div>
      </fieldset>

      <fieldset className="bg-white rounded-2xl border border-border p-5 space-y-4">
        <legend className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-2">
          Imagen
        </legend>

        {evento?.image && (
          <div className="flex items-center gap-3">
            <div className="relative w-24 h-14 rounded-xl overflow-hidden bg-muted shrink-0">
              <Image
                src={evento.image}
                alt={`Imagen actual de ${evento.title}`}
                fill
                sizes="96px"
                className="object-cover"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Imagen actual. Si no subís otra, se conserva.
            </p>
          </div>
        )}

        <div>
          <label htmlFor="imagen" className={etiqueta}>
            {editando ? "Reemplazar imagen" : "Imagen del evento"}
          </label>
          <input
            id="imagen"
            name="imagen"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            required={!editando}
            aria-describedby="ayuda-imagen"
            className="w-full text-sm text-foreground file:mr-3 file:px-3 file:py-2 file:rounded-xl file:border-0 file:text-sm file:font-bold file:text-white file:cursor-pointer"
          />
          <p id="ayuda-imagen" className={ayuda}>
            Se ve apaisada, como miniatura del video. JPG, PNG, WebP o AVIF, hasta 5 MB.
          </p>
        </div>
      </fieldset>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={enviando}
          className="px-6 py-3 rounded-xl font-bold text-sm text-white transition-opacity hover:opacity-90 disabled:opacity-60 disabled:cursor-progress"
          style={{ background: PRIMARY }}
        >
          {enviando ? "Guardando…" : editando ? "Guardar cambios" : "Crear evento"}
        </button>
        <Link
          href="/admin/eventos"
          className="px-4 py-3 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
