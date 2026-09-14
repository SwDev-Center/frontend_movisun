"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { exigirSesion } from "@/lib/auth";
import {
  actualizarCategoria,
  actualizarSubcategoria,
  crearCategoria,
  crearSubcategoria,
  eliminarCategoria,
  eliminarSubcategoria,
  moverCategoria,
  moverSubcategoria,
} from "@/lib/repo-admin";
import { resolverImagen } from "@/lib/imagenes";
import {
  esquemaCategoria,
  esquemaSubcategoria,
  lineasALista,
  primerError,
} from "@/lib/validation";

export interface EstadoFormulario {
  error?: string;
}

// Las categorías alimentan el menú del sitio y el nombre de subcategoría que
// viaja dentro de cada producto, así que al guardar se invalidan las dos cachés.
function refrescarSitio(): void {
  updateTag("categories");
  updateTag("products");
}

/** Mensaje de error legible en la URL, para las acciones que no usan formulario. */
function volverConError(destino: string, err: unknown): never {
  const mensaje = err instanceof Error ? err.message : "No se pudo completar la operación.";
  redirect(`${destino}?error=${encodeURIComponent(mensaje)}`);
}

// ─── Categoría ──────────────────────────────────────────────────────────────

export async function guardarCategoria(
  _estadoPrevio: EstadoFormulario,
  formData: FormData
): Promise<EstadoFormulario> {
  await exigirSesion();

  const id = String(formData.get("id") ?? "").trim();

  const imagen = await resolverImagen(
    formData.get("imagen"),
    String(formData.get("imagenActual") ?? "")
  );
  if ("error" in imagen) return { error: imagen.error };

  const resultado = esquemaCategoria.safeParse({
    label: formData.get("label"),
    tagline: formData.get("tagline"),
    description: formData.get("description"),
    icon: formData.get("icon"),
    color: formData.get("color"),
    coverImg: imagen.ruta,
  });

  if (!resultado.success) return { error: primerError(resultado.error) };

  let destino: string;
  try {
    if (id) {
      await actualizarCategoria(id, resultado.data);
      destino = `/admin/categorias/${id}?estado=editada`;
    } else {
      // Las subcategorías iniciales son opcionales: una por línea.
      const nuevo = await crearCategoria(resultado.data, lineasALista(formData.get("subcategorias")));
      destino = `/admin/categorias/${nuevo}?estado=creada`;
    }
  } catch (err) {
    return { error: err instanceof Error ? err.message : "No se pudo guardar la categoría." };
  }

  refrescarSitio();
  redirect(destino);
}

export async function borrarCategoria(formData: FormData): Promise<void> {
  await exigirSesion();
  const id = String(formData.get("id") ?? "").trim();

  try {
    await eliminarCategoria(id);
  } catch (err) {
    volverConError("/admin/categorias", err);
  }

  refrescarSitio();
  redirect("/admin/categorias?estado=borrada");
}

export async function ordenarCategoria(formData: FormData): Promise<void> {
  await exigirSesion();
  const id = String(formData.get("id") ?? "").trim();
  const direccion = formData.get("direccion") === "arriba" ? "arriba" : "abajo";

  await moverCategoria(id, direccion);
  refrescarSitio();
  redirect("/admin/categorias");
}

// ─── Subcategorías ──────────────────────────────────────────────────────────

export async function agregarSubcategoria(
  _estadoPrevio: EstadoFormulario,
  formData: FormData
): Promise<EstadoFormulario> {
  await exigirSesion();

  const categoryId = String(formData.get("categoryId") ?? "").trim();
  const resultado = esquemaSubcategoria.safeParse({
    label: formData.get("label"),
    icon: formData.get("icon"),
  });

  if (!resultado.success) return { error: primerError(resultado.error) };

  try {
    await crearSubcategoria(categoryId, resultado.data);
  } catch (err) {
    // El índice único (category_id, label) es el que salta si se repite.
    const mensaje =
      err instanceof Error && err.message.includes("subcategories_label_unico")
        ? `Ya existe una subcategoría llamada «${resultado.data.label}» en esta categoría.`
        : "No se pudo agregar la subcategoría.";
    return { error: mensaje };
  }

  refrescarSitio();
  redirect(`/admin/categorias/${categoryId}?estado=sub-creada`);
}

export async function guardarSubcategoria(formData: FormData): Promise<void> {
  await exigirSesion();

  const categoryId = String(formData.get("categoryId") ?? "").trim();
  const id = Number(formData.get("id"));
  const resultado = esquemaSubcategoria.safeParse({
    label: formData.get("label"),
    icon: formData.get("icon"),
  });

  if (!resultado.success) {
    volverConError(`/admin/categorias/${categoryId}`, new Error(primerError(resultado.error)));
  }

  try {
    await actualizarSubcategoria(id, resultado.data);
  } catch {
    volverConError(
      `/admin/categorias/${categoryId}`,
      new Error("No se pudo guardar la subcategoría. ¿Ya existe otra con ese nombre?")
    );
  }

  refrescarSitio();
  redirect(`/admin/categorias/${categoryId}?estado=sub-editada`);
}

export async function borrarSubcategoria(formData: FormData): Promise<void> {
  await exigirSesion();

  const categoryId = String(formData.get("categoryId") ?? "").trim();
  const id = Number(formData.get("id"));

  try {
    await eliminarSubcategoria(id);
  } catch (err) {
    volverConError(`/admin/categorias/${categoryId}`, err);
  }

  refrescarSitio();
  redirect(`/admin/categorias/${categoryId}?estado=sub-borrada`);
}

export async function ordenarSubcategoria(formData: FormData): Promise<void> {
  await exigirSesion();

  const categoryId = String(formData.get("categoryId") ?? "").trim();
  const id = Number(formData.get("id"));
  const direccion = formData.get("direccion") === "arriba" ? "arriba" : "abajo";

  await moverSubcategoria(id, direccion);
  refrescarSitio();
  redirect(`/admin/categorias/${categoryId}`);
}
