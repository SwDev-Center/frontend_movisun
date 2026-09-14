import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Plus, Pencil, ChevronUp, ChevronDown, AlertCircle } from "lucide-react";
import { PRIMARY } from "@/lib/constants";
import { listarCategorias } from "@/lib/repo-admin";
import { BotonConfirmar } from "@/components/admin/BotonConfirmar";
import { borrarCategoria, ordenarCategoria } from "@/app/(admin)/admin/(panel)/categorias/actions";

export const metadata: Metadata = {
  title: "Categorías",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const MENSAJES: Record<string, string> = {
  borrada: "Categoría eliminada.",
};

export default async function CategoriasPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string; error?: string }>;
}) {
  const { estado, error } = await searchParams;
  const categorias = await listarCategorias();

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Categorías</h1>
          <p className="text-sm text-muted-foreground">
            Son los módulos del menú. El orden de esta lista es el del menú del sitio.
          </p>
        </div>
        <Link
          href="/admin/categorias/nueva"
          className="ml-auto flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90"
          style={{ background: PRIMARY }}
        >
          <Plus size={15} aria-hidden="true" /> Nueva categoría
        </Link>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 mb-5 p-3 rounded-xl bg-red-50 border border-red-200"
        >
          <AlertCircle size={15} className="text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-sm text-red-700 font-medium">{error}</p>
        </div>
      )}

      {estado && MENSAJES[estado] && (
        <p
          role="status"
          className="mb-5 p-3 rounded-xl text-sm font-medium border bg-green-50 border-green-200 text-green-800"
        >
          {MENSAJES[estado]}
        </p>
      )}

      {categorias.length === 0 ? (
        <p className="text-center py-16 text-muted-foreground text-sm">
          Todavía no hay categorías. El menú del sitio se arma con ellas.
        </p>
      ) : (
        <ul className="space-y-3">
          {categorias.map((c, i) => (
            <li key={c.id} className="bg-white rounded-2xl border border-border p-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative w-16 h-12 rounded-xl overflow-hidden bg-muted shrink-0">
                  <Image src={c.cover_img} alt="" fill sizes="64px" className="object-cover" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0 border border-black/10"
                      style={{ background: c.color }}
                      aria-hidden="true"
                    />
                    <p className="font-bold text-foreground">{c.label}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    /catalogo/{c.id} · {c.subcategorias}{" "}
                    {c.subcategorias === 1 ? "subcategoría" : "subcategorías"} · {c.productos}{" "}
                    {c.productos === 1 ? "producto" : "productos"}
                  </p>
                </div>

                <div className="flex items-center gap-1 ml-auto">
                  {/* Reordenar: mueve la categoría en el menú del sitio. */}
                  <form action={ordenarCategoria}>
                    <input type="hidden" name="id" value={c.id} />
                    <input type="hidden" name="direccion" value="arriba" />
                    <button
                      type="submit"
                      disabled={i === 0}
                      aria-label={`Subir ${c.label} en el menú`}
                      className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                      <ChevronUp size={15} aria-hidden="true" />
                    </button>
                  </form>
                  <form action={ordenarCategoria}>
                    <input type="hidden" name="id" value={c.id} />
                    <input type="hidden" name="direccion" value="abajo" />
                    <button
                      type="submit"
                      disabled={i === categorias.length - 1}
                      aria-label={`Bajar ${c.label} en el menú`}
                      className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                      <ChevronDown size={15} aria-hidden="true" />
                    </button>
                  </form>

                  <Link
                    href={`/admin/categorias/${c.id}`}
                    aria-label={`Editar ${c.label}`}
                    className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  >
                    <Pencil size={15} aria-hidden="true" />
                  </Link>

                  <BotonConfirmar
                    accion={borrarCategoria}
                    campos={{ id: c.id }}
                    etiqueta={`Eliminar ${c.label}`}
                    mensaje={
                      c.productos > 0
                        ? `«${c.label}» tiene ${c.productos} productos y no se va a poder eliminar. ¿Intentar igual?`
                        : `¿Eliminar «${c.label}» y sus ${c.subcategorias} subcategorías? Esta acción no se puede deshacer.`
                    }
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
