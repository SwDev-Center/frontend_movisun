# La API de Movisun

Referencia de los endpoints y de la forma exacta de cada entidad.

La API vive dentro del mismo proyecto Next.js, en `src/app/api/v1/`. La fuente
de verdad de los tipos es **`src/lib/types.ts`**: este documento la describe en
prosa, pero si los dos se contradicen, manda el archivo.

## Regla que no se rompe

Las respuestas tienen que seguir siendo exactamente las que declara
`src/lib/types.ts`. Mientras se cumpla, ninguna página ni componente del sitio
público necesita cambiar cuando se toca la capa de datos.

**Cómo verificarlo:** guardá la respuesta de los cuatro endpoints antes del
cambio, repetila después y compará campo por campo. Es lo que se hizo al migrar
de los datos falsos a PostgreSQL, y detectó las dos únicas diferencias que hubo.

## Convenciones

- JSON plano: **sin envoltura `{ data: … }`**, sin metadatos de paginación.
- **Sin parámetros de consulta.** Cada endpoint devuelve su colección completa;
  el filtrado ocurre después, en el servidor de Next o en el navegador.
- **Sin autenticación.** Son datos públicos, los mismos que muestra el sitio.
- Los campos **opcionales se omiten** cuando no tienen valor. No llegan como
  `null`: directamente no aparece la clave.
- Los precios son **pesos colombianos enteros**, sin decimales ni centavos.

Todas las llamadas salen del servidor de Next, nunca del navegador, así que no
hace falta configurar CORS.

---

## Endpoints

### `GET /api/v1/products`

Devuelve `Product[]`: el catálogo completo, ordenado por id.

No acepta filtros. La selección por categoría, por novedad y por oferta la hacen
las funciones de `src/api/products.ts` sobre la lista ya recibida.

| Campo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `id` | number | sí | Entero. Clave del carrito y referencia desde las ofertas relámpago. |
| `name` | string | sí | Se trunca a 26 caracteres en el aviso de «agregado al carrito». |
| `price` | number | sí | COP enteros. |
| `originalPrice` | number | no | **Su sola presencia significa «está en oferta»**: el producto aparece en `/promociones` y se le calcula el descuento. |
| `category` | string | sí | Coincide con un `Category.id`. |
| `subcategory` | string | sí | Coincide con el `label` de una subcategoría de esa categoría. Se compara por texto literal, tildes incluidas. |
| `description` | string | sí | Solo se muestra en la ficha del producto. |
| `features` | string[] | sí | Viñetas cortas. Entre 1 y 12. |
| `image` | string | sí | Ruta relativa: `/img/…` para las imágenes originales, `/api/v1/images/<id>` para las subidas desde el panel. |
| `badge` | string | no | Solo `"Nuevo"`, `"Más vendido"` u `"Oferta"`. |
| `rating` | number | sí | De 0 a 5, con un decimal. |
| `reviews` | number | sí | Solo el conteo. No existe entidad de reseña. |
| `colors` | string[] | no | Los nombres conocidos llevan muestra de color (ver `COLOR_HEX` en `src/lib/constants.ts`); cualquier otro funciona igual, sin muestra. |
| `isNew` | boolean | sí | Destaca el producto en el carrusel de la portada. |
| `addedDaysAgo` | number | sí | **Derivado**, no almacenado: se calcula desde `products.created_at` en cada respuesta. Es el criterio de orden por novedad. |

### `GET /api/v1/categories`

Devuelve `Category[]`, ordenadas por su posición.

| Campo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `id` | string | sí | Slug de URL: `/catalogo/<id>`. Se genera del nombre al crear la categoría y **no cambia al renombrarla**, para no romper enlaces ya publicados. |
| `label` | string | sí | Es el `<h1>` de la página y el título SEO. |
| `tagline` | string | sí | Antetítulo sobre la portada. |
| `description` | string | sí | Alimenta la meta description y Open Graph. |
| `icon` | string | sí | Uno de: `watch`, `headphones`, `bluetooth`, `battery`, `zap`, `cable`, `speaker`, `radio`. |
| `color` | string | sí | Hex de **6 dígitos**. Se le concatenan `e0` y `90` para el degradado de la portada, así que otro formato rompe el diseño. |
| `coverImg` | string | sí | Portada de la categoría; también su imagen de Open Graph. |
| `heroImg` | string | sí | Está en el tipo y en los datos, pero **ningún componente lo lee**. El panel lo guarda con el mismo valor que `coverImg` y no lo pide por separado. |
| `subcategories` | objeto[] | sí | Cada una con `label` e `icon`. Definen las pastillas de filtro y los grupos del catálogo, y el submenú del header. «Todos» no viene acá: el catálogo lo agrega siempre. |

### `GET /api/v1/advisors`

Devuelve `Advisor[]`. **Todavía no sale de la base**: son datos fijos en
`src/lib/data/advisors.mock.ts`.

| Campo | Tipo | Notas |
|---|---|---|
| `name` | string | Se usa como clave de React en la página de contacto: tiene que ser único. |
| `label` | string | «Ventas» o «Soporte». Los datos estructurados lo inspeccionan: si contiene «venta», se marca como contacto comercial. |
| `phone` | string | 10 dígitos **sin** indicativo. El sitio antepone `+57`. |
| `wa` | string | Con indicativo y **sin** `+` (`573200000001`). Va literal dentro del enlace `wa.me/`. |

> **El orden importa y no hay `id`.** `advisors[0]` es el asesor de ventas: es el
> número que recibe los pedidos del carrito y el del botón flotante de WhatsApp.

### `GET /api/v1/events`

Devuelve un objeto con dos colecciones. Es el único endpoint que no devuelve un
arreglo.

```json
{ "live": [ … ], "flash": [ … ] }
```

**`live[]` — eventos en vivo**

| Campo | Tipo | Notas |
|---|---|---|
| `id` | number | |
| `title`, `desc` | string | También alimentan los datos estructurados del evento. |
| `date` | string | **Derivado**, no almacenado: se calcula de `startsAt` en hora de Colombia y sale como «Hoy, 7:00 PM», «Mañana, 8:00 PM», «Viernes, 6:00 PM» o «18 sep, 6:00 PM». |
| `startsAt` | string | ISO 8601. Solo se usa para los datos estructurados. |
| `url` | string | Enlace externo del stream. El sitio no lo incrusta: redirige. |
| `live` | boolean | **Derivado**, no almacenado: verdadero mientras el momento actual esté entre el inicio del evento y el final de su duración. Cambia el botón entre «Ver ahora» y «Notificarme» por WhatsApp. |
| `image` | string | Ruta relativa. |
| `viewers` | number | Se muestra tal cual; no se actualiza solo. |

**`flash[]` — ofertas relámpago.** Las vencidas **no se incluyen**: desaparecen del sitio al llegar a cero, aunque siguen en el panel para reactivarlas.

| Campo | Tipo | Notas |
|---|---|---|
| `productId` | number | Tiene que existir en `/products`. Un producto admite **una sola** oferta: es la clave primaria de la tabla. |
| `extraDiscount` | number | Porcentaje entero aplicado **sobre `price`**, no sobre `originalPrice`. |
| `endsInHours` | number | **Derivado**, no almacenado: se calcula desde `flash_sales.ends_at`. Admite decimales y nunca es negativo. |
| `stock` | number | El **único** inventario de todo el sistema, y solo para estas ofertas. |

### `GET /api/v1/images/[id]`

Sirve una imagen subida desde el panel, guardada en la tabla `images`.

El `id` es el hash del contenido: si el archivo cambia, cambia la URL. Por eso la
respuesta se cachea como inmutable (`max-age=31536000, immutable`) y subir dos
veces el mismo archivo no lo duplica.

Devuelve los bytes con su `Content-Type` real, o `404` con
`{ "error": "Imagen no encontrada" }`.

---

## Caché

El cliente de `src/api/*` cachea cada endpoint con `next.revalidate`:

| Endpoint | Vida de la caché | ¿Se invalida al guardar en el panel? |
|---|---|---|
| `/products` | 120 s | **Sí**, con `updateTag("products")` |
| `/categories` | 600 s | **Sí**, con `updateTag("categories")` |
| `/advisors` | 600 s | No aplica: no es editable |
| `/events` | 120 s | **Sí**, con `updateTag("events")` |

En Next 16, `revalidateTag` exige dos argumentos y sigue sirviendo contenido
viejo un rato. Para ver lo que uno acaba de escribir, desde una Server Action va
**`updateTag`**, que expira al instante.

## Escrituras

**No hay endpoints REST de escritura.** El panel guarda con Server Actions, que
llaman directamente a `src/lib/repo-admin.ts`.

Si alguna vez hace falta administrar el catálogo desde fuera del sitio —una app
móvil, por ejemplo— habría que exponer esas operaciones como endpoints.

Cada acción que escribe empieza con `await exigirSesion()`. El guardia del layout
protege las pantallas, no las acciones: una acción se puede invocar sin haber
pasado por ellas.
