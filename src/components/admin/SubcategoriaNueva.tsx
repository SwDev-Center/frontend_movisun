"use client";

import { useActionState } from "react";
import { AlertCircle, Plus } from "lucide-react";
import { PRIMARY } from "@/lib/constants";
import { ICONOS, NOMBRES_ICONOS } from "@/lib/validation";
import {
  agregarSubcategoria,
  type EstadoFormulario,
} from "@/app/(admin)/admin/(panel)/categorias/actions";

// Alta de subcategoría dentro de una categoría. Va en su propio formulario
// porque el HTML no admite formularios anidados.
export function SubcategoriaNueva({ categoryId }: { categoryId: string }) {
  const [estado, accion, enviando] = useActionState<EstadoFormulario, FormData>(
    agregarSubcategoria,
    {}
  );

  return (
    <div>
      {estado.error && (
        <div
          role="alert"
          className="flex items-start gap-2 mb-3 p-3 rounded-xl bg-red-50 border border-red-200"
        >
          <AlertCircle size={15} className="text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-sm text-red-700 font-medium">{estado.error}</p>
        </div>
      )}

      <form action={accion} className="flex flex-wrap items-end gap-2">
        <input type="hidden" name="categoryId" value={categoryId} />

        <div className="flex-1 min-w-[10rem]">
          <label htmlFor="nueva-sub" className="block text-xs font-bold text-foreground mb-1.5">
            Nueva subcategoría
          </label>
          <input
            id="nueva-sub"
            name="label"
            required
            maxLength={40}
            placeholder="Manos libres"
            className="w-full px-3 py-2 rounded-xl border border-border bg-white text-foreground text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          />
        </div>

        <div>
          <label htmlFor="nueva-sub-icono" className="block text-xs font-bold text-foreground mb-1.5">
            Icono
          </label>
          <select
            id="nueva-sub-icono"
            name="icon"
            defaultValue="headphones"
            className="px-3 py-2 rounded-xl border border-border bg-white text-foreground text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {ICONOS.map((i) => (
              <option key={i} value={i}>
                {NOMBRES_ICONOS[i]}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={enviando}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          style={{ background: PRIMARY }}
        >
          <Plus size={14} aria-hidden="true" /> {enviando ? "Agregando…" : "Agregar"}
        </button>
      </form>
    </div>
  );
}
