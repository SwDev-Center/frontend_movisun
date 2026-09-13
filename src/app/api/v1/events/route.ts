import { NextResponse } from "next/server";
import { events } from "@/lib/data/events.mock";

export const dynamic = "force-dynamic";

export async function GET() {
  await new Promise((r) => setTimeout(r, 150));
  return NextResponse.json(events);
}