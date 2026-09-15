@AGENTS.md

---

# Movisun Nariño

Sitio de catálogo y panel de administración para una tienda de accesorios de
tecnología en Nariño, Colombia.

**Cómo funciona el negocio:** el visitante navega el catálogo, arma un carrito y
**cierra el pedido por WhatsApp**. No hay pasarela de pago, no hay cuentas de
usuario y **no hay stock** (el único `stock` del sistema es el de las ofertas
relámpago). El dueño administra productos, el menú, la portada y las ofertas
desde `/admin`.

Este archivo es el **mapa**. El detalle está en `docs/`.

## Stack

| | |
|---|---|
| Framework | **Next.js 16** (App Router) + **React 19** |
| Lenguaje | TypeScript, alias `@/*` → `./src/*` |
| Estilos | **Tailwind v4**, configuración en CSS (`@theme inline`), sin `tailwind.config` |
| Base de datos | **PostgreSQL** en Supabase, con `pg` y SQL plano (**sin ORM**) |
| Validación | **zod 4** |
| Animación | `motion` (ex framer-motion), importado como `motion/react` |
| Iconos | `lucide-react` |

No hay framework de pruebas ni suite de tests.

## Comandos

```bash
npm run dev                   # servidor de desarrollo en :3000
npm run lint                  # ESLint
npx tsc --noEmit              # control de tipos SIN tocar .next
npm run build                 # build de producción (también valida tipos)

npm run db:setup              # crea las tablas y carga el catálogo si la base está vacía
npm run db:setup -- --reset   # borra todo y recarga desde db/seed/*.json
```

> **Para verificar tipos usá `npx tsc --noEmit`, no `npm run build`.** El build
> comparte `.next/` con el servidor de desarrollo: si hay uno corriendo, lo rompe.

Variables de entorno: copiar `.env.example` → `.env.local`. Los valores reales van
**solo** en `.env.local`, que está en `.gitignore`. Ver el README.

## Qué documento leer según lo que vayas a tocar

| Vas a modificar… | Leé primero |
|---|---|
| Un endpoint, o la forma de una respuesta | **[docs/API.md](docs/API.md)** |
| El flujo de datos, la caché, el middleware, la sesión | **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** |
| Tablas, columnas, consultas SQL, el seed | **[docs/DATABASE.md](docs/DATABASE.md)** |
| Páginas, componentes, estado, formularios, estilos | **[docs/FRONTEND.md](docs/FRONTEND.md)** |
| Algo cuyo «por qué» no entendés | **[docs/DECISIONS.md](docs/DECISIONS.md)** |
| Puesta en marcha, variables de entorno, uso del panel | [README.md](README.md) |

**Antes de proponer un cambio de arquitectura, leé `docs/DECISIONS.md`.** Ahí
está lo que ya se decidió y por qué, para no volver a discutirlo.

## Estructura

```
src/
├─ app/
│  ├─ (tienda)/          sitio público    ← layout raíz propio
│  ├─ (admin)/           panel            ← layout raíz propio
│  │  ├─ admin/login/       público
│  │  └─ admin/(panel)/     exige sesión
│  ├─ api/v1/            endpoints de lectura
│  ├─ globals.css, robots.ts, sitemap.ts
├─ api/                  cliente HTTP + política de caché
├─ components/           tienda, panel y piezas reutilizables
├─ context/              CartContext, ShopContext
├─ hooks/
├─ lib/                  contrato, base de datos, repositorios, validación, auth
└─ middleware.ts
db/                      schema.sql + seed
docs/                    esta documentación
```

**`src/app/` no tiene `layout.tsx`**: hay dos layouts raíz, uno por grupo. Los
paréntesis no aparecen en la URL. Ver `docs/ARCHITECTURE.md`.

## Mapa rápido de archivos

| Necesitás… | Está en |
|---|---|
| **El contrato de datos (fuente de verdad)** | `src/lib/types.ts` |
| Esquema de la base | `db/schema.sql` |
| Conexión a Postgres | `src/lib/db.ts` |
| Consultas de lectura del sitio | `src/lib/repo.ts` |
| Lecturas y escrituras del panel | `src/lib/repo-admin.ts` |
| Fila de la base → DTO, y campos derivados | `src/lib/mappers.ts` |
| Cliente HTTP del frontend | `src/api/http.ts` |
| Esquemas de validación (zod) | `src/lib/validation.ts` |
| Subida de imágenes | `src/lib/imagenes.ts` |
| Sesión del panel | `src/lib/auth.ts` |
| Acciones del panel | `src/app/(admin)/admin/(panel)/*/actions.ts` |
| Construcción del menú | `src/lib/nav.ts` |
| Interruptores de secciones | `src/lib/features.ts` |
| Número de WhatsApp | `src/lib/advisors.ts` |
| Formato COP, enlaces de WhatsApp, precio final | `src/lib/utils.ts` |
| Paleta y constantes de diseño | `src/lib/constants.ts` |
| Filtrado del catálogo (en cliente) | `src/components/catalog/CatalogView.tsx` |
| Carrito | `src/context/CartContext.tsx` |

## Convenciones

- **Todo en español (Colombia)**: copia de la interfaz, comentarios del código,
  etiquetas `aria`, mensajes de error y nombres de funciones nuevas en `lib/`.
- **Columnas en `snake_case`, contrato en `camelCase`.** La traducción vive solo
  en `src/lib/mappers.ts`.
- **Precios en pesos colombianos enteros**, sin centavos. Se formatean con `fmt()`.
- **Los campos opcionales se omiten**, no llegan como `null`.
- Componentes de servidor por defecto; `"use client"` solo donde hace falta.
- La accesibilidad (WCAG AA) es un **requisito duro**, no un extra.

## Reglas para un agente de IA

1. **Preguntá antes de hacer algo que no se pidió.** No amplíes el alcance por tu
   cuenta. Se avanza por fases y se verifica cada una antes de seguir.
2. **No rompas el contrato.** La respuesta de cada endpoint tiene que seguir
   siendo exactamente la que declara `src/lib/types.ts`. Mientras se cumpla,
   ninguna página del sitio público necesita cambiar.
3. **Toda Server Action que escriba empieza con `await exigirSesion()`.** El
   guardia del layout protege las pantallas, no las acciones.
4. **Después de escribir, invalidá la caché** con `updateTag(...)`, no con
   `revalidateTag`. Mirá qué etiquetas corresponden en `docs/ARCHITECTURE.md`.
5. **Nada de `localStorage` durante el render**: provoca errores de hidratación.
   Estado inicial neutro y lectura en un `useEffect`.
6. **Ningún secreto lleva el prefijo `NEXT_PUBLIC_`.** Con ese prefijo Next lo
   incrusta en el JavaScript que baja al navegador.
7. **Una sola fórmula para el precio**: `precioFinal` / `conPrecioFinal` de
   `src/lib/utils.ts`. Nunca recalcular el descuento a mano.
8. **No inventes valores de `IconKey` ni de `ProductBadge`**: son enums cerrados,
   validados también por un `check` en la base. Hay que tocar los dos lados.
9. **No agregues stock.** Fue una decisión explícita del dueño del proyecto.
10. **Verificá antes de afirmar.** Correr `npx tsc --noEmit` y `npm run lint`, y
    probar contra el servidor de desarrollo si está levantado.
11. **Nunca mates el servidor de desarrollo del usuario.** Si el puerto 3000 está
    ocupado, probablemente sea suyo: reusalo.

## Estado actual

Las cinco fases de construcción están **hechas**: esquema y endpoints, sesión del
panel, productos, categorías/menú, y eventos/ofertas. El sitio público ya no usa
datos falsos — `src/lib/data/` se borró y **no queda ningún mock**.

**`/eventos` está apagada** (`MOSTRAR_EVENTOS = false` en `src/lib/features.ts`).
El panel no se ve afectado: de `/admin/eventos` salen las ofertas relámpago, que
sí se muestran en el catálogo y en `/promociones`.

Pendientes conocidos, por orden de valor: centralizar las rutas, limpiar imágenes
huérfanas, agregar `error.tsx`, arreglar el soft 404 de `/catalogo/<inexistente>`
y devolver 403 en vez de 500 cuando falta sesión. El detalle de cada uno está al
final de `docs/DECISIONS.md` y en «Limitaciones conocidas» de
`docs/ARCHITECTURE.md`.

## Documentation Maintenance

**La documentación se actualiza en el mismo cambio que la provoca, no después.**
Si un cambio deja un documento desactualizado, el cambio no está terminado.

| Si tu cambio… | Actualizá |
|---|---|
| Agrega, modifica o elimina un endpoint, o cambia la forma de una respuesta | `docs/API.md` |
| Cambia el flujo de datos, la caché, el middleware, la sesión o una integración externa | `docs/ARCHITECTURE.md` |
| Toca `db/schema.sql`, agrega una tabla o columna, o cambia una consulta importante | `docs/DATABASE.md` |
| Agrega o quita una ruta, cambia el estado global, los formularios o las reglas de imágenes | `docs/FRONTEND.md` |
| Toma una decisión de arquitectura, o revierte una que está registrada | `docs/DECISIONS.md` |
| Agrega un comando, una variable de entorno o cambia la puesta en marcha | `README.md` **y** la sección «Comandos» de acá |
| Cambia `src/lib/types.ts` | `docs/API.md` (el contrato) y, si corresponde, `docs/DATABASE.md` |
| Enciende o apaga una sección en `src/lib/features.ts` | «Estado actual» de acá y `docs/FRONTEND.md` |

Reglas al escribir documentación en este proyecto:

- **Describí lo que hay, no lo que debería haber.** Si algo está a medias o mal,
  documentalo como está y anotalo en los pendientes.
- **No inventes justificaciones.** Si no podés deducir el motivo de una decisión
  del código o de la documentación existente, escribí exactamente:
  `Motivo histórico: no documentado.`
- **No dupliques.** Cada hecho vive en un solo documento; los demás enlazan.
  Este archivo es índice y contexto general, no referencia exhaustiva.
- **Usá rutas de archivo reales**, para que se pueda ir directo a la implementación.
- **No pegues bloques largos de código**: referenciá el archivo.
