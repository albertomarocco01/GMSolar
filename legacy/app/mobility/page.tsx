import type { Metadata } from "next";
import Section from "@gmgroup/ui/Section";
import Badge from "@gmgroup/ui/Badge";
import Button from "@gmgroup/ui/Button";
import SplitTextReveal from "@gmgroup/ui/SplitTextReveal";
import MobilityStage from "@/components/mobility/MobilityStage";
import MarketStats from "@/components/mobility/MarketStats";
import Solutions from "@/components/mobility/Solutions";
import ChargingMap from "@/components/mobility/ChargingMap";
import Configurator from "@/components/mobility/Configurator";

export const metadata: Metadata = {
  title: "Mobility",
  description:
    "GMobility — wallbox e colonnine di ricarica Mennekes per casa, azienda e spazi pubblici. Esplora la colonnina in 3D, il mercato dell'elettrico e la rete di ricarica.",
  alternates: { canonical: "/mobility" },
};

/**
 * Sezione GMobility — taglio "3D scroll storytelling".
 * 1+2) Stage 3D pinnato: la colonnina ruota e i componenti si separano (explode).
 * 3) Il mercato in numeri. 4) Soluzioni aziende/casa + partner Mennekes.
 * 5) Mappa della rete di ricarica. 6) Configuratore "che soluzione ti serve".
 */
export default function MobilityPage() {
  return (
    <>
      <MobilityStage />
      <MarketStats />
      <Solutions />

      {/* Teaser → demo agente AI di bordo (/mobility/agent) */}
      <Section className="bg-brand-950 text-white">
        <div className="grid items-center gap-8 md:grid-cols-2">
          <div>
            <Badge variant="accent">Anteprima · Agente AI</Badge>
            <SplitTextReveal
              as="h2"
              text="Un assistente di ricarica dentro l'auto"
              className="font-display text-display-sm mt-4 font-bold tracking-tight text-balance"
            />
            <p className="mt-4 text-lg text-white/70">
              Trova la stazione ultra-rapida sul percorso, prenota lo stallo e avvia la navigazione
              — con timer e costi in tempo reale. Una demo interattiva del nostro agente
              conversazionale di bordo.
            </p>
            <Button href="/mobility/agent" size="lg" className="mt-6">
              Apri il simulatore →
            </Button>
          </div>
          <ul className="space-y-3 text-sm text-white/80">
            <li className="border-border/20 rounded-lg border bg-white/5 p-4">
              🔌 <strong className="text-accent">Prenotazione stallo</strong> + rotta nel navigatore
              in un solo comando vocale.
            </li>
            <li className="border-border/20 rounded-lg border bg-white/5 p-4">
              ⏱️ <strong className="text-accent">Timer di ricarica</strong> e scontrino costi
              generati nella chat.
            </li>
            <li className="border-border/20 rounded-lg border bg-white/5 p-4">
              🛡️ <strong className="text-accent">Guardrail di brand</strong>: resta sul dominio
              ricarica, niente fuori-tema.
            </li>
          </ul>
        </div>
      </Section>

      <ChargingMap />
      <Configurator />
    </>
  );
}
