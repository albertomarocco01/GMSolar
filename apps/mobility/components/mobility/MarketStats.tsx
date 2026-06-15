import Section from "@gmgroup/ui/Section";
import Badge from "@gmgroup/ui/Badge";
import Card from "@gmgroup/ui/Card";
import AnimatedCounter from "@gmgroup/ui/AnimatedCounter";
import ScrollReveal from "@gmgroup/ui/ScrollReveal";
import { MARKET_SOURCE, MARKET_STATS } from "@/components/mobility/content";

/**
 * Sezione 3 — il mercato in numeri (DATI REALI, fonte citata in coda).
 * I contatori si animano una volta allo scroll-in (AnimatedCounter) e
 * rispettano prefers-reduced-motion (mostrano subito il valore finale).
 */
export default function MarketStats() {
  return (
    <Section id="mercato" className="bg-surface/40">
      <div className="mx-auto max-w-2xl text-center">
        <Badge>Il mercato</Badge>
        <h2 className="font-display text-display-sm mt-4 font-bold text-balance">
          L&apos;elettrico è già qui
        </h2>
        <p className="text-muted mt-4 text-lg text-pretty">
          La domanda di mobilità elettrica accelera e con lei la rete di ricarica. Ecco i numeri che
          contano.
        </p>
      </div>

      <ScrollReveal
        stagger={0.1}
        className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {MARKET_STATS.map((stat) => (
          <Card key={stat.label} className="p-6">
            <p className="text-accent-ink font-display text-4xl font-bold tracking-tight md:text-5xl">
              <AnimatedCounter value={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
            </p>
            <p className="mt-3 font-semibold">{stat.label}</p>
            <p className="text-muted mt-1 text-sm">{stat.note}</p>
          </Card>
        ))}
      </ScrollReveal>

      <p className="text-muted mt-8 text-center text-xs">{MARKET_SOURCE}</p>
    </Section>
  );
}
