import type { Metadata } from "next";
import Section from "@gmgroup/ui/Section";
import Badge from "@gmgroup/ui/Badge";
import Button from "@gmgroup/ui/Button";
import SplitTextReveal from "@gmgroup/ui/SplitTextReveal";
import EvAgentApp from "@/components/mobility/agent/EvAgentApp";

export const metadata: Metadata = {
  title: "Agente di ricarica",
  description:
    "Prototipo di assistente di ricarica a bordo (GMobility): trova una stazione ultra-rapida sul percorso, prenota lo stallo, avvia la navigazione e mostra timer e costi in tempo reale. Demo interattiva.",
  alternates: { canonical: "/mobility/agent" },
};

/**
 * /mobility/agent — porting del prototipo "EV charging agent" di Jacopo.
 *
 * È una demo 100% CLIENT-SIDE: l'"AI" è uno script a keyword-matching (nessuna
 * chiave, nessun endpoint), il valore è la GENERATIVE UI nel mockup smartphone
 * (timer di ricarica animato, scontrino costi) e il guardrail di brand. Il tema
 * neon originale è stato riportato sull'accent del mondo (verde GMobility).
 */
export default function MobilityAgentPage() {
  return (
    <>
      <Section className="pt-28">
        <div className="max-w-2xl">
          <Badge>GMobility · Agente AI di bordo</Badge>
          <SplitTextReveal
            as="h1"
            text="L'assistente che ricarica al posto tuo"
            className="font-display text-display-sm mt-4 font-bold tracking-tight text-balance"
          />
          <p className="text-muted mt-4 text-lg">
            Un agente conversazionale dentro l&apos;auto: trova una stazione ultra-rapida sul
            percorso, <strong>prenota lo stallo</strong>, imposta la rotta nel navigatore e ti
            mostra <strong>tempi e costi in tempo reale</strong>. Prova le scorciatoie nella chat o
            scrivi una domanda — l&apos;agente resta sul suo dominio (niente ricette di cucina).
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button href="#simulatore" size="lg">
              Prova il simulatore
            </Button>
            <Button href="/mobility" variant="ghost" size="lg">
              ← Torna a GMobility
            </Button>
          </div>
          <p className="text-muted mt-6 text-xs">
            Demo interattiva: dati e stazioni sono segnaposto, l&apos;assistente gira interamente
            nel browser (nessuna chiave AI necessaria).
          </p>
        </div>
      </Section>

      {/* Palco scuro full-bleed: il mockup smartphone porta la sua scena. */}
      <div id="simulatore" className="scroll-mt-20">
        <EvAgentApp />
      </div>
    </>
  );
}
