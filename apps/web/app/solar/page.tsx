import type { Metadata } from "next";
import Section from "@gmgroup/ui/Section";
import Badge from "@gmgroup/ui/Badge";
import Button from "@gmgroup/ui/Button";
import Card from "@gmgroup/ui/Card";
import SplitTextReveal from "@gmgroup/ui/SplitTextReveal";
import SolarHero from "@/components/solar/SolarHero";
import SolarStats from "@/components/solar/SolarStats";
import SolarTrust from "@/components/solar/SolarTrust";
import SolarTipologie from "@/components/solar/SolarTipologie";
import SolarServizi from "@/components/solar/SolarServizi";
import SolarCaseStudy from "@/components/solar/SolarCaseStudy";
import SolarMap from "@/components/solar/SolarMap";
import SolarCalculator from "@/components/solar/SolarCalculator";
import SolarCTA from "@/components/solar/SolarCTA";

export const metadata: Metadata = {
  title: "Solar",
  description:
    "GM Solar — EPC Contractor per impianti fotovoltaici di media e grande scala: progettazione, installazione, monitoraggio e manutenzione O&M.",
  alternates: { canonical: "/solar" },
};

/**
 * Sezione GM Solar (taglio cinematografico). Composizione di blocchi piccoli
 * e riusabili da @/components/solar; i dati arrivano da data/solar-projects.json
 * e i video reali da lib/assets. Il theming (accent chartreuse) è già attivo su
 * questa route via ThemeProvider.
 */
export default function SolarPage() {
  return (
    <>
      <SolarHero />
      <SolarStats />
      <SolarTrust />
      <SolarTipologie />

      {/* Strumenti AI di GM Solar (demo) → /solar/lead, /solar/analytics */}
      <Section id="ai-tools" className="bg-surface border-border border-y">
        <div className="max-w-2xl">
          <Badge>Strumenti AI · Demo</Badge>
          <SplitTextReveal
            as="h2"
            text="L'intelligenza artificiale al lavoro per GM Solar"
            className="font-display text-display-sm mt-4 font-bold tracking-tight text-balance"
          />
          <p className="text-muted mt-4 text-lg">
            Due prototipi agentici: un assistente che qualifica i lead in pre-vendita e un modulo di
            analytics in linguaggio naturale per il back-office. Funzionano anche senza chiave AI.
          </p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <Card className="flex flex-col p-6">
            <h3 className="font-display text-lg font-bold tracking-tight">
              Lead Qualifier agentico
            </h3>
            <p className="text-muted mt-2 flex-1 text-sm leading-relaxed">
              Capisce il bisogno e consiglia Monofase, Trifase o Accumulo. Con filtro di
              brand-safety e pannello di ragionamento dell&apos;agente.
            </p>
            <Button href="/solar/lead" className="mt-5 self-start">
              Apri il lead qualifier →
            </Button>
          </Card>
          <Card className="flex flex-col p-6">
            <h3 className="font-display text-lg font-bold tracking-tight">
              Analytics in linguaggio naturale
            </h3>
            <p className="text-muted mt-2 flex-1 text-sm leading-relaxed">
              Domande in italiano → SQL → grafici e sintesi, con un gatekeeper di sicurezza che
              blocca le richieste di dati sensibili (GDPR).
            </p>
            <Button href="/solar/analytics" className="mt-5 self-start">
              Apri l&apos;analytics →
            </Button>
          </Card>
        </div>
      </Section>

      <SolarServizi />
      <SolarCaseStudy />
      <SolarMap />
      <SolarCalculator />
      <SolarCTA />
    </>
  );
}
