/**
 * /integrazioni — Showcase Integrazioni API.
 *
 * Struttura:
 *   1. Hero: titolo + disclaimer "simulazione dimostrativa"
 *   2. Griglia connettori: 7 card (WhatsApp, Email, CRM, Stripe, Calendar, AI, Sheets)
 *   3. Flussi animati: 2 scenari con diagramma a nodi SVG + log simulato
 *
 * L'accent "platform" (viola) è attivato automaticamente dal ThemeProvider
 * tramite la route /integrazioni (cfr. packages/lib/src/theme.ts).
 *
 * RECINTO: questo file e apps/web/components/integrazioni/** — non toccare
 * la zona condivisa (packages/**, layout, globals, tokens, Header/Footer).
 */

import type { Metadata } from "next";
import { Info } from "lucide-react";
import Section from "@gmgroup/ui/Section";
import ScrollReveal from "@gmgroup/ui/ScrollReveal";
import Badge from "@gmgroup/ui/Badge";
import Button from "@gmgroup/ui/Button";
import ConnectorGrid from "@/components/integrazioni/ConnectorGrid";
import FlowDiagram from "@/components/integrazioni/FlowDiagram";
import { CONNECTORS, SCENARIOS } from "@/components/integrazioni/data";

export const metadata: Metadata = {
  title: "Integrazioni API — Connessi a tutto ciò che usi già",
  description:
    "WhatsApp, email, CRM, pagamenti, AI: orchestriamo qualunque sistema con API in flussi automatici.",
};

export default function IntegrazioniPage() {
  return (
    <>
      {/* ── 1. Hero ─────────────────────────────────────────────────────── */}
      <Section className="pt-20 pb-10">
        <ScrollReveal>
          <Badge>Servizio 06 · Integrazioni API</Badge>

          <h1 className="font-display text-display-sm md:text-display-md mt-4 max-w-3xl font-bold tracking-tight text-balance">
            Connessi a tutto ciò che usi già
          </h1>

          <p className="text-muted mt-4 max-w-xl text-lg leading-relaxed">
            WhatsApp, email transazionali, CRM, pagamenti e AI: progettiamo e implementiamo flussi
            automatici che orchestrano qualunque sistema con API, senza silos.
          </p>

          {/* Disclaimer simulazione */}
          <p className="text-muted border-border mt-6 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs">
            <Info size={12} aria-hidden />
            Simulazione dimostrativa — nessuna chiamata reale viene effettuata in questa pagina
          </p>

          <div className="mt-8">
            <Button href="/" variant="outline">
              ← Torna alla presentazione
            </Button>
          </div>
        </ScrollReveal>
      </Section>

      {/* ── 2. Griglia connettori ────────────────────────────────────────── */}
      <Section id="connettori" className="bg-surface-2">
        <ScrollReveal>
          <Badge variant="neutral">Connettori</Badge>
          <h2 className="font-display text-display-sm mt-3 font-bold tracking-tight">
            Cosa colleghiamo
          </h2>
          <p className="text-muted mt-2 max-w-lg text-base">
            Ogni connettore è un canale già testato in produzione. Basta configurare le chiavi API e
            il flusso parte.
          </p>
        </ScrollReveal>

        <ConnectorGrid connectors={CONNECTORS} />
      </Section>

      {/* ── 3. Flussi animati ────────────────────────────────────────────── */}
      <Section id="flussi">
        <ScrollReveal>
          <Badge variant="neutral">Flussi di automazione</Badge>
          <h2 className="font-display text-display-sm mt-3 font-bold tracking-tight">
            Automazioni in azione
          </h2>
          <p className="text-muted mt-2 max-w-lg text-base">
            Ogni scenario mostra un flusso reale: premi{" "}
            <span className="text-foreground font-medium">Riproduci</span> per vedere il pacchetto
            percorrere i nodi e leggere il log passo dopo passo.
          </p>
        </ScrollReveal>

        <div className="mt-12 flex flex-col gap-16">
          {SCENARIOS.map((scenario) => (
            <ScrollReveal key={scenario.id} y={16}>
              {/* Intestazione scenario */}
              <div className="border-border mb-6 border-b pb-4">
                <p className="text-accent-ink text-xs font-semibold tracking-wide uppercase">
                  Scenario
                </p>
                <h3 className="font-display mt-1 text-xl font-bold">{scenario.title}</h3>
                <p className="text-muted mt-1 max-w-xl text-sm leading-relaxed">
                  {scenario.description}
                </p>
              </div>

              {/* Diagramma a nodi + log */}
              <FlowDiagram scenarioId={scenario.id} />
            </ScrollReveal>
          ))}
        </div>
      </Section>

      {/* ── 4. CTA chiusura ─────────────────────────────────────────────── */}
      <Section className="bg-surface-2">
        <ScrollReveal className="text-center">
          <h2 className="font-display text-display-sm font-bold tracking-tight">
            Quale sistema vuoi integrare?
          </h2>
          <p className="text-muted mx-auto mt-3 max-w-md text-base">
            Raccontaci i tuoi strumenti e il flusso che vorresti automatizzare: valutiamo insieme la
            soluzione più rapida.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button href="/" size="lg">
              ← Torna alla presentazione
            </Button>
            <Button href="/segnalazioni" size="lg" variant="outline">
              Mandaci una richiesta
            </Button>
          </div>
        </ScrollReveal>
      </Section>
    </>
  );
}
