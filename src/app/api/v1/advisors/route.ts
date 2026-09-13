import { NextResponse } from "next/server";
import { advisors } from "@/lib/data/advisors.mock";

export const dynamic = "force-dynamic";

export async function GET() {
  await new Promise((r) => setTimeout(r, 100));
  return NextResponse.json(advisors);
}