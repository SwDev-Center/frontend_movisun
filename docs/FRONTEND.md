# Frontend

Pantallas, estado y estilos. La estructura de layouts raíz y el flujo de datos
están en [ARCHITECTURE.md](ARCHITECTURE.md).

## Rutas

### Sitio público — `src/app/(tienda)/`

| Ruta | Archivo | Notas |
|---|---|---|
| `/` | `page.tsx` | Siete secciones; pide sus datos en un solo `Promise.all` |
| `/catalogo/[categoria]` | `catalogo/[categoria]/page.tsx` | Acepta `?sub=<label>` para preseleccionar el filtro |
| `/promociones` | `promociones/page.tsx` | Todo lo rebajado: `originalPrice` **o** oferta relámpago vigente |
| `/eventos` | `eventos/page.tsx` | **Apagada**: ver «Secciones apagadas» |
| `/distribuidores` | `distribuidores/page.tsx` | |
| `/distribuidores/contacto` | `distribuidores/contacto/page.tsx` | |
| 404 | `not-found.tsx` | `robots: noindex` |
| carga | `loading.tsx` | Esqueleto con `animate-pulse motion-reduce:animate-none` |

### Panel — `src/app/(admin)/`

| Ruta | Archivo | Sesión |
|---|---|---|
| `/admin/login` | `admin/login/page.tsx` | **Pública**, fuera del guardia |
| `/admin` | `admin/(panel)/page.tsx` | Resumen con los conteos de `contarTodo()` |
| `/admin/inicio` | `admin/(panel)/inicio/page.tsx` | Hero (4 piezas) y carrusel |
| `/admin/productos` + `/nuevo` + `/[id]` | `admin/(panel)/productos/` | |
| `/admin/categorias` + `/nueva` + `/[id]` | `admin/(panel)/categorias/` | El `[id]` administra también sus subcategorías |
| `/admin/eventos` + `/nuevo` + `/[id]` | `admin/(panel)/eventos/` | Eventos **y** ofertas relámpago |

El grupo `(panel)` es el que exige sesión, desde su `layout.tsx`.

## Manejo de estado

Solo hay **dos contextos**, ambos montados en `(tienda)/layout.tsx`. El panel no
usa ninguno.

### `CartContext` — `src/context/CartContext.tsx`

`useReducer` + persistencia en `localStorage` (clave `movisun.cart.v1`, versionada
para poder ignorar carritos viejos en el futuro).

Expone `items`, `count`, `total`, `addItem`, `updateQty`, `removeItem`.

> **Nada de `localStorage` durante el render.** El servidor no lo tiene, así que
> leerlo ahí provoca un error de hidratación. El estado arranca en
> `ESTADO_INICIAL` (vacío, igual que el servidor) y lo guardado se lee en un
> `useEffect`. La bandera `hidratado` vive **dentro del estado del reducer**: así
> los ítems y la bandera cambian en el mismo commit y el efecto que persiste
> nunca llega a pisar el carrito con el `[]` inicial. Un `useState` aparte no
> sirve, porque `react-hooks/set-state-in-effect` prohíbe llamar a un setState
> desde un efecto.

`src/hooks/useCart.ts` es solo un reexport de `useCart` del contexto.

### `ShopContext` — `src/context/ShopContext.tsx`

Estado de interfaz: qué overlay está abierto (`cartOpen`, `selectedProduct`,
`videoOpen`) y el aviso de «agregado al carrito» (`toast`).

`addToCart` envuelve a `addItem` del carrito y además muestra el aviso, que se
apaga solo a los 2400 ms.

**No hay librería de estado global** (Redux, Zustand, etc.) ni estado de servidor
en el cliente: los datos llegan como props desde Server Components.

## Comunicación con la API

Todas las llamadas salen **del servidor de Next**, nunca del navegador, así que
no hace falta CORS. El navegador solo pide las imágenes.

```
Server Component  →  src/api/*.ts  →  src/api/http.ts (httpGet)  →  /api/v1/*
```

`httpGet` fija `next: { revalidate, tags }` y **no valida la respuesta**: hace
`res.json() as Promise<T>`. Lanza `ApiError` si el estado no es 2xx.

Las funciones derivadas (`getProductById`, `getProductsByCategory`,
`getNewProducts`, `getDiscountedProducts`, `getCategoryById`) piden la colección
completa y la filtran en memoria.

## Formularios

Todos los del panel siguen el mismo patrón, con **`useActionState`**:

```tsx
const [estado, accion, enviando] = useActionState<EstadoFormulario, FormData>(accionDelServidor, {});
```

- El componente es `"use client"` solo para poder mostrar el error y deshabilitar
  el botón mientras `enviando` sea verdadero.
- `EstadoFormulario` lleva `{ error?: string }`. En `inicio/actions.ts` lleva
  además `slot` y `slideId`, porque **esa página tiene varios formularios a la
  vez** y cada uno debe mostrar solo su propio error.
- La validación real es de servidor, con zod (`src/lib/validation.ts`).
  `primerError()` reduce el `ZodError` a un mensaje legible.
- **Funcionan sin JavaScript.** React deja campos ocultos (`$ACTION_ID_*`) para
  que el navegador pueda enviar el formulario por sí solo.
- Las acciones sin formulario (borrar, reordenar) devuelven el error por la URL,
  con `volverConError()` → `?error=<mensaje>`.
- Tras guardar, la acción redirige con `?estado=creado|editado|borrado|…`, que la
  página lee para mostrar el aviso de éxito. **Son palabras mágicas compartidas
  entre la acción y la página**, sin constantes.

### Subida de imágenes

El formulario manda `multipart/form-data`. El límite de cuerpo de las Server
Actions es 1 MB por defecto y está subido a **6 MB** en `next.config.ts`, para
permitir imágenes de hasta 5 MB (`TAMANO_MAX_IMAGEN`) más lo que agrega multipart.

Las reglas están en `src/lib/imagenes.ts` y son **distintas según el destino**:

| Función | Formatos | Regla extra |
|---|---|---|
| `resolverImagen` | JPG, PNG, WebP, AVIF | Solo peso |
| `resolverImagenHero` | PNG, WebP, AVIF | **Rechaza JPG** (no admite alfa) y también un PNG opaco, leyendo el tipo de color del IHDR |
| `resolverImagenSlide` | JPG, PNG, WebP, AVIF | Rechaza fotos **paradas** (alto > ancho) y de menos de 1200 px de ancho |

Las reglas del hero y las del carrusel son **opuestas a propósito**: el hero son
recortes que flotan sobre un degradado azul y necesitan transparencia; el
carrusel son fotos a todo el ancho, donde el JPG es lo adecuado y la
transparencia no sirve de nada.

Con WebP y AVIF no se mide nada: se confía en la previsualización, que reproduce
el recuadro real donde va a caer la imagen.

Si el formulario no trae archivo nuevo, se conserva la ruta actual: así editar un
producto sin tocar la imagen no la borra.

## Autenticación desde el frontend

No hay estado de sesión en el cliente. La cookie es `httpOnly`, así que el
JavaScript de la página **no puede leerla**.

- `/admin/login` es un formulario con Server Action (`entrar`).
- Si la contraseña falla, redirige a `?error=1` y el mensaje **nunca** dice si
  estuvo cerca ni cuántos intentos quedan.
- El botón «Salir» es un `<form action={salir}>`, no un enlace: cerrar sesión
  cambia estado del servidor y no debe poder dispararse con un GET.

## Estilos

**Tailwind v4 con configuración en CSS**: no hay `tailwind.config`. Los tokens se
declaran con `@theme inline` en `src/app/globals.css`, de donde salen utilidades
como `bg-background`, `text-muted-foreground` y `border-border`.

Las variables CSS propias se usan con sintaxis entre paréntesis:
`bg-(--wa-btn)`, `hover:bg-(--wa-btn-hover)`.

`src/lib/constants.ts` guarda lo que se aplica con `style={{}}` en vez de clases:
`PRIMARY` (`#1A2F5F`), `HERO_BG`, `EASE`, `COLOR_HEX` y los ids de los videos.

**Animación:** `motion` (ex framer-motion), importado como `motion/react` y
envuelto en `<MotionConfig reducedMotion="user">`.

**Iconos:** `lucide-react`. `src/components/ui/categoryIcons.ts` mapea cada
`IconKey` a su componente — el contrato guarda la clave, nunca el componente.

## Accesibilidad

Es un requisito duro (WCAG AA), no un extra. Al modificar componentes hay que
mantener:

- Enlace de salto (`.skip-link`) como primer elemento del `body`, en **ambos**
  layouts raíz.
- Anillos de `:focus-visible` visibles.
- Modales con trampa de foco (`src/hooks/useFocusTrap.ts`) y región viva.
- `AppShell` marca el contenido de fondo como `inert` cuando hay un overlay
  abierto, para que no reciba foco ni lo lean los lectores de pantalla (WCAG 2.1.2).
- `prefers-reduced-motion` respetado, vía `usePrefersReducedMotion` y
  `motion-reduce:` de Tailwind. El carrusel **no avanza solo** si el usuario lo
  pide (WCAG 2.2.2), y tampoco mientras tenga el mouse encima o el foco dentro.
- **Los botones de WhatsApp usan `#15803D`, no el verde de marca `#25D366`**, que
  no alcanza el contraste AA. No revertir.
- Toda la copia, los comentarios y las etiquetas aria van en **español (Colombia)**.

## Componentes reutilizables

| Componente | Para qué |
|---|---|
| `ui/ProductCard.tsx` | Tarjeta de producto. Aplica la fórmula de precio final y muestra el descuento relámpago |
| `ui/ProductModal.tsx` | Ficha completa con selección de color y cantidad |
| `ui/CartDrawer.tsx` | Carrito lateral y botón de cierre del pedido por WhatsApp |
| `ui/ProductImage.tsx` | Envoltura de `next/image` |
| `ui/Countdown.tsx` + `hooks/useCountdown.ts` | Cuenta regresiva de las ofertas relámpago |
| `ui/Badge.tsx`, `ui/Stars.tsx`, `ui/WaIcon.tsx` | Piezas pequeñas |
| `ui/Reveal.tsx` | Aparición al hacer scroll |
| `ui/Toast.tsx` | Aviso de «agregado al carrito» |
| `ui/JsonLd.tsx` | Inyecta datos estructurados |
| `admin/BotonBorrar.tsx`, `admin/BotonConfirmar.tsx` | Confirmación antes de una acción destructiva |

## Vistas grandes

- **`catalog/CatalogView.tsx`** (~366 líneas) es la pieza más compleja del sitio.
  Cliente. Concentra **todo** el filtrado: subcategoría, búsqueda, rango de
  precio, rating mínimo, solo-ofertas y seis criterios de orden, más el
  agrupamiento por subcategoría. Todo en un `useMemo` sobre la lista completa que
  llega por props: **no hay ninguna petición al servidor al filtrar**.
- **`eventos/EventosView.tsx`** y **`promociones/PromocionesView.tsx`** son las
  otras dos vistas con estado propio.

## Precios: una sola fórmula

Vive en `src/lib/utils.ts` y **no debe duplicarse**:

- `precioConDescuento(precio, descuento)`
- `precioFinal(producto)` — aplica `flash.extraDiscount` sobre `price` si la
  oferta está vigente
- `conPrecioFinal(producto)` — **es lo que hay que mandar al carrito**

La oferta relámpago viaja **dentro del producto** (`Product.flash`). Antes solo
existía en `/events`, y el resultado era que el catálogo mostraba el precio lleno
mientras `/eventos` mostraba el rebajado, y **el carrito cobraba de más**.

## Secciones apagadas

`src/lib/features.ts` tiene los interruptores. Hoy:

```ts
export const MOSTRAR_EVENTOS = false;
```

Con eso en `false`, `/eventos` desaparece del menú (`NAV_FIJOS` en `src/lib/nav.ts`),
del pie de página y del sitemap, y responde 404 de verdad gracias a
`src/middleware.ts`.

**El panel no se ve afectado**: `/admin/eventos` sigue funcionando, porque de ahí
salen las ofertas relámpago, que sí se muestran en el catálogo y en `/promociones`.

Para volver a publicarla, poner `true`. No hace falta tocar nada más.

## El menú

Se arma en `src/lib/nav.ts`: `construirNav(categories)` mezcla las categorías de
la base con `NAV_FIJOS` (Promociones, Eventos, Distribuidores, que no son
categorías). `(tienda)/layout.tsx` lo calcula y lo baja como prop a `Header`
(componente de cliente) y las categorías a `Footer`.

**El nombre que se ve en el menú es el `label` de la categoría**: no hay nombre
corto aparte, así que el header dice «Bluetooth y Parlantes», no «Bluetooth».

Las subcategorías enlazan a `/catalogo/<id>?sub=<label>`, que es lo que lee
`CatalogView` para preseleccionar el filtro.

## La portada

- **Cuatro piezas fijas** en el hero, una por esquina. La composición está en la
  constante `DISENO` de `src/components/home/Hero.tsx`; la base solo guarda
  imagen, texto alternativo y destino. **Solo se ven en pantallas ≥ 1280 px**
  (`hidden xl:block`): en celular la portada muestra únicamente el bloque central.
- **El carrusel admite cualquier cantidad.** Con una sola diapositiva no rota ni
  muestra flechas; con ninguna, `ImageCarousel` devuelve `null`.
- **El destino de ambos es una ruta interna libre**, validada con una expresión
  regular que exige empezar con `/`. El panel sugiere las rutas reales con un
  `datalist` (`rutasSugeridas()`), pero no las impone: escribir una que no existe
  lleva a un 404.
- `BrandVideoSection` («La tecnología que mereces») **no tiene controles a la
  vista**: el video es decorativo y siempre va en silencio (`mute=1`). Solo se
  pausa, vía la JSAPI de YouTube, si el usuario pide reducir el movimiento.
