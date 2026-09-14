import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { listarSubcategorias } from "@/lib/repo-admin";
import { ProductoForm } from "@/components/admin/ProductoForm";

export const metadata: Metadata = {
  title: "Nuevo producto",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function NuevoProductoPage() {
  const opciones = await listarSubcategorias();

  return (
    <>
      <Link
        href="/admin/productos"
        className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors mb-3"
      >
        <ChevronLeft size={13} aria-hidden="true" /> Productos
      </Link>
      <h1 className="text-2xl font-extrabold text-foreground mb-6">Nuevo producto</h1>

      {opciones.length === 0 ? (
        <p className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-900">
          No hay subcategorías todavía, y un producto tiene que pertenecer a una.
          Creá primero una categoría con sus subcategorías.
        </p>
      ) : (
        <ProductoForm opciones={opciones} />
      )}
    </>
  );
}
