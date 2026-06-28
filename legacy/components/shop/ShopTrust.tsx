import ScrollReveal from "@gmgroup/ui/ScrollReveal";
import { Truck, RotateCcw, BadgeCheck, ShieldCheck } from "lucide-react";

/**
 * Fascia "trust" sotto l'assistente, prima del catalogo. Una sola volta in
 * pagina. Superficie neutra, icone in accent-ink (niente fill lime), quattro
 * promesse del brand (le stesse del sito reale Cavo Perfetto).
 */
const CLAIMS = [
  { Icon: Truck, title: "Spedizioni gratuite", body: "In tutta Italia, sempre incluse." },
  { Icon: RotateCcw, title: "Reso facile", body: "Hai 30 giorni per ripensarci." },
  {
    Icon: BadgeCheck,
    title: "Rivendita autorizzata Mennekes",
    body: "Prodotti originali, garanzia ufficiale.",
  },
  {
    Icon: ShieldCheck,
    title: "Alta qualità garantita",
    body: "Materiali certificati per ogni ricarica.",
  },
];

export default function ShopTrust() {
  return (
    <section className="bg-surface border-border border-y">
      <ScrollReveal
        stagger={0.06}
        y={16}
        className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-x-6 gap-y-7 px-6 py-8 md:grid-cols-4 md:gap-y-0 md:divide-x md:divide-border md:px-8"
      >
        {CLAIMS.map(({ Icon, title, body }) => (
          <div key={title} className="flex items-start gap-3 md:px-6 md:first:pl-0">
            <Icon
              className="text-accent-ink mt-0.5 h-5 w-5 shrink-0"
              strokeWidth={1.75}
              aria-hidden
            />
            <div className="min-w-0">
              <p className="text-foreground text-sm leading-snug font-semibold">{title}</p>
              <p className="text-muted mt-0.5 text-xs leading-snug">{body}</p>
            </div>
          </div>
        ))}
      </ScrollReveal>
    </section>
  );
}
