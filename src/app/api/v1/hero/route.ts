import { NextResponse } from "next/server";
import { findHeroTiles } from "@/lib/repo";

// Las cuatro piezas que flotan en la portada.
export const dynamic = "force-dynamic";

export async function GET() {
  const tiles = await findHeroTiles();
  return NextResponse.json(tiles);
}
