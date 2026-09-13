import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { ShopProvider } from "@/context/ShopContext";
import { getAdvisors } from "@/api/advisors";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Overlays } from "@/components/layout/Overlays";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Movisun Nariño — Tecnología premium en tus manos",
    template: "%s | Movisun Nariño",
  },
  description:
    "Smartwatches, audio premium, cargadores rápidos y accesorios Bluetooth. Pedidos por WhatsApp con entrega en todo Nariño, Colombia.",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const advisors = await getAdvisors();

  return (
    <html lang="es" className={plusJakartaSans.variable}>
      <body className="min-h-screen bg-background antialiased">
        <CartProvider>
          <ShopProvider>
            <Header advisors={advisors} />
            {children}
            <Footer advisors={advisors} />
            <Overlays advisors={advisors} />
          </ShopProvider>
        </CartProvider>
      </body>
    </html>
  );
}