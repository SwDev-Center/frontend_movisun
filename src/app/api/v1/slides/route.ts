import { NextResponse } from "next/server";
import { findHomeSlides } from "@/lib/repo";

// Diapositivas del carrusel de la portada.
export const dynamic = "force-dynamic";

export async function GET() {
  const slides = await findHomeSlides();
  return NextResponse.json(slides);
}
