/**
 * @descrizione Sezione "Flussi di automazione" della pagina /integrazioni:
 * intestazione + un FlowDiagram per scenario. Estratto da
 * app/integrazioni/page.tsx (stesso markup a runtime).
 */
import Section from "@gmgroup/ui/Section";
import ScrollReveal from "@gmgroup/ui/ScrollReveal";
import Badge from "@gmgroup/ui/Badge";
import FlowDiagram from "@/components/integrazioni/FlowDiagram";
import type { FlowScenario } from "@/components/integrazioni/types";

export default function FlussiSection({ scenarios }: { scenarios: FlowScenario[] }) {
  return (
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
        {scenarios.map((scenario) => (
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
  );
}
