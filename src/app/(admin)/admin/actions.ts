"use server";

import { redirect } from "next/navigation";
import { cerrarSesion, iniciarSesion } from "@/lib/auth";

/** Solo se acepta volver a una ruta del propio panel: evita redirecciones
 *  abiertas hacia sitios externos a través del parámetro ?next. */
function destinoSeguro(valor: FormDataEntryValue | null): string {
  const ruta = typeof valor === "string" ? valor : "";
  return ruta.startsWith("/admin") && !ruta.startsWith("//") ? ruta : "/admin";
}

export async function entrar(formData: FormData): Promise<void> {
  const password = String(formData.get("password") ?? "");
  const destino = destinoSeguro(formData.get("next"));

  if (!(await iniciarSesion(password))) {
    // El mensaje nunca dice si la contraseña estaba cerca ni cuántos intentos
    // quedan: solo que no es correcta.
    redirect(`/admin/login?error=1&next=${encodeURIComponent(destino)}`);
  }

  redirect(destino);
}

export async function salir(): Promise<void> {
  await cerrarSesion();
  redirect("/admin/login");
}
