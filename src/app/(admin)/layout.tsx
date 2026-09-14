import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Plus_Jakarta_Sans } from "next/font/google";
import "../globals.css";

// Layout raíz del panel. Es independiente del de la tienda: acá no hay header,
// footer, carrito ni botón de WhatsApp, y no se consulta /advisors.
// Next permite varios layouts raíz cuando cada uno vive en su grupo de rutas.

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Panel — Movisun Nariño",
  // El panel no debe aparecer en buscadores.
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es-CO" className={plusJakartaSans.variable}>
      <body className="min-h-screen bg-muted antialiased">
        <a href="#panel" className="skip-link">
          Saltar al contenido principal
        </a>
        {children}
      </body>
    </html>
  );
}
