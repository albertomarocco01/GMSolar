import type { Metadata } from "next";
import Section from "@gmgroup/ui/Section";
import Badge from "@gmgroup/ui/Badge";
import Button from "@gmgroup/ui/Button";
import SplitTextReveal from "@gmgroup/ui/SplitTextReveal";
import AnalyticsApp from "@/components/solar/analytics/AnalyticsApp";

export const metadata: Metadata = {
  title: "Analytics AI",
  description:
    "Prototipo di analytics back-office per GM Solar: domande in linguaggio naturale → SQL → grafici e sintesi, con un Security Audit Gatekeeper che blocca l'estrazione di dati sensibili (PIN, PII) per conformità GDPR. Funziona anche senza chiave AI.",
  alternates: { canonical: "/solar/analytics" },
};

/**
 * /solar/analytics — porting del prototipo "gm-solar-analytics".
 *
 * Server route `app/api/analytics` (helper multi-provider) con due scenari
 * pre-baked (analisi kWh legittima + blocco di sicurezza) e sandbox senza chiave:
 * funziona ANCHE senza AI_API_KEY. La UI ERP (slate/white) è ri-tematizzata col
 * verde-accent di GM Solar per i tratti brand/primari; i grafici usano Recharts.
 */
export default function SolarAnalyticsPage() {
  return (
    <>
      <Section className="pt-28 pb-8">
        <div className="max-w-2xl">
          <Badge>GM Solar · Back-office AI — Demo MVP</Badge>
          <SplitTextReveal
            as="h1"
            text="Analytics che parlano la tua lingua"
            className="font-display text-display-sm mt-4 font-bold tracking-tight text-balance"
          />
          <p className="text-muted mt-4 text-lg">
            Fai una domanda in italiano: l&apos;agente genera la <strong>query SQL</strong>, ti
            restituisce una sintesi e un <strong>grafico</strong>. Un{" "}
            <strong>Security Audit Gatekeeper</strong> blocca i tentativi di estrarre PIN o dati
            personali (GDPR), con tanto di audit-trail.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button href="#console" size="lg">
              Prova la console
            </Button>
            <Button href="/solar" variant="ghost" size="lg">
              ← Torna a GM Solar
            </Button>
          </div>
          <p className="text-muted mt-6 text-xs">
            Demo interattiva: dati e tabelle sono segnaposto. Prova le domande veloci, incluso il
            test &laquo;PIN&raquo; per vedere il blocco di sicurezza. Funziona anche senza chiave
            AI.
          </p>
        </div>
      </Section>

      {/* Finestra "app" ERP incorniciata, full-width entro il container. */}
      <div id="console" className="scroll-mt-20 px-4 pb-16 sm:px-6">
        <div className="border-border shadow-lift mx-auto max-w-7xl overflow-hidden rounded-2xl border">
          <AnalyticsApp />
        </div>
      </div>
    </>
  );
}
