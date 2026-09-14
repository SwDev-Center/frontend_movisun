"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, type Variants } from "motion/react";
import { Search, SlidersHorizontal, TrendingUp, Tag, Star, Package, ChevronRight } from "lucide-react";
import { PRIMARY, EASE } from "@/lib/constants";
import type { Category, Product } from "@/lib/types";
import { CATEGORY_ICONS } from "@/components/ui/categoryIcons";
import { ProductImage } from "@/components/ui/ProductImage";
import { ProductCard } from "@/components/ui/ProductCard";

type SortKey = "nuevos" | "antiguos" | "precio-asc" | "precio-desc" | "rating" | "descuento";
type PriceRange = "all" | "0-30" | "30-80" | "80-130" | "130+";

const SORTS: [SortKey, string][] = [
  ["nuevos", "Más nuevos"],
  ["antiguos", "Más antiguos"],
  ["precio-asc", "Precio ↑"],
  ["precio-desc", "Precio ↓"],
  ["rating", "Mejor valorados"],
  ["descuento", "Mayor descuento"],
];
const PRICES: [PriceRange, string][] = [
  ["all", "Todos"],
  ["0-30", "Menos de $30k"],
  ["30-80", "$30k – $80k"],
  ["80-130", "$80k – $130k"],
  ["130+", "Más de $130k"],
];
const RATINGS: [number, string][] = [
  [0, "Todas"],
  [4.5, "4.5+"],
  [4.0, "4.0+"],
  [3.5, "3.5+"],
];

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

export function CatalogView({ category, products, initialSub = null }: { category: Category; products: Product[]; initialSub?: string | null }) {
  const [activeSub, setActiveSub] = useState<string | null>(initialSub);
  const [sortBy, setSortBy] = useState<SortKey>("nuevos");
  const [priceRange, setPriceRange] = useState<PriceRange>("all");
  const [minRating, setMinRating] = useState(0);
  const [onlyDiscount, setOnlyDiscount] = useState(false);
  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const Icon = CATEGORY_ICONS[category.icon];

  const activeFiltersCount =
    (priceRange !== "all" ? 1 : 0) + (minRating > 0 ? 1 : 0) + (onlyDiscount ? 1 : 0) + (sortBy !== "nuevos" ? 1 : 0);

  const filtered = useMemo(() => {
    let list = products.filter(
      (p) =>
        (!activeSub || p.subcategory === activeSub) &&
        (!search ||
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.subcategory.toLowerCase().includes(search.toLowerCase())) &&
        (priceRange === "all" ||
          (priceRange === "0-30" && p.price < 30000) ||
          (priceRange === "30-80" && p.price >= 30000 && p.price < 80000) ||
          (priceRange === "80-130" && p.price >= 80000 && p.price < 130000) ||
          (priceRange === "130+" && p.price >= 130000)) &&
        (minRating === 0 || p.rating >= minRating) &&
        (!onlyDiscount || !!p.originalPrice)
    );
    list = [...list].sort((a, b) => {
      if (sortBy === "nuevos") return (a.addedDaysAgo ?? 99) - (b.addedDaysAgo ?? 99);
      if (sortBy === "antiguos") return (b.addedDaysAgo ?? 0) - (a.addedDaysAgo ?? 0);
      if (sortBy === "precio-asc") return a.price - b.price;
      if (sortBy === "precio-desc") return b.price - a.price;
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "descuento")
        return (b.originalPrice ? b.originalPrice - b.price : 0) - (a.originalPrice ? a.originalPrice - a.price : 0);
      return 0;
    });
    const grouped: Record<string, Product[]> = {};
    list.forEach((p) => {
      (grouped[p.subcategory] ??= []).push(p);
    });
    return grouped;
  }, [products, activeSub, search, priceRange, minRating, onlyDiscount, sortBy]);

  const subMetas = Object.fromEntries(category.subcategories.map((s) => [s.label, s]));

  return (
    <div className="min-h-screen py-10 bg-white pt-24">
      <div className="max-w-5xl mx-auto px-4">
        <nav aria-label="Miga de pan" className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
          {/* Migas de pan: enlace real a la home en lugar de un botón para
              que los buscadores puedan recorrer la jerarquía del sitio. */}
          <Link href="/" className="hover:text-primary transition-colors">
            Inicio
          </Link>
          <ChevronRight size={11} aria-hidden="true" />
          <span style={{ color: PRIMARY }} className="font-semibold" aria-current="page">
            {category.label}
          </span>
        </nav>

        {/* Category cover */}
        <div className="relative rounded-2xl overflow-hidden mb-5 h-32 sm:h-44">
          <ProductImage src={category.coverImg} alt={category.label} fill sizes="100vw" className="object-cover" priority />
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(to right, ${category.color}e0 0%, ${category.color}90 50%, transparent 100%)` }}
          />
          <div className="absolute inset-0 flex items-center gap-4 px-6 sm:px-10">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 bg-black/20 backdrop-blur">
              <Icon size={22} aria-hidden="true" />
            </div>
            <div>
              <p className="text-blue-200 text-xs font-bold tracking-widest uppercase mb-1">{category.tagline}</p>
              {/* Título principal de la página (antes era un h3) para que solo
              exista un h1 real por ruta. */}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{category.label}</h1>
              <p className="text-blue-200/80 text-sm mt-1 hidden sm:block max-w-xs">{category.description}</p>
            </div>
          </div>
        </div>

        {/* Subcategory pills + search + filter toggle */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {category.subcategories.length > 1 && (
            <>
              <button
                onClick={() => setActiveSub(null)}
                aria-pressed={!activeSub}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  !activeSub ? "text-white border-transparent" : "text-muted-foreground border-border hover:bg-muted"
                }`}
                style={!activeSub ? { background: PRIMARY } : {}}
              >
                Todos
              </button>
              {category.subcategories.map((s) => {
                const SubIcon = CATEGORY_ICONS[s.icon];
                return (
                  <button
                    key={s.label}
                    onClick={() => setActiveSub(s.label === activeSub ? null : s.label)}
                    aria-pressed={activeSub === s.label}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      activeSub === s.label ? "text-white border-transparent" : "text-muted-foreground border-border hover:bg-muted"
                    }`}
                    style={activeSub === s.label ? { background: PRIMARY } : {}}
                  >
                    <SubIcon size={12} /> {s.label}
                  </button>
                );
              })}
            </>
          )}
          <div className="ml-auto flex items-center gap-2">
            <div className="flex items-center gap-2 border border-border rounded-xl px-3 py-1.5 bg-muted">
              <Search size={13} className="text-muted-foreground" aria-hidden="true" />
              <input
                type="search"
                aria-label="Buscar en el catálogo"
                placeholder="Buscar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent text-xs w-24 md:w-40 text-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              />
            </div>
            <button
              onClick={() => setFiltersOpen((f) => !f)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                filtersOpen ? "text-white border-transparent" : "text-muted-foreground border-border hover:bg-muted"
              }`}
              style={filtersOpen ? { background: PRIMARY } : {}}
            >
              <SlidersHorizontal size={13} />
              Filtros
              {activeFiltersCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center font-bold">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Filter panel */}
        <AnimatePresence>
          {filtersOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-4"
            >
              <div className="bg-muted rounded-2xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs font-bold text-foreground mb-2 flex items-center gap-1">
                    <TrendingUp size={11} aria-hidden="true" /> Ordenar por
                  </p>
                  <div className="space-y-1">
                    {SORTS.map(([k, l]) => (
                      <button
                        key={k}
                        onClick={() => setSortBy(k)}
                        aria-pressed={sortBy === k}
                        className={`block w-full text-left text-xs px-2 py-1 rounded-lg transition-colors ${
                          sortBy === k ? "font-bold text-white" : "text-muted-foreground hover:bg-white"
                        }`}
                        style={sortBy === k ? { background: PRIMARY } : {}}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground mb-2 flex items-center gap-1">
                    <Tag size={11} aria-hidden="true" /> Precio
                  </p>
                  <div className="space-y-1">
                    {PRICES.map(([k, l]) => (
                      <button
                        key={k}
                        onClick={() => setPriceRange(k)}
                        aria-pressed={priceRange === k}
                        className={`block w-full text-left text-xs px-2 py-1 rounded-lg transition-colors ${
                          priceRange === k ? "font-bold text-white" : "text-muted-foreground hover:bg-white"
                        }`}
                        style={priceRange === k ? { background: PRIMARY } : {}}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground mb-2 flex items-center gap-1">
                    <Star size={11} aria-hidden="true" /> Valoración
                  </p>
                  <div className="space-y-1">
                    {RATINGS.map(([k, l]) => (
                      <button
                        key={k}
                        onClick={() => setMinRating(k)}
                        aria-pressed={minRating === k}
                        className={`block w-full text-left text-xs px-2 py-1 rounded-lg transition-colors ${
                          minRating === k ? "font-bold text-white" : "text-muted-foreground hover:bg-white"
                        }`}
                        style={minRating === k ? { background: PRIMARY } : {}}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground mb-2">Otros</p>
                  {/* Switch real (checkbox nativo): el estado on/off es operable
                      por teclado y anunciado por lectores de pantalla. */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      role="switch"
                      checked={onlyDiscount}
                      onChange={(e) => setOnlyDiscount(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div
                      className={`w-9 h-5 rounded-full transition-colors relative peer-checked:bg-(--wa-btn) peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring ${
                        onlyDiscount ? "" : "bg-gray-300"
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                          onlyDiscount ? "translate-x-4" : "translate-x-0.5"
                        }`}
                      />
                    </div>
                    <span className="text-xs text-foreground">Solo en oferta</span>
                  </label>
                  <button
                    onClick={() => {
                      setSortBy("nuevos");
                      setPriceRange("all");
                      setMinRating(0);
                      setOnlyDiscount(false);
                    }}
                    className="mt-3 text-xs text-red-500 hover:text-red-700 font-semibold transition-colors"
                  >
                    Limpiar filtros
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Products */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCatKey(activeSub, sortBy, priceRange, minRating, onlyDiscount)}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            {Object.keys(filtered).length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                <Package size={44} strokeWidth={1} className="mx-auto mb-4" />
                <p className="font-semibold">No hay productos que coincidan con los filtros</p>
              </div>
            ) : (
              <div className="space-y-10">
                {Object.entries(filtered).map(([sub, prods]) => {
                  const subMeta = subMetas[sub];
                  return (
                    <div key={sub}>
                      {Object.keys(filtered).length > 1 && (
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white" style={{ background: PRIMARY }}>
                            {subMeta ? (() => {
                              const SubIcon = CATEGORY_ICONS[subMeta.icon];
                              return <SubIcon size={13} />;
                            })() : (
                              <Package size={13} />
                            )}
                          </div>
                          <h4 className="font-extrabold text-foreground text-sm">{sub}</h4>
                          <div className="flex-1 h-px bg-border" />
                        </div>
                      )}
                      <motion.div
                        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4"
                        initial="hidden"
                        animate="visible"
                        variants={stagger}
                      >
                        {prods.map((p) => (
                          <ProductCard key={p.id} product={p} />
                        ))}
                      </motion.div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function activeCatKey(activeSub: string | null, sortBy: string, priceRange: string, minRating: number, onlyDiscount: boolean): string {
  return [activeSub ?? "all", sortBy, priceRange, minRating, onlyDiscount ? 1 : 0].join("-");
}