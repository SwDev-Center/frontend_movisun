import { guardarImagen } from "@/lib/repo-admin";
import {
  ANCHO_MIN_SLIDE,
  MIMES_HERO,
  MIMES_IMAGEN,
  TAMANO_MAX_IMAGEN,
  dimensionesDeImagen,
  pngSinTransparencia,
} from "@/lib/validation";

// Subida de imágenes desde los formularios del panel. Lo usan tanto los
// productos como las portadas de categoría, para que las reglas de formato y
// tamaño sean las mismas en los dos lados.

export type ResultadoImagen = { ruta: string } | { error: string };

/**
 * Devuelve la ruta de la imagen a guardar: la recién subida, o `actual` si el
 * formulario no traía archivo nuevo (así editar sin tocar la imagen la conserva).
 */
export async function resolverImagen(
  archivo: FormDataEntryValue | null,
  actual: string
): Promise<ResultadoImagen> {
  if (!(archivo instanceof File) || archivo.size === 0) {
    return { ruta: actual.trim() };
  }

  if (!(MIMES_IMAGEN as readonly string[]).includes(archivo.type)) {
    return { error: "Formato no admitido. Usá JPG, PNG, WebP o AVIF." };
  }

  if (archivo.size > TAMANO_MAX_IMAGEN) {
    const mb = (archivo.size / 1024 / 1024).toFixed(1);
    return { error: `La imagen pesa ${mb} MB y el máximo son 5 MB.` };
  }

  const ruta = await guardarImagen(Buffer.from(await archivo.arrayBuffer()), archivo.type);
  return { ruta };
}

/**
 * Igual que `resolverImagen`, pero con las reglas del hero: las piezas flotan
 * recortadas sobre el degradado azul, así que la imagen tiene que tener fondo
 * transparente. Un JPG o un PNG opaco se verían como un rectángulo pegado.
 */
export async function resolverImagenHero(
  archivo: FormDataEntryValue | null,
  actual: string
): Promise<ResultadoImagen> {
  if (!(archivo instanceof File) || archivo.size === 0) {
    return { ruta: actual.trim() };
  }

  if (!(MIMES_HERO as readonly string[]).includes(archivo.type)) {
    const esJpg = archivo.type === "image/jpeg";
    return {
      error: esJpg
        ? "El JPG no sirve para la portada porque no admite fondo transparente: la imagen se vería como un rectángulo sobre el fondo azul. Usá PNG, WebP o AVIF recortados."
        : "Formato no admitido en la portada. Usá PNG, WebP o AVIF con fondo transparente.",
    };
  }

  if (archivo.size > TAMANO_MAX_IMAGEN) {
    const mb = (archivo.size / 1024 / 1024).toFixed(1);
    return { error: `La imagen pesa ${mb} MB y el máximo son 5 MB.` };
  }

  const bytes = Buffer.from(await archivo.arrayBuffer());

  if (pngSinTransparencia(bytes)) {
    return {
      error:
        "Ese PNG no tiene fondo transparente: se vería como un rectángulo sobre el fondo azul. Recortá el producto y guardalo con transparencia.",
    };
  }

  return { ruta: await guardarImagen(bytes, archivo.type) };
}

/**
 * Reglas del carrusel: son fotos que ocupan todo el ancho de la pantalla y se
 * recortan a una franja apaisada. Acá el JPG sí sirve —es lo habitual para una
 * foto— y lo que importa es que sea ancha y no esté parada.
 */
export async function resolverImagenSlide(
  archivo: FormDataEntryValue | null,
  actual: string
): Promise<ResultadoImagen> {
  if (!(archivo instanceof File) || archivo.size === 0) {
    return { ruta: actual.trim() };
  }

  if (!(MIMES_IMAGEN as readonly string[]).includes(archivo.type)) {
    return { error: "Formato no admitido. Usá JPG, PNG, WebP o AVIF." };
  }

  if (archivo.size > TAMANO_MAX_IMAGEN) {
    const mb = (archivo.size / 1024 / 1024).toFixed(1);
    return { error: `La imagen pesa ${mb} MB y el máximo son 5 MB.` };
  }

  const bytes = Buffer.from(await archivo.arrayBuffer());
  const medidas = dimensionesDeImagen(bytes);

  if (medidas) {
    if (medidas.alto > medidas.ancho) {
      return {
        error: `Esa imagen está parada (${medidas.ancho} × ${medidas.alto} px). El carrusel la recortaría a una franja ancha y se perdería casi todo. Usá una foto apaisada.`,
      };
    }
    if (medidas.ancho < ANCHO_MIN_SLIDE) {
      return {
        error: `La imagen mide ${medidas.ancho} px de ancho y se vería borrosa: el carrusel ocupa todo el ancho de la pantalla. Usá una de al menos ${ANCHO_MIN_SLIDE} px.`,
      };
    }
  }

  return { ruta: await guardarImagen(bytes, archivo.type) };
}
