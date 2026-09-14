"use client";

import { useActionState, useEffect, useState } from "react";
import { AlertCircle, Upload } from "lucide-react";
import { HERO_BG, PRIMARY } from "@/lib/constants";
import {
  guardarHeroTile,
  type EstadoFormulario,
} from "@/app/(admin)/admin/(panel)/inicio/actions";
import type { FilaHeroTile } from "@/lib/repo-admin";

// Una de las cuatro piezas de la portada.
//
// La previsualización reproduce el recuadro real del hero: el mismo fondo azul,
// el mismo resplandor detrás y el mismo encuadre. Es la forma más directa de
// ver si una imagen sirve, sobre todo si tiene fondo opaco.

const ESQUINAS: Record<number, string> = {
  1: "Arriba a la izquierda",
  2: "Abajo a la izquierda",
  3: "Arriba a la derecha",
  4: "Abajo a la derecha",
};

export function HeroTileForm({
  tile,
  listaRutas,
}: {
  tile: FilaHeroTile;
  /** id del <datalist> con las rutas sugeridas del sitio. */
  listaRutas: string;
}) {
  const [estado, accion, enviando] = useActionState<EstadoFormulario, FormData>(
    guardarHeroTile,
    {}
  );

  // Vista previa del archivo recién elegido, antes de subirlo.
  const [previa, setPrevia] = useState<string | null>(null);

  // Liberar la URL temporal al cambiarla o al desmontar: si no, el navegador
  // se queda con el archivo en memoria.
  useEffect(() => () => {
    if (previa) URL.revokeObjectURL(previa);
  }, [previa]);

  const error = estado.slot === tile.slot ? estado.error : undefined;

  return (
    <form action={accion} className="bg-white rounded-2xl border border-border p-5">
      <input type="hidden" name="slot" value={tile.slot} />
      <input type="hidden" name="imagenActual" value={tile.image} />

      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
        {ESQUINAS[tile.slot] ?? `Posición ${tile.slot}`}
      </p>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 mb-4 p-3 rounded-xl bg-red-50 border border-red-200"
        >
          <AlertCircle size={15} className="text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-sm text-red-700 font-medium">{error}</p>
        </div>
      )}

      <div className="flex flex-wrap gap-5">
        {/* ── Previsualización ─────────────────────────────────────────────── */}
        <div className="shrink-0">
          <div
            className="relative w-40 h-40 rounded-2xl overflow-hidden flex items-center justify-center"
            style={{ background: HERO_BG }}
          >
            {/* Mismo resplandor blanco que hay detrás de la pieza en la portada. */}
            <div className="absolute w-24 h-24 rounded-full bg-white blur-2xl opacity-[0.22]" />
            {/* eslint-disable-next-line @next/next/no-img-element -- la vista
                previa usa una URL temporal (blob:) que next/image no optimiza. */}
            <img
              src={previa ?? tile.image}
              alt=""
              className="relative w-[85%] h-[85%] object-contain"
              style={{ filter: "drop-shadow(0 8px 32px rgba(180,210,255,0.22))" }}
            />
          </div>
          <p className="text-[11px] text-muted-foreground mt-2 text-center">
            {previa ? "Vista previa del archivo nuevo" : "Imagen actual"}
          </p>
        </div>

        {/* ── Campos ───────────────────────────────────────────────────────── */}
        <div className="flex-1 min-w-[15rem] space-y-3">
          <div>
            <label
              htmlFor={`imagen-${tile.slot}`}
              className="block text-xs font-bold text-foreground mb-1.5"
            >
              Cambiar imagen
            </label>
            <input
              id={`imagen-${tile.slot}`}
              name="imagen"
              type="file"
              accept="image/png,image/webp,image/avif"
              onChange={(e) => {
                const archivo = e.target.files?.[0];
                setPrevia(archivo ? URL.createObjectURL(archivo) : null);
              }}
              className="w-full text-sm text-foreground file:mr-3 file:px-3 file:py-2 file:rounded-xl file:border-0 file:text-sm file:font-bold file:text-white file:cursor-pointer"
            />
          </div>

          <div>
            <label
              htmlFor={`alt-${tile.slot}`}
              className="block text-xs font-bold text-foreground mb-1.5"
            >
              Qué se ve en la imagen
            </label>
            <input
              id={`alt-${tile.slot}`}
              name="alt"
              required
              maxLength={60}
              defaultValue={tile.alt}
              aria-describedby={`ayuda-alt-${tile.slot}`}
              className="w-full px-3 py-2 rounded-xl border border-border bg-white text-foreground text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            />
            <p id={`ayuda-alt-${tile.slot}`} className="text-[11px] text-muted-foreground mt-1">
              Lo leen los lectores de pantalla y nombra el enlace. Ej.: «Smartwatch».
            </p>
          </div>

          <div>
            <label
              htmlFor={`href-${tile.slot}`}
              className="block text-xs font-bold text-foreground mb-1.5"
            >
              A dónde lleva el clic
            </label>
            <input
              id={`href-${tile.slot}`}
              name="href"
              required
              list={listaRutas}
              maxLength={200}
              defaultValue={tile.href}
              aria-describedby={`ayuda-href-${tile.slot}`}
              className="w-full px-3 py-2 rounded-xl border border-border bg-white text-foreground text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            />
            <p id={`ayuda-href-${tile.slot}`} className="text-[11px] text-muted-foreground mt-1">
              Ruta del sitio, empezando con «/». El campo sugiere las que existen.
            </p>
          </div>

          <button
            type="submit"
            disabled={enviando}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{ background: PRIMARY }}
          >
            <Upload size={14} aria-hidden="true" /> {enviando ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </div>
    </form>
  );
}
