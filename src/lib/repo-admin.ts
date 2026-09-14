import { createHash } from "node:crypto";
import { query, transaction } from "@/lib/db";
import {
  generarSlug,
  type DatosCategoria,
  type DatosEvento,
  type DatosOferta,
  type DatosProducto,
  type DatosSubcategoria,
} from "@/lib/validation";

// Lecturas y escrituras del panel. Separado de src/lib/repo.ts, que sirve al
// sitio público: acá las formas son las que necesitan los formularios, no las
// del contrato de la API.

// ─── Lecturas ───────────────────────────────────────────────────────────────

export interface FilaListado {
  id: number;
  name: string;
  price: number;
  original_price: number | null;
  categoria: string;
  subcategoria: string;
  image: string;
  badge: string | null;
  is_new: boolean;
  en_oferta_flash: boolean;
}

export async function listarProductos(): Promise<FilaListado[]> {
  return query<FilaListado>(`
    select p.id, p.name, p.price, p.original_price,
           c.label as categoria,
           s.label as subcategoria,
           p.image, p.badge, p.is_new,
           exists (select 1 from flash_sales f where f.product_id = p.id) as en_oferta_flash
      from products p
      join categories c    on c.id = p.category_id
      join subcategories s on s.id = p.subcategory_id
     order by p.created_at desc, p.id desc
  `);
}

export interface OpcionSubcategoria {
  id: number;
  categoria: string;
  label: string;
}

/** Opciones del selector: una entrada por subcategoría, con su categoría.
 *  Elegir la subcategoría ya determina la categoría, así que el formulario
 *  necesita un solo desplegable y ningún JavaScript. */
export async function listarSubcategorias(): Promise<OpcionSubcategoria[]> {
  return query<OpcionSubcategoria>(`
    select s.id, c.label as categoria, s.label
      from subcategories s
      join categories c on c.id = s.category_id
     order by c.position, c.id, s.position, s.id
  `);
}

export interface ProductoEdicion {
  id: number;
  name: string;
  price: number;
  original_price: number | null;
  subcategory_id: number;
  description: string;
  features: string[];
  image: string;
  badge: string | null;
  rating: string | number;
  reviews: number;
  colors: string[] | null;
  is_new: boolean;
}

export async function buscarProducto(id: number): Promise<ProductoEdicion | null> {
  const [fila] = await query<ProductoEdicion>(
    `select id, name, price, original_price, subcategory_id, description, features,
            image, badge, rating, reviews, colors, is_new
       from products where id = $1`,
    [id]
  );
  return fila ?? null;
}

// ─── Escrituras ─────────────────────────────────────────────────────────────

/** La categoría no se pide en el formulario: se deduce de la subcategoría
 *  elegida, dentro de la misma consulta. Así nunca quedan desincronizadas. */
export async function crearProducto(d: DatosProducto): Promise<number> {
  const filas = await query<{ id: number }>(
    `insert into products (name, price, original_price, category_id, subcategory_id,
                           description, features, image, badge, rating, reviews, colors, is_new)
     select $1, $2, $3, s.category_id, s.id, $4, $5, $6, $7, $8, $9, $10, $11
       from subcategories s
      where s.id = $12
     returning id`,
    [
      d.name, d.price, d.originalPrice ?? null, d.description, d.features, d.image,
      d.badge ?? null, d.rating, d.reviews, d.colors.length ? d.colors : null,
      d.isNew, d.subcategoryId,
    ]
  );

  if (!filas[0]) throw new Error("La subcategoría elegida ya no existe.");
  return filas[0].id;
}

export async function actualizarProducto(id: number, d: DatosProducto): Promise<void> {
  // created_at NO se toca: es de donde sale addedDaysAgo, y editar un producto
  // no lo vuelve más nuevo.
  const filas = await query<{ id: number }>(
    `update products p
        set name = $1, price = $2, original_price = $3,
            category_id = s.category_id, subcategory_id = s.id,
            description = $4, features = $5, image = $6, badge = $7,
            rating = $8, reviews = $9, colors = $10, is_new = $11,
            updated_at = now()
       from subcategories s
      where p.id = $12 and s.id = $13
     returning p.id`,
    [
      d.name, d.price, d.originalPrice ?? null, d.description, d.features, d.image,
      d.badge ?? null, d.rating, d.reviews, d.colors.length ? d.colors : null,
      d.isNew, id, d.subcategoryId,
    ]
  );

  if (!filas[0]) throw new Error("No se pudo actualizar: el producto o la subcategoría no existen.");
}

export async function eliminarProducto(id: number): Promise<void> {
  // La oferta relámpago asociada, si la hay, se borra sola (on delete cascade).
  await query("delete from products where id = $1", [id]);
}

/** Guarda la imagen y devuelve la ruta con la que se sirve.
 *  El id es el hash del contenido: subir dos veces el mismo archivo no lo
 *  duplica y la URL puede cachearse para siempre. */
export async function guardarImagen(bytes: Buffer, mime: string): Promise<string> {
  const id = createHash("sha256").update(bytes).digest("hex").slice(0, 32);

  await query(
    `insert into images (id, mime, bytes, size)
     values ($1, $2, $3, $4)
     on conflict (id) do nothing`,
    [id, mime, bytes, bytes.length]
  );

  return `/api/v1/images/${id}`;
}

// ─── Categorías y subcategorías ─────────────────────────────────────────────

export interface FilaCategoria {
  id: string;
  label: string;
  tagline: string;
  description: string;
  icon: string;
  color: string;
  cover_img: string;
  position: number;
  subcategorias: number;
  productos: number;
}

export async function listarCategorias(): Promise<FilaCategoria[]> {
  return query<FilaCategoria>(`
    select c.id, c.label, c.tagline, c.description, c.icon, c.color, c.cover_img, c.position,
           (select count(*) from subcategories s where s.category_id = c.id)::int as subcategorias,
           (select count(*) from products p      where p.category_id = c.id)::int as productos
      from categories c
     order by c.position, c.id
  `);
}

export async function buscarCategoria(id: string): Promise<FilaCategoria | null> {
  const [fila] = await query<FilaCategoria>(
    `select c.id, c.label, c.tagline, c.description, c.icon, c.color, c.cover_img, c.position,
            (select count(*) from subcategories s where s.category_id = c.id)::int as subcategorias,
            (select count(*) from products p      where p.category_id = c.id)::int as productos
       from categories c where c.id = $1`,
    [id]
  );
  return fila ?? null;
}

export interface FilaSubcategoria {
  id: number;
  label: string;
  icon: string;
  position: number;
  productos: number;
}

export async function listarSubcategoriasDe(categoryId: string): Promise<FilaSubcategoria[]> {
  return query<FilaSubcategoria>(
    `select s.id, s.label, s.icon, s.position,
            (select count(*) from products p where p.subcategory_id = s.id)::int as productos
       from subcategories s
      where s.category_id = $1
      order by s.position, s.id`,
    [categoryId]
  );
}

/** Slug libre derivado del nombre. Si ya existe, se le agrega un número. */
async function slugDisponible(label: string): Promise<string> {
  const base = generarSlug(label);
  for (let intento = 0; intento < 50; intento++) {
    const candidato = intento === 0 ? base : `${base}-${intento + 1}`;
    const [existe] = await query<{ id: string }>("select id from categories where id = $1", [
      candidato,
    ]);
    if (!existe) return candidato;
  }
  throw new Error("No se pudo generar una URL única para esa categoría.");
}

/** Crea la categoría y, opcionalmente, sus primeras subcategorías.
 *  Devuelve el slug generado, que es el id y la URL. */
export async function crearCategoria(
  datos: DatosCategoria,
  subcategorias: string[] = []
): Promise<string> {
  const id = await slugDisponible(datos.label);

  await transaction(async (client) => {
    const { rows } = await client.query<{ siguiente: number }>(
      "select coalesce(max(position) + 1, 0) as siguiente from categories"
    );

    await client.query(
      `insert into categories (id, label, tagline, description, icon, color, cover_img, hero_img, position)
       values ($1,$2,$3,$4,$5,$6,$7,$7,$8)`,
      // hero_img va con el mismo valor que cover_img: está en el contrato pero
      // ningún componente del sitio lo usa, así que no se pide por separado.
      [id, datos.label, datos.tagline, datos.description, datos.icon, datos.color, datos.coverImg, rows[0].siguiente]
    );

    for (const [i, label] of subcategorias.entries()) {
      await client.query(
        `insert into subcategories (category_id, label, icon, position) values ($1,$2,$3,$4)`,
        [id, label, datos.icon, i]
      );
    }
  });

  return id;
}

/** El id/slug NO se toca: cambiarlo rompería las URLs ya publicadas. */
export async function actualizarCategoria(id: string, datos: DatosCategoria): Promise<void> {
  const filas = await query<{ id: string }>(
    `update categories
        set label = $1, tagline = $2, description = $3, icon = $4, color = $5,
            cover_img = $6, hero_img = $6
      where id = $7
     returning id`,
    [datos.label, datos.tagline, datos.description, datos.icon, datos.color, datos.coverImg, id]
  );
  if (!filas[0]) throw new Error("La categoría ya no existe.");
}

/** Borra la categoría junto con sus subcategorías vacías.
 *  Si algún producto depende de ella, no borra nada y explica cuál lo impide. */
export async function eliminarCategoria(id: string): Promise<void> {
  await transaction(async (client) => {
    const { rows: conProductos } = await client.query<{ label: string; productos: number }>(
      `select s.label, count(p.id)::int as productos
         from subcategories s
         join products p on p.subcategory_id = s.id
        where s.category_id = $1
        group by s.label
        order by productos desc`,
      [id]
    );

    if (conProductos.length > 0) {
      const total = conProductos.reduce((s, f) => s + f.productos, 0);
      const detalle = conProductos.map((f) => `${f.label} (${f.productos})`).join(", ");
      throw new Error(
        `No se puede eliminar: la categoría todavía tiene ${total} ${
          total === 1 ? "producto" : "productos"
        } en ${detalle}. Movelos o eliminalos primero.`
      );
    }

    await client.query("delete from subcategories where category_id = $1", [id]);
    await client.query("delete from categories where id = $1", [id]);
  });
}

export async function crearSubcategoria(
  categoryId: string,
  datos: DatosSubcategoria
): Promise<void> {
  await transaction(async (client) => {
    const { rows } = await client.query<{ siguiente: number }>(
      "select coalesce(max(position) + 1, 0) as siguiente from subcategories where category_id = $1",
      [categoryId]
    );
    await client.query(
      `insert into subcategories (category_id, label, icon, position) values ($1,$2,$3,$4)`,
      [categoryId, datos.label, datos.icon, rows[0].siguiente]
    );
  });
}

/** Renombrar es seguro: los productos apuntan al id de la subcategoría, no a su
 *  nombre, así que la API pasa a devolver el nombre nuevo sin tocar nada más. */
export async function actualizarSubcategoria(
  id: number,
  datos: DatosSubcategoria
): Promise<void> {
  const filas = await query<{ id: number }>(
    "update subcategories set label = $1, icon = $2 where id = $3 returning id",
    [datos.label, datos.icon, id]
  );
  if (!filas[0]) throw new Error("La subcategoría ya no existe.");
}

export async function eliminarSubcategoria(id: number): Promise<void> {
  const [fila] = await query<{ label: string; productos: number }>(
    `select s.label, (select count(*) from products p where p.subcategory_id = s.id)::int as productos
       from subcategories s where s.id = $1`,
    [id]
  );

  if (!fila) throw new Error("La subcategoría ya no existe.");

  if (fila.productos > 0) {
    throw new Error(
      `No se puede eliminar «${fila.label}»: tiene ${fila.productos} ${
        fila.productos === 1 ? "producto" : "productos"
      }. Movelos a otra subcategoría o eliminalos primero.`
    );
  }

  await query("delete from subcategories where id = $1", [id]);
}

type Direccion = "arriba" | "abajo";

/** Reordena intercambiando con el vecino y renumerando todas las posiciones,
 *  para que nunca queden huecos ni empates. */
export async function moverCategoria(id: string, direccion: Direccion): Promise<void> {
  await transaction(async (client) => {
    const { rows } = await client.query<{ id: string }>(
      "select id from categories order by position, id"
    );
    const ids = rows.map((r) => r.id);
    const desde = ids.indexOf(id);
    const hasta = direccion === "arriba" ? desde - 1 : desde + 1;
    if (desde < 0 || hasta < 0 || hasta >= ids.length) return;

    [ids[desde], ids[hasta]] = [ids[hasta], ids[desde]];
    for (const [posicion, cid] of ids.entries()) {
      await client.query("update categories set position = $1 where id = $2", [posicion, cid]);
    }
  });
}

export async function moverSubcategoria(id: number, direccion: Direccion): Promise<void> {
  await transaction(async (client) => {
    const { rows: cat } = await client.query<{ category_id: string }>(
      "select category_id from subcategories where id = $1",
      [id]
    );
    if (!cat[0]) return;

    const { rows } = await client.query<{ id: number }>(
      "select id from subcategories where category_id = $1 order by position, id",
      [cat[0].category_id]
    );
    const ids = rows.map((r) => r.id);
    const desde = ids.indexOf(id);
    const hasta = direccion === "arriba" ? desde - 1 : desde + 1;
    if (desde < 0 || hasta < 0 || hasta >= ids.length) return;

    [ids[desde], ids[hasta]] = [ids[hasta], ids[desde]];
    for (const [posicion, sid] of ids.entries()) {
      await client.query("update subcategories set position = $1 where id = $2", [posicion, sid]);
    }
  });
}

// ─── Eventos en vivo ────────────────────────────────────────────────────────

export interface FilaEvento {
  id: number;
  title: string;
  description: string;
  starts_at: Date;
  duration_minutes: number;
  url: string;
  image: string;
  viewers: number;
  position: number;
}

export async function listarEventos(): Promise<FilaEvento[]> {
  return query<FilaEvento>(`
    select id, title, description, starts_at, duration_minutes, url, image, viewers, position
      from live_events
     order by position, id
  `);
}

export async function buscarEvento(id: number): Promise<FilaEvento | null> {
  const [fila] = await query<FilaEvento>(
    `select id, title, description, starts_at, duration_minutes, url, image, viewers, position
       from live_events where id = $1`,
    [id]
  );
  return fila ?? null;
}

export async function crearEvento(d: DatosEvento): Promise<number> {
  const filas = await query<{ id: number }>(
    `insert into live_events (title, description, starts_at, duration_minutes, url, image, viewers, position)
     values ($1,$2,$3,$4,$5,$6,$7, coalesce((select max(position) + 1 from live_events), 0))
     returning id`,
    [d.title, d.description, d.startsAt, d.durationMinutes, d.url, d.image, d.viewers]
  );
  return filas[0].id;
}

export async function actualizarEvento(id: number, d: DatosEvento): Promise<void> {
  const filas = await query<{ id: number }>(
    `update live_events
        set title = $1, description = $2, starts_at = $3, duration_minutes = $4,
            url = $5, image = $6, viewers = $7
      where id = $8
     returning id`,
    [d.title, d.description, d.startsAt, d.durationMinutes, d.url, d.image, d.viewers, id]
  );
  if (!filas[0]) throw new Error("El evento ya no existe.");
}

export async function eliminarEvento(id: number): Promise<void> {
  await query("delete from live_events where id = $1", [id]);
}

export async function moverEvento(id: number, direccion: "arriba" | "abajo"): Promise<void> {
  await transaction(async (client) => {
    const { rows } = await client.query<{ id: number }>(
      "select id from live_events order by position, id"
    );
    const ids = rows.map((r) => r.id);
    const desde = ids.indexOf(id);
    const hasta = direccion === "arriba" ? desde - 1 : desde + 1;
    if (desde < 0 || hasta < 0 || hasta >= ids.length) return;

    [ids[desde], ids[hasta]] = [ids[hasta], ids[desde]];
    for (const [posicion, eid] of ids.entries()) {
      await client.query("update live_events set position = $1 where id = $2", [posicion, eid]);
    }
  });
}

// ─── Ofertas relámpago ──────────────────────────────────────────────────────

export interface FilaOferta {
  product_id: number;
  extra_discount: number;
  ends_at: Date;
  stock: number;
  producto: string;
  precio: number;
  imagen: string;
  vencida: boolean;
}

export async function listarOfertas(): Promise<FilaOferta[]> {
  // El panel muestra TODAS, vencidas incluidas: el sitio público es el que las
  // oculta. Así se pueden reactivar con una fecha nueva.
  return query<FilaOferta>(`
    select f.product_id, f.extra_discount, f.ends_at, f.stock,
           p.name as producto, p.price as precio, p.image as imagen,
           f.ends_at <= now() as vencida
      from flash_sales f
      join products p on p.id = f.product_id
     order by f.ends_at
  `);
}

export interface OpcionProducto {
  id: number;
  name: string;
  price: number;
}

/** Productos que todavía no tienen oferta: flash_sales.product_id es clave
 *  primaria, así que cada producto admite una sola. */
export async function listarProductosSinOferta(): Promise<OpcionProducto[]> {
  return query<OpcionProducto>(`
    select p.id, p.name, p.price
      from products p
     where not exists (select 1 from flash_sales f where f.product_id = p.id)
     order by p.name
  `);
}

export async function crearOferta(d: DatosOferta): Promise<void> {
  await query(
    `insert into flash_sales (product_id, extra_discount, ends_at, stock) values ($1,$2,$3,$4)`,
    [d.productId, d.extraDiscount, d.endsAt, d.stock]
  );
}

export async function actualizarOferta(productId: number, d: DatosOferta): Promise<void> {
  const filas = await query<{ product_id: number }>(
    `update flash_sales set extra_discount = $1, ends_at = $2, stock = $3
      where product_id = $4
     returning product_id`,
    [d.extraDiscount, d.endsAt, d.stock, productId]
  );
  if (!filas[0]) throw new Error("La oferta ya no existe.");
}

export async function eliminarOferta(productId: number): Promise<void> {
  await query("delete from flash_sales where product_id = $1", [productId]);
}
