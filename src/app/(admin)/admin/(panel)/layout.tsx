import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LogOut, ExternalLink } from "lucide-react";
import { PRIMARY } from "@/lib/constants";
import { haySesion } from "@/lib/auth";
import { salir } from "@/app/(admin)/admin/actions";

// Guardia del panel. Todo lo que cuelgue de este grupo exige sesión; el login
// vive fuera, en /admin/login.
//
// Ojo: esto protege el renderizado de las páginas. Cada Server Action que
// escriba en la base tiene que volver a comprobar la sesión por su cuenta —
// una acción se puede invocar sin pasar por esta pantalla.
export default async function PanelLayout({ children }: { children: ReactNode }) {
  if (!(await haySesion())) redirect("/admin/login");

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-border">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-4">
          <Link href="/admin" className="font-extrabold text-sm text-foreground shrink-0">
            Movisun <span className="text-muted-foreground font-semibold">· Panel</span>
          </Link>

          <nav aria-label="Secciones del panel" className="flex items-center gap-1">
            <Link
              href="/admin/productos"
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              Productos
            </Link>
            <Link
              href="/admin/categorias"
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              Categorías
            </Link>
            <Link
              href="/admin/eventos"
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              Eventos
            </Link>
          </nav>

          <div className="ml-auto flex items-center gap-3">
            {/* Cruzar del panel a la tienda cambia de layout raíz, así que Next
                hace una recarga completa de la página por su cuenta. */}
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              <ExternalLink size={13} aria-hidden="true" /> Ver el sitio
            </Link>
            <form action={salir}>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-border text-foreground hover:bg-muted transition-colors"
              >
                <LogOut size={13} aria-hidden="true" /> Salir
              </button>
            </form>
          </div>
        </div>
      </header>

      <main id="panel" tabIndex={-1} className="flex-1 max-w-5xl w-full mx-auto px-4 py-8">
        {children}
      </main>

      <footer className="border-t border-border py-4">
        <p className="max-w-5xl mx-auto px-4 text-xs text-muted-foreground">
          Panel de administración ·{" "}
          <span style={{ color: PRIMARY }} className="font-semibold">
            Movisun Nariño
          </span>
        </p>
      </footer>
    </div>
  );
}
