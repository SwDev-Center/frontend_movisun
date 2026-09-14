"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { exigirSesion } from "@/lib/auth";
import {
  actualizarHeroTile,
  actualizarSlide,
  crearSlide,
  eliminarSlide,
  moverSlide,
} from "@/lib/repo-admin";
import { resolverImagenHero, resolverImagenSlide } from "@/lib/imagenes";
import { esquemaHeroTile, esquemaSlide, primerError } from "@/lib/validation";

export interface EstadoFormulario {
  error?: string;
  /** Identifica de qué formulario de la página vino el error: la página tiene
   *  varios a la vez y cada uno debe mostrar solo el suyo. */
  slot?: number;
  slideId?: number | "nueva";
}

export async function guardarHeroTile(
  _estadoPrevio: EstadoFormulario,
  formData: FormData
): Promise<EstadoFormulario> {
  await exigirSesion();

  const slot = Number(formData.get("slot"));

  // Reglas propias del hero: sin JPG y sin PNG opaco.
  const imagen = await resolverImagenHero(
    formData.get("imagen"),
    String(formData.get("imagenActual") ?? "")
  );
  if ("error" in imagen) return { error: imagen.error, slot };

  const resultado = esquemaHeroTile.safeParse({
    slot,
    alt: formData.get("alt"),
    href: formData.get("href"),
    image: imagen.ruta,
  });

  if (!resultado.success) return { error: primerError(resultado.error), slot };

  try {
    await actualizarHeroTile(resultado.data);
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "No se pudo guardar la imagen.",
      slot,
    };
  }

  updateTag("hero");
  redirect(`/admin/inicio?estado=guardado&slot=${slot}`);
}


// ─── Diapositivas del carrusel ──────────────────────────────────────────────

export async function guardarSlide(
  _estadoPrevio: EstadoFormulario,
  formData: FormData
): Promise<EstadoFormulario> {
  await exigirSesion();

  const idCrudo = formData.get("id");
  const id = idCrudo ? Number(idCrudo) : null;
  const marca: EstadoFormulario["slideId"] = id ?? "nueva";

  // Reglas propias del carrusel: fotos apaisadas y anchas.
  const imagen = await resolverImagenSlide(
    formData.get("imagen"),
    String(formData.get("imagenActual") ?? "")
  );
  if ("error" in imagen) return { error: imagen.error, slideId: marca };

  const resultado = esquemaSlide.safeParse({
    headline: formData.get("headline"),
    sub: formData.get("sub"),
    ctaLabel: formData.get("ctaLabel"),
    href: formData.get("href"),
    image: imagen.ruta,
  });

  if (!resultado.success) return { error: primerError(resultado.error), slideId: marca };

  try {
    if (id) await actualizarSlide(id, resultado.data);
    else await crearSlide(resultado.data);
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "No se pudo guardar la diapositiva.",
      slideId: marca,
    };
  }

  updateTag("slides");
  redirect(`/admin/inicio?estado=${id ? "slide-guardada" : "slide-creada"}`);
}

export async function borrarSlide(formData: FormData): Promise<void> {
  await exigirSesion();
  await eliminarSlide(Number(formData.get("id")));
  updateTag("slides");
  redirect("/admin/inicio?estado=slide-borrada");
}

export async function ordenarSlide(formData: FormData): Promise<void> {
  await exigirSesion();
  const direccion = formData.get("direccion") === "arriba" ? "arriba" : "abajo";
  await moverSlide(Number(formData.get("id")), direccion);
  updateTag("slides");
  redirect("/admin/inicio");
}
