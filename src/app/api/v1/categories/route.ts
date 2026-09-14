import { NextResponse } from "next/server";
import { findCategories } from "@/lib/repo";

// Categorías con sus subcategorías. Son también los "módulos" del header que
// se administran desde el panel.
export const dynamic = "force-dynamic";

export async function GET() {
  const categories = await findCategories();
  return NextResponse.json(categories);
}
