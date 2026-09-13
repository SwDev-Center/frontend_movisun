import { getDiscountedProducts } from "@/api/products";
import { PromocionesView } from "@/components/promociones/PromocionesView";

export default async function PromocionesPage() {
  const products = await getDiscountedProducts();
  return <PromocionesView products={products} />;
}