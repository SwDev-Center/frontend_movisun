import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Lock, AlertCircle } from "lucide-react";
import { PRIMARY } from "@/lib/constants";
import { haySesion } from "@/lib/auth";
import { entrar } from "@/app/(admin)/admin/actions";

export const metadata: Metadata = {
  title: "Entrar al panel",
  robots: { index: false, follow: false },
};

// Esta página queda FUERA del grupo (panel), que es el que exige sesión:
// si estuviera adentro, el guardia la redirigiría a sí misma sin parar.
export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;

  // Con sesión abierta no tiene sentido mostrar el formulario.
  if (await haySesion()) redirect("/admin");

  return (
    <main id="panel" className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-white mx-auto mb-4"
            style={{ background: PRIMARY }}
          >
            <Lock size={20} aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-extrabold text-foreground">Panel de administración</h1>
          <p className="text-sm text-muted-foreground mt-1">Movisun Nariño</p>
        </div>

        <form action={entrar} className="bg-white rounded-2xl border border-border p-6 shadow-sm">
          {error && (
            // role="alert" hace que los lectores de pantalla lo anuncien al aparecer.
            <div
              role="alert"
              className="flex items-start gap-2 mb-4 p-3 rounded-xl bg-red-50 border border-red-200"
            >
              <AlertCircle size={15} className="text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-sm text-red-700 font-medium">La contraseña no es correcta.</p>
            </div>
          )}

          <label htmlFor="password" className="block text-sm font-bold text-foreground mb-2">
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoFocus
            autoComplete="current-password"
            className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted text-foreground text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          />

          <input type="hidden" name="next" value={next ?? "/admin"} />

          <button
            type="submit"
            className="w-full mt-5 py-3 rounded-xl font-bold text-sm text-white transition-opacity hover:opacity-90 active:scale-[.99]"
            style={{ background: PRIMARY }}
          >
            Entrar
          </button>
        </form>
      </div>
    </main>
  );
}
