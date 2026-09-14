import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Zap } from "lucide-react";
import { fmt, precioConDescuento } from "@/lib/utils";
import { etiquetaDeFecha } from "@/lib/mappers";
import { buscarOfertaDeProducto, buscarProducto, listarSubcategorias } from "@/lib/repo-admin";
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

  const [producto, opciones, oferta] = await Promise.all([
    buscarProducto(numero),
    listarSubcategorias(),
    buscarOfertaDeProducto(numero),
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

      {/* Oferta relámpago: se administra desde Eventos, pero se muestra acá
          porque cambia el precio que ve el cliente en todo el sitio. */}
      <section
        className={`mb-6 rounded-2xl border p-4 ${
          oferta && !oferta.vencida ? "border-amber-300 bg-amber-50" : "border-border bg-white"
        }`}
      >
        <h2 className="flex items-center gap-1.5 text-sm font-bold text-foreground mb-2">
          <Zap size={14} aria-hidden="true" /> Oferta relámpago
        </h2>

        {!oferta ? (
          <p className="text-sm text-muted-foreground">
            Este producto no tiene oferta relámpago.{" "}
            <Link href="/admin/eventos" className="font-semibold hover:underline">
              Crear una en Eventos
            </Link>
            .
          </p>
        ) : oferta.vencida ? (
          <p className="text-sm text-muted-foreground">
            Tenía una oferta del {oferta.extra_discount} % que venció el{" "}
            {etiquetaDeFecha(oferta.ends_at)}. No se está aplicando.{" "}
            <Link href="/admin/eventos" className="font-semibold hover:underline">
              Reactivarla en Eventos
            </Link>
            .
          </p>
        ) : (
          <div className="text-sm text-amber-950">
            <p>
              <strong>−{oferta.extra_discount} %</strong> hasta el{" "}
              <strong>{etiquetaDeFecha(oferta.ends_at)}</strong> · {oferta.stock} disponibles.
            </p>
            <p className="mt-1 tabular-nums">
              En el sitio se muestra a{" "}
              <strong>{fmt(precioConDescuento(producto.price, oferta.extra_discount))}</strong>{" "}
              en vez de <span className="line-through">{fmt(producto.price)}</span>.
            </p>
            <Link href="/admin/eventos" className="inline-block mt-2 font-semibold hover:underline">
              Editarla en Eventos
            </Link>
          </div>
        )}
      </section>

      <ProductoForm opciones={opciones} producto={producto} />
    </>
  );
}
