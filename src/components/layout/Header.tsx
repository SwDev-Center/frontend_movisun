"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  ShoppingCart,
  X,
  Search,
  Menu,
  ChevronDown,
  ChevronRight,
  Phone,
} from "lucide-react";
import { navItems } from "@/lib/data/nav.mock";
import type { NavItem, Advisor } from "@/lib/types";
import { useHeaderScroll } from "@/hooks/useHeaderScroll";
import { useCart } from "@/context/CartContext";
import { useShop } from "@/context/ShopContext";
import { PRIMARY } from "@/lib/constants";
import { ProductImage } from "@/components/ui/ProductImage";
import { IMG } from "@/assets/images";

function isNavActive(pathname: string, item: NavItem): boolean {
  if (item.href) {
    if (item.href.startsWith("/catalogo")) return pathname === item.href;
    return pathname === item.href || pathname.startsWith(item.href + "/");
  }
  return false;
}

function isChildActive(pathname: string, item: NavItem): boolean {
  return (item.children ?? []).some((c) => isNavActive(pathname, { id: item.id, label: c.label, href: c.href }));
}

export function Header({ advisors }: { advisors: Advisor[] }) {
  const pathname = usePathname();
  const scrolled = useHeaderScroll(60);
  const { count } = useCart();
  const { openCart } = useShop();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedCat, setExpandedCat] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [prevPathname, setPrevPathname] = useState(pathname);

  const onHome = pathname === "/";
  const transparent = !scrolled && !mobileOpen && onHome;

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  // Reset transient UI when the route changes (derived-state pattern).
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMobileOpen(false);
    setExpandedCat(null);
    setHoveredItem(null);
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        transparent ? "bg-transparent" : "bg-white/96 backdrop-blur-lg shadow-sm border-b border-border"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-3">
        <Link
          href="/"
          onClick={() => onHome && window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex items-center gap-3 shrink-0 mr-1"
        >
          <div className={`relative transition-all ${transparent ? "w-14 h-14 rounded-2xl overflow-hidden bg-white p-2" : "w-10 h-10"}`}>
            <ProductImage src={IMG.movisunLogo} alt="Movisun" fill className="object-contain" />
          </div>
          <div className="hidden sm:block">
            <p
              className={`font-extrabold text-sm tracking-wide leading-tight transition-colors ${transparent ? "text-white" : ""}`}
              style={!transparent ? { color: PRIMARY } : {}}
            >
              MOVISUN
            </p>
            <p className={`text-[10px] font-medium leading-tight ${transparent ? "text-blue-300" : "text-muted-foreground"}`}>
              Nariño
            </p>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-0.5 flex-1">
          {navItems.map((item) => {
            const hasChildren = !!item.children?.length;
            const isActive = isNavActive(pathname, item) || isChildActive(pathname, item);
            return (
              <div
                key={item.id}
                className="relative"
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <Link
                  href={item.href ?? "#"}
                  className={`flex items-center gap-1 px-3 py-2 rounded-xl text-[13px] font-semibold transition-all whitespace-nowrap ${
                    isActive
                      ? transparent
                        ? "bg-white/20 text-white"
                        : "bg-secondary text-primary"
                      : transparent
                        ? "text-white/75 hover:text-white hover:bg-white/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {item.label}
                  {hasChildren && (
                    <ChevronDown size={12} className={`transition-transform ${hoveredItem === item.id ? "rotate-180" : ""}`} />
                  )}
                </Link>
                <AnimatePresence>
                  {hoveredItem === item.id && hasChildren && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.97 }}
                      transition={{ duration: 0.16 }}
                      className="absolute top-full left-0 mt-1 bg-white rounded-2xl shadow-xl border border-border py-2 min-w-[160px] z-20"
                    >
                      {item.children!.map((child) => (
                        <Link
                          key={child.label}
                          href={child.href ?? "#"}
                          className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted hover:text-primary transition-colors"
                        >
                          <ChevronRight size={12} style={{ color: PRIMARY }} /> {child.label}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>

        {/* Right: search + cart + hamburger */}
        <div className="flex items-center gap-1.5 ml-auto">
          <AnimatePresence>
            {searchOpen && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 200, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="hidden md:flex overflow-hidden"
              >
                <div className={`flex items-center gap-2 rounded-xl px-3 py-2 w-full ${transparent ? "bg-white/15 border border-white/20" : "bg-muted border border-border"}`}>
                  <Search size={13} className={transparent ? "text-blue-200" : "text-muted-foreground"} />
                  <input
                    ref={searchRef}
                    type="text"
                    placeholder="Buscar..."
                    value={searchVal}
                    onChange={(e) => setSearchVal(e.target.value)}
                    className={`bg-transparent text-sm outline-none flex-1 ${transparent ? "text-white placeholder:text-blue-300" : "text-foreground placeholder:text-muted-foreground"}`}
                  />
                  {searchVal && (
                    <button onClick={() => setSearchVal("")}>
                      <X size={12} />
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={() => setSearchOpen((s) => !s)}
            className={`hidden md:flex w-9 h-9 items-center justify-center rounded-xl transition-all ${
              transparent ? "text-white hover:bg-white/15" : "text-muted-foreground hover:bg-muted"
            }`}
            aria-label="Buscar"
          >
            {searchOpen ? <X size={17} /> : <Search size={17} />}
          </button>
          <button
            onClick={openCart}
            className={`relative flex items-center justify-center w-9 h-9 rounded-xl transition-all ${
              transparent ? "text-white hover:bg-white/15" : "hover:bg-muted"
            }`}
            style={!transparent ? { color: PRIMARY } : {}}
            aria-label="Carrito"
          >
            <ShoppingCart size={19} />
            <AnimatePresence>
              {count > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-1 -right-1 w-[18px] h-[18px] bg-[#25D366] text-white text-[9px] font-bold rounded-full flex items-center justify-center"
                >
                  {count}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className={`lg:hidden flex items-center justify-center w-9 h-9 rounded-xl transition-all ${
              transparent ? "text-white hover:bg-white/15" : "text-foreground hover:bg-muted"
            }`}
            aria-label="Menú"
          >
            {mobileOpen ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-t border-border overflow-hidden"
          >
            <div className="px-4 pt-3 pb-1">
              <div className="flex items-center gap-2 bg-muted rounded-xl px-3 py-2.5 border border-border mb-2">
                <Search size={14} className="text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  className="bg-transparent text-sm outline-none flex-1 text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>
            <div className="px-4 pb-2 flex gap-3">
              {advisors.map((a) => (
                <a key={a.wa} href={`tel:+57${a.phone}`} className="flex items-center gap-1 text-xs font-medium" style={{ color: PRIMARY }}>
                  <Phone size={10} /> {a.label}
                </a>
              ))}
            </div>
            <div className="px-3 pb-3 space-y-0.5">
              {navItems.map((item) => {
                const hasChildren = !!item.children?.length;
                return (
                  <div key={item.id}>
                    <div className="flex items-center">
                      <Link
                        href={item.href ?? "#"}
                        onClick={() => !hasChildren && setMobileOpen(false)}
                        className="flex-1 flex items-center gap-2 text-left px-3 py-3 rounded-xl text-sm font-semibold transition-colors hover:bg-muted text-foreground"
                      >
                        {item.label}
                      </Link>
                      {hasChildren && (
                        <button
                          onClick={() => setExpandedCat(expandedCat === item.id ? null : item.id)}
                          className="px-3 py-3 rounded-xl hover:bg-muted transition-colors text-muted-foreground"
                          aria-label={`Desplegar ${item.label}`}
                        >
                          <ChevronDown size={15} className={`transition-transform ${expandedCat === item.id ? "rotate-180" : ""}`} />
                        </button>
                      )}
                    </div>
                    <AnimatePresence>
                      {expandedCat === item.id && hasChildren && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden pl-4"
                        >
                          {item.children!.map((child) => (
                            <Link
                              key={child.label}
                              href={child.href ?? "#"}
                              onClick={() => setMobileOpen(false)}
                              className="flex items-center gap-2 w-full text-left px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
                            >
                              <ChevronRight size={12} style={{ color: PRIMARY }} /> {child.label}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}