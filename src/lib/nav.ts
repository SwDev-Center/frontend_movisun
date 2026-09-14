import type { Category, NavItem } from "@/lib/types";

// Construcción del menú del sitio.
//
// Las categorías salen de la base y se administran desde el panel; el resto
// son páginas propias que no son categorías, así que viven en el código.

/** Páginas que no son categorías. No se administran desde el panel. */
export const NAV_FIJOS: NavItem[] = [
  { id: "promociones", label: "Promociones", href: "/promociones" },
  { id: "eventos", label: "Eventos", href: "/eventos" },
  {
    id: "distribuidores",
    label: "Distribuidores",
    href: "/distribuidores",
    children: [
      { label: "Información", href: "/distribuidores" },
      { label: "Contacto", href: "/distribuidores/contacto" },
    ],
  },
];

/**
 * Menú completo: primero las categorías en el orden definido en el panel,
 * después las páginas fijas.
 *
 * Las subcategorías enlazan a /catalogo/<id>?sub=<label>, que es lo que lee
 * CatalogView para preseleccionar el filtro. «Todos» no se incluye: el catálogo
 * lo muestra siempre por su cuenta.
 */
export function construirNav(categories: Category[]): NavItem[] {
  const deCategorias: NavItem[] = categories.map((c) => ({
    id: c.id,
    label: c.label,
    href: `/catalogo/${c.id}`,
    children: c.subcategories.map((s) => ({
      label: s.label,
      href: `/catalogo/${c.id}?sub=${encodeURIComponent(s.label)}`,
    })),
  }));

  return [...deCategorias, ...NAV_FIJOS];
}
