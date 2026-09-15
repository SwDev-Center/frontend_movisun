<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Movisun Nariño

Sitio de catálogo + panel de administración. Next.js 16 App Router, React 19,
Tailwind v4, PostgreSQL.

**El punto de entrada al proyecto es [CLAUDE.md](CLAUDE.md)**, que indica qué
documento de `docs/` leer según lo que vayas a modificar. Este archivo guarda
solo lo propio de esta versión de Next y de React, que es lo que más difiere de
lo que un modelo trae aprendido.

## Next.js 16 / React 19: lo que cambia

- Esta versión de Next difiere de tu entrenamiento — leé la guía en
  `node_modules/next/dist/docs/` antes de escribir código (bloque de arriba).
- **`params` y `searchParams` son promesas** y hay que `await`earlas, también
  dentro de `generateMetadata`. Ver `src/app/(tienda)/catalogo/[categoria]/page.tsx`.
- Next genera tipos globales de rutas en `.next/` (`Routes`, `PageProps<"/...">`,
  `LayoutProps<"/">`); `src/app/(tienda)/layout.tsx` usa `LayoutProps<"/">` sin
  importarlo.
- **Desde una Server Action, para invalidar caché va `updateTag`, no
  `revalidateTag`**: en Next 16 este último exige dos argumentos y sigue
  sirviendo contenido viejo un rato.
- **`notFound()` no cambia el código de estado** si el layout es `force-dynamic`
  y la respuesta ya empezó a salir: devuelve 200 con el 404 pintado encima. Para
  apagar una ruta de verdad hace falta `src/middleware.ts`.
- `eslint` marca `Date.now()` en render (`react-hooks/purity`), pero no
  `new Date()`. En Server Components `force-dynamic`, leer la hora es lo buscado.
- `react-hooks/set-state-in-effect` prohíbe llamar a un `setState` desde un
  `useEffect`. Si hace falta una bandera junto a otro estado, va **dentro** del
  reducer.
- `motion` (ex framer-motion) se importa como `motion/react` y va envuelto en
  `<MotionConfig reducedMotion="user">`.

## Dos layouts raíz

`src/app/` **no tiene `layout.tsx`**. Hay uno en `(tienda)/` y otro en `(admin)/`.
Los grupos entre paréntesis no aparecen en la URL. Por eso el 404 vive en
`(tienda)/not-found.tsx`: un `not-found.tsx` global exigiría la bandera
experimental `globalNotFound`.

## La costura de datos

`src/api/*` (`http.ts` + products/categories/advisors/events/hero/slides) hace
`fetch` a los route handlers de `src/app/api/v1/*`, que leen de PostgreSQL.
**Ya no hay mocks**: `src/lib/data/` se borró.

Esos handlers solo existen en tiempo de petición, así que **todo lo que consuma
`src/api/*` tiene que ser `force-dynamic`**. Ya lo son `(tienda)/layout.tsx` y
`src/app/sitemap.ts`.

## Comandos

- `npm run dev` — servidor de desarrollo en http://localhost:3000
- `npm run lint` — ESLint
- **`npx tsc --noEmit` — control de tipos.** Preferilo a `npm run build`, que
  comparte `.next/` con el servidor de desarrollo y lo rompe si está corriendo.
- `npm run db:setup` — esquema y carga inicial

No existe framework ni suite de pruebas.

## Estilos y accesibilidad

- Tailwind v4 con **configuración en CSS**: los tokens se declaran con
  `@theme inline` en `src/app/globals.css`. No hay `tailwind.config`. Las
  variables propias se usan entre paréntesis: `bg-(--wa-btn)`.
- La accesibilidad (WCAG AA) es un **requisito duro**: enlace de salto, anillos de
  `:focus-visible`, modales con trampa de foco y región viva, respeto por
  `prefers-reduced-motion`. Los botones de WhatsApp usan `#15803D` a propósito,
  porque el verde de marca `#25D366` no alcanza el contraste AA. No lo revirtás.
- Toda la copia, los comentarios y las etiquetas aria van en **español (Colombia)**.
  Los precios se formatean con `fmt()` de `src/lib/utils.ts`.

## Variables de entorno

Copiar `.env.example` → `.env.local` (el segundo está en `.gitignore`).
`DATABASE_URL`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET` y `WHATSAPP_VENTAS` son
obligatorias; `NEXT_PUBLIC_SITE_URL` alimenta sitemap, canonical y Open Graph, y
`API_BASE_URL` (o `VERCEL_URL`) elige el origen de la API. Detalle en el README.
