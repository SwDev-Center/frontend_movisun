@AGENTS.md

---

> `AGENTS.md` (importado arriba) cubre comandos, arquitectura general,
> especificidades de Next.js 16 / React 19, estilos y accesibilidad.
> **No repitas eso aquí.** Este archivo guarda el contexto que costó derivar
> leyendo el código y las decisiones ya tomadas, para no volver a preguntarlas.

# Estado del proyecto

Se está construyendo el backend y un panel de administración. El sitio público
ya **no** usa datos falsos: lee de PostgreSQL.

| Fase | Qué incluye | Estado |
|---|---|---|
| 1 | Esquema, conexión, carga inicial, los 4 endpoints leyendo de Postgres | **Hecha** |
| 2 | Login y sesión de administrador | **Hecha** |
| 3 | Productos: crear, editar, eliminar, subir imágenes | **Hecha** |
| 4 | Categorías y subcategorías + header dinámico | **Hecha** |
| 5 | Eventos en vivo y ofertas relámpago | **Hecha** |

**Fuera de alcance por ahora:** el asesor de WhatsApp no se edita desde el
panel. Sale de `WHATSAPP_VENTAS` en `.env.local`, a través de
`src/lib/advisors.ts`. **Ya no queda ningún mock**: `src/lib/data/` se borró.
**Hay UN solo asesor (Ventas).** El de Soporte se eliminó: duplicaba el mismo
número en la portada, el pie, el menú móvil, /distribuidores/contacto y el
JSON-LD. `getAdvisors()` sigue devolviendo un arreglo porque el contrato es
`Advisor[]` y todas las vistas lo recorren con `.map`.

**La página pública `/eventos` está APAGADA** con `MOSTRAR_EVENTOS = false` en
`src/lib/features.ts`. Para volver a publicarla, poner `true`: vuelve al menú,
al pie de página y al sitemap, y deja de dar 404. **El panel no se ve afectado**:
`/admin/eventos` sigue funcionando porque de ahí salen las ofertas relámpago,
que sí se muestran en el catálogo y en /promociones.

## Estado: las cinco fases están hechas

El panel administra productos, categorías/subcategorías (el menú) y eventos/ofertas.
Lo que queda pendiente, por orden de valor:

1. **Centralizar las rutas** (`src/lib/rutas.ts`). Hoy hay ~41 rutas escritas a
   mano en 22 archivos y los `?estado=creado` son palabras mágicas compartidas
   entre acciones y páginas. Se pospuso a propósito.
   **`typedRoutes: true` se evaluó y se descartó**: da 9 errores porque nuestro
   menú es dinámico (`NavItem.href` es `string`, no literal) y no cubre los
   `?estado=`.
2. **Asesor de WhatsApp editable.** Hoy sale de una variable de entorno, no del panel.
3. **Limpieza de imágenes huérfanas.** Borrar un producto, categoría o evento no
   borra su fila en `images`.
4. **`error.tsx`.** No existe: un 500 en `/advisors` tumba la tienda entera.
5. **El soft 404** de `/catalogo/<inexistente>` (preexistente, ver más abajo).

## Cómo trabaja el usuario

- Pregunta antes de hacer cosas que no pidió explícitamente. No amplíes el alcance.
- Avanza por fases y se verifica cada una antes de seguir.
- Copy, comentarios y etiquetas aria en español (Colombia).

# Decisiones ya tomadas (no volver a plantearlas)

| Tema | Decisión |
|---|---|
| Backend | **Dentro de Next.js**, en `src/app/api/v1/`. No hay servidor aparte. |
| Base de datos | **PostgreSQL en Supabase** (solo como Postgres gestionado: sin SDK de Supabase, sin RLS). |
| Acceso a datos | **`pg` con SQL plano**, sin ORM. Esquema en `db/schema.sql`. |
| Imágenes subidas | **Guardadas en Postgres** (tabla `images`), servidas por `/api/v1/images/[id]`. |
| Escrituras del panel | **Server Actions**, no endpoints REST. |
| Autenticación | **Contraseña única en variable de entorno** + cookie de sesión firmada. Sin tabla de usuarios. |
| Header | **Se deriva de las categorías.** Promociones, Eventos y Distribuidores siguen fijos en el código. |
| Stock | **No existe y no va a existir.** Se agrega al carrito y se cierra el pedido por WhatsApp. El único `stock` es el de las ofertas relámpago. |

# Comandos propios del proyecto

```
npm run db:setup              # crea las tablas y carga el catálogo si la base está vacía
npm run db:setup -- --reset   # borra todo y recarga desde db/seed/*.json
npx tsc --noEmit              # control de tipos SIN tocar .next (no rompe un dev server activo)
```

`npm run build` también valida tipos, pero comparte `.next/` con `next dev`:
si hay un servidor de desarrollo corriendo, usá `tsc --noEmit`.

# Mapa rápido

| Necesitas… | Está en |
|---|---|
| Contrato de datos (fuente de verdad) | `src/lib/types.ts` |
| Esquema de la base | `db/schema.sql` |
| Carga inicial | `db/seed.mjs` + `db/seed/*.json` |
| Conexión a Postgres | `src/lib/db.ts` |
| Fila de la base → DTO del contrato | `src/lib/mappers.ts` |
| Consultas de lectura (SQL) | `src/lib/repo.ts` |
| Endpoints públicos | `src/app/api/v1/*/route.ts` |
| Cliente HTTP del frontend | `src/api/http.ts` |
| Formato COP, links de WhatsApp, checkout | `src/lib/utils.ts` |
| Paleta, verdes AA de WhatsApp, hex de colores | `src/lib/constants.ts` |
| Filtrado/orden/búsqueda del catálogo (en cliente) | `src/components/catalog/CatalogView.tsx` |
| Carrito (Context + localStorage) | `src/context/CartContext.tsx` |
| Sesión del panel | `src/lib/auth.ts` |
| Acciones del panel (login/logout) | `src/app/(admin)/admin/actions.ts` |
| Lecturas y escrituras del panel (SQL) | `src/lib/repo-admin.ts` |
| Validación de formularios (zod) | `src/lib/validation.ts` |
| Acciones de productos | `src/app/(admin)/admin/(panel)/productos/actions.ts` |
| Acciones de categorías | `src/app/(admin)/admin/(panel)/categorias/actions.ts` |
| Acciones de eventos y ofertas | `src/app/(admin)/admin/(panel)/eventos/actions.ts` |
| Construcción del menú del sitio | `src/lib/nav.ts` |
| Interruptores de secciones | `src/lib/features.ts` |
| Número de WhatsApp | `src/lib/advisors.ts` |
| Acciones de la portada | `src/app/(admin)/admin/(panel)/inicio/actions.ts` |
| Subida de imágenes (común) | `src/lib/imagenes.ts` |

# Estructura de rutas: dos layouts raíz

`src/app/` **no tiene `layout.tsx`**. Hay dos layouts raíz, cada uno en su grupo:

```
src/app/(tienda)/layout.tsx          ← html+body, fuentes, Cart/Shop, Header, Footer, Overlays
src/app/(tienda)/…                     page, catalogo, promociones, eventos, distribuidores,
                                       loading.tsx, not-found.tsx
src/app/(admin)/layout.tsx           ← html+body, fuentes. Sin carrito ni header de tienda.
src/app/(admin)/admin/login/…        ← público (fuera del guardia)
src/app/(admin)/admin/(panel)/…      ← exige sesión; el guardia está en su layout
src/app/api/, robots.ts, sitemap.ts, globals.css, favicon.ico  ← quedan en la raíz
```

Los grupos entre paréntesis **no aparecen en la URL**: las rutas públicas no cambiaron.
`globals.css` se importa como `"../globals.css"` desde cada layout raíz.

**Un `not-found.tsx` global no es posible** con dos layouts raíz sin activar la
bandera experimental `globalNotFound`. Por eso el 404 vive en `(tienda)/`.

# El contrato de la API

Cuatro GET, JSON plano, **sin envoltura `{data}`, sin paginación, sin query params**.
Todas las llamadas salen del servidor de Next, nunca del navegador (no hace falta CORS).

| Endpoint | Devuelve | `revalidate` | Origen |
|---|---|---|---|
| `GET /api/v1/products` | `Product[]` (catálogo completo) | 120 s | Postgres |
| `GET /api/v1/categories` | `Category[]` | 600 s | Postgres |
| `GET /api/v1/advisors` | `Advisor[]` (hoy 1 elemento) | 600 s | variable de entorno |
| `GET /api/v1/events` | `{ live, flash }` | 120 s | Postgres |
| `GET /api/v1/hero` | `HeroTile[]` (4 piezas) | 600 s | Postgres |
| `GET /api/v1/slides` | `HomeSlide[]` (carrusel) | 600 s | Postgres |

**Regla que no se rompe:** la respuesta debe seguir siendo exactamente la que
declara `src/lib/types.ts`. Mientras se cumpla, ninguna página ni componente
del sitio público necesita cambiar.

Para verificar después de tocar la capa de datos: guardar la respuesta de los
cuatro endpoints antes y después, y compararlas campo por campo.

# Invariantes y trampas

- **`advisors[0]` es el asesor de ventas, por posición.** No hay `id`. El botón
  flotante, el checkout y `getSalesAdvisor()` dependen del orden del arreglo,
  que fija `getAdvisors()` en `src/lib/advisors.ts`. Hoy es el único elemento.
  La tarjeta de `/distribuidores/contacto` se centra sola cuando hay uno solo.
- **El número se normaliza al leerlo.** `3201234567`, `+57 320 123 4567` y
  `573201234567` dan el mismo resultado. Si no es un celular colombiano válido
  (10 dígitos empezando por 3) se usa `3000000000` de ejemplo y se avisa por
  consola en desarrollo, para que el sitio no se caiga por un `.env` incompleto.
- **`Advisor.phone`** son 10 dígitos sin indicativo (el front antepone `+57`);
  **`Advisor.wa`** lleva indicativo y sin `+` (`573200000001`), va literal en `wa.me/`.
- **`(tienda)/layout.tsx` es `force-dynamic` y llama a `getAdvisors()` en cada
  render.** Un 500 ahí tumba la tienda entera: **no existe `error.tsx` ni
  `global-error.tsx`**. El panel no depende de ese endpoint.
- **`addedDaysAgo` y `endsInHours` NO se almacenan.** Se derivan de `products.created_at`
  y `flash_sales.ends_at` en `src/lib/mappers.ts`, para que no se desfasen con la caché.
- **`rating` es `numeric` y `pg` lo devuelve como string.** Siempre `Number()` al mapear.
- **El filtrado vive en memoria, no en el servidor.** `getProductsByCategory`,
  `getNewProducts`, `getDiscountedProducts` y `getCategoryById` piden la lista
  completa y la recorren. Búsqueda, rangos de precio, rating y orden, en el navegador.
- **El menú se arma en `src/lib/nav.ts`.** `construirNav(categories)` mezcla las
  categorías de la base con `NAV_FIJOS` (Promociones, Eventos, Distribuidores,
  que no son categorías). `(tienda)/layout.tsx` lo calcula y lo baja como prop a
  `Header` (componente de cliente) y las categorías a `Footer`.
  **El nombre que se ve en el menú es el `label` de la categoría**: no hay nombre
  corto aparte, así que el header dice «Bluetooth y Parlantes», no «Bluetooth».
- **El slug de una categoría se genera al crearla y NUNCA cambia.** Renombrar
  «Audio y Carga» no altera `/catalogo/audio`: es a propósito, para no romper
  enlaces ya publicados. Puede quedar desalineado del nombre con el tiempo.
- **Renombrar una subcategoría es seguro.** Los productos apuntan a su id, no a
  su nombre, así que `Product.subcategory` pasa a devolver el nombre nuevo solo.
  Por eso las acciones de categorías invalidan **las dos** cachés.
- **`Category.heroImg` se guarda con el mismo valor que `coverImg`.** Sigue en el
  contrato pero nadie lo lee, así que el panel no lo pide por separado.
- **Caché: `products` ya se invalida al instante.** El fetch de
  `src/api/products.ts` lleva `tags: ["products"]` y las acciones del panel
  llaman a `updateTag("products")`. En Next 16 `revalidateTag` exige dos
  argumentos y no sirve para leer lo recién escrito: desde una Server Action va
  `updateTag`. **Los tres endpoints editables están etiquetados**: `products`,
  `categories` y `events`. Las acciones de categorías refrescan `products`
  además, porque el nombre de la subcategoría viaja dentro de cada producto.
- **El límite de cuerpo de las Server Actions es 1 MB por defecto.** Está subido
  a 6 MB en `next.config.ts` para permitir imágenes de hasta 5 MB (el máximo que
  valida `src/lib/validation.ts`); el resto es el margen que agrega multipart.
- **`EventosView.tsx` hace `products.find(...)!`** antes de la guarda `if (!product)`.
  El `on delete cascade` de `flash_sales` evita que queden ofertas huérfanas, pero
  el código sigue siendo frágil.
- **`LiveEvent.date` y `LiveEvent.live` NO se almacenan**: se derivan de
  `starts_at` y `duration_minutes` en `src/lib/mappers.ts`. El texto («Hoy, 7:00 PM»,
  «Mañana», el día de la semana, o «18 sep») se calcula en hora de Colombia, y el
  cartel EN VIVO se apaga solo al terminar la duración. Las columnas `date_label`
  e `is_live` se eliminaron del esquema.
- **Las ofertas relámpago vencidas se ocultan del sitio** (`where ends_at > now()`
  en `src/lib/repo.ts`), pero siguen listadas en el panel para reactivarlas.
- **La oferta relámpago viaja DENTRO del producto** (`Product.flash`), no solo en
  `/events`. Sin eso el catálogo mostraba el precio lleno mientras `/eventos`
  mostraba el rebajado, y el carrito cobraba de más. `findProducts` hace
  `left join flash_sales ... and f.ends_at > now()`.
  **Una sola fórmula para el precio**: `precioConDescuento` y `precioFinal` en
  `src/lib/utils.ts`; `conPrecioFinal` es lo que se manda al carrito.
  Por eso las acciones de eventos invalidan `products` además de `events`.
- **`/promociones` lista todo lo rebajado**: `originalPrice` **o** una oferta
  relámpago vigente (`getDiscountedProducts` en `src/api/products.ts`).
- **Para apagar una ruta de verdad hace falta `src/middleware.ts`.** `notFound()`
  dentro de una página de la tienda devuelve **200** con el 404 pintado encima,
  porque el layout es `force-dynamic` y la respuesta ya salió. El middleware la
  reescribe a una ruta inexistente antes de responder, y ahí sí es un 404 con su
  código. Es el mismo motivo del soft 404 de `/catalogo/<inexistente>`.
- **Un producto admite una sola oferta relámpago**: `flash_sales.product_id` es
  la clave primaria. El desplegable de alta solo ofrece productos sin oferta.
- **Las fechas del panel se interpretan como hora de Colombia.** Un
  `datetime-local` manda la hora sin zona; `fechaDesdeFormulario` le agrega
  `-05:00`, que es constante porque el país no usa horario de verano.
- **`eslint` marca `Date.now()` en render** (`react-hooks/purity`), pero no
  `new Date()`. En Server Components `force-dynamic` leer la hora es lo buscado.
- **Nada de `localStorage` durante el render.** El servidor no lo tiene, así que
  leerlo ahí hace que el primer render del cliente no coincida con el HTML y
  React tira un error de hidratación. `CartProvider` arranca en `ESTADO_INICIAL`
  (vacío, igual que el servidor) y lee lo guardado en un `useEffect`, con la
  bandera `hidratado` DENTRO del estado del reducer: así los ítems y la bandera
  cambian en el mismo commit y el efecto que persiste nunca llega a pisar el
  carrito con el `[]` inicial. El mismo patrón está en `useHeaderScroll`.
  `react-hooks/set-state-in-effect` prohíbe resolverlo con un `useState` aparte.
- **El síntoma aparece lejos de la causa.** El error de hidratación se veía en la
  insignia del carrito de `Header.tsx`, pero `count` es solo un consumidor:
  también lo usan `FloatingWhatsApp` (donde cambia hasta el `href`) y
  `CartDrawer`. Parchear la vista con un `isMounted` mueve el error, no lo cura.
- **Los ids de producto no son correlativos** (faltan el 6 y el 8; van del 1 al 27).
  El seed los conserva y ajusta la secuencia con `setval`.
- **`originalPrice` presente = "está en oferta".** No hay bandera aparte.
  `isNew` es redundante con `badge === "Nuevo"`: el filtro acepta cualquiera.
- **`IconKey` y `ProductBadge` son enums cerrados**, validados también por `check`
  en la base. Un valor nuevo rompe el build y el insert.
- **`Category.color` debe ser hex de 6 dígitos** — se le concatenan `e0` y `90`
  para el degradado. **`Category.heroImg` no lo consume nadie.**
- **`Product.subcategory` se compara por texto literal** contra el `label` de la
  subcategoría, con tildes incluidas.
- **No hay validación de las respuestas en runtime.** `httpGet` hace
  `res.json() as Promise<T>`: el tipo se asume, no se comprueba.
- **El guardia de `(panel)/layout.tsx` solo protege el renderizado.** Cada Server
  Action que escriba tiene que empezar con `await exigirSesion()`: una acción se
  puede invocar sin pasar por esa pantalla. Verificado: sin sesión responde 500 y
  no escribe nada. (Un 403 sería más prolijo; hoy una acción que lanza da 500.)
- **Las imágenes borradas quedan huérfanas.** Eliminar un producto no borra su
  fila en `images`. No hay limpieza automática todavía.
- **El id de una imagen es el hash de su contenido**, así que subir el mismo
  archivo dos veces no lo duplica y su URL puede cachearse para siempre.
- **Bug preexistente, no introducido por el backend:** `/catalogo/<inexistente>`
  devuelve **HTTP 200** en vez de 404 y con el `<title>` de la home, aunque
  renderiza el 404. Es un "soft 404" que perjudica el SEO. Verificado: pasa igual
  en el commit 081e946, antes de tocar nada. Sin arreglar, fuera de alcance.

# La portada (hero)

- **Cuatro piezas fijas**, una por esquina, en la tabla `hero_tiles` (`slot` 1-4
  como clave primaria). No se pueden agregar ni quitar: la posición, el tamaño,
  los brillos y el ritmo de flotación están compuestos a mano en la constante
  `DISENO` de `src/components/home/Hero.tsx`. Eso es diseño; la base solo guarda
  imagen, texto alternativo y destino.
- **Solo se ven en pantallas ≥ 1280 px** (`hidden xl:block`). En celular la
  portada muestra únicamente el bloque central.
- **La imagen tiene que tener fondo transparente.** `resolverImagenHero` en
  `src/lib/imagenes.ts` rechaza JPG (no admite alfa) y también un PNG opaco:
  `pngSinTransparencia` lee el tipo de color del IHDR. Con WebP y AVIF se confía
  en la previsualización, que reproduce el recuadro real del hero.
- **El destino es una ruta interna libre**, validada con una expresión regular
  que exige empezar con `/`. El panel sugiere las rutas reales con un `datalist`,
  pero no las impone: escribir una que no existe lleva a un 404. Vale igual para
  las diapositivas del carrusel.

## El carrusel

- **Cantidad libre** (tabla `home_slides`, ordenadas por `position`). Con una
  sola no rota ni muestra flechas; con ninguna, `ImageCarousel` devuelve `null`
  y la portada sigue funcionando sin esa franja.
- **Las reglas de imagen son las OPUESTAS a las del hero**: acá son fotos de
  fondo a todo el ancho, así que el JPG es lo adecuado y la transparencia no
  sirve de nada. `resolverImagenSlide` rechaza las fotos **paradas** (alto >
  ancho, se perdería casi todo al recortar) y las de menos de `ANCHO_MIN_SLIDE`
  (1200 px, se verían borrosas). `dimensionesDeImagen` lee la cabecera de PNG y
  JPEG; con WebP y AVIF no mide y deja pasar.
- **El texto del botón y el destino son editables**, así que el carrusel puede
  anunciar Promociones y no solo categorías.

# Seguridad

- **`DATABASE_URL` nunca lleva el prefijo `NEXT_PUBLIC_`.** Con ese prefijo Next
  la incrusta en el JavaScript del navegador. Lo mismo para cualquier secreto.
- **La conexión a Supabase usa `rejectUnauthorized: false`** (`src/lib/db.ts`):
  cifra el tráfico pero **no verifica el certificado**, porque Supabase lo firma
  con una CA propia. Equivale a `sslmode=require`. Para verificación completa hay
  que descargar la CA de Supabase y pasarla en la opción `ca`.
- `.gitignore` cubre `.env*` salvo `.env.example`. Los secretos van en `.env.local`.
