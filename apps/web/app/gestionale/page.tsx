import type { Metadata } from "next";
import Section from "@gmgroup/ui/Section";
import Badge from "@gmgroup/ui/Badge";
import Button from "@gmgroup/ui/Button";
import SplitTextReveal from "@gmgroup/ui/SplitTextReveal";
import GestionaleApp from "@/components/gestionale/GestionaleApp";

export const metadata: Metadata = {
  title: "Gestionale con AI",
  description:
    "Webapp gestionale demo con assistente AI integrato: chiedi in linguaggio naturale (es. «ordini aperti sopra 50.000 €», «clienti del Piemonte», «progetti in ritardo») e l'app filtra clienti, ordini, progetti e scadenze.",
  alternates: { canonical: "/gestionale" },
};

/**
 * /gestionale — demo del gestionale con assistente AI.
 *
 * Tutti i dati sono MOCK (data/erp-mock.ts), deterministici. L'assistente usa
 * il route handler `app/api/gestionale` (helper multi-provider @/lib/ai): con
 * AI_API_KEY interpreta via LLM, altrimenti ricade su un parser euristico
 * deterministico. Guardrail server-side contro injection e richieste fuori
 * ambito. Accent "hub" (lime) ereditato dal ThemeProvider sulla route.
 */
export default function GestionalePage() {
  return (
    <>
      <Section className="pt-28 pb-6">
        <div className="max-w-2xl">
          <Badge>Servizio 4 · Gestionale con AI — Demo</Badge>
          <SplitTextReveal
            as="h1"
            text="Il gestionale che parla la tua lingua"
            className="font-display text-display-sm mt-4 font-bold tracking-tight text-balance"
          />
          <p className="text-muted mt-4 text-lg">
            Clienti, ordini, progetti e scadenze in un&apos;unica webapp. Chiedi all&apos;
            <strong>assistente AI</strong> in italiano — «ordini aperti sopra 50.000 €», «clienti
            del Piemonte», «progetti in ritardo» — e i dati si filtrano da soli.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button href="#app" size="lg">
              Apri il gestionale
            </Button>
            <Button href="/" variant="ghost" size="lg">
              ← Torna alla presentazione
            </Button>
          </div>
          <p className="text-muted mt-6 text-xs">
            Demo interattiva: dati segnaposto e deterministici, risposte simulate per la
            presentazione.
          </p>
        </div>
      </Section>

      <div id="app" className="scroll-mt-20 px-4 pb-16 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <GestionaleApp />
        </div>
      </div>
    </>
  );
}
