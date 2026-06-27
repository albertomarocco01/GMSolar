import { Fragment } from "react";
import Hero from "@/components/home/Hero";
import WorldDoors from "@/components/home/WorldDoors";
import Section from "@gmgroup/ui/Section";
import Badge from "@gmgroup/ui/Badge";
import Button from "@gmgroup/ui/Button";
import ScrollReveal from "@gmgroup/ui/ScrollReveal";
import SplitTextReveal from "@gmgroup/ui/SplitTextReveal";
import AnimatedCounter from "@gmgroup/ui/AnimatedCounter";
import { GROUP, WORLDS } from "@gmgroup/lib/site";
import solar from "@/data/solar-projects.json";

/** Numeri reali (GM Solar) per la fascia statistiche. */
const STATS = [
  { value: solar.stats.potenzaInstallataKWp, suffix: " kWp", label: "Potenza installata" },
  { value: solar.stats.co2RisparmiataT, suffix: " t", label: "CO₂ risparmiata" },
  { value: solar.stats.energiaProdottaMWh, suffix: " MWh", label: "Energia prodotta" },
  { value: solar.stats.progettiRealizzati, suffix: "+", label: "Progetti realizzati" },
];

export default function HomePage() {
  return (
    <>
      <Hero />

      {/* === L'ecosistema: il cerchio che si chiude === */}
      <Section id="ecosistema">
        <div className="max-w-2xl">
          <Badge>L&apos;ecosistema</Badge>
          <SplitTextReveal
            as="h2"
            text="Un cerchio che si chiude"
            className="font-display text-display-sm mt-4 font-bold tracking-tight text-balance"
          />
          <p className="text-muted mt-4 text-lg">
            Tre aziende, un&apos;unica filiera dell&apos;energia: ognuna risolve un pezzo e passa il
            testimone alla successiva.
          </p>
        </div>

        <ScrollReveal className="mt-12" y={28}>
          <div className="flex flex-col gap-4 md:flex-row md:items-stretch">
            {WORLDS.map((world, i) => (
              <Fragment key={world.key}>
                <div className="bg-surface border-border flex-1 rounded-lg border p-6">
                  <div className="font-display text-3xl font-bold" style={{ color: world.inkVar }}>
                    {world.step}
                  </div>
                  <h3 className="font-display mt-3 text-lg font-bold tracking-tight">
                    {world.role}
                  </h3>
                  <p className="text-muted mt-2 text-sm leading-relaxed">{world.description}</p>
                  <p className="text-muted mt-4 text-xs font-medium tracking-widest uppercase">
                    {world.brand}
                  </p>
                </div>
                {i < WORLDS.length - 1 && (
                  <div aria-hidden className="text-muted flex items-center justify-center md:px-1">
                    <span className="rotate-90 text-2xl md:rotate-0">→</span>
                  </div>
                )}
              </Fragment>
            ))}
          </div>
        </ScrollReveal>
      </Section>

      {/* === Fascia numeri (dark, accent lime ad alto contrasto) === */}
      <Section className="bg-brand-950 text-white">
        <p className="text-accent text-center text-xs font-medium tracking-widest uppercase">
          GM Solar in numeri
        </p>
        <div className="mt-10 grid grid-cols-2 gap-8 text-center md:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label}>
              <p className="font-display text-display-sm text-accent font-bold">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </p>
              <p className="mt-1 text-sm text-white/70">{stat.label}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* === Le tre porte === */}
      <Section>
        <div className="max-w-2xl">
          <Badge>I tre mondi</Badge>
          <SplitTextReveal
            as="h2"
            text="Scegli da dove entrare"
            className="font-display text-display-sm mt-4 font-bold tracking-tight text-balance"
          />
          <p className="text-muted mt-4 text-lg">
            Ogni mondo è un&apos;esperienza a sé. Apri una porta: il sito si ri-tematizza sul brand
            che stai visitando.
          </p>
        </div>
        <div className="mt-12">
          <WorldDoors />
        </div>
      </Section>

      {/* === Rimando alle demo + story-tour === */}
      <Section id="demo" className="bg-brand-950 text-white">
        <div className="grid items-center gap-10 md:grid-cols-[1.15fr_0.85fr]">
          <div className="max-w-2xl">
            <Badge variant="outline" className="border-white/25 text-white">
              Demo Wrapped
            </Badge>
            <SplitTextReveal
              as="h2"
              text="Tutta la demo in due minuti"
              className="font-display text-display-sm mt-4 font-bold tracking-tight text-balance"
            />
            <p className="mt-4 max-w-xl text-lg text-white/75">
              Uno story-tour a schermo intero che attraversa i tre mondi e i prototipi AI, in
              sequenza e in automatico. Oppure apri il launcher e scegli tu da dove partire.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button href="/demos/tour" size="lg">
                <span aria-hidden>▶</span> Avvia il tour
              </Button>
              <Button href="/demos" variant="outline" size="lg" className="border-white/30 text-white">
                Apri il demo launcher
              </Button>
            </div>
          </div>

          {/* Anteprima "cosa c'è dentro": i tre mondi + le demo AI. */}
          <ul className="grid gap-3 text-sm">
            {WORLDS.map((world) => (
              <li
                key={world.key}
                className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/4 px-4 py-3"
              >
                <span
                  aria-hidden
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: world.colorVar }}
                />
                <span className="font-semibold">{world.brand}</span>
                <span className="text-white/55">{world.role}</span>
              </li>
            ))}
            <li className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/4 px-4 py-3">
              <span aria-hidden className="text-base">
                ✨
              </span>
              <span className="font-semibold">Prototipi AI</span>
              <span className="text-white/55">lead, analytics, agente di ricarica</span>
            </li>
          </ul>
        </div>
      </Section>

      {/* === CTA finale === */}
      <Section className="bg-surface border-border border-t text-center">
        <SplitTextReveal
          as="h2"
          text="Pronto a chiudere il cerchio?"
          className="font-display text-display-sm mx-auto max-w-2xl font-bold tracking-tight text-balance"
        />
        <p className="text-muted mx-auto mt-4 max-w-xl text-lg">
          Energia, mobilità e ricarica con un unico interlocutore: GM Group.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button href={`mailto:${GROUP.email}`} size="lg">
            Parla con il gruppo
          </Button>
          <Button href="/solar" variant="ghost" size="lg">
            Esplora GM Solar
          </Button>
        </div>
      </Section>
    </>
  );
}
