import { MessageCircle, Phone } from "lucide-react";
import { PRIMARY } from "@/lib/constants";
import { getAdvisors } from "@/api/advisors";
import { Reveal, RevealItem } from "@/components/ui/Reveal";
import { WaIcon } from "@/components/ui/WaIcon";

export default async function DistribuidoresContactoPage() {
  const advisors = await getAdvisors();

  return (
    <div className="pt-16 min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Reveal>
          <RevealItem className="text-center mb-10">
            <MessageCircle size={40} className="mx-auto mb-4" style={{ color: PRIMARY }} />
            <h1 className="text-3xl font-extrabold text-foreground mb-2">Contacto Distribuidores</h1>
            <p className="text-muted-foreground">Escríbenos directamente y te contactamos en menos de 24 horas.</p>
          </RevealItem>

          <RevealItem>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {advisors.map((a) => (
                <div key={a.name} className="p-5 bg-muted rounded-2xl">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">{a.label}</p>
                  <p className="font-bold text-foreground mb-3">{a.name}</p>
                  <a href={`tel:+57${a.phone}`} className="flex items-center gap-2 text-sm font-medium mb-2 hover:underline" style={{ color: PRIMARY }}>
                    <Phone size={14} /> +57 {a.phone}
                  </a>
                  <a
                    href={`https://wa.me/${a.wa}?text=${encodeURIComponent("Hola! Me interesa ser distribuidor Movisun Nariño.")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold text-white bg-[#25D366] hover:bg-[#1ebe5d] transition-colors justify-center mt-2"
                  >
                    <WaIcon size={14} /> WhatsApp
                  </a>
                </div>
              ))}
            </div>
          </RevealItem>

          <RevealItem>
            <div className="p-5 rounded-2xl border border-border text-center">
              <p className="text-sm text-muted-foreground">
                O escríbenos al correo:{" "}
                <a href="mailto:distribuidores@movisun.com.co" className="font-semibold hover:underline" style={{ color: PRIMARY }}>
                  distribuidores@movisun.com.co
                </a>
              </p>
            </div>
          </RevealItem>
        </Reveal>
      </div>
    </div>
  );
}