import Link from "next/link";
import { Phone } from "lucide-react";
import { navItems } from "@/lib/data/nav.mock";
import { categories } from "@/lib/data/categories.mock";
import type { Advisor } from "@/lib/types";
import { ProductImage } from "@/components/ui/ProductImage";
import { IMG } from "@/assets/images";

export function Footer({ advisors }: { advisors: Advisor[] }) {
  return (
    <footer className="py-10 px-4" style={{ background: "#07111f" }}>
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-8 mb-8">
          <div className="flex items-center gap-3">
            <div className="relative w-14 h-14 bg-white rounded-2xl overflow-hidden p-1.5">
              <ProductImage src={IMG.movisunLogo} alt="Movisun" fill className="object-contain" />
            </div>
            <div>
              <p className="text-white font-extrabold">MOVISUN Nariño</p>
              <p className="text-blue-400 text-xs">Tu tienda de tecnología</p>
              <div className="flex gap-3 mt-1">
                {advisors.map((a) => (
                  <a key={a.wa} href={`tel:+57${a.phone}`} className="text-blue-300 text-xs hover:text-white transition-colors flex items-center gap-1">
                    <Phone size={9} /> {a.phone}
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-8">
            {categories.map((c) => (
              <div key={c.id}>
                <p className="text-white text-xs font-bold mb-2">{c.label}</p>
                {c.subcategories.map((s) => (
                  <Link
                    key={s.label}
                    href={`/catalogo/${c.id}?sub=${encodeURIComponent(s.label)}`}
                    className="block text-blue-400 hover:text-blue-200 text-xs py-0.5 transition-colors"
                  >
                    {s.label}
                  </Link>
                ))}
              </div>
            ))}
            <div>
              <p className="text-white text-xs font-bold mb-2">Movisun</p>
              {navItems
                .filter((i) => i.href && !i.href.startsWith("/catalogo"))
                .map((i) => (
                  <Link key={i.id} href={i.href!} className="block text-blue-400 hover:text-blue-200 text-xs py-0.5 transition-colors">
                    {i.label}
                  </Link>
                ))}
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 pt-6 text-center text-blue-500 text-xs">
          © 2025 Movisun Nariño · Todos los derechos reservados
        </div>
      </div>
    </footer>
  );
}