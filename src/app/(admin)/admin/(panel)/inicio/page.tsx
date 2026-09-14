import type { Metadata } from "next";
import { ImageIcon, Info, ChevronUp, ChevronDown } from "lucide-react";
import { listarHeroTiles, listarSlides, rutasSugeridas } from "@/lib/repo-admin";
import { HeroTileForm } from "@/components/admin/HeroTileForm";
import { SlideForm } from "@/components/admin/SlideForm";
import { BotonConfirmar } from "@/components/admin/BotonConfirmar";
import { borrarSlide, ordenarSlide } from "@/app/(admin)/admin/(panel)/inicio/actions";

export const metadata: Metadata = {
  title: "Portada",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const LISTA_RUTAS = "rutas-del-sitio";

const MENSAJES: Record<string, string> = {
  guardado: "Imagen guardada. Ya se ve en la portada.",
  "slide-guardada": "Diapositiva guardada.",
  "slide-creada": "Diapositiva agregada al carrusel.",
  "slide-borrada": "Diapositiva eliminada.",
};

export default async function InicioPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>;
}) {
  const [{ estado }, tiles, slides, rutas] = await Promise.all([
    searchParams,
    listarHeroTiles(),
    listarSlides(),
    rutasSugeridas(),
  ]);

  return (
    <>
      <h1 className="text-2xl font-extrabold text-foreground mb-1">Portada</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Las cuatro imágenes que flotan en las esquinas de la página de inicio. Cada una lleva a
        donde vos decidas.
      </p>

      {estado && MENSAJES[estado] && (
        <p
          role="status"
          className="mb-5 p-3 rounded-xl text-sm font-medium border bg-green-50 border-green-200 text-green-800"
        >
          {MENSAJES[estado]}
        </p>
      )}

      <h2 className="text-lg font-extrabold text-foreground mb-1">Imágenes flotantes</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Las cuatro piezas que rodean el título de bienvenida.
      </p>

      {/* Requisitos de la imagen. Van arriba y no escondidos en un campo:
          subir la imagen equivocada es lo que rompe la estética del hero. */}
      <section className="mb-6 p-4 rounded-2xl border border-blue-200 bg-blue-50/60">
        <h2 className="flex items-center gap-1.5 text-sm font-bold text-foreground mb-2">
          <Info size={14} aria-hidden="true" /> Cómo tiene que ser la imagen
        </h2>
        <ul className="text-sm text-foreground/80 space-y-1.5 list-disc pl-5">
          <li>
            <strong>Fondo transparente, sin recuadro.</strong> El producto flota sobre el degradado
            azul. Una foto con fondo blanco se ve como un rectángulo pegado encima.
          </li>
          <li>
            <strong>PNG, WebP o AVIF.</strong> El JPG no sirve: no admite transparencia, y el panel
            lo rechaza.
          </li>
          <li>
            <strong>Más o menos cuadrada</strong>, con el producto centrado y algo de aire alrededor.
            Se muestra dentro de un cuadro de unos 250 px sin recortarse.
          </li>
          <li>
            <strong>Entre 800 × 800 y 1200 × 1200 px, hasta 5 MB.</strong> Más grande no se ve
            mejor y hace más lenta la portada.
          </li>
        </ul>
        <p className="text-sm text-foreground/80 mt-2">
          El recuadro de la izquierda de cada pieza muestra exactamente cómo va a quedar, con el
          mismo fondo y el mismo resplandor que la portada real.
        </p>
      </section>

      <p className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
        <ImageIcon size={13} aria-hidden="true" />
        Estas imágenes solo se ven en pantallas de 1280 px o más; en celular la portada muestra
        únicamente el bloque central.
      </p>

      <div className="space-y-4">
        {tiles.map((t) => (
          <HeroTileForm key={t.slot} tile={t} listaRutas={LISTA_RUTAS} />
        ))}
      </div>

      {/* ── Carrusel ────────────────────────────────────────────────────────── */}
      <h2 className="text-lg font-extrabold text-foreground mt-12 mb-1">Carrusel</h2>
      <p className="text-sm text-muted-foreground mb-4">
        La franja ancha que aparece debajo de la bienvenida y va rotando sola. El orden de esta
        lista es el orden en que se muestran.
      </p>

      {/* Las reglas son las contrarias a las de arriba: acá son fotos de fondo. */}
      <section className="mb-6 p-4 rounded-2xl border border-blue-200 bg-blue-50/60">
        <h3 className="flex items-center gap-1.5 text-sm font-bold text-foreground mb-2">
          <Info size={14} aria-hidden="true" /> Cómo tiene que ser la foto
        </h3>
        <ul className="text-sm text-foreground/80 space-y-1.5 list-disc pl-5">
          <li>
            <strong>Apaisada</strong>, más ancha que alta. Se recorta a una franja, así que una foto
            vertical perdería casi todo. El panel rechaza las que están paradas.
          </li>
          <li>
            <strong>Al menos 1200 px de ancho</strong>, idealmente 1920. Ocupa todo el ancho de la
            pantalla: una foto chica se ve borrosa.
          </li>
          <li>
            <strong>JPG sirve perfecto acá</strong> — al revés que en las imágenes flotantes. Es una
            foto de fondo, no un recorte.
          </li>
          <li>
            <strong>Con el motivo hacia la derecha.</strong> El texto va sobre la mitad izquierda,
            oscurecida con un degradado.
          </li>
        </ul>
      </section>

      {slides.length === 0 ? (
        <p className="text-center py-8 text-muted-foreground text-sm">
          No hay diapositivas: el carrusel no se muestra en la portada.
        </p>
      ) : (
        <ul className="space-y-4">
          {slides.map((s, i) => (
            <li key={s.id}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Diapositiva {i + 1}
                </span>
                <div className="ml-auto flex items-center gap-1">
                  <form action={ordenarSlide}>
                    <input type="hidden" name="id" value={s.id} />
                    <input type="hidden" name="direccion" value="arriba" />
                    <button
                      type="submit"
                      disabled={i === 0}
                      aria-label={`Adelantar «${s.headline}»`}
                      className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                      <ChevronUp size={15} aria-hidden="true" />
                    </button>
                  </form>
                  <form action={ordenarSlide}>
                    <input type="hidden" name="id" value={s.id} />
                    <input type="hidden" name="direccion" value="abajo" />
                    <button
                      type="submit"
                      disabled={i === slides.length - 1}
                      aria-label={`Atrasar «${s.headline}»`}
                      className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                      <ChevronDown size={15} aria-hidden="true" />
                    </button>
                  </form>
                  <BotonConfirmar
                    accion={borrarSlide}
                    campos={{ id: s.id }}
                    etiqueta={`Eliminar «${s.headline}»`}
                    mensaje={`¿Eliminar la diapositiva «${s.headline}»?`}
                  />
                </div>
              </div>
              <SlideForm slide={s} listaRutas={LISTA_RUTAS} />
            </li>
          ))}
        </ul>
      )}

      <h3 className="text-sm font-bold text-foreground mt-8 mb-3">Agregar una diapositiva</h3>
      <SlideForm listaRutas={LISTA_RUTAS} />

      {/* Sugerencias de rutas reales, compartidas por los cuatro campos. */}
      <datalist id={LISTA_RUTAS}>
        {rutas.map((r) => (
          <option key={r} value={r} />
        ))}
      </datalist>
    </>
  );
}
