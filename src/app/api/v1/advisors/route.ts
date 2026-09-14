import { NextResponse } from "next/server";
import { getAdvisors } from "@/lib/advisors";

// Asesores de WhatsApp. No se administran desde el panel: salen de las
// variables WHATSAPP_VENTAS y WHATSAPP_SOPORTE del .env.local.
//
// El orden importa: el primero es el número que recibe los pedidos del carrito
// (ver getSalesAdvisor en src/api/advisors.ts).
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(getAdvisors());
}
