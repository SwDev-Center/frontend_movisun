"use client";

import { Trash2 } from "lucide-react";
import { borrarProducto } from "@/app/(admin)/admin/(panel)/productos/actions";

// Borrar no se puede deshacer, así que se pide confirmación antes de enviar.
// Si el navegador no ejecuta JavaScript, el formulario se envía igual: es una
// capa de protección, no el único control.
export function BotonBorrar({ id, nombre }: { id: number; nombre: string }) {
  return (
    <form
      action={borrarProducto}
      onSubmit={(e) => {
        if (!window.confirm(`¿Eliminar «${nombre}»? Esta acción no se puede deshacer.`)) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        aria-label={`Eliminar ${nombre}`}
        className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
      >
        <Trash2 size={15} aria-hidden="true" />
      </button>
    </form>
  );
}
