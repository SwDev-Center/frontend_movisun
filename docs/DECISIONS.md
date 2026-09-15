# Decisiones

Por qué el sistema es así. **No volver a plantear estas discusiones** sin un
motivo nuevo.

Cada entrada dice de dónde sale la justificación. Donde el código no alcanza para
saberlo, se dice explícitamente en vez de inventar una razón.

---

## 1. El backend vive dentro de Next.js

**Decisión:** no hay servidor aparte. La API está en `src/app/api/v1/` y el panel
en `src/app/(admin)/`.

**Por qué:** el proyecto empezó como un frontend con datos falsos servidos por
route handlers locales. Esa costura ya existía, así que reemplazar los datos
falsos por PostgreSQL no obligó a cambiar ninguna página. `src/api/http.ts`
conserva la vía de escape: apuntando `API_BASE_URL` a otro servicio y borrando
`src/app/api/v1/`, el sitio sigue funcionando igual.

---

## 2. PostgreSQL en Supabase, usado solo como Postgres

**Decisión:** Supabase como base gestionada, **sin** su SDK, sin RLS, sin Auth y
sin Storage. Acceso con `pg` y SQL plano.

**Por qué Supabase:** elección explícita del dueño del proyecto («Prefiero
supabase»).

**Por qué solo como Postgres:** no hay usuarios finales ni permisos por fila —
el sitio público es anónimo entero y el panel tiene una sola contraseña. RLS y
Auth resuelven problemas que este sistema no tiene. Evitarlos deja la base
portable a cualquier otro Postgres.

---

## 3. Sin ORM

**Decisión:** SQL plano en `src/lib/repo.ts` y `src/lib/repo-admin.ts`.

**Por qué:** el esquema tiene ocho tablas y las consultas son directas. Se pidió
explícitamente «la manera más simple posible para no complicarnos». Un ORM
agregaría una capa de generación y migraciones para un modelo que cabe en un
archivo `.sql`.

**Lo que cuesta:** hay que acordarse de `Number()` en las columnas `numeric`
(`pg` las devuelve como string) y no existe protección contra un typo en un
nombre de columna hasta que la consulta corre.

---

## 4. Las escrituras son Server Actions, no endpoints REST

**Decisión:** el panel llama a `src/lib/repo-admin.ts` desde Server Actions. La
API expone **solo lecturas**.

**Por qué:** no hay ningún otro consumidor de escritura. Un endpoint REST habría
requerido su propia autenticación, su propia validación de cuerpo y su propio
manejo de errores, duplicando lo que las Server Actions ya traen. Además los
formularios siguen funcionando sin JavaScript.

**Cuándo revisarla:** si alguna vez hay que administrar el catálogo desde fuera
del sitio (una app móvil, por ejemplo), habrá que exponer esas operaciones.

---

## 5. Una contraseña y una cookie firmada, sin tabla de usuarios

**Decisión:** `ADMIN_PASSWORD` + cookie HMAC-SHA256 (`src/lib/auth.ts`).

**Por qué:** hay un solo administrador. Una tabla de usuarios exige registro,
recuperación de contraseña, roles y hash de credenciales — todo para una fila.

**Consecuencias asumidas, visibles en el código:**
- La cookie no guarda datos, solo un vencimiento firmado: sin el secreto no se
  puede fabricar una válida.
- Se comparan digests SHA-256 con `timingSafeEqual` para que el tiempo de
  respuesta no filtre información.
- El freno al ensayo de contraseñas es un **retraso creciente por IP, no un
  bloqueo**, porque un bloqueo se puede usar para dejar afuera al dueño del sitio.
  Vive en memoria del proceso: frena un ataque casero, no uno distribuido.

---

## 6. Dos guardias de sesión, no uno

**Decisión:** `haySesion()` en `(panel)/layout.tsx` **y** `await exigirSesion()`
al principio de cada Server Action que escriba.

**Por qué:** no es redundante. El guardia del layout protege el **renderizado**
de las pantallas; una Server Action se puede invocar directamente sin haber
pasado nunca por ellas. Verificado: sin sesión, la acción responde 500 y no
escribe nada.

---

## 7. No hay stock

**Decisión:** el único campo `stock` de todo el sistema es el de `flash_sales`.

**Por qué:** definido explícitamente por el dueño del proyecto — «esta pagina no
usa stock, simplemente agrega al carrito y cuando quiere comprar le envia un
mensaje de wssp al numero que definimos». No hay pasarela de pago ni inventario
que reservar.

---

## 8. Los campos que dependen del tiempo se derivan, no se guardan

**Decisión:** `addedDaysAgo`, `endsInHours`, `LiveEvent.date` y `LiveEvent.live`
se calculan al leer, en `src/lib/mappers.ts`. Las columnas `date_label` e
`is_live` se **eliminaron** del esquema.

**Por qué:** las respuestas se cachean entre 120 y 600 segundos. Un «Hoy, 7:00 PM»
guardado en la base seguiría diciendo «Hoy» al día siguiente dentro de una
respuesta cacheada, y el cartel EN VIVO no se apagaría solo.

---

## 9. La oferta relámpago viaja dentro del producto

**Decisión:** `Product.flash`, además de la colección `flash` de `/events`.

**Por qué:** corrige un error real. Cuando la oferta existía solo en `/events`,
el catálogo mostraba el precio lleno mientras `/eventos` mostraba el rebajado, y
**el carrito cobraba de más**. Con la oferta dentro del producto, cualquier
pantalla puede calcular el precio correcto sin consultar `/events`.

De ahí se sigue que las acciones de eventos invaliden también la caché de
`products`, y que exista una sola fórmula de precio (`precioFinal` /
`conPrecioFinal` en `src/lib/utils.ts`).

---

## 10. Las imágenes subidas se guardan en PostgreSQL

**Decisión:** tabla `images` (`bytea`), servidas por `/api/v1/images/[id]`.

**Por qué:** evita depender de un servicio de archivos aparte y de sus
credenciales. El id es el **hash SHA-256 del contenido**, lo que da dos
propiedades gratis: subir dos veces el mismo archivo no lo duplica, y la
respuesta se puede cachear como inmutable durante un año.

**Lo que cuesta:** los bytes pasan por la base en cada lectura no cacheada, y
borrar un producto deja su imagen huérfana (`products.image` es texto, no una FK).

---

## 11. Dos layouts raíz en vez de uno

**Decisión:** `(tienda)` y `(admin)`, cada uno con su `html`+`body`.

**Por qué:** el layout de la tienda monta el carrito, el header, el pie, los
overlays y consulta `/advisors` en cada render. El panel no necesita nada de eso,
y además debe llevar `robots: noindex`. Compartir layout habría significado
condicionar media docena de piezas según la ruta.

**Lo que cuesta:** no se puede tener un `not-found.tsx` global sin la bandera
experimental `globalNotFound`, y cruzar de un grupo al otro fuerza una recarga
completa de la página.

---

## 12. Los interruptores de secciones viven en el código, no en la base

**Decisión:** `src/lib/features.ts`.

**Por qué:** está escrito en el propio archivo — son decisiones de producto que
cambian pocas veces y conviene que queden registradas en el historial del código,
no escondidas en una fila que alguien tocó sin dejar rastro.

---

## 13. Hace falta un middleware para apagar una ruta

**Decisión:** `src/middleware.ts` reescribe `/eventos` a `/404`.

**Por qué:** `notFound()` dentro de la página **no alcanza**. El layout de la
tienda es `force-dynamic`, así que la respuesta ya salió con estado 200 y lo
único que se logra es pintar el 404 encima; Google la indexaría igual. El
middleware corta antes de que Next empiece a responder.

---

## 14. Los asesores de WhatsApp no se administran desde el panel

**Decisión:** salen de `WHATSAPP_VENTAS` en `.env.local`, vía
`src/lib/advisors.ts`.

**Por qué:** por ese número entra **cada pedido**. Que se pueda cambiar desde una
pantalla web protegida por una sola contraseña convierte un acceso al panel en un
desvío de todas las ventas.

El número se normaliza al leerlo (`3201234567`, `+57 320 123 4567` y
`573201234567` dan lo mismo) y, si falta o es inválido, se usa `3000000000` de
ejemplo con un aviso por consola en desarrollo, para que un `.env` incompleto no
tumbe el sitio.

---

## 15. Un solo asesor

**Decisión:** `getAdvisors()` devuelve un único elemento (Ventas).

**Por qué:** el de Soporte duplicaba el mismo número en cinco lugares. Sigue
siendo un arreglo porque el contrato declara `Advisor[]` y todas las vistas lo
recorren con `.map`: agregar otro asesor es una línea.

---

## 16. El slug de una categoría nunca cambia

**Decisión:** se genera al crearla y renombrarla no lo altera.

**Por qué:** está documentado en el código — para no romper enlaces ya
publicados. El costo asumido es que el slug puede quedar desalineado del nombre
con el tiempo (`/catalogo/audio` para «Audio y Carga»).

---

## 17. `typedRoutes` se evaluó y se descartó

**Decisión:** queda apagado.

**Por qué:** se midió. Produce **9 errores** con este código, porque el menú es
dinámico (`NavItem.href` es `string`, no un literal) y además no cubre los
parámetros de consulta `?estado=`, que son la otra fuente de rutas mágicas.

---

## 18. TLS sin verificar la CA

**Decisión:** `ssl: { rejectUnauthorized: false }` en `src/lib/db.ts`.

**Por qué:** Supabase firma su certificado con una CA propia que no está en el
almacén del sistema. La línea **no es opcional**: `node-postgres` no activa TLS
por defecto y la URL del pooler no trae `sslmode`, así que sin ella la conexión
viajaría en texto plano. Equivale a `sslmode=require`.

**Cómo endurecerla:** descargar la CA de Supabase y pasarla en la opción `ca`.

---

## 19. El filtrado del catálogo ocurre en el navegador

**Decisión:** `CatalogView` recibe la lista completa y filtra, ordena, busca y
agrupa en memoria.

**Motivo histórico: no documentado.** Lo que sí se puede afirmar del código: el
catálogo es chico (27 productos), la API no acepta parámetros de consulta y así
el filtrado es instantáneo, sin ida y vuelta al servidor. Si el catálogo crece
mucho, es la primera decisión a revisar.

---

## 20. Elección de librerías

| Librería | Para qué | Por qué |
|---|---|---|
| `pg` | PostgreSQL | El cliente estándar de Node. Coherente con la decisión 3 |
| `zod` 4 | Validar formularios | La validación tiene que ser de servidor y tipada; `z.infer` genera los tipos de los datos |
| `motion` | Animación | Ya estaba en el frontend original. **Motivo de la elección: no documentado** |
| `lucide-react` | Iconos | Ya estaba en el frontend original. **Motivo de la elección: no documentado** |
| Tailwind v4 | Estilos | Ya estaba. Se usa la configuración en CSS (`@theme inline`), sin `tailwind.config` |

No hay librería de estado global, ni de formularios, ni de fetching (React Query
o similar): los datos llegan como props desde Server Components y el poco estado
que hay cabe en dos contextos.

---

## Decisiones pendientes

Cosas conocidas, todavía sin resolver:

1. **Centralizar las rutas** en `src/lib/rutas.ts`. Hay 34 rutas literales
   distintas repartidas en 31 archivos. Se pospuso a propósito.
2. **Limpieza de imágenes huérfanas.**
3. **`error.tsx`.** Hoy un 500 en `/advisors` tumba la tienda entera.
4. **El soft 404** de `/catalogo/<inexistente>`.
5. **Un 403 en vez de un 500** cuando una Server Action se invoca sin sesión.
