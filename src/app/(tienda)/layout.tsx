import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { MotionConfig } from "motion/react";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { ShopProvider } from "@/context/ShopContext";
import { getAdvisors } from "@/api/advisors";
import { AppShell } from "@/components/layout/AppShell";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Overlays } from "@/components/layout/Overlays";
import { JsonLd } from "@/components/ui/JsonLd";
import { SITE_NAME, SITE_URL } from "@/lib/site";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

// Metadata global. El título usa una plantilla para que cada página agregue su
// propio nombre ("%s | Movisun Nariño") y metadataBase convierte las URLs
// relativas de canonical/Open Graph en absolutas.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Tecnología premium en tus manos`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Smartwatches, audio premium, cargadores rápidos y accesorios Bluetooth. Pedidos por WhatsApp con entrega en todo Nariño, Colombia.",
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "es_CO",
    url: "/",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Tecnología premium en tus manos`,
    description:
      "Smartwatches, audio premium, cargadores rápidos y accesorios Bluetooth. Entrega en todo Nariño, Colombia.",
    images: [{ url: "/img/unsplash-watch.jpg", width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Tecnología premium en tus manos`,
    description:
      "Smartwatches, audio premium, cargadores rápidos y accesorios Bluetooth. Entrega en todo Nariño, Colombia.",
    images: ["/img/unsplash-watch.jpg"],
  },
};

// Configuración de la ventana gráfica: color de tema que controla la barra
// del navegador/el marco de la app en móviles.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1A2F5F",
};

// El layout consulta la API en cada petición (getAdvisors), así que todas
// las páginas se renderizan bajo demanda en el servidor.
export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const advisors = await getAdvisors();

  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/img/image.png`,
    description:
      "Tienda de tecnología en Nariño, Colombia: smartwatches, audio premium, cargadores rápidos y accesorios Bluetooth.",
    areaServed: "Nariño, Colombia",
    // Un contactPoint por asesor; el teléfono se deriva del wa (que ya incluye
    // el código de país, p. ej. 573200000001) y se expone como "+573200000001".
    contactPoint: advisors.map((a) => ({
      "@type": "ContactPoint",
      contactType: a.label.toLowerCase().includes("venta") ? "sales" : "customer service",
      telephone: `+${a.wa}`,
      availableLanguage: "Spanish",
    })),
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: "es-CO",
  };

  return (
    <html lang="es-CO" className={plusJakartaSans.variable}>
      <body className="min-h-screen bg-background antialiased">
        {/* Enlace de salto: primero del body para que el usuario de teclado
            pueda ir directo al contenido principal (#main). */}
        <a href="#main" className="skip-link">
          Saltar al contenido principal
        </a>
        {/* Esquemas globales de la marca: aparecen en todas las páginas. */}
        <JsonLd data={[orgSchema, websiteSchema]} />
        <CartProvider>
          <ShopProvider>
            {/* reducedMotion="user" hace que motion/react desactive las
                animaciones de transform/opación cuando el usuario prefiere
                "reducir movimiento" (prefers-reduced-motion). */}
            <MotionConfig reducedMotion="user">
              <AppShell>
                <Header advisors={advisors} />
                <main id="main" tabIndex={-1} className="flex-1">
                  {children}
                </main>
                <Footer advisors={advisors} />
              </AppShell>
              <Overlays advisors={advisors} />
            </MotionConfig>
          </ShopProvider>
        </CartProvider>
      </body>
    </html>
  );
}