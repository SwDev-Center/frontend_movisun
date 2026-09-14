# Movisun Nariño

Sitio público y panel de administración de Movisun Nariño, tienda de accesorios
tecnológicos en Nariño, Colombia.

El sitio no tiene inventario ni pasarela de pago: el visitante arma un carrito y
el pedido se cierra por WhatsApp, con el mensaje ya redactado.

**Next.js 16 · React 19 · Tailwind v4 · PostgreSQL**

---

## Requisitos

- **Node.js 20.9 o superior** — lo exige Next 16, y `npm run db:setup` usa
  `node --env-file`, disponible desde la 20.6. Desarrollado sobre la 22.16.
- Una base **PostgreSQL**. En desarrollo usamos Supabase con su plan gratuito.

## Puesta en marcha

```bash
npm install
cp .env.example .env.local   # completá los valores (abajo)
npm run db:setup             # crea las tablas y carga el catálogo inicial
npm run dev                  # http://localhost:3000
```

El paso `db:setup` deja la base con el mismo catálogo con el que arrancó el
proyecto: 25 productos, 3 categorías y sus 14 subcategorías, 3 eventos y
3 ofertas relámpago. Si la base ya tiene datos, no toca nada.

Para borrar todo y volver a cargar desde cero:

```bash
npm run db:setup -- --reset
```

## Variables de entorno

Van en `.env.local`, que **no se versiona**. `.env.example` documenta cada una.

| Variable | Para qué sirve |
|---|---|
| `DATABASE_URL` | Conexión a PostgreSQL. En Supabase, usá la cadena del **pooler en modo Transaction** (puerto `6543`), no la conexión directa: la directa suele ser solo IPv6 y falla en muchas redes. |
| `ADMIN_PASSWORD` | Contraseña única de acceso a `/admin`. No hay tabla de usuarios. |
| `ADMIN_SESSION_SECRET` | Secreto para firmar la cookie de sesión. Generalo con `openssl rand -hex 32`. |
| `NEXT_PUBLIC_SITE_URL` | URL pública del sitio. Alimenta el sitemap, las URL canónicas y Open Graph. |

> **Nunca** le pongas el prefijo `NEXT_PUBLIC_` a un secreto: con ese prefijo
> Next lo incrusta en el JavaScript que se descarga el navegador.

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo en http://localhost:3000 |
| `npm run build` | Compilación de producción. **También es el control de tipos**: no hay script `typecheck` aparte. |
| `npm run start` | Sirve la compilación de producción |
| `npm run lint` | ESLint |
| `npm run db:setup` | Crea las tablas y carga el catálogo inicial si la base está vacía |
| `npm run db:setup -- --reset` | Vacía las tablas y recarga desde `db/seed/*.json`. No borra las imágenes subidas. |
| `npx tsc --noEmit` | Control de tipos sin tocar `.next/`. Usalo si tenés `npm run dev` corriendo: `npm run build` comparte esa carpeta y le rompe la sesión. |

No hay framework de pruebas: la verificación es el control de tipos más pruebas
manuales sobre el servidor de desarrollo.

## Panel de administración

Entrá a **`/admin`** con la contraseña de `ADMIN_PASSWORD`. La sesión dura 7 días
en una cookie firmada, `httpOnly`.

Hoy se puede administrar:

- **Productos** — crear, editar y eliminar, con subida de imagen.
- **Categorías y subcategorías** — son el menú del sitio: crear, editar,
  reordenar y eliminar. Lo que cambies acá se ve en el header y en el pie de
  página al instante.

Los cambios aparecen en el sitio público de inmediato: al guardar se invalida la
caché correspondiente.

No se puede eliminar una categoría o subcategoría que tenga productos: el panel
lo explica y no borra nada. La dirección de una categoría (`/catalogo/algo`) se
genera al crearla y no cambia si después la renombrás, para no romper enlaces
que alguien ya haya compartido.

- **Eventos y ofertas relámpago** — programar eventos en vivo y ofertas por
  tiempo limitado. El cartel rojo EN VIVO se enciende y se apaga solo según la
  hora de inicio y la duración que cargues, y las ofertas vencidas desaparecen
  del sitio sin que tengas que hacer nada.

Lo único que todavía no se administra desde el panel son los asesores de
WhatsApp, que siguen fijos en el código.

## Cómo está armado

La API vive **dentro de este mismo proyecto**, en `src/app/api/v1/`. No hay un
servidor aparte. Las páginas nunca consultan la base directamente: pasan por
`src/api/*`, que hace HTTP contra esos endpoints.

```
src/app/(tienda)/    el sitio público
src/app/(admin)/     el panel; tiene su propio layout raíz, sin carrito ni header de tienda
src/app/api/v1/      la API
src/lib/             tipos, conexión, consultas, validación, sesión
db/                  esquema SQL y carga inicial
```

Los grupos entre paréntesis son una convención de Next: **no aparecen en la URL**.

El detalle de los endpoints y de cada entidad está en
**[docs/api.md](docs/api.md)**. Las decisiones de arquitectura y las trampas
conocidas del código, en **[CLAUDE.md](CLAUDE.md)**.

## Accesibilidad

El cumplimiento de WCAG AA es un requisito, no un extra: enlace de salto, anillos
de foco visibles, modales con trampa de foco, y respeto por
`prefers-reduced-motion`. Los botones de WhatsApp usan `#15803D` a propósito: el
verde de marca `#25D366` no alcanza el contraste mínimo con texto blanco.

Toda la interfaz, los comentarios del código y las etiquetas `aria` están en
español de Colombia.
