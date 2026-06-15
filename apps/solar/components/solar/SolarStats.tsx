import Section from "@gmgroup/ui/Section";
import ScrollReveal from "@gmgroup/ui/ScrollReveal";
import AnimatedCounter from "@gmgroup/ui/AnimatedCounter";
import solar from "@/data/solar-projects.json";

/**
 * Banda statistiche: i 4 numeri reali dell'azienda (da data/solar-projects.json)
 * con conteggio animato allo scroll. Strip scura per un contrasto cinematografico;
 * su sfondo scuro l'accent pieno è leggibile, quindi qui si usa `text-accent`.
 */
const STATS = [
  { value: solar.stats.potenzaInstallataKWp, suffix: " kWp", label: "Potenza installata" },
  { value: solar.stats.co2RisparmiataT, suffix: " t", label: "CO₂ risparmiata" },
  { value: solar.stats.energiaProdottaMWh, suffix: " MWh", label: "Energia prodotta" },
  { value: solar.stats.progettiRealizzati, suffix: "+", label: "Progetti realizzati" },
] as const;

export default function SolarStats() {
  return (
    <Section className="bg-brand-950 text-white">
      <p className="text-accent text-center text-xs font-medium tracking-[0.25em] uppercase">
        GM Solar in numeri
      </p>

      <ScrollReveal
        className="mt-10 grid grid-cols-2 gap-x-8 gap-y-10 text-center md:grid-cols-4"
        stagger={0.12}
        y={28}
      >
        {STATS.map((stat) => (
          <div key={stat.label}>
            <p className="font-display text-display-sm text-accent font-bold tabular-nums">
              <AnimatedCounter value={stat.value} suffix={stat.suffix} />
            </p>
            <p className="mt-1 text-sm text-white/70">{stat.label}</p>
          </div>
        ))}
      </ScrollReveal>
    </Section>
  );
}
