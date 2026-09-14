<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Movisun frontend

Public marketing/catalog site for Movisun Nariño, a tech-accessories store in Nariño, Colombia. Next.js 16 App Router + React 19 + Tailwind v4.

## Commands

- `npm run dev` — dev server on http://localhost:3000
- `npm run lint` — ESLint only (`eslint-config-next` core-web-vitals + typescript)
- `npm run build` — production build; this is the typecheck gate — there is **no** separate `typecheck` script, `next build` runs TypeScript

No test framework or suite exists.

## Architecture

- All source lives under `src/`; path alias `@/*` → `./src/*`.
- Server Components by default; interactive pieces opt in with `"use client"` (every `context/`, `hooks/`, and the `layout/`, `home/`, `catalog/`, `eventos/`, `promociones/`, `ui/` components).
- Data seam: `src/api/*` (`http.ts` + products/categories/advisors/events) fetches local mock route handlers `src/app/api/v1/*`, which serve `src/lib/data/*.mock.ts` with ~200 ms artificial latency so `loading.tsx` skeletons actually render. To switch to the real API: set `API_BASE_URL` and delete `src/app/api/v1/` — no page/component changes required.
- Mock route handlers only exist at request time, so anything that fetches them at build time must be `force-dynamic`: `src/app/layout.tsx` and `src/app/sitemap.ts` already are. Don't statically prerender new pages that fetch through `src/api/*`.

## Next.js 16 / React 19 specifics

- This Next version differs from older training data — read the guide in `node_modules/next/dist/docs/` before writing code (block above).
- `params` and `searchParams` are Promises and must be `await`ed — including inside `generateMetadata` (see `src/app/catalogo/[categoria]/page.tsx`).
- Next generates global, typed-route types in `.next/` (e.g. `Routes`, `PageProps<"/...">`, `LayoutProps<"/">`); `src/app/layout.tsx` uses `LayoutProps<"/">` with no import.
- Motion (ex-framer-motion) is imported as `motion/react` and wrapped in `MotionConfig reducedMotion="user"`.

## Styling & a11y

- Tailwind v4, **CSS-first config**: tokens are defined via `@theme inline` in `src/app/globals.css` (e.g. `bg-background`, `text-muted-foreground`); there is no `tailwind.config` file. Custom CSS vars use parenthesized syntax, e.g. `bg-(--wa-btn)`.
- Accessibility (WCAG AA) is a hard requirement: skip link, `:focus-visible` rings, modals with focus trap + live region, `prefers-reduced-motion` handling. WhatsApp buttons deliberately use `#15803D` because brand green `#25D366` fails AA contrast. Don't regress these.
- All UI copy, code comments, and aria labels are in Spanish (Colombia); new content must match. Prices use `fmt()` from `src/lib/utils.ts` (COP, es-CO locale).

## Env

Copy `.env.example` → `.env.local`. `NEXT_PUBLIC_SITE_URL` drives sitemap/canonical/Open Graph URLs; `API_BASE_URL` (or `VERCEL_URL`) selects the API endpoint.