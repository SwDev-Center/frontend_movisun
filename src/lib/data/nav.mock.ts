import type { NavItem } from "@/lib/types";

// Header/footer navigation. Category children map to /catalogo/[id]?sub=<label>.
export const navItems: NavItem[] = [
  {
    id: "smartwatch",
    label: "Smartwatch",
    href: "/catalogo/smartwatch",
    children: [
      { label: "Sumergible", href: "/catalogo/smartwatch?sub=Sumergible" },
      { label: "No sumergible", href: "/catalogo/smartwatch?sub=No sumergible" },
      { label: "Con chip", href: "/catalogo/smartwatch?sub=Con chip" },
    ],
  },
  {
    id: "audio",
    label: "Audio y Carga",
    href: "/catalogo/audio",
    children: [
      { label: "Manos libres", href: "/catalogo/audio?sub=Manos libres" },
      { label: "Cargadores", href: "/catalogo/audio?sub=Cargadores" },
      { label: "Power Bank", href: "/catalogo/audio?sub=Power Bank" },
      { label: "Cables", href: "/catalogo/audio?sub=Cables" },
      { label: "Pilas", href: "/catalogo/audio?sub=Pilas" },
    ],
  },
  {
    id: "bluetooth",
    label: "Bluetooth",
    href: "/catalogo/bluetooth",
    children: [
      { label: "Diademas", href: "/catalogo/bluetooth?sub=Diademas" },
      { label: "Parlantes", href: "/catalogo/bluetooth?sub=Parlantes" },
      { label: "Audífonos", href: "/catalogo/bluetooth?sub=Audífonos" },
      { label: "Localizador", href: "/catalogo/bluetooth?sub=Localizador" },
      { label: "Intercomunicadores", href: "/catalogo/bluetooth?sub=Intercomunicadores" },
      { label: "Gamer", href: "/catalogo/bluetooth?sub=Gamer" },
    ],
  },
  { id: "promociones", label: "Promociones", href: "/promociones" },
  { id: "eventos", label: "Eventos", href: "/eventos" },
  {
    id: "distribuidores",
    label: "Distribuidores",
    href: "/distribuidores",
    children: [
      { label: "Información", href: "/distribuidores" },
      { label: "Contacto", href: "/distribuidores/contacto" },
    ],
  },
];