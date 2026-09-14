"use client";

import { Trash2 } from "lucide-react";

// Botón de eliminar con confirmación. Sirve para cualquier acción destructiva
// del panel: recibe la acción y los campos ocultos que necesita.
//
// Si el navegador no ejecuta JavaScript el formulario se envía igual: la
// confirmación es una red de seguridad, no el único control. Las reglas de
// negocio (no borrar algo que tenga productos) viven en el servidor.
export function BotonConfirmar({
  accion,
  campos,
  mensaje,
  etiqueta,
}: {
  accion: (formData: FormData) => Promise<void>;
  campos: Record<string, string | number>;
  mensaje: string;
  etiqueta: string;
}) {
  return (
    <form
      action={accion}
      onSubmit={(e) => {
        if (!window.confirm(mensaje)) e.preventDefault();
      }}
    >
      {Object.entries(campos).map(([nombre, valor]) => (
        <input key={nombre} type="hidden" name={nombre} value={valor} />
      ))}
      <button
        type="submit"
        aria-label={etiqueta}
        className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
      >
        <Trash2 size={15} aria-hidden="true" />
      </button>
    </form>
  );
}
