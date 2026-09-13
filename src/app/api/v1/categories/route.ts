import { NextResponse } from "next/server";
import { categories } from "@/lib/data/categories.mock";

export const dynamic = "force-dynamic";

export async function GET() {
  await new Promise((r) => setTimeout(r, 150));
  return NextResponse.json(categories);
}