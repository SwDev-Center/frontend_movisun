import { CheckCircle, Package, TrendingUp, Info, Users } from "lucide-react";
import { PRIMARY } from "@/lib/constants";
import { Reveal, RevealItem } from "@/components/ui/Reveal";

const BENEFITS = [
  {
    icon: <CheckCircle size={22} />,
    title: "Precios de mayorista",
    desc: "Accede a precios especiales con descuentos exclusivos por volumen de compra desde el primer pedido.",
  },
  {
    icon: <Package size={22} />,
    title: "Variedad de productos",
    desc: "Catálogo completo: smartwatches, audio, cargadores, Bluetooth y más. Siempre disponible.",
  },
  {
    icon: <TrendingUp size={22} />,
    title: "Apoyo comercial",
    desc: "Material de ventas, capacitación de productos y soporte de nuestro equipo para impulsar tu negocio.",
  },
  {
    icon: <Info size={22} />,
    title: "Requisitos",
    desc: "Persona natural o jurídica con RUT activo, pedido mínimo inicial de $500.000 COP y zona geográfica definida.",
  },
];

export default function DistribuidoresPage() {
  return (
    <div className="pt-16 min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Reveal className="space-y-4">
          <RevealItem className="text-center mb-10">
            <Users size={40} className="mx-auto mb-4" style={{ color: PRIMARY }} />
            <h1 className="text-3xl font-extrabold text-foreground mb-2">Programa de Distribuidores</h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              Únete a la red de distribuidores Movisun Nariño y lleva la mejor tecnología a tu región.
            </p>
          </RevealItem>
          {BENEFITS.map((item) => (
            <RevealItem key={item.title}>
              <div className="flex gap-4 p-5 bg-muted rounded-2xl">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0" style={{ background: PRIMARY }}>
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-bold text-foreground mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </div>
            </RevealItem>
          ))}
        </Reveal>
      </div>
    </div>
  );
}