import { NextResponse } from "next/server";
import { findEvents } from "@/lib/repo";

// Eventos en vivo y ofertas relámpago. Único endpoint que devuelve un objeto
// con dos colecciones en lugar de un arreglo.
export const dynamic = "force-dynamic";

export async function GET() {
  const events = await findEvents();
  return NextResponse.json(events);
}
