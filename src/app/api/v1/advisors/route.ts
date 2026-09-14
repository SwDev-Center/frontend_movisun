import { NextResponse } from "next/server";
import { advisors } from "@/lib/data/advisors.mock";

// Los asesores todavía NO son administrables: quedaron fuera del alcance de
// esta primera versión del panel, así que siguen siendo datos fijos.
// El orden importa: advisors[0] es el asesor de ventas y es el número que
// recibe los pedidos del carrito (ver getSalesAdvisor en src/api/advisors.ts).
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(advisors);
}
