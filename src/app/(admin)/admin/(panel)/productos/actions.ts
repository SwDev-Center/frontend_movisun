"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { exigirSesion } from "@/lib/auth";
import {
  actualizarProducto,
  crearProducto,
  eliminarProducto,
} from "@/lib/repo-admin";
import { resolverImagen } from "@/lib/imagenes";
import {
  comasALista,
  esquemaProducto,
  lineasALista,
  primerError,
} from "@/lib/validation";

export interface EstadoFormulario {
  error?: string;
}

export async function guardarProducto(
  _estadoPrevio: EstadoFormulario,
  formData: FormData
): Promise<EstadoFormulario> {
  // El guardia del layout protege las pantallas, no las acciones: una acción se
  // puede invocar sin pasar por ellas, así que se comprueba de nuevo acá.
  await exigirSesion();

  const idCrudo = formData.get("id");
  const id = idCrudo ? Number(idCrudo) : null;

  // ── Imagen ────────────────────────────────────────────────────────────────
  // Al editar, si no se sube nada se conserva la que ya tenía.
  const imagen = await resolverImagen(
    formData.get("imagen"),
    String(formData.get("imagenActual") ?? "")
  );
  if ("error" in imagen) return { error: imagen.error };
  const image = imagen.ruta;

  // ── Validación ────────────────────────────────────────────────────────────
  const resultado = esquemaProducto.safeParse({
    name: formData.get("name"),
    price: formData.get("price"),
    originalPrice: formData.get("originalPrice"),
    subcategoryId: formData.get("subcategoryId"),
    description: formData.get("description"),
    features: lineasALista(formData.get("features")),
    image,
    badge: formData.get("badge"),
    rating: formData.get("rating"),
    reviews: formData.get("reviews"),
    colors: comasALista(formData.get("colors")),
    isNew: formData.get("isNew") === "on",
  });

  if (!resultado.success) {
    return { error: primerError(resultado.error) };
  }

  try {
    if (id) {
      await actualizarProducto(id, resultado.data);
    } else {
      await crearProducto(resultado.data);
    }
  } catch (err) {
    return { error: err instanceof Error ? err.message : "No se pudo guardar el producto." };
  }

  // Invalida la caché del catálogo público para que el cambio se vea ya, sin
  // esperar los 120 s de revalidate. updateTag() es el que sirve desde una
  // Server Action: expira al instante en lugar de seguir sirviendo lo viejo.
  updateTag("products");
  redirect(id ? "/admin/productos?estado=editado" : "/admin/productos?estado=creado");
}

export async function borrarProducto(formData: FormData): Promise<void> {
  await exigirSesion();

  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id <= 0) {
    redirect("/admin/productos?estado=error");
  }

  // Si el producto tenía una oferta relámpago, se borra con él (on delete cascade).
  await eliminarProducto(id);

  updateTag("products");
  redirect("/admin/productos?estado=borrado");
}
