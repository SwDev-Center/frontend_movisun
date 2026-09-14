import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { CategoriaForm } from "@/components/admin/CategoriaForm";

export const metadata: Metadata = {
  title: "Nueva categoría",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function NuevaCategoriaPage() {
  return (
    <>
      <Link
        href="/admin/categorias"
        className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors mb-3"
      >
        <ChevronLeft size={13} aria-hidden="true" /> Categorías
      </Link>
      <h1 className="text-2xl font-extrabold text-foreground mb-1">Nueva categoría</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Va a aparecer en el menú del sitio y en el pie de página apenas la crees.
      </p>

      <CategoriaForm />
    </>
  );
}
