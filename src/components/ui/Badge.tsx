import type { ProductBadge } from "@/lib/types";

const BADGE_STYLES: Record<ProductBadge, string> = {
  Nuevo: "bg-emerald-100 text-emerald-700",
  "Más vendido": "bg-amber-100 text-amber-700",
  // text-red-700 (#b91c1c) sobre red-100: ≈5.5:1, cumple AA; text-red-600 fallaba.
  Oferta: "bg-red-100 text-red-700",
};

export function Badge({ text }: { text: ProductBadge }) {
  const cls = BADGE_STYLES[text] ?? BADGE_STYLES.Oferta;
  return <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${cls}`}>{text}</span>;
}