import type { ComponentType, SVGProps } from "react";
import Section from "@/components/ui/Section";
import Badge from "@/components/ui/Badge";
import ScrollReveal from "@/components/ui/ScrollReveal";
import SplitTextReveal from "@/components/ui/SplitTextReveal";
import solar from "@/data/solar-projects.json";
import {
  IconDesign,
  IconWrench,
  IconMonitor,
  IconDocument,
  IconChat,
  IconShield,
} from "@/components/solar/SolarIcons";

type Icon = ComponentType<SVGProps<SVGSVGElement>>;

/**
 * Presentazione locale dei servizi: l'elenco vive nel dato
 * (data/solar-projects.json → servizi), qui solo icona e copy.
 * "Chiavi in mano" come EPC: ogni voce è una fase del ciclo dell'impianto.
 */
const PRESENTATION: Record<string, { icon: Icon; description: string }> = {
  Progettazione: {
    icon: IconDesign,
    description: "Studio di fattibilità, dimensionamento e progetto esecutivo su misura del sito.",
  },
  Installazione: {
    icon: IconWrench,
    description: "Realizzazione chiavi in mano con squadre certificate e collaudo dell'impianto.",
  },
  Monitoraggio: {
    icon: IconMonitor,
    description: "Telecontrollo continuo della produzione per intervenire prima che cali la resa.",
  },
  "Gestione amministrativa": {
    icon: IconDocument,
    description:
      "Pratiche, permessi, incentivi e connessione alla rete: la burocrazia la gestiamo noi.",
  },
  Consulenza: {
    icon: IconChat,
    description: "Analisi dei consumi e scelta della soluzione più conveniente nel tempo.",
  },
  "Manutenzione O&M": {
    icon: IconShield,
    description: "Operation & Maintenance programmata per tenere l'impianto efficiente per anni.",
  },
};

export default function SolarServizi() {
  return (
    <Section id="servizi" className="bg-surface border-border border-y">
      <div className="max-w-2xl">
        <Badge>Servizi end-to-end</Badge>
        <SplitTextReveal
          as="h2"
          text="Un solo interlocutore, dall'idea alla resa"
          className="font-display text-display-sm mt-4 font-bold tracking-tight text-balance"
        />
        <p className="text-muted mt-4 text-lg">
          Da EPC Contractor seguiamo tutto il ciclo di vita dell&apos;impianto, senza scaricare
          niente sul cliente.
        </p>
      </div>

      <ScrollReveal
        className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3"
        stagger={0.08}
        y={28}
      >
        {solar.servizi.map((nome) => {
          const { icon: Icon, description } = PRESENTATION[nome] ?? {
            icon: IconShield,
            description: "",
          };
          return (
            <div key={nome} className="flex gap-4">
              <span className="text-accent-ink mt-0.5 shrink-0">
                <Icon className="h-7 w-7" />
              </span>
              <div>
                <h3 className="font-display text-base font-bold tracking-tight">{nome}</h3>
                <p className="text-muted mt-1.5 text-sm leading-relaxed">{description}</p>
              </div>
            </div>
          );
        })}
      </ScrollReveal>
    </Section>
  );
}
