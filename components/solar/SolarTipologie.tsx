import type { ComponentType, SVGProps } from "react";
import Section from "@/components/ui/Section";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import ScrollReveal from "@/components/ui/ScrollReveal";
import SplitTextReveal from "@/components/ui/SplitTextReveal";
import solar from "@/data/solar-projects.json";
import { IconHome, IconFactory, IconSolarFarm, IconRevamp } from "@/components/solar/SolarIcons";

type Icon = ComponentType<SVGProps<SVGSVGElement>>;

/**
 * Presentazione locale delle tipologie: i NOMI vivono nel dato
 * (data/solar-projects.json), qui si aggiungono solo icona e copy descrittivo.
 * Fallback neutro se in futuro arrivasse una tipologia non mappata.
 */
const PRESENTATION: Record<string, { icon: Icon; description: string }> = {
  Residenziali: {
    icon: IconHome,
    description:
      "Impianti su tetto per abitazioni singole e condomini, con accumulo e ottimizzazione dell'autoconsumo.",
  },
  "Industriali C&I": {
    icon: IconFactory,
    description:
      "Coperture di capannoni, logistica e attività commerciali: tagli di costo energetico su grandi superfici.",
  },
  "Solar Farm": {
    icon: IconSolarFarm,
    description:
      "Grandi campi a terra in scala utility, dalla connessione alla rete alla gestione dell'esercizio.",
  },
  Revamping: {
    icon: IconRevamp,
    description:
      "Ammodernamento e repowering di impianti esistenti per recuperarne efficienza e prolungarne la vita.",
  },
};

export default function SolarTipologie() {
  return (
    <Section id="tipologie">
      <div className="max-w-2xl">
        <Badge>Cosa realizziamo</Badge>
        <SplitTextReveal
          as="h2"
          text="Un impianto per ogni scala"
          className="font-display text-display-sm mt-4 font-bold tracking-tight text-balance"
        />
        <p className="text-muted mt-4 text-lg">
          Dalla villetta al campo da decine di megawatt: stesso metodo EPC, dimensioni diverse.
        </p>
      </div>

      <ScrollReveal className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4" stagger={0.1} y={32}>
        {solar.tipologie.map((nome) => {
          const { icon: Icon, description } = PRESENTATION[nome] ?? {
            icon: IconSolarFarm,
            description: "",
          };
          return (
            <Card key={nome} interactive className="flex h-full flex-col p-6">
              <span className="bg-accent-soft text-accent-ink inline-flex h-12 w-12 items-center justify-center rounded-lg">
                <Icon className="h-6 w-6" />
              </span>
              <h3 className="font-display mt-5 text-lg font-bold tracking-tight">{nome}</h3>
              <p className="text-muted mt-2 text-sm leading-relaxed">{description}</p>
            </Card>
          );
        })}
      </ScrollReveal>
    </Section>
  );
}
