import { query } from "@/lib/db";
import {
  toCategory,
  toFlashSale,
  toLiveEvent,
  toProduct,
  type CategoryRow,
  type FlashSaleRow,
  type LiveEventRow,
  type ProductRow,
} from "@/lib/mappers";
import type { Category, EventsCatalog, HeroTile, HomeSlide, Product } from "@/lib/types";

// Lecturas de la base de datos. Es la única capa que escribe SQL de consulta;
// los route handlers de src/app/api/v1 solo llaman a estas funciones.

export async function findProducts(): Promise<Product[]> {
  // El orden por id replica el de los mocks, que el catálogo reordena después.
  const rows = await query<ProductRow>(`
    select p.id,
           p.name,
           p.price,
           p.original_price,
           p.category_id as category,
           s.label       as subcategory,
           p.description,
           p.features,
           p.image,
           p.badge,
           p.rating,
           p.reviews,
           p.colors,
           p.is_new,
           p.created_at,
           -- Solo las ofertas vigentes: una vencida no debe rebajar el precio
           -- en el catálogo, igual que no se muestra en /eventos.
           f.extra_discount as flash_extra_discount,
           f.ends_at        as flash_ends_at,
           f.stock          as flash_stock
      from products p
      join subcategories s on s.id = p.subcategory_id
      left join flash_sales f on f.product_id = p.id and f.ends_at > now()
     order by p.id
  `);
  return rows.map(toProduct);
}

export async function findCategories(): Promise<Category[]> {
  // Las subcategorías se agregan en la misma consulta para no hacer N+1.
  const rows = await query<CategoryRow>(`
    select c.id,
           c.label,
           c.tagline,
           c.description,
           c.icon,
           c.color,
           c.cover_img,
           c.hero_img,
           coalesce(
             (select json_agg(json_build_object('label', s.label, 'icon', s.icon)
                              order by s.position, s.id)
                from subcategories s
               where s.category_id = c.id),
             '[]'::json
           ) as subcategories
      from categories c
     order by c.position, c.id
  `);
  return rows.map(toCategory);
}

export async function findEvents(): Promise<EventsCatalog> {
  const [liveRows, flashRows] = await Promise.all([
    query<LiveEventRow>(`
      select id, title, description, starts_at, duration_minutes, url, image, viewers
        from live_events
       order by position, id
    `),
    query<FlashSaleRow>(`
      select product_id, extra_discount, ends_at, stock
        from flash_sales
       -- Las ofertas vencidas desaparecen solas del sitio; en el panel siguen
       -- estando, para poder darles una fecha nueva.
       where ends_at > now()
       order by product_id
    `),
  ]);

  // Un único instante para toda la respuesta: así dos eventos de la misma
  // consulta no se evalúan contra relojes distintos.
  const ahora = new Date();

  return {
    live: liveRows.map((fila) => toLiveEvent(fila, ahora)),
    flash: flashRows.map(toFlashSale),
  };
}

export interface Resumen {
  productos: number;
  categorias: number;
  subcategorias: number;
  eventos: number;
  ofertas: number;
  imagenes: number;
}

/** Conteos para el panel. Una sola ida a la base en lugar de seis. */
export async function contarTodo(): Promise<Resumen> {
  const [fila] = await query<Resumen>(`
    select (select count(*) from products)::int      as productos,
           (select count(*) from categories)::int    as categorias,
           (select count(*) from subcategories)::int as subcategorias,
           (select count(*) from live_events)::int   as eventos,
           (select count(*) from flash_sales)::int   as ofertas,
           (select count(*) from images)::int        as imagenes
  `);
  return fila;
}

export async function findHeroTiles(): Promise<HeroTile[]> {
  return query<HeroTile>(`
    select slot, image, alt, href
      from hero_tiles
     order by slot
  `);
}

interface HomeSlideRow {
  id: number;
  image: string;
  headline: string;
  sub: string;
  cta_label: string;
  href: string;
}

export async function findHomeSlides(): Promise<HomeSlide[]> {
  const filas = await query<HomeSlideRow>(`
    select id, image, headline, sub, cta_label, href
      from home_slides
     order by position, id
  `);
  return filas.map((f) => ({
    id: f.id,
    image: f.image,
    headline: f.headline,
    sub: f.sub,
    ctaLabel: f.cta_label,
    href: f.href,
  }));
}
