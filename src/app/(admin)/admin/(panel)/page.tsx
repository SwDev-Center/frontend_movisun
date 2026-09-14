import type { Metadata } from "next";
import Link from "next/link";
import { Package, Layers, Radio, Image as ImageIcon, ChevronRight } from "lucide-react";
import { PRIMARY } from "@/lib/constants";
import { contarTodo } from "@/lib/repo";

export const metadata: Metadata = {
  title: "Inicio del panel",
  robots: { index: false, follow: false },
};

// Lee de la base en cada visita: los conteos tienen que reflejar la realidad.
export const dynamic = "force-dynamic";

export default async function PanelPage() {
  const r = await contarTodo();

  const secciones = [
    {
      icono: <Package size={18} aria-hidden="true" />,
      titulo: "Productos",
      dato: `${r.productos} en el catálogo`,
      estado: "Agregar, editar, eliminar y cambiar imágenes",
      href: "/admin/productos",
    },
    {
      icono: <Layers size={18} aria-hidden="true" />,
      titulo: "Categorías del header",
      dato: `${r.categorias} categorías · ${r.subcategorias} subcategorías`,
      estado: "Crear, editar, reordenar y eliminar el menú del sitio",
      href: "/admin/categorias",
    },
    {
      icono: <Radio size={18} aria-hidden="true" />,
      titulo: "Eventos y ofertas",
      dato: `${r.eventos} eventos · ${r.ofertas} ofertas relámpago`,
      estado: "Programar eventos en vivo y ofertas por tiempo limitado",
      href: "/admin/eventos",
    },
    {
      icono: <ImageIcon size={18} aria-hidden="true" />,
      titulo: "Portada",
      dato: "4 imágenes flotantes en la página de inicio",
      estado: "Cambiar la imagen y a dónde lleva cada una",
      href: "/admin/inicio",
    },
  ];

  return (
    <>
      <h1 className="text-2xl font-extrabold text-foreground mb-1">Panel de administración</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Sesión iniciada. Esto es lo que hay hoy en la base de datos.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {secciones.map((s) => {
          const contenido = (
            <div className="flex items-start gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0"
                style={{ background: PRIMARY }}
              >
                {s.icono}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-bold text-foreground text-sm flex items-center gap-1">
                  {s.titulo}
                  {s.href && <ChevronRight size={14} aria-hidden="true" />}
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5">{s.dato}</p>
                <p className="text-xs text-muted-foreground/80 mt-2">{s.estado}</p>
              </div>
            </div>
          );

          // Solo las secciones ya construidas son enlaces; el resto informa y
          // no promete una pantalla que todavía no existe.
          return s.href ? (
            <Link
              key={s.titulo}
              href={s.href}
              className="bg-white rounded-2xl border border-border p-5 hover:border-muted-foreground/40 transition-colors"
            >
              {contenido}
            </Link>
          ) : (
            <div key={s.titulo} className="bg-white rounded-2xl border border-border p-5">
              {contenido}
            </div>
          );
        })}
      </div>
    </>
  );
}
