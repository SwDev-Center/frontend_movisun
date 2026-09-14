"use client";

import { useActionState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { PRIMARY } from "@/lib/constants";
import { ICONOS, NOMBRES_ICONOS } from "@/lib/validation";
import {
  guardarCategoria,
  type EstadoFormulario,
} from "@/app/(admin)/admin/(panel)/categorias/actions";
import type { FilaCategoria } from "@/lib/repo-admin";

// Alta y edición de categorías. La URL (el id) solo se genera al crear: al
// editar no se toca, para no romper enlaces ya publicados.

const campo =
  "w-full px-3 py-2 rounded-xl border border-border bg-white text-foreground text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";
const etiqueta = "block text-sm font-bold text-foreground mb-1.5";
const ayuda = "text-xs text-muted-foreground mt-1";

export function CategoriaForm({ categoria }: { categoria?: FilaCategoria | null }) {
  const [estado, accion, enviando] = useActionState<EstadoFormulario, FormData>(
    guardarCategoria,
    {}
  );

  const editando = Boolean(categoria);

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

      {categoria && <input type="hidden" name="id" value={categoria.id} />}
      <input type="hidden" name="imagenActual" value={categoria?.cover_img ?? ""} />

      <fieldset className="bg-white rounded-2xl border border-border p-5 space-y-4">
        <legend className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-2">
          Categoría
        </legend>

        <div>
          <label htmlFor="label" className={etiqueta}>
            Nombre
          </label>
          <input
            id="label"
            name="label"
            required
            maxLength={60}
            aria-describedby="ayuda-label"
            defaultValue={categoria?.label ?? ""}
            className={campo}
          />
          <p id="ayuda-label" className={ayuda}>
            {editando
              ? `Es el nombre que se ve en el menú y en el catálogo. La dirección /catalogo/${categoria?.id} no cambia aunque lo renombres.`
              : "Es el nombre que se ve en el menú y en el catálogo. La dirección de la página se genera a partir de él."}
          </p>
        </div>

        <div>
          <label htmlFor="tagline" className={etiqueta}>
            Lema
          </label>
          <input
            id="tagline"
            name="tagline"
            required
            maxLength={80}
            aria-describedby="ayuda-tagline"
            defaultValue={categoria?.tagline ?? ""}
            className={campo}
          />
          <p id="ayuda-tagline" className={ayuda}>
            Frase corta sobre la portada, como «Mide cada momento».
          </p>
        </div>

        <div>
          <label htmlFor="description" className={etiqueta}>
            Descripción
          </label>
          <textarea
            id="description"
            name="description"
            required
            rows={2}
            maxLength={300}
            aria-describedby="ayuda-description"
            defaultValue={categoria?.description ?? ""}
            className={campo}
          />
          <p id="ayuda-description" className={ayuda}>
            También es lo que muestran Google y WhatsApp al compartir la página.
          </p>
        </div>
      </fieldset>

      <fieldset className="bg-white rounded-2xl border border-border p-5 space-y-4">
        <legend className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-2">
          Apariencia
        </legend>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="icon" className={etiqueta}>
              Icono
            </label>
            <select id="icon" name="icon" required defaultValue={categoria?.icon ?? "watch"} className={campo}>
              {ICONOS.map((i) => (
                <option key={i} value={i}>
                  {NOMBRES_ICONOS[i]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="color" className={etiqueta}>
              Color
            </label>
            <input
              id="color"
              name="color"
              type="color"
              required
              aria-describedby="ayuda-color"
              defaultValue={categoria?.color ?? PRIMARY}
              className="w-full h-[42px] px-2 py-1 rounded-xl border border-border bg-white cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            />
            <p id="ayuda-color" className={ayuda}>
              Tiñe la portada de la categoría.
            </p>
          </div>
        </div>

        {categoria?.cover_img && (
          <div className="flex items-center gap-3">
            <div className="relative w-24 h-14 rounded-xl overflow-hidden bg-muted shrink-0">
              <Image
                src={categoria.cover_img}
                alt={`Portada actual de ${categoria.label}`}
                fill
                sizes="96px"
                className="object-cover"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Portada actual. Si no subís otra, se conserva.
            </p>
          </div>
        )}

        <div>
          <label htmlFor="imagen" className={etiqueta}>
            {editando ? "Reemplazar portada" : "Portada"}
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
            Se ve como banner ancho arriba del catálogo. JPG, PNG, WebP o AVIF, hasta 5 MB.
          </p>
        </div>
      </fieldset>

      {!editando && (
        <fieldset className="bg-white rounded-2xl border border-border p-5">
          <legend className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-2">
            Subcategorías
          </legend>
          <label htmlFor="subcategorias" className={etiqueta}>
            Subcategorías iniciales{" "}
            <span className="font-normal text-muted-foreground">(opcional)</span>
          </label>
          <textarea
            id="subcategorias"
            name="subcategorias"
            rows={4}
            aria-describedby="ayuda-subcategorias"
            className={campo}
          />
          <p id="ayuda-subcategorias" className={ayuda}>
            Una por línea. Podés agregar más, renombrarlas y reordenarlas después.
            «Todos» no hace falta: el catálogo lo muestra siempre.
          </p>
        </fieldset>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={enviando}
          className="px-6 py-3 rounded-xl font-bold text-sm text-white transition-opacity hover:opacity-90 disabled:opacity-60 disabled:cursor-progress"
          style={{ background: PRIMARY }}
        >
          {enviando ? "Guardando…" : editando ? "Guardar cambios" : "Crear categoría"}
        </button>
        <Link
          href="/admin/categorias"
          className="px-4 py-3 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
