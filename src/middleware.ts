import { NextResponse, type NextRequest } from "next/server";
import { MOSTRAR_EVENTOS } from "@/lib/features";

/**
 * Corta las rutas de secciones apagadas ANTES de que Next empiece a responder.
 *
 * Llamar a `notFound()` dentro de la página no alcanza: el layout de la tienda
 * es `force-dynamic`, así que la respuesta ya salió con estado 200 y lo único
 * que se logra es pintar el 404 sobre una respuesta «correcta». Google la
 * indexaría igual. Reescribir hacia una ruta que no existe devuelve un 404 de
 * verdad, con su código de estado.
 */
export function middleware(request: NextRequest) {
  if (!MOSTRAR_EVENTOS && request.nextUrl.pathname === "/eventos") {
    return NextResponse.rewrite(new URL("/404", request.url));
  }
  return NextResponse.next();
}

// Solo se evalúa en esta ruta: el resto del sitio ni pasa por acá.
export const config = {
  matcher: "/eventos",
};
