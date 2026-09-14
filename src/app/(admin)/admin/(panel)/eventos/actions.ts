"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { exigirSesion } from "@/lib/auth";
import {
  actualizarEvento,
  actualizarOferta,
  crearEvento,
  crearOferta,
  eliminarEvento,
  eliminarOferta,
  moverEvento,
} from "@/lib/repo-admin";
import { resolverImagen } from "@/lib/imagenes";
import {
  esquemaEvento,
  esquemaOferta,
  fechaDesdeFormulario,
  primerError,
} from "@/lib/validation";

export interface EstadoFormulario {
  error?: string;
}

// Una oferta relámpago cambia /api/v1/events Y el precio que muestra el
// catálogo, porque viaja dentro del propio producto (Product.flash).
function refrescarEventos(): void {
  updateTag("events");
  updateTag("products");
}

function volverConError(destino: string, err: unknown): never {
  const mensaje = err instanceof Error ? err.message : "No se pudo completar la operación.";
  redirect(`${destino}?error=${encodeURIComponent(mensaje)}`);
}

// ─── Eventos ────────────────────────────────────────────────────────────────

export async function guardarEvento(
  _estadoPrevio: EstadoFormulario,
  formData: FormData
): Promise<EstadoFormulario> {
  await exigirSesion();

  const idCrudo = formData.get("id");
  const id = idCrudo ? Number(idCrudo) : null;

  const imagen = await resolverImagen(
    formData.get("imagen"),
    String(formData.get("imagenActual") ?? "")
  );
  if ("error" in imagen) return { error: imagen.error };

  const resultado = esquemaEvento.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    startsAt: fechaDesdeFormulario(formData.get("startsAt")),
    durationMinutes: formData.get("durationMinutes"),
    url: formData.get("url"),
    image: imagen.ruta,
    viewers: formData.get("viewers"),
  });

  if (!resultado.success) return { error: primerError(resultado.error) };

  try {
    if (id) await actualizarEvento(id, resultado.data);
    else await crearEvento(resultado.data);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "No se pudo guardar el evento." };
  }

  refrescarEventos();
  redirect(id ? "/admin/eventos?estado=editado" : "/admin/eventos?estado=creado");
}

export async function borrarEvento(formData: FormData): Promise<void> {
  await exigirSesion();
  await eliminarEvento(Number(formData.get("id")));
  refrescarEventos();
  redirect("/admin/eventos?estado=borrado");
}

export async function ordenarEvento(formData: FormData): Promise<void> {
  await exigirSesion();
  const direccion = formData.get("direccion") === "arriba" ? "arriba" : "abajo";
  await moverEvento(Number(formData.get("id")), direccion);
  refrescarEventos();
  redirect("/admin/eventos");
}

// ─── Ofertas relámpago ──────────────────────────────────────────────────────

export async function agregarOferta(
  _estadoPrevio: EstadoFormulario,
  formData: FormData
): Promise<EstadoFormulario> {
  await exigirSesion();

  const resultado = esquemaOferta.safeParse({
    productId: formData.get("productId"),
    extraDiscount: formData.get("extraDiscount"),
    endsAt: fechaDesdeFormulario(formData.get("endsAt")),
    stock: formData.get("stock"),
  });

  if (!resultado.success) return { error: primerError(resultado.error) };

  try {
    await crearOferta(resultado.data);
  } catch {
    // product_id es clave primaria: un producto admite una sola oferta.
    return { error: "Ese producto ya tiene una oferta relámpago. Editá la que ya existe." };
  }

  refrescarEventos();
  redirect("/admin/eventos?estado=oferta-creada");
}

export async function guardarOferta(formData: FormData): Promise<void> {
  await exigirSesion();

  const productId = Number(formData.get("productId"));
  const resultado = esquemaOferta.safeParse({
    productId,
    extraDiscount: formData.get("extraDiscount"),
    endsAt: fechaDesdeFormulario(formData.get("endsAt")),
    stock: formData.get("stock"),
  });

  if (!resultado.success) {
    volverConError("/admin/eventos", new Error(primerError(resultado.error)));
  }

  try {
    await actualizarOferta(productId, resultado.data);
  } catch (err) {
    volverConError("/admin/eventos", err);
  }

  refrescarEventos();
  redirect("/admin/eventos?estado=oferta-editada");
}

export async function borrarOferta(formData: FormData): Promise<void> {
  await exigirSesion();
  await eliminarOferta(Number(formData.get("productId")));
  refrescarEventos();
  redirect("/admin/eventos?estado=oferta-borrada");
}
