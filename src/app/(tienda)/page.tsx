import { getCategories } from "@/api/categories";
import { getNewProducts } from "@/api/products";
import { getAdvisors } from "@/api/advisors";
import { Hero } from "@/components/home/Hero";
import { ImageCarousel } from "@/components/home/ImageCarousel";
import { CategoryCardsSection } from "@/components/home/CategoryCardsSection";
import { NewProductsCarousel } from "@/components/home/NewProductsCarousel";
import { BrandVideoSection } from "@/components/home/BrandVideoSection";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { CtaSection } from "@/components/home/CtaSection";

export default async function HomePage() {
  const [categories, newProducts, advisors] = await Promise.all([
    getCategories(),
    getNewProducts(),
    getAdvisors(),
  ]);

  // El <main> lo provee el root layout (id="main"); aquí solo se listan
  // las secciones de la home para evitar landmarks anidados.
  return (
    <>
      <Hero />
      <ImageCarousel />
      <CategoryCardsSection categories={categories} />
      <NewProductsCarousel products={newProducts} />
      <BrandVideoSection advisors={advisors} />
      <FeaturesSection />
      <CtaSection advisors={advisors} />
    </>
  );
}