# Base de datos

**PostgreSQL alojado en Supabase**, usado únicamente como Postgres gestionado:
sin el SDK de Supabase, sin RLS, sin Auth, sin Storage. El acceso es con
**`pg` y SQL plano, sin ORM**.

- Esquema: `db/schema.sql`
- Carga inicial: `db/seed.mjs` + `db/seed/*.json`
- Conexión: `src/lib/db.ts`
- Lecturas del sitio: `src/lib/repo.ts`
- Lecturas y escrituras del panel: `src/lib/repo-admin.ts`
- Traducción fila → DTO: `src/lib/mappers.ts`

Las columnas se nombran en `snake_case` y se traducen a `camelCase` en los
mappers, porque el contrato de `src/lib/types.ts` es camelCase.

## Tablas

### `categories` — los «módulos» del header

| Campo | Notas |
|---|---|
| `id` **PK** | **Es el slug de la URL** (`/catalogo/<id>`), texto, no serial |
| `label` | El nombre que se ve en el menú y en el `<h1>` |
| `icon` | `check` cerrado: `watch`, `headphones`, `bluetooth`, `battery`, `zap`, `cable`, `speaker`, `radio` |
| `color` | `check` de hex de **6 dígitos**: se le concatenan `e0` y `90` para el degradado |
| `cover_img`, `hero_img` | `hero_img` se guarda con el mismo valor que `cover_img` |
| `position` | Orden en el header |

### `subcategories` — los «submódulos»

| Campo | Notas |
|---|---|
| `id` **PK** | serial |
| `category_id` **FK** | → `categories(id)`, `on update cascade on delete restrict` |
| `label` | |
| `icon` | Mismo `check` cerrado que `categories` |
| `position` | Orden dentro de la categoría |

**`unique (category_id, label)`**: el frontend compara subcategorías por texto
literal, así que no puede haber dos iguales en la misma categoría.

«Todos» **no existe como fila**: el catálogo la agrega siempre por su cuenta.

### `products`

| Campo | Notas |
|---|---|
| `id` **PK** | serial. **No son correlativos**: faltan el 6 y el 8 |
| `price` | `integer`, COP enteros, sin centavos |
| `original_price` | `check (original_price > price)`. **Su sola presencia significa «está en oferta»** |
| `category_id` **FK** | → `categories(id)`, `on delete restrict` |
| `subcategory_id` **FK** | → `subcategories(id)`, `on delete restrict` |
| `features` | `text[]` |
| `badge` | `check` cerrado: `Nuevo`, `Más vendido`, `Oferta` |
| `rating` | `numeric(2,1)`, 0 a 5 |
| `colors` | `text[]`, admite null |
| `is_new` | Redundante con `badge = 'Nuevo'`; el filtro acepta cualquiera de los dos |
| `created_at` | **De acá se deriva `addedDaysAgo`** |

Índices en `category_id` y `subcategory_id`.

### `images` — las imágenes subidas desde el panel

| Campo | Notas |
|---|---|
| `id` **PK** | **Los primeros 32 caracteres del SHA-256 del contenido** |
| `mime`, `bytes` (`bytea`), `size` | |

Se sirven por `GET /api/v1/images/[id]`. Que el id sea el hash tiene dos
consecuencias buscadas: subir dos veces el mismo archivo **no lo duplica**
(`on conflict do nothing`) y la respuesta se puede cachear como inmutable.

> **No hay foreign key desde `products.image`.** Es una ruta de texto, que puede
> apuntar tanto a `/img/…` (archivos estáticos originales) como a
> `/api/v1/images/<id>`. Por eso borrar un producto deja la imagen huérfana.

### `live_events`

| Campo | Notas |
|---|---|
| `id` **PK** | serial |
| `description` | Se expone como **`desc`** en el JSON (`desc` es palabra reservada en SQL) |
| `starts_at` | `timestamptz` |
| `duration_minutes` | `check (> 0)`, por defecto 60 |
| `url` | Stream externo: el sitio redirige, no lo incrusta |
| `viewers`, `position` | |

**`date_label` e `is_live` se eliminaron del esquema.** Ver «Campos derivados».

### `flash_sales` — ofertas relámpago

| Campo | Notas |
|---|---|
| `product_id` **PK y FK** | → `products(id)` **`on delete cascade`**. Que sea PK implica que **un producto admite una sola oferta** |
| `extra_discount` | `check (> 0 and < 100)`. Porcentaje **sobre `price`**, no sobre `original_price` |
| `ends_at` | **De acá se deriva `endsInHours`** |
| `stock` | El **único inventario de todo el sistema**, y solo para estas ofertas |

El `on delete cascade` no es decorativo: sin él, borrar un producto dejaría una
oferta huérfana que revienta `EventosView.tsx`, que hace `products.find(...)!`
antes de comprobar el resultado.

### `hero_tiles` — las cuatro piezas de la portada

| Campo | Notas |
|---|---|
| `slot` **PK** | `check (between 1 and 4)`. **La cantidad es fija** |
| `image`, `alt`, `href` | |

La posición, el tamaño, los brillos y el ritmo de flotación de cada esquina son
**diseño** y viven en la constante `DISENO` de `src/components/home/Hero.tsx`.
La base solo guarda lo que se puede cambiar desde el panel.

### `home_slides` — el carrusel de la portada

| Campo | Notas |
|---|---|
| `id` **PK** | serial. **La cantidad es libre**, al revés que el hero |
| `image` | Foto apaisada, mínimo 1200 px de ancho |
| `headline`, `sub`, `cta_label`, `href` | |
| `position` | |

Con cero diapositivas `ImageCarousel` devuelve `null` y la portada sigue
funcionando sin esa franja.

## Relaciones

```
categories ──1:N──▶ subcategories
     │                   │
     └──────1:N──────▶ products ──1:0..1──▶ flash_sales
                                              (cascade)

live_events · hero_tiles · home_slides · images   ← sin relaciones
```

Todas las FK hacia `categories` y `subcategories` son **`on delete restrict`**:
la base impide borrar una categoría que todavía tenga productos. `repo-admin.ts`
además comprueba antes y lanza un mensaje legible con el conteo y el detalle,
para que el panel no muestre un error de Postgres en crudo.

## Campos derivados (no se almacenan)

Se calculan al leer, en `src/lib/mappers.ts`, para que **no se desfasen con la
caché**: un valor guardado en la base quedaría viejo dentro de una respuesta
cacheada 120 segundos.

| Campo del contrato | Se deriva de | Función |
|---|---|---|
| `Product.addedDaysAgo` | `products.created_at` | `toProduct` |
| `ProductFlash.endsInHours` / `FlashSale.endsInHours` | `flash_sales.ends_at` | `horasRestantes` |
| `LiveEvent.date` | `starts_at` | `etiquetaDeFecha` |
| `LiveEvent.live` | `starts_at` + `duration_minutes` | `toLiveEvent` |

`etiquetaDeFecha` produce «Hoy, 7:00 PM», «Mañana, 8:00 PM», «Viernes, 6:00 PM»
o «18 sep, 6:00 PM», **calculado en hora de Colombia** (`America/Bogota`). El
array `MESES` está escrito a mano porque `Intl` en es-CO devuelve «13 de sept» y
el estilo del sitio es «13 sep».

Colombia no usa horario de verano, así que el desfase es siempre −05:00. Por eso
`fechaDesdeFormulario` puede agregarle `-05:00` a lo que manda un
`datetime-local`, que viaja sin zona.

## Filtrado en la base vs. en memoria

Solo dos cosas se filtran en SQL, y las dos por la misma razón (que lo vencido
desaparezca solo del sitio, sin tarea programada):

- `repo.ts` → `findProducts()`: `left join flash_sales f on … and f.ends_at > now()`
- `repo.ts` → `findEvents()`: `where ends_at > now()`

**Todo lo demás se filtra en memoria.** `getProductsByCategory`,
`getNewProducts`, `getDiscountedProducts` y `getCategoryById` piden la lista
completa y la recorren; la búsqueda, los rangos de precio, el rating y el orden
ocurren en el navegador.

En el panel las ofertas vencidas **sí se listan**, para poder darles una fecha
nueva.

## Migraciones

**No hay herramienta de migraciones.** `db/schema.sql` es un archivo idempotente
que se puede correr las veces que haga falta:

- `create table if not exists` en todas las tablas
- `alter table … add column if not exists` / `drop column if exists` para los
  cambios sobre bases ya creadas
- Las cargas iniciales de `hero_tiles` y `home_slides` usan
  `on conflict do nothing` y `where not exists`

La migración que hay hoy en el archivo elimina `live_events.date_label` e
`is_live`, que pasaron a derivarse. En una base nueva esas sentencias no hacen
nada.

**Para cambiar el esquema:** editá `db/schema.sql` de forma que siga siendo
idempotente y corré `npm run db:setup`. No hay control de versiones de esquema
ni rollback: si un cambio no se puede expresar de forma idempotente, hay que
escribirlo a mano.

## Comandos

```bash
npm run db:setup              # aplica el esquema y carga si la base está vacía
npm run db:setup -- --reset   # borra todo y recarga desde db/seed/*.json
```

El script se ejecuta con `node --env-file=.env.local`, así que lee la conexión
de ahí y no del entorno del shell.

`db/seed/*.json` es una copia exacta de lo que servían los datos falsos
originales. El seed conserva los ids de producto no correlativos y ajusta la
secuencia con `setval`.

## Trampas

- **`pg` devuelve `numeric` como string.** `rating` es `numeric(2,1)`: siempre
  `Number()` al mapear.
- **El slug de una categoría se genera al crearla y NUNCA cambia.** Renombrar
  «Audio y Carga» no altera `/catalogo/audio`. Es a propósito, para no romper
  enlaces ya publicados; con el tiempo el slug puede quedar desalineado del nombre.
- **Renombrar una subcategoría es seguro**: los productos apuntan a su id, no a
  su nombre. Pero como el nombre viaja dentro de cada producto, las acciones de
  categorías tienen que invalidar también la caché de `products`.
- **`Category.heroImg` no lo lee ningún componente.** Sigue en el contrato.
- **Los `check` de `icon` y `badge` son enums cerrados** que existen además en
  TypeScript (`IconKey`, `ProductBadge`). Un valor nuevo rompe el build **y** el
  insert: hay que tocar los dos lados.
