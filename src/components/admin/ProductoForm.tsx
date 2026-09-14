"use client";

import { useActionState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { PRIMARY, COLOR_HEX } from "@/lib/constants";
import {
  guardarProducto,
  type EstadoFormulario,
} from "@/app/(admin)/admin/(panel)/productos/actions";
import type { OpcionSubcategoria, ProductoEdicion } from "@/lib/repo-admin";

// Formulario de alta y edición. Es el mismo en los dos casos: si llega
// `producto`, se rellena y se manda su id; si no, crea uno nuevo.
//
// Usa useActionState para que un error de validación no borre lo que la
// persona ya había escrito.

const campo =
  "w-full px-3 py-2 rounded-xl border border-border bg-white text-foreground text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";
const etiqueta = "block text-sm font-bold text-foreground mb-1.5";
const ayuda = "text-xs text-muted-foreground mt-1";

export function ProductoForm({
  opciones,
  producto,
}: {
  opciones: OpcionSubcategoria[];
  producto?: ProductoEdicion | null;
}) {
  const [estado, accion, enviando] = useActionState<EstadoFormulario, FormData>(
    guardarProducto,
    {}
  );

  const editando = Boolean(producto);

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

      {producto && <input type="hidden" name="id" value={producto.id} />}
      <input type="hidden" name="imagenActual" value={producto?.image ?? ""} />

      {/* ── Identidad ─────────────────────────────────────────────────────── */}
      <fieldset className="bg-white rounded-2xl border border-border p-5 space-y-4">
        <legend className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-2">
          Producto
        </legend>

        <div>
          <label htmlFor="name" className={etiqueta}>
            Nombre
          </label>
          <input
            id="name"
            name="name"
            required
            maxLength={120}
            defaultValue={producto?.name ?? ""}
            className={campo}
          />
        </div>

        <div>
          <label htmlFor="subcategoryId" className={etiqueta}>
            Categoría y subcategoría
          </label>
          <select
            id="subcategoryId"
            name="subcategoryId"
            required
            defaultValue={producto?.subcategory_id ?? ""}
            className={campo}
          >
            <option value="" disabled>
              Elegí una…
            </option>
            {opciones.map((o) => (
              <option key={o.id} value={o.id}>
                {o.categoria} → {o.label}
              </option>
            ))}
          </select>
          <p className={ayuda}>La categoría se deduce de la subcategoría que elijas.</p>
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
            maxLength={1000}
            defaultValue={producto?.description ?? ""}
            className={campo}
          />
        </div>

        <div>
          <label htmlFor="features" className={etiqueta}>
            Características
          </label>
          <textarea
            id="features"
            name="features"
            required
            rows={5}
            aria-describedby="ayuda-features"
            defaultValue={producto?.features.join("\n") ?? ""}
            className={campo}
          />
          <p id="ayuda-features" className={ayuda}>
            Una por línea. Cortas, como aparecen en la ficha: «IP68», «7 días batería».
          </p>
        </div>
      </fieldset>

      {/* ── Precio ────────────────────────────────────────────────────────── */}
      <fieldset className="bg-white rounded-2xl border border-border p-5 space-y-4">
        <legend className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-2">
          Precio
        </legend>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="price" className={etiqueta}>
              Precio (COP)
            </label>
            <input
              id="price"
              name="price"
              type="number"
              required
              min={0}
              step={1}
              aria-describedby="ayuda-precio"
              defaultValue={producto?.price ?? ""}
              className={campo}
            />
            <p id="ayuda-precio" className={ayuda}>
              Sin puntos ni decimales: 89900.
            </p>
          </div>

          <div>
            <label htmlFor="originalPrice" className={etiqueta}>
              Precio anterior <span className="font-normal text-muted-foreground">(opcional)</span>
            </label>
            <input
              id="originalPrice"
              name="originalPrice"
              type="number"
              min={0}
              step={1}
              aria-describedby="ayuda-precio-anterior"
              defaultValue={producto?.original_price ?? ""}
              className={campo}
            />
            <p id="ayuda-precio-anterior" className={ayuda}>
              Si lo completás, el producto aparece en Promociones con su descuento.
            </p>
          </div>
        </div>
      </fieldset>

      {/* ── Imagen ────────────────────────────────────────────────────────── */}
      <fieldset className="bg-white rounded-2xl border border-border p-5 space-y-4">
        <legend className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-2">
          Imagen
        </legend>

        {producto?.image && (
          <div className="flex items-center gap-3">
            <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-muted shrink-0">
              <Image
                src={producto.image}
                alt={`Imagen actual de ${producto.name}`}
                fill
                sizes="80px"
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
            {editando ? "Reemplazar imagen" : "Imagen del producto"}
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
            JPG, PNG, WebP o AVIF. Hasta 5 MB. Se guarda en la base de datos.
          </p>
        </div>
      </fieldset>

      {/* ── Presentación ──────────────────────────────────────────────────── */}
      <fieldset className="bg-white rounded-2xl border border-border p-5 space-y-4">
        <legend className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-2">
          Presentación
        </legend>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="badge" className={etiqueta}>
              Etiqueta
            </label>
            <select
              id="badge"
              name="badge"
              defaultValue={producto?.badge ?? ""}
              className={campo}
            >
              <option value="">Sin etiqueta</option>
              <option value="Nuevo">Nuevo</option>
              <option value="Más vendido">Más vendido</option>
              <option value="Oferta">Oferta</option>
            </select>
          </div>

          <div>
            <label htmlFor="rating" className={etiqueta}>
              Valoración
            </label>
            <input
              id="rating"
              name="rating"
              type="number"
              required
              min={0}
              max={5}
              step={0.1}
              defaultValue={producto ? Number(producto.rating) : 4.5}
              className={campo}
            />
          </div>

          <div>
            <label htmlFor="reviews" className={etiqueta}>
              Cantidad de reseñas
            </label>
            <input
              id="reviews"
              name="reviews"
              type="number"
              required
              min={0}
              step={1}
              defaultValue={producto?.reviews ?? 0}
              className={campo}
            />
          </div>
        </div>

        <div>
          <label htmlFor="colors" className={etiqueta}>
            Colores <span className="font-normal text-muted-foreground">(opcional)</span>
          </label>
          <input
            id="colors"
            name="colors"
            aria-describedby="ayuda-colores"
            defaultValue={producto?.colors?.join(", ") ?? ""}
            className={campo}
          />
          <p id="ayuda-colores" className={ayuda}>
            Separados por coma. Con muestra de color: {Object.keys(COLOR_HEX).join(", ")}.
            Cualquier otro nombre también funciona, pero sin muestra.
          </p>
        </div>

        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            id="isNew"
            name="isNew"
            type="checkbox"
            defaultChecked={producto?.is_new ?? false}
            className="w-4 h-4 rounded border-border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          />
          <span className="text-sm text-foreground">
            Destacar como novedad
            <span className="text-muted-foreground"> — aparece en el carrusel de la portada</span>
          </span>
        </label>
      </fieldset>

      {/* ── Envío ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={enviando}
          className="px-6 py-3 rounded-xl font-bold text-sm text-white transition-opacity hover:opacity-90 disabled:opacity-60 disabled:cursor-progress"
          style={{ background: PRIMARY }}
        >
          {enviando ? "Guardando…" : editando ? "Guardar cambios" : "Crear producto"}
        </button>
        <Link
          href="/admin/productos"
          className="px-4 py-3 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
