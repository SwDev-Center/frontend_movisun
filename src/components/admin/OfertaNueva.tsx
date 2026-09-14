"use client";

import { useActionState } from "react";
import { AlertCircle, Plus } from "lucide-react";
import { PRIMARY } from "@/lib/constants";
import { fmt } from "@/lib/utils";
import {
  agregarOferta,
  type EstadoFormulario,
} from "@/app/(admin)/admin/(panel)/eventos/actions";
import type { OpcionProducto } from "@/lib/repo-admin";

// Alta de oferta relámpago. El desplegable solo lista productos que todavía no
// tienen una: cada producto admite una sola.
export function OfertaNueva({
  productos,
  minimo,
}: {
  productos: OpcionProducto[];
  /** Fecha mínima para el input, en hora de Colombia. */
  minimo: string;
}) {
  const [estado, accion, enviando] = useActionState<EstadoFormulario, FormData>(
    agregarOferta,
    {}
  );

  const campo =
    "w-full px-3 py-2 rounded-xl border border-border bg-white text-foreground text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";
  const etiqueta = "block text-xs font-bold text-foreground mb-1.5";

  if (productos.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Todos los productos ya tienen una oferta relámpago. Eliminá alguna para crear otra.
      </p>
    );
  }

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

      <form action={accion} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
        <div className="lg:col-span-2">
          <label htmlFor="oferta-producto" className={etiqueta}>
            Producto
          </label>
          <select id="oferta-producto" name="productId" required defaultValue="" className={campo}>
            <option value="" disabled>
              Elegí uno…
            </option>
            {productos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — {fmt(p.price)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="oferta-descuento" className={etiqueta}>
            Descuento extra (%)
          </label>
          <input
            id="oferta-descuento"
            name="extraDiscount"
            type="number"
            required
            min={1}
            max={99}
            step={1}
            defaultValue={15}
            className={campo}
          />
        </div>

        <div>
          <label htmlFor="oferta-fin" className={etiqueta}>
            Termina
          </label>
          <input
            id="oferta-fin"
            name="endsAt"
            type="datetime-local"
            required
            min={minimo}
            className={campo}
          />
        </div>

        <div className="flex items-end gap-2">
          <div className="flex-1">
            <label htmlFor="oferta-stock" className={etiqueta}>
              Unidades
            </label>
            <input
              id="oferta-stock"
              name="stock"
              type="number"
              required
              min={0}
              step={1}
              defaultValue={10}
              className={campo}
            />
          </div>
          <button
            type="submit"
            disabled={enviando}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60 shrink-0"
            style={{ background: PRIMARY }}
          >
            <Plus size={14} aria-hidden="true" /> {enviando ? "…" : "Crear"}
          </button>
        </div>
      </form>
    </div>
  );
}
