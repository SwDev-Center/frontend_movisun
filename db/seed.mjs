// Carga inicial: pasa el catálogo de db/seed/*.json a PostgreSQL.
//
//   npm run db:setup          crea las tablas y carga si están vacías
//   npm run db:setup -- --reset   borra todo y vuelve a cargar
//
// Los JSON de db/seed/ son una copia exacta de lo que servían los mocks, así
// que después de correr esto el sitio se ve idéntico.

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import pg from "pg";

const aqui = dirname(fileURLToPath(import.meta.url));
const reset = process.argv.includes("--reset");

if (!process.env.DATABASE_URL) {
  console.error("Falta DATABASE_URL. Corré con: node --env-file=.env.local db/seed.mjs");
  process.exit(1);
}

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  // Mismo criterio que src/lib/db.ts: cifrado sin verificar la CA de Supabase.
  ssl: { rejectUnauthorized: false },
});

const leerJson = async (nombre) =>
  JSON.parse(await readFile(join(aqui, "seed", nombre), "utf8"));

const DIA = 86_400_000;
const HORA = 3_600_000;

await client.connect();

try {
  // ── 1. Esquema ────────────────────────────────────────────────────────────
  const schema = await readFile(join(aqui, "schema.sql"), "utf8");
  await client.query(schema);
  console.log("✓ Esquema aplicado");

  // ── 2. ¿Ya hay datos? ─────────────────────────────────────────────────────
  const { rows } = await client.query("select count(*)::int n from categories");
  if (rows[0].n > 0 && !reset) {
    console.log(`\nLa base ya tiene ${rows[0].n} categorías. No se tocó nada.`);
    console.log("Para borrar todo y recargar:  npm run db:setup -- --reset");
    process.exit(0);
  }

  await client.query("begin");

  if (reset) {
    // images queda fuera a propósito: son archivos subidos desde el panel,
    // no datos de carga inicial, y borrarlos rompería productos existentes.
    await client.query(
      "truncate flash_sales, live_events, products, subcategories, categories restart identity cascade"
    );
    console.log("✓ Tablas vaciadas");
  }

  // ── 3. Categorías y subcategorías ─────────────────────────────────────────
  const categories = await leerJson("categories.json");
  // label de subcategoría → id generado, para resolver los productos después.
  const subIdPorClave = new Map();

  for (const [i, c] of categories.entries()) {
    await client.query(
      `insert into categories (id, label, tagline, description, icon, color, cover_img, hero_img, position)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [c.id, c.label, c.tagline, c.description, c.icon, c.color, c.coverImg, c.heroImg, i]
    );

    for (const [j, s] of c.subcategories.entries()) {
      const { rows: sub } = await client.query(
        `insert into subcategories (category_id, label, icon, position)
         values ($1,$2,$3,$4) returning id`,
        [c.id, s.label, s.icon, j]
      );
      subIdPorClave.set(`${c.id}::${s.label}`, sub[0].id);
    }
  }
  console.log(`✓ ${categories.length} categorías y ${subIdPorClave.size} subcategorías`);

  // ── 4. Productos ──────────────────────────────────────────────────────────
  const products = await leerJson("products.json");

  for (const p of products) {
    const subId = subIdPorClave.get(`${p.category}::${p.subcategory}`);
    if (!subId) {
      throw new Error(
        `El producto ${p.id} ("${p.name}") apunta a ${p.category}/${p.subcategory}, que no existe.`
      );
    }
    // addedDaysAgo es relativo; se guarda como fecha absoluta y se vuelve a
    // derivar al leer. Sin addedDaysAgo, el producto queda como creado hoy.
    const createdAt = new Date(Date.now() - (p.addedDaysAgo ?? 0) * DIA);

    // Se conserva el id original: el carrito guardado en localStorage y las
    // ofertas relámpago lo referencian.
    await client.query(
      `insert into products (id, name, price, original_price, category_id, subcategory_id,
                             description, features, image, badge, rating, reviews, colors,
                             is_new, created_at)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
      [
        p.id, p.name, p.price, p.originalPrice ?? null, p.category, subId,
        p.description, p.features, p.image, p.badge ?? null, p.rating, p.reviews,
        p.colors ?? null, p.isNew ?? false, createdAt,
      ]
    );
  }
  // La secuencia queda después del id más alto para que los productos nuevos
  // del panel no choquen con los existentes.
  await client.query("select setval('products_id_seq', (select max(id) from products))");
  console.log(`✓ ${products.length} productos`);

  // ── 5. Eventos y ofertas relámpago ────────────────────────────────────────
  const events = await leerJson("events.json");

  for (const [i, e] of events.live.entries()) {
    // e.date y e.live del JSON se ignoran a propósito: ahora se derivan de
    // starts_at y duration_minutes al leer. Una hora es la duración por defecto.
    await client.query(
      `insert into live_events (id, title, description, starts_at, duration_minutes, url, image, viewers, position)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [e.id, e.title, e.desc, e.startsAt, 60, e.url, e.image, e.viewers, i]
    );
  }
  await client.query("select setval('live_events_id_seq', (select max(id) from live_events))");

  for (const f of events.flash) {
    // Mismo criterio que addedDaysAgo: endsInHours es relativo, ends_at no.
    await client.query(
      `insert into flash_sales (product_id, extra_discount, ends_at, stock)
       values ($1,$2,$3,$4)`,
      [f.productId, f.extraDiscount, new Date(Date.now() + f.endsInHours * HORA), f.stock]
    );
  }
  console.log(`✓ ${events.live.length} eventos y ${events.flash.length} ofertas relámpago`);

  await client.query("commit");
  console.log("\nListo. La base quedó con el mismo catálogo que los mocks.");
} catch (err) {
  await client.query("rollback").catch(() => {});
  console.error("\nFalló la carga, no se guardó nada:\n", err.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
