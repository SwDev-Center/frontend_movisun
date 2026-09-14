import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Plus, Pencil, Search, Zap } from "lucide-react";
import { PRIMARY } from "@/lib/constants";
import { fmt, precioConDescuento } from "@/lib/utils";
import { listarProductos } from "@/lib/repo-admin";
import { BotonBorrar } from "@/components/admin/BotonBorrar";

export const metadata: Metadata = {
  title: "Productos",
  robots: { index: false, follow: false },
};

// Lee de la base directamente, sin pasar por la API ni su caché: el panel
// siempre tiene que mostrar el estado real.
export const dynamic = "force-dynamic";

const MENSAJES: Record<string, string> = {
  creado: "Producto creado.",
  editado: "Cambios guardados.",
  borrado: "Producto eliminado.",
  error: "No se pudo completar la operación.",
};

export default async function ProductosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; estado?: string }>;
}) {
  const { q, estado } = await searchParams;
  const productos = await listarProductos();

  const busqueda = (q ?? "").trim().toLowerCase();
  const filtrados = busqueda
    ? productos.filter(
        (p) =>
          p.name.toLowerCase().includes(busqueda) ||
          p.categoria.toLowerCase().includes(busqueda) ||
          p.subcategoria.toLowerCase().includes(busqueda)
      )
    : productos;

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Productos</h1>
          <p className="text-sm text-muted-foreground">
            {productos.length} en el catálogo
            {busqueda && ` · ${filtrados.length} coinciden con la búsqueda`}
          </p>
        </div>

        <Link
          href="/admin/productos/nuevo"
          className="ml-auto flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90"
          style={{ background: PRIMARY }}
        >
          <Plus size={15} aria-hidden="true" /> Nuevo producto
        </Link>
      </div>

      {estado && MENSAJES[estado] && (
        <p
          role="status"
          className={`mb-5 p-3 rounded-xl text-sm font-medium border ${
            estado === "error"
              ? "bg-red-50 border-red-200 text-red-700"
              : "bg-green-50 border-green-200 text-green-800"
          }`}
        >
          {MENSAJES[estado]}
        </p>
      )}

      {/* Búsqueda por GET: funciona sin JavaScript y queda en la URL. */}
      <form className="mb-5 flex items-center gap-2 max-w-sm">
        <div className="flex items-center gap-2 flex-1 border border-border rounded-xl px-3 py-2 bg-white">
          <Search size={14} className="text-muted-foreground" aria-hidden="true" />
          <input
            type="search"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Buscar por nombre o categoría…"
            aria-label="Buscar productos"
            className="bg-transparent text-sm w-full text-foreground placeholder:text-muted-foreground focus-visible:outline-none"
          />
        </div>
        <button
          type="submit"
          className="px-3 py-2 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-white transition-colors"
        >
          Buscar
        </button>
      </form>

      {filtrados.length === 0 ? (
        <p className="text-center py-16 text-muted-foreground text-sm">
          {busqueda ? "Ningún producto coincide con la búsqueda." : "Todavía no hay productos."}
        </p>
      ) : (
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          {/* La tabla puede desbordar en pantallas chicas: solo scrollea ella. */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <caption className="sr-only">Productos del catálogo</caption>
              <thead>
                <tr className="bg-muted text-left">
                  <th scope="col" className="p-3 font-bold text-xs uppercase tracking-wider text-muted-foreground">
                    Producto
                  </th>
                  <th scope="col" className="p-3 font-bold text-xs uppercase tracking-wider text-muted-foreground">
                    Ubicación
                  </th>
                  <th scope="col" className="p-3 font-bold text-xs uppercase tracking-wider text-muted-foreground">
                    Precio
                  </th>
                  <th scope="col" className="p-3 font-bold text-xs uppercase tracking-wider text-muted-foreground text-right">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((p) => (
                  <tr key={p.id} className="border-t border-border">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-muted shrink-0">
                          <Image src={p.image} alt="" fill sizes="40px" className="object-cover" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground">{p.name}</p>
                          <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                            {p.badge && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                                {p.badge}
                              </span>
                            )}
                            {p.is_new && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700">
                                Novedad
                              </span>
                            )}
                            {p.flash_extra_discount !== null && (
                              <span className="flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-900">
                                <Zap size={9} aria-hidden="true" /> -{p.flash_extra_discount}% relámpago
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-muted-foreground whitespace-nowrap">
                      {p.categoria}
                      <span className="text-muted-foreground/60"> → </span>
                      {p.subcategoria}
                    </td>
                    <td className="p-3 whitespace-nowrap tabular-nums">
                      {/* Con oferta vigente se muestra lo que realmente paga el
                          cliente, que es lo que ve en el sitio. */}
                      {p.flash_extra_discount !== null ? (
                        <>
                          <span className="font-bold text-amber-700">
                            {fmt(precioConDescuento(p.price, p.flash_extra_discount))}
                          </span>
                          <span className="ml-1.5 text-xs line-through text-muted-foreground">
                            {fmt(p.price)}
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="font-bold text-foreground">{fmt(p.price)}</span>
                          {p.original_price && (
                            <span className="ml-1.5 text-xs line-through text-muted-foreground">
                              {fmt(p.original_price)}
                            </span>
                          )}
                        </>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/productos/${p.id}`}
                          aria-label={`Editar ${p.name}`}
                          className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        >
                          <Pencil size={15} aria-hidden="true" />
                        </Link>
                        <BotonBorrar id={p.id} nombre={p.name} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
