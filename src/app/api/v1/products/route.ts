import { NextResponse } from "next/server";
import { findProducts } from "@/lib/repo";

// Catálogo completo. La forma de la respuesta es la que declara Product en
// src/lib/types.ts; el filtrado por categoría, novedad y oferta sigue ocurriendo
// en src/api/products.ts, así que ninguna página cambió.
export const dynamic = "force-dynamic";

export async function GET() {
  const products = await findProducts();
  return NextResponse.json(products);
}
