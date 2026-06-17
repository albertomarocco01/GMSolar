import type { Metadata } from "next";
import Section from "@gmgroup/ui/Section";
import Badge from "@gmgroup/ui/Badge";
import Button from "@gmgroup/ui/Button";
import SplitTextReveal from "@gmgroup/ui/SplitTextReveal";
import LeadQualifierApp from "@/components/solar/lead/LeadQualifierApp";

export const metadata: Metadata = {
  title: "Lead qualifier AI",
  description:
    "Prototipo di agente di pre-vendita per GM Solar: un Product-Selector consiglia impianto Monofase, Trifase o Accumulo dal bisogno dell'utente, con filtro di brand-safety (out-of-scope) e pannello di ragionamento dell'agente. Funziona anche senza chiave AI.",
  alternates: { canonical: "/solar/lead" },
};

/**
 * /solar/lead — porting del prototipo "gm-solar-agentic-lead-qualifier".
 *
 * Server route `app/api/lead-qualifier` (helper multi-provider) con risposte
 * pre-baked + fallback euristico: la demo funziona ANCHE senza AI_API_KEY. La UI
 * (interfaccia generativa a sinistra + chat a destra) è ri-tematizzata sull'accent
 * di GM Solar; i colori semantici (blu industriale, smeraldo accumulo, rosso
 * blocco) restano per distinguere le categorie.
 */
export default function SolarLeadPage() {
  return (
    <>
      <Section className="pt-28">
        <div className="max-w-2xl">
          <Badge>GM Solar · Agentic AI — Demo MVP</Badge>
          <SplitTextReveal
            as="h1"
            text="Qualifica i lead con un agente AI"
            className="font-display text-display-sm mt-4 font-bold tracking-tight text-balance"
          />
          <p className="text-muted mt-4 text-lg">
            Un agente <strong>Product-Selector</strong> capisce il bisogno e consiglia
            l&apos;impianto giusto — <strong>Monofase</strong>, <strong>Trifase</strong> o{" "}
            <strong>Accumulo</strong> — mentre un filtro di <strong>brand-safety</strong> blocca le
            richieste fuori tema. A sinistra l&apos;interfaccia si trasforma in tempo reale; il
            pannello di ragionamento mostra cosa pensa l&apos;agente.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button href="#configuratore" size="lg">
              Prova l&apos;agente
            </Button>
            <Button href="/solar" variant="ghost" size="lg">
              ← Torna a GM Solar
            </Button>
          </div>
          <p className="text-muted mt-6 text-xs">
            Demo interattiva: scenari e dimensionamenti sono segnaposto. L&apos;assistente funziona
            anche senza chiave AI (risposte deterministiche); con una chiave passa al modello.
          </p>
        </div>
      </Section>

      <div id="configuratore" className="scroll-mt-20">
        <LeadQualifierApp />
      </div>
    </>
  );
}
