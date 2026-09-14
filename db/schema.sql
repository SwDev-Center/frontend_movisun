-- Esquema de Movisun Nariño.
-- Idempotente: se puede correr varias veces (npm run db:setup).
--
-- Regla que atraviesa todo el archivo: la API pública debe seguir devolviendo
-- exactamente el JSON que declara src/lib/types.ts. Las columnas se nombran en
-- snake_case y se traducen a camelCase en src/lib/mappers.ts.

-- ─── Categorías (los "módulos" del header) ──────────────────────────────────
create table if not exists categories (
  id          text primary key,              -- slug de URL: /catalogo/<id>
  label       text not null,
  tagline     text not null,
  description text not null,
  icon        text not null,                 -- IconKey; validado abajo
  color       text not null,                 -- hex de 6 dígitos: se le concatena e0/90
  cover_img   text not null,
  hero_img    text not null,
  position    integer not null default 0,    -- orden en el header
  created_at  timestamptz not null default now(),
  constraint categories_icon_valido check (
    icon in ('watch','headphones','bluetooth','battery','zap','cable','speaker','radio')
  ),
  constraint categories_color_hex check (color ~ '^#[0-9a-fA-F]{6}$')
);

-- ─── Subcategorías (los "submódulos") ───────────────────────────────────────
create table if not exists subcategories (
  id          serial primary key,
  category_id text not null references categories(id) on update cascade on delete restrict,
  label       text not null,
  icon        text not null,
  position    integer not null default 0,
  constraint subcategories_icon_valido check (
    icon in ('watch','headphones','bluetooth','battery','zap','cable','speaker','radio')
  ),
  -- El frontend compara subcategorías por texto literal: no puede haber dos
  -- iguales dentro de la misma categoría.
  constraint subcategories_label_unico unique (category_id, label)
);

-- ─── Productos ──────────────────────────────────────────────────────────────
create table if not exists products (
  id             serial primary key,
  name           text not null,
  price          integer not null check (price >= 0),      -- COP enteros, sin centavos
  original_price integer check (original_price is null or original_price > price),
  category_id    text not null references categories(id) on update cascade on delete restrict,
  subcategory_id integer not null references subcategories(id) on delete restrict,
  description    text not null,
  features       text[] not null default '{}',
  image          text not null,
  badge          text check (badge is null or badge in ('Nuevo','Más vendido','Oferta')),
  rating         numeric(2,1) not null default 0 check (rating >= 0 and rating <= 5),
  reviews        integer not null default 0 check (reviews >= 0),
  colors         text[],
  is_new         boolean not null default false,
  -- addedDaysAgo se DERIVA de esta fecha al leer, para que no se desfase con la caché.
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists products_category_idx    on products (category_id);
create index if not exists products_subcategory_idx on products (subcategory_id);

-- ─── Imágenes subidas desde el panel ────────────────────────────────────────
-- Se sirven por GET /api/v1/images/[id]. El id es el hash del contenido, así que
-- la respuesta puede cachearse como inmutable y subir dos veces el mismo archivo
-- no lo duplica.
create table if not exists images (
  id         text primary key,
  mime       text not null,
  bytes      bytea not null,
  size       integer not null,
  created_at timestamptz not null default now()
);

-- ─── Eventos en vivo ────────────────────────────────────────────────────────
-- El texto de la fecha ("Hoy, 7:00 PM") y la bandera "en vivo" NO se almacenan:
-- se derivan de starts_at y duration_minutes al leer, en src/lib/mappers.ts.
-- Así "Hoy" nunca miente y el cartel EN VIVO se apaga solo.
create table if not exists live_events (
  id               serial primary key,
  title            text not null,
  description      text not null,            -- se expone como "desc" (palabra reservada en SQL)
  starts_at        timestamptz not null,
  duration_minutes integer not null default 60 check (duration_minutes > 0),
  url              text not null,            -- stream externo
  image            text not null,
  viewers          integer not null default 0 check (viewers >= 0),
  position         integer not null default 0
);

-- Migración para bases creadas antes de que la fecha y el estado se derivaran.
-- Es idempotente: en una base nueva estas tres sentencias no hacen nada.
alter table live_events add column if not exists duration_minutes integer not null default 60;
alter table live_events drop column if exists date_label;
alter table live_events drop column if exists is_live;

-- ─── Ofertas relámpago ──────────────────────────────────────────────────────
-- on delete cascade: borrar un producto borra su oferta. Sin esto, una oferta
-- huérfana revienta EventosView, que hace products.find(...)! antes de comprobar.
create table if not exists flash_sales (
  product_id     integer primary key references products(id) on delete cascade,
  extra_discount integer not null check (extra_discount > 0 and extra_discount < 100),
  -- endsInHours se DERIVA de esta fecha al leer, por el mismo motivo que addedDaysAgo.
  ends_at        timestamptz not null,
  stock          integer not null check (stock >= 0)
);

-- ─── Piezas flotantes del hero (portada) ────────────────────────────────────
-- Exactamente cuatro, una por esquina. Las posiciones, tamaños y animaciones
-- están compuestas a mano en src/components/home/Hero.tsx: acá solo vive lo
-- que se puede cambiar desde el panel.
create table if not exists hero_tiles (
  slot  integer primary key check (slot between 1 and 4),
  image text not null,
  alt   text not null,          -- lo que leen los lectores de pantalla
  href  text not null           -- ruta interna a la que lleva el clic
);

-- Carga inicial con las imágenes que ya tenía la portada, para que el sitio se
-- vea igual apenas se crea la tabla. `do nothing` la hace idempotente.
insert into hero_tiles (slot, image, alt, href) values
  (1, '/img/image-2.png', 'Smartwatch', '/catalogo/smartwatch'),
  (2, '/img/image-3.png', 'Diadema',    '/catalogo/bluetooth'),
  (3, '/img/image-4.png', 'Parlante',   '/catalogo/bluetooth'),
  (4, '/img/image-5.png', 'Audífonos',  '/catalogo/audio')
on conflict (slot) do nothing;

-- ─── Diapositivas del carrusel de la portada ────────────────────────────────
-- A diferencia del hero, acá la cantidad es libre: el carrusel y sus puntos se
-- adaptan a las que haya. Con cero diapositivas la sección no se dibuja.
create table if not exists home_slides (
  id        serial primary key,
  image     text not null,            -- foto apaisada, se recorta a lo ancho
  headline  text not null,
  sub       text not null,
  cta_label text not null,            -- texto del botón
  href      text not null,            -- ruta interna a la que lleva
  position  integer not null default 0
);

-- Carga inicial con las cinco diapositivas que ya tenía la portada. Solo corre
-- si la tabla está vacía, así no duplica nada al reaplicar el esquema.
insert into home_slides (image, headline, sub, cta_label, href, position)
select * from (values
  ('/img/unsplash-watch.jpg',    'Smartwatches de última generación',   'Monitorea tu salud y mantente conectado todo el día.', 'Ver categoría', '/catalogo/smartwatch', 0),
  ('/img/unsplash-tws.jpg',      'Audífonos TWS con cancelación de ruido', 'Sonido inmersivo para cada momento de tu día.',    'Ver categoría', '/catalogo/audio',      1),
  ('/img/unsplash-charging.jpg', 'Carga rápida donde vayas',            'Power banks y cargadores GaN compactos y potentes.',  'Ver categoría', '/catalogo/audio',      2),
  ('/img/unsplash-speakers.jpg', 'Parlantes Bluetooth 360°',            'Lleva la música a cualquier lugar. IPX7 resistente.', 'Ver categoría', '/catalogo/bluetooth',  3),
  ('/img/unsplash-gaming.jpg',   'Diademas Gaming Premium',             'Sonido 7.1, micrófono ANC y RGB personalizable.',     'Ver categoría', '/catalogo/bluetooth',  4)
) as inicial
where not exists (select 1 from home_slides);
