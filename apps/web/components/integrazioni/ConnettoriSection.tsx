/**
 * @descrizione Sezione "Connettori" della pagina /integrazioni: intestazione
 * + griglia connettori. Estratto da app/integrazioni/page.tsx (stesso markup
 * a runtime, componente più piccolo e mirato).
 */
import Section from "@gmgroup/ui/Section";
import ScrollReveal from "@gmgroup/ui/ScrollReveal";
import Badge from "@gmgroup/ui/Badge";
import ConnectorGrid from "@/components/integrazioni/ConnectorGrid";
import type { ConnectorDef } from "@/components/integrazioni/types";

export default function ConnettoriSection({ connectors }: { connectors: ConnectorDef[] }) {
  return (
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

      <ConnectorGrid connectors={connectors} />
    </Section>
  );
}
