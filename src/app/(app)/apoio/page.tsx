import Image from "next/image";
import { MessageCircle, CalendarX } from "lucide-react";

const CAROL_WHATSAPP = "554192871250";
const CAROL_WA_MESSAGE = encodeURIComponent(
  "Oi, Carol! Vim pelo Diário de Emoções e gostaria de marcar uma consulta.",
);

export default function ApoioPage() {
  const carolWhatsappUrl = `https://wa.me/${CAROL_WHATSAPP}?text=${CAROL_WA_MESSAGE}`;

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-3xl font-display font-bold">Encontre sua psicóloga</h1>
        <p className="text-soft font-display text-sm mt-1">
          Profissionais de confiança que apoiam o uso do app.
        </p>
      </header>

      <div className="space-y-4">
        {/* Card Paula */}
        <section className="card">
          <header className="flex items-center gap-4 mb-4">
            <div className="relative w-20 h-20 rounded-full overflow-hidden shrink-0 ring-2 ring-blush-100">
              <Image
                src="/team/paula.jpg"
                alt="Paula Koppe"
                fill
                sizes="80px"
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="min-w-0">
              <h2 className="font-display font-bold text-lg leading-tight">
                Paula Koppe
              </h2>
              <p className="text-xs font-display text-soft mt-0.5">
                Psicóloga junguiana · CRP 08/40564
              </p>
            </div>
          </header>

          <div className="space-y-3 text-sm font-display text-soft leading-relaxed mb-4">
            <p>
              A terapia sempre foi parte importante da minha vida e me move
              poder devolver isso pra outras pessoas. Trabalho na abordagem
              junguiana, com escuta atenta e respeito ao tempo de cada um.
            </p>
            <p>
              Também sou desenvolvedora web — e o Diário de Emoções nasceu
              dessa interseção, como ferramenta de apoio entre as sessões.
            </p>
          </div>

          <div
            className="flex items-center gap-2 rounded-2xl bg-blush-100 dark:bg-blush-400/15 px-4 py-3"
            role="status"
            aria-live="polite"
          >
            <CalendarX className="w-4 h-4 text-blush-500 shrink-0" />
            <p className="text-sm font-display font-semibold text-blush-500">
              Agenda cheia no momento
            </p>
          </div>
        </section>

        {/* Card Carol */}
        <section className="card">
          <header className="flex items-center gap-4 mb-4">
            <div className="relative w-20 h-20 rounded-full overflow-hidden shrink-0 ring-2 ring-mint-200">
              <Image
                src="/team/carol.jpg"
                alt="Carol"
                fill
                sizes="80px"
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="min-w-0">
              <h2 className="font-display font-bold text-lg leading-tight">
                Carol
              </h2>
              <p className="text-xs font-display text-soft mt-0.5">
                Psicóloga humanista · CRP 08/43368
              </p>
            </div>
          </header>

          <div className="space-y-3 text-sm font-display text-soft leading-relaxed mb-4">
            <p>
              Oi, eu sou a Carol! Sou psicóloga humanista e atuo na clínica
              online. Mas, para além do CRP, sou uma pessoa comum, que
              acredita profundamente que a psicologia acontece, de verdade,
              no olho no olho.
            </p>
            <p>
              Acredito que é na relação autêntica entre terapeuta e cliente
              que o crescimento floresce. É nesse encontro, construído com
              segurança, escuta profunda e presença, que surge a liberdade
              de sermos vulneráveis e, pouco a pouco, mais nós mesmos.
            </p>
            <p>
              Se você está buscando uma abordagem humanizada e comprometida
              com seu autoconhecimento, estou aqui para te apoiar nessa
              jornada.
            </p>
          </div>

          <a
            href={carolWhatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary w-full"
          >
            <MessageCircle className="w-4 h-4" />
            Marcar consulta no WhatsApp
          </a>
        </section>

        <p className="text-xs font-display text-soft text-center pt-2 pb-4">
          As profissionais listadas atendem por conta própria. O Diário de
          Emoções não intermedia a relação terapêutica.
        </p>
      </div>
    </div>
  );
}
