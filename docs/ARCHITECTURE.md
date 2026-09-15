# Arquitectura

Cómo está armado el sistema y por dónde pasa una petición. Para el detalle de
cada endpoint está [API.md](API.md); para las tablas, [DATABASE.md](DATABASE.md);
para las pantallas, [FRONTEND.md](FRONTEND.md).

## En una frase

Una sola aplicación Next.js 16 que contiene el sitio público, el panel de
administración y la API. No hay servidor aparte: la única pieza externa es
PostgreSQL.

```
Navegador  ──▶  Next.js (App Router)  ──▶  PostgreSQL (Supabase)
                 │
                 ├── (tienda)  sitio público
                 ├── (admin)   panel de administración
                 └── api/v1    endpoints de lectura
```

## Las dos mitades

`src/app/` **no tiene `layout.tsx`**. Hay dos layouts raíz, cada uno en su grupo
de rutas. Next lo permite mientras cada layout viva en un grupo distinto.

| Grupo | Layout raíz | Qué monta |
|---|---|---|
| `(tienda)` | `src/app/(tienda)/layout.tsx` | `html`+`body`, fuentes, `CartProvider`, `ShopProvider`, `MotionConfig`, Header, Footer, Overlays, JSON-LD |
| `(admin)` | `src/app/(admin)/layout.tsx` | `html`+`body`, fuentes. Sin carrito, sin header de tienda, `robots: noindex` |

Los paréntesis **no aparecen en la URL**. Consecuencias prácticas:

- Cruzar de `/admin` a `/` cambia de layout raíz, así que Next hace una **recarga
  completa** en vez de una navegación de cliente.
- **No se puede tener un `not-found.tsx` global** sin la bandera experimental
  `globalNotFound`. Por eso el 404 vive en `src/app/(tienda)/not-found.tsx`.
- `globals.css` se importa como `"../globals.css"` desde cada layout raíz.

`src/app/api/`, `robots.ts`, `sitemap.ts`, `globals.css` y `favicon.ico` quedan
fuera de los dos grupos, en la raíz de `src/app/`.

## Flujo de una petición de lectura

Ejemplo: alguien abre `/catalogo/smartwatch`.

```
1. middleware.ts          ── solo corre en /eventos (matcher). Deja pasar.
2. (tienda)/layout.tsx    ── force-dynamic. Pide asesores y categorías,
                             arma el menú con construirNav().
3. catalogo/[categoria]/page.tsx
                          ── await params; pide categoría y productos.
4. src/api/*.ts           ── httpGet() con next.revalidate + next.tags
5. src/app/api/v1/*/route.ts
                          ── force-dynamic; llama al repositorio
6. src/lib/repo.ts        ── SQL plano
7. src/lib/db.ts          ── pool de pg
8. PostgreSQL
   ↩ vuelta
9. src/lib/mappers.ts     ── fila snake_case → DTO camelCase de types.ts
10. NextResponse.json()
11. CatalogView (cliente) ── filtra, ordena y busca en memoria
```

**El paso 4 es un `fetch` HTTP del servidor a sí mismo.** Es la costura que
permitiría mover la API a otro servicio cambiando `API_BASE_URL` y borrando
`src/app/api/v1/`, sin tocar ninguna página.

Como ese fetch ocurre en tiempo de petición y los route handlers no existen
durante el build, **todo lo que consuma `src/api/*` tiene que ser
`force-dynamic`**. Ya lo son `(tienda)/layout.tsx` y `sitemap.ts`.

## Flujo de una escritura

El panel **no usa endpoints REST**. Escribe con Server Actions:

```
Formulario (componente cliente, useActionState)
   ↓  POST del propio Next
Server Action  ──  src/app/(admin)/admin/(panel)/*/actions.ts
   1. await exigirSesion()          ← obligatorio, siempre primero
   2. validación con zod            ← src/lib/validation.ts
   3. imagen, si hay                ← src/lib/imagenes.ts → guardarImagen()
   4. escritura                     ← src/lib/repo-admin.ts (SQL plano)
   5. updateTag("...")              ← invalida la caché del sitio público
   6. redirect("...?estado=...")
```

Los formularios funcionan **sin JavaScript**: React deja campos ocultos
(`$ACTION_ID_*`) para que el navegador pueda enviar el formulario por sí solo.

### Qué invalida qué

| Acción | Etiquetas que refresca | Por qué |
|---|---|---|
| `productos/actions.ts` | `products` | |
| `categorias/actions.ts` | `categories` + `products` | el nombre de la subcategoría viaja dentro de cada producto |
| `eventos/actions.ts` | `events` + `products` | la oferta relámpago viaja dentro del producto (`Product.flash`) |
| `inicio/actions.ts` | `hero` o `slides` | |

> En Next 16 `revalidateTag` exige dos argumentos y sigue sirviendo contenido
> viejo un rato. Desde una Server Action el que sirve para leer lo recién
> escrito es **`updateTag`**.

## Responsabilidad de cada módulo

| Carpeta / archivo | Responsabilidad |
|---|---|
| `src/lib/types.ts` | **El contrato.** Fuente de verdad de la forma de los datos |
| `src/lib/db.ts` | Pool de `pg`, `query()` y `transaction()` |
| `src/lib/repo.ts` | SQL de lectura del sitio público |
| `src/lib/repo-admin.ts` | SQL de lectura y escritura del panel |
| `src/lib/mappers.ts` | Fila de la base → DTO, y los campos derivados |
| `src/lib/validation.ts` | Esquemas zod de todos los formularios |
| `src/lib/imagenes.ts` | Reglas de subida (formato, peso, transparencia, medidas) |
| `src/lib/auth.ts` | Sesión del panel |
| `src/lib/nav.ts` | Arma el menú mezclando categorías + páginas fijas |
| `src/lib/features.ts` | Interruptores de secciones |
| `src/lib/advisors.ts` | Números de WhatsApp desde variables de entorno |
| `src/lib/utils.ts` | Formato COP, enlaces de WhatsApp, fórmula de precio final |
| `src/api/*` | Cliente HTTP con la política de caché de cada endpoint |
| `src/app/api/v1/*` | Endpoints de lectura |
| `src/components/*` | Interfaz. Ver [FRONTEND.md](FRONTEND.md) |

**La regla de capas:** un route handler nunca escribe SQL, un repositorio nunca
devuelve filas crudas, un componente nunca habla con la base.

## Middleware

`src/middleware.ts` es diminuto y tiene un solo trabajo, con `matcher: "/eventos"`:
reescribir esa ruta a `/404` mientras `MOSTRAR_EVENTOS` sea `false`.

Existe porque **`notFound()` no alcanza**: el layout de la tienda es
`force-dynamic`, así que cuando la página decide devolver 404 la respuesta ya
salió con estado **200** y lo único que se logra es pintar el 404 encima. Google
la indexaría igual. El middleware corta antes de que Next empiece a responder.

Es el mismo motivo por el que `/catalogo/<inexistente>` responde 200 (ver
«Limitaciones conocidas»).

## Autenticación y autorización

Solo el panel tiene sesión. El sitio público es anónimo entero.

- **Una contraseña, sin tabla de usuarios**: `ADMIN_PASSWORD`.
- **Cookie firmada** (`movisun_admin`) con HMAC-SHA256 y `ADMIN_SESSION_SECRET`.
  No guarda datos: solo un vencimiento firmado. Sin el secreto no se puede
  fabricar una válida. Dura 7 días.
- La cookie es `httpOnly`, `sameSite: lax`, y `secure` en producción.
- Las comparaciones usan `timingSafeEqual` sobre digests SHA-256, para que el
  tiempo de respuesta no filtre información.
- **Freno al ensayo de contraseñas**: retraso creciente por IP (hasta 2 s) dentro
  de una ventana de 15 minutos. No bloquea la cuenta a propósito, porque un
  bloqueo sirve para dejar afuera al dueño del sitio. Vive en memoria del
  proceso: frena un ataque casero, no uno distribuido.

Dos guardias, y hacen falta los dos:

| Guardia | Dónde | Qué protege |
|---|---|---|
| `haySesion()` → `redirect` | `(panel)/layout.tsx` | El **renderizado** de las pantallas |
| `await exigirSesion()` | Primera línea de **cada** Server Action | La **escritura** |

El segundo no es redundante: una Server Action se puede invocar directamente sin
haber pasado nunca por la pantalla. Hoy `exigirSesion()` lanza una excepción, que
Next traduce a **500** (un 403 sería más prolijo).

El parámetro `?next=` del login se filtra con `destinoSeguro()`, que solo acepta
rutas que empiecen con `/admin`, para evitar redirecciones abiertas.

## Integraciones externas

| Servicio | Para qué | Dónde |
|---|---|---|
| **PostgreSQL / Supabase** | Toda la persistencia. Solo como Postgres gestionado: sin SDK, sin RLS | `src/lib/db.ts` |
| **WhatsApp** (`wa.me`) | Cierre de pedidos y contacto. No hay pasarela de pago | `src/lib/utils.ts`, `src/lib/advisors.ts` |
| **YouTube** (iframe) | Video de marca y modal de presentación | `BrandVideoSection.tsx`, `VideoModal.tsx` |
| **Google Fonts** | Plus Jakarta Sans, vía `next/font/google` | Los dos layouts raíz |

No hay analítica, ni pasarela de pago, ni servicio de correo, ni almacenamiento
de archivos externo: **las imágenes subidas viven en la propia base de datos**.

### Conexión a la base

Se usa el **pooler de Supabase en modo transacción (puerto 6543)**, no la
conexión directa, que suele ser solo IPv6 y falla en muchas redes.

`src/lib/db.ts` fija `ssl: { rejectUnauthorized: false }` explícitamente. **No es
decorativo**: `node-postgres` no activa TLS por defecto y la URL del pooler no
trae `sslmode`, así que sin esa línea la conexión viajaría en texto plano. Cifra
pero no verifica la CA, que es el equivalente a `sslmode=require`.

El pool se cachea en `globalThis` porque Next reinicia los módulos en cada
recompilación en desarrollo y, sin eso, cada cambio de archivo abriría un pool
nuevo hasta agotar las conexiones.

## Caché

| Endpoint | `revalidate` | Etiqueta |
|---|---|---|
| `/api/v1/products` | 120 s | `products` |
| `/api/v1/events` | 120 s | `events` |
| `/api/v1/categories` | 600 s | `categories` |
| `/api/v1/hero` | 600 s | `hero` |
| `/api/v1/slides` | 600 s | `slides` |
| `/api/v1/advisors` | 600 s | — (no es editable) |
| `/api/v1/images/[id]` | inmutable, 1 año | — (el id es el hash del contenido) |

## Limitaciones conocidas

Están acá para que nadie las vuelva a descubrir desde cero:

- **No existe `error.tsx` ni `global-error.tsx`.** `(tienda)/layout.tsx` llama a
  `getAdvisors()` en cada render: un 500 ahí tumba la tienda entera. El panel no
  depende de ese endpoint.
- **Soft 404 preexistente:** `/catalogo/<inexistente>` responde **200** con el
  `<title>` de la home, aunque pinte el 404. Verificado en el commit `081e946`,
  antes de que existiera el backend. Misma causa que el middleware de `/eventos`.
- **Imágenes huérfanas:** borrar un producto, categoría o evento no borra su fila
  en `images`. No hay limpieza automática.
- **Sin validación de las respuestas en runtime.** `httpGet` hace
  `res.json() as Promise<T>`: el tipo se asume, no se comprueba.
- **Las rutas no están centralizadas.** Hay 34 rutas literales distintas
  repartidas en 31 archivos, y los `?estado=creado` son palabras mágicas
  compartidas entre acciones y páginas. `typedRoutes: true` se evaluó y **se descartó**: produce 9
  errores porque el menú es dinámico (`NavItem.href` es `string`, no literal) y
  además no cubre los parámetros de consulta.
- **`EventosView.tsx` hace `products.find(...)!`** antes de la guarda `if (!product)`.
  El `on delete cascade` de `flash_sales` evita ofertas huérfanas, pero el código
  sigue siendo frágil.
