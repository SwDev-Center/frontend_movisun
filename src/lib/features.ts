/**
 * Interruptores de secciones del sitio público.
 *
 * Están acá y no en la base de datos a propósito: son decisiones de producto
 * que cambian pocas veces y conviene que queden registradas en el historial
 * del código, no escondidas en una fila que alguien tocó sin dejar rastro.
 */

/**
 * Página pública /eventos (eventos en vivo).
 *
 * Apagada por ahora: no se están haciendo transmisiones. Con esto en `false`
 * la ruta responde «página no encontrada», desaparece del menú, del pie de
 * página y del sitemap.
 *
 * **El panel NO se ve afectado**: `/admin/eventos` sigue funcionando, porque de
 * ahí salen las ofertas relámpago, que sí se muestran en /promociones y en el
 * catálogo. Para volver a publicar la página, poner `true`.
 */
export const MOSTRAR_EVENTOS = false;
