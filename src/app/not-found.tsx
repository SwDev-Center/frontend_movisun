import type { Metadata } from "next";
import Link from "next/link";
import { PRIMARY } from "@/lib/constants";

// Página 404: no debe indexarse ni seguir enlaces desde aquí.
export const metadata: Metadata = {
  title: "Página no encontrada",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="min-h-screen pt-16 bg-white flex items-center justify-center">
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <p className="text-6xl font-extrabold mb-2" style={{ color: PRIMARY }}>
          404
        </p>
        <h1 className="text-2xl font-extrabold text-foreground mb-2">Página no encontrada</h1>
        <p className="text-muted-foreground text-sm mb-6">
          Lo sentimos, la página que buscas no existe o fue movida.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold text-sm hover:opacity-90 transition-opacity"
          style={{ background: PRIMARY }}
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}