import type { Advisor } from "@/lib/types";

// Los asesores de WhatsApp salen de variables de entorno, no de la base:
// cambian muy de vez en cuando y son la vía por la que entra CADA pedido, así
// que conviene que estén donde no los pueda tocar nadie desde el panel.
//
// Solo se leen en el servidor (el route handler de /api/v1/advisors), por eso
// no llevan el prefijo NEXT_PUBLIC_.

const INDICATIVO_COLOMBIA = "57";

/** Número de ejemplo que se usa si la variable falta o está mal escrita, para
 *  que el sitio no se caiga por un `.env` incompleto. */
const SIN_CONFIGURAR = "3000000000";

/**
 * Deja el número en 10 dígitos nacionales, aceptando lo que se haya escrito:
 * «+57 320 123 4567», «573201234567» o «3201234567» dan todos el mismo
 * resultado. Devuelve null si no parece un celular colombiano.
 */
function normalizar(valor: string | undefined): string | null {
  const digitos = (valor ?? "").replace(/\D/g, "");
  const nacional = digitos.length === 12 && digitos.startsWith(INDICATIVO_COLOMBIA)
    ? digitos.slice(2)
    : digitos;

  // Los celulares colombianos son 10 dígitos y empiezan con 3.
  return /^3\d{9}$/.test(nacional) ? nacional : null;
}

function construir(name: string, label: string, variable: string): Advisor {
  const numero = normalizar(process.env[variable]);

  if (!numero && process.env.NODE_ENV !== "production") {
    console.warn(
      `[advisors] ${variable} no está configurada o no es un celular colombiano válido ` +
        `(10 dígitos empezando por 3). Se usa un número de ejemplo.`
    );
  }

  const phone = numero ?? SIN_CONFIGURAR;
  return { name, label, phone, wa: `${INDICATIVO_COLOMBIA}${phone}` };
}

/**
 * Hoy hay UN solo asesor: el de ventas, que recibe los pedidos del carrito, el
 * botón flotante de WhatsApp y el enlace general del sitio.
 *
 * Sigue siendo un arreglo porque el contrato de `/api/v1/advisors` devuelve
 * `Advisor[]` y todas las vistas (portada, pie, menú móvil, contacto) lo
 * recorren con `.map`. Para sumar otro asesor alcanza con agregarlo acá: el
 * ORDEN IMPORTA, porque el primero es el que recibe los pedidos.
 */
export function getAdvisors(): Advisor[] {
  return [construir("Asesor de Ventas", "Ventas", "WHATSAPP_VENTAS")];
}
