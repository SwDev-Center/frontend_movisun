import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronUp, ChevronDown, AlertCircle, Save } from "lucide-react";
import { buscarCategoria, listarSubcategoriasDe } from "@/lib/repo-admin";
import { ICONOS, NOMBRES_ICONOS } from "@/lib/validation";
import { CategoriaForm } from "@/components/admin/CategoriaForm";
import { SubcategoriaNueva } from "@/components/admin/SubcategoriaNueva";
import { BotonConfirmar } from "@/components/admin/BotonConfirmar";
import {
  borrarSubcategoria,
  guardarSubcategoria,
  ordenarSubcategoria,
} from "@/app/(admin)/admin/(panel)/categorias/actions";

export const metadata: Metadata = {
  title: "Editar categoría",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const MENSAJES: Record<string, string> = {
  creada: "Categoría creada. Ya aparece en el menú del sitio.",
  editada: "Cambios guardados.",
  "sub-creada": "Subcategoría agregada.",
  "sub-editada": "Subcategoría guardada.",
  "sub-borrada": "Subcategoría eliminada.",
};

export default async function EditarCategoriaPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ estado?: string; error?: string }>;
}) {
  const [{ id }, { estado, error }] = await Promise.all([params, searchParams]);

  const [categoria, subcategorias] = await Promise.all([
    buscarCategoria(id),
    listarSubcategoriasDe(id),
  ]);

  if (!categoria) notFound();

  return (
    <>
      <Link
        href="/admin/categorias"
        className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors mb-3"
      >
        <ChevronLeft size={13} aria-hidden="true" /> Categorías
      </Link>
      <h1 className="text-2xl font-extrabold text-foreground mb-1">{categoria.label}</h1>
      <p className="text-sm text-muted-foreground mb-6">
        <Link href={`/catalogo/${categoria.id}`} className="hover:underline">
          /catalogo/{categoria.id}
        </Link>{" "}
        · {categoria.productos} {categoria.productos === 1 ? "producto" : "productos"}
      </p>

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

      <CategoriaForm categoria={categoria} />

      {/* ── Subcategorías ──────────────────────────────────────────────────── */}
      <section className="mt-10">
        <h2 className="text-lg font-extrabold text-foreground mb-1">Subcategorías</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Son las opciones del submenú y los filtros del catálogo. «Todos» aparece siempre,
          no hace falta crearlo.
        </p>

        <div className="bg-white rounded-2xl border border-border p-5 mb-4">
          <SubcategoriaNueva categoryId={categoria.id} />
        </div>

        {subcategorias.length === 0 ? (
          <p className="text-center py-10 text-muted-foreground text-sm">
            Esta categoría todavía no tiene subcategorías.
          </p>
        ) : (
          <ul className="space-y-2">
            {subcategorias.map((s, i) => (
              <li
                key={s.id}
                className="bg-white rounded-2xl border border-border p-3 flex flex-wrap items-center gap-2"
              >
                {/* Renombrar y cambiar icono. Va en su propio formulario: el
                    HTML no permite anidarlos, así que reordenar y eliminar son
                    formularios hermanos, no hijos de este. */}
                <form action={guardarSubcategoria} className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
                  <input type="hidden" name="id" value={s.id} />
                  <input type="hidden" name="categoryId" value={categoria.id} />

                  <label htmlFor={`sub-${s.id}`} className="sr-only">
                    Nombre de la subcategoría
                  </label>
                  <input
                    id={`sub-${s.id}`}
                    name="label"
                    required
                    maxLength={40}
                    defaultValue={s.label}
                    className="flex-1 min-w-[8rem] px-3 py-2 rounded-xl border border-border bg-white text-foreground text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  />

                  <label htmlFor={`sub-icono-${s.id}`} className="sr-only">
                    Icono de {s.label}
                  </label>
                  <select
                    id={`sub-icono-${s.id}`}
                    name="icon"
                    defaultValue={s.icon}
                    className="px-3 py-2 rounded-xl border border-border bg-white text-foreground text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  >
                    {ICONOS.map((k) => (
                      <option key={k} value={k}>
                        {NOMBRES_ICONOS[k]}
                      </option>
                    ))}
                  </select>

                  <button
                    type="submit"
                    aria-label={`Guardar ${s.label}`}
                    className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  >
                    <Save size={15} aria-hidden="true" />
                  </button>
                </form>

                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {s.productos} {s.productos === 1 ? "producto" : "productos"}
                </span>

                <div className="flex items-center gap-1">
                  <form action={ordenarSubcategoria}>
                    <input type="hidden" name="id" value={s.id} />
                    <input type="hidden" name="categoryId" value={categoria.id} />
                    <input type="hidden" name="direccion" value="arriba" />
                    <button
                      type="submit"
                      disabled={i === 0}
                      aria-label={`Subir ${s.label}`}
                      className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                      <ChevronUp size={15} aria-hidden="true" />
                    </button>
                  </form>
                  <form action={ordenarSubcategoria}>
                    <input type="hidden" name="id" value={s.id} />
                    <input type="hidden" name="categoryId" value={categoria.id} />
                    <input type="hidden" name="direccion" value="abajo" />
                    <button
                      type="submit"
                      disabled={i === subcategorias.length - 1}
                      aria-label={`Bajar ${s.label}`}
                      className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                      <ChevronDown size={15} aria-hidden="true" />
                    </button>
                  </form>

                  <BotonConfirmar
                    accion={borrarSubcategoria}
                    campos={{ id: s.id, categoryId: categoria.id }}
                    etiqueta={`Eliminar ${s.label}`}
                    mensaje={
                      s.productos > 0
                        ? `«${s.label}» tiene ${s.productos} productos y no se va a poder eliminar. ¿Intentar igual?`
                        : `¿Eliminar la subcategoría «${s.label}»?`
                    }
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
