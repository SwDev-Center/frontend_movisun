import { guardarImagen } from "@/lib/repo-admin";
import { MIMES_IMAGEN, TAMANO_MAX_IMAGEN } from "@/lib/validation";

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
