"use client";

import { useActionState, useEffect, useState } from "react";
import { AlertCircle, Plus, Upload } from "lucide-react";
import { PRIMARY } from "@/lib/constants";
import {
  guardarSlide,
  type EstadoFormulario,
} from "@/app/(admin)/admin/(panel)/inicio/actions";
import type { FilaSlide } from "@/lib/repo-admin";

// Una diapositiva del carrusel. El mismo formulario sirve para crear y editar.
//
// La previsualización reproduce la franja real: la foto recortada a lo ancho,
// el degradado oscuro de la izquierda y el texto encima, que es donde se nota
// si una imagen tiene el motivo descentrado o demasiado contraste.

const campo =
  "w-full px-3 py-2 rounded-xl border border-border bg-white text-foreground text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";
const etiqueta = "block text-xs font-bold text-foreground mb-1.5";

export function SlideForm({
  slide,
  listaRutas,
}: {
  slide?: FilaSlide;
  listaRutas: string;
}) {
  const [estado, accion, enviando] = useActionState<EstadoFormulario, FormData>(
    guardarSlide,
    {}
  );

  const [previa, setPrevia] = useState<string | null>(null);
  const [titulo, setTitulo] = useState(slide?.headline ?? "");

  useEffect(() => () => {
    if (previa) URL.revokeObjectURL(previa);
  }, [previa]);

  const marca = slide?.id ?? "nueva";
  const error = estado.slideId === marca ? estado.error : undefined;
  const imagen = previa ?? slide?.image;

  return (
    <form action={accion} className="bg-white rounded-2xl border border-border p-5">
      {slide && <input type="hidden" name="id" value={slide.id} />}
      <input type="hidden" name="imagenActual" value={slide?.image ?? ""} />

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 mb-4 p-3 rounded-xl bg-red-50 border border-red-200"
        >
          <AlertCircle size={15} className="text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-sm text-red-700 font-medium">{error}</p>
        </div>
      )}

      {/* ── Previsualización de la franja ──────────────────────────────────── */}
      <div className="relative w-full h-28 rounded-xl overflow-hidden bg-muted mb-4">
        {imagen ? (
          // La vista previa usa una URL temporal (blob:) del archivo recién
          // elegido, que next/image no puede optimizar.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imagen} alt="" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
            Elegí una imagen para ver cómo queda
          </div>
        )}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, rgba(7,17,32,0.85) 0%, rgba(26,47,95,0.6) 50%, rgba(0,0,0,0.1) 100%)",
          }}
        />
        <div className="absolute inset-0 flex flex-col justify-center px-4">
          <p className="text-blue-300 text-[8px] font-bold tracking-[0.2em] uppercase mb-1">
            Movisun Nariño
          </p>
          <p className="text-white text-sm font-extrabold leading-tight line-clamp-2 max-w-[60%]">
            {titulo || "Título de la diapositiva"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <label htmlFor={`headline-${marca}`} className={etiqueta}>
            Título
          </label>
          <input
            id={`headline-${marca}`}
            name="headline"
            required
            maxLength={80}
            defaultValue={slide?.headline ?? ""}
            onChange={(e) => setTitulo(e.target.value)}
            className={campo}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor={`sub-${marca}`} className={etiqueta}>
            Bajada
          </label>
          <input
            id={`sub-${marca}`}
            name="sub"
            required
            maxLength={140}
            defaultValue={slide?.sub ?? ""}
            className={campo}
          />
        </div>

        <div>
          <label htmlFor={`cta-${marca}`} className={etiqueta}>
            Texto del botón
          </label>
          <input
            id={`cta-${marca}`}
            name="ctaLabel"
            required
            maxLength={30}
            placeholder="Ver categoría"
            defaultValue={slide?.cta_label ?? "Ver categoría"}
            className={campo}
          />
        </div>

        <div>
          <label htmlFor={`href-${marca}`} className={etiqueta}>
            A dónde lleva
          </label>
          <input
            id={`href-${marca}`}
            name="href"
            required
            list={listaRutas}
            maxLength={200}
            placeholder="/catalogo/audio"
            defaultValue={slide?.href ?? ""}
            className={campo}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor={`imagen-${marca}`} className={etiqueta}>
            {slide ? "Reemplazar imagen" : "Imagen"}
          </label>
          <input
            id={`imagen-${marca}`}
            name="imagen"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            required={!slide}
            onChange={(e) => {
              const archivo = e.target.files?.[0];
              setPrevia(archivo ? URL.createObjectURL(archivo) : null);
            }}
            className="w-full text-sm text-foreground file:mr-3 file:px-3 file:py-2 file:rounded-xl file:border-0 file:text-sm file:font-bold file:text-white file:cursor-pointer"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={enviando}
        className="flex items-center gap-1.5 mt-4 px-4 py-2 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        style={{ background: PRIMARY }}
      >
        {slide ? <Upload size={14} aria-hidden="true" /> : <Plus size={14} aria-hidden="true" />}
        {enviando ? "Guardando…" : slide ? "Guardar" : "Agregar diapositiva"}
      </button>
    </form>
  );
}
