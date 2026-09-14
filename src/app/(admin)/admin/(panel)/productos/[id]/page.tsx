import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { buscarProducto, listarSubcategorias } from "@/lib/repo-admin";
import { ProductoForm } from "@/components/admin/ProductoForm";

export const metadata: Metadata = {
  title: "Editar producto",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function EditarProductoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numero = Number(id);

  // Un id que no sea un entero no llega siquiera a consultar la base.
  if (!Number.isInteger(numero) || numero <= 0) notFound();

  const [producto, opciones] = await Promise.all([
    buscarProducto(numero),
    listarSubcategorias(),
  ]);

  if (!producto) notFound();

  return (
    <>
      <Link
        href="/admin/productos"
        className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors mb-3"
      >
        <ChevronLeft size={13} aria-hidden="true" /> Productos
      </Link>
      <h1 className="text-2xl font-extrabold text-foreground mb-1">{producto.name}</h1>
      <p className="text-sm text-muted-foreground mb-6">Producto #{producto.id}</p>

      <ProductoForm opciones={opciones} producto={producto} />
    </>
  );
}
