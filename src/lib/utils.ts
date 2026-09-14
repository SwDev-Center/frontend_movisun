import type { CartItem, Product } from "@/lib/types";

/** Formats a number as Colombian pesos, e.g. 89900 → "$89.900". */
export function fmt(n: number): string {
  return `$${n.toLocaleString("es-CO")}`;
}

/** Utility for merging conditional class names. */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

/** Discount percentage of a product vs its original price, or null. */
export function discountOf(p: Pick<Product, "price" | "originalPrice">): number | null {
  return p.originalPrice ? Math.round((1 - p.price / p.originalPrice) * 100) : null;
}

/** WhatsApp deep link with an encoded message. */
export function waUrl(wa: string, text: string): string {
  return `https://wa.me/${wa}?text=${encodeURIComponent(text)}`;
}

/** The default "ver catálogo" WhatsApp link. */
export function waGeneralUrl(wa: string): string {
  return waUrl(wa, "Hola Movisun Nariño! Me gustaría ver el catálogo.");
}

/** Builds the order message + WhatsApp checkout link for a cart. */
export function buildOrderUrl(cart: CartItem[], wa: string): string {
  const lines = cart.map(
    (i) =>
      `• ${i.name}${i.selectedColor ? ` (${i.selectedColor})` : ""} x${i.quantity} — ${fmt(i.price * i.quantity)}`
  );
  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const msg = ["Hola Movisun Nariño! Mi pedido:", "", ...lines, "", `*Total: ${fmt(total)}*`, "", "¡Gracias!"].join("\n");
  return waUrl(wa, msg);
}
/** Aplica un porcentaje de descuento a un precio. Una sola fórmula para todo el
 *  sitio: el catálogo, la ficha y la página de eventos deben coincidir. */
export function precioConDescuento(precio: number, descuento: number): number {
  return Math.round(precio * (1 - descuento / 100));
}

/** Precio que realmente se cobra: el de la oferta relámpago si hay una vigente.
 *  El descuento se aplica sobre `price`, no sobre `originalPrice`. */
export function precioFinal(p: Pick<Product, "price" | "flash">): number {
  return p.flash ? precioConDescuento(p.price, p.flash.extraDiscount) : p.price;
}

/** Producto tal como debe entrar al carrito: con el precio de la oferta ya
 *  aplicado, para que el pedido de WhatsApp diga lo mismo que vio la persona. */
export function conPrecioFinal<T extends Product>(p: T): T {
  const precio = precioFinal(p);
  return precio === p.price ? p : { ...p, price: precio };
}
