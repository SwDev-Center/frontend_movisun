import { NextResponse } from "next/server";
import { products } from "@/lib/data/products.mock";

// Mock API. Simulates network latency so loading.tsx / skeletons actually render.
// Delete this folder once the real API is available and set API_BASE_URL.
export const dynamic = "force-dynamic";

export async function GET() {
  await new Promise((r) => setTimeout(r, 200));
  return NextResponse.json(products);
}