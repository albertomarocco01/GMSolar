import Link from "next/link";
import Container from "@gmgroup/ui/Container";
import ScrollReveal from "@gmgroup/ui/ScrollReveal";
import DemoCard from "@/components/demos/DemoCard";
import TourEntryButton from "@/components/demos/TourEntryButton";
import { DEMOS, SECTIONS, STATUS, demosBySection } from "@/components/demos/catalog";

/**
 * Demo launcher — dashboard interna che elenca TUTTE le demo dell'ecosistema
 * (i tre mondi + hub, i prototipi AI, la roadmap). Le card sono guidate da
 * `/data/demos.json`: aggiungere una demo = una voce. Pagina server-side;
 * l'unica parte animata è il reveal allo scroll (ScrollReveal, che rispetta
 * prefers-reduced-motion). Header/footer propri (l'header/footer di gruppo è
 * nascosto dal layout di route).
 */

const readyCount = DEMOS.filter((demo) => demo.status === "ready").length;

export default function DemosPage() {
  return (
    <>
      {/* Header strip della dashboard. */}
      <header className="border-border/70 bg-background/80 sticky top-0 z-40 border-b backdrop-blur-md">
        <Container size="wide" className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="font-display text-lg font-bold tracking-tight"
              aria-label="GM Group — vai al sito"
            >
              GM <span className="text-accent-ink">Group</span>
            </Link>
            <span className="text-border" aria-hidden>
              /
            </span>
            <span className="text-muted text-sm font-medium">Demo launcher</span>
          </div>
          <Link
            href="/"
            className="text-muted hover:text-foreground text-sm font-medium transition-colors"
          >
            Vai al sito{" "}
            <span aria-hidden>↗</span>
          </Link>
        </Container>
      </header>

      <main className="flex-1">
        {/* Intro. */}
        <Container size="wide" className="py-10 md:py-14">
          <p className="text-accent-ink text-xs font-semibold tracking-[0.22em] uppercase">
            Navigazione interna
          </p>
          <h1 className="font-display text-display-sm mt-3 font-bold tracking-tight text-balance">
            Demo launcher
          </h1>
          <p className="text-muted mt-3 max-w-2xl text-lg">
            Un solo posto da cui aprire ogni demo dell&apos;ecosistema GM Group durante la
            presentazione. Tutte le anteprime e gli asset sono placeholder.
          </p>

          {/* Entry point del "Demo Wrapped": story-tour a schermo intero. */}
          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2">
            <TourEntryButton />
            <span className="text-muted text-sm">
              Riproduzione automatica · swipe, tap o frecce per navigare
            </span>
          </div>

          {/* Legenda + conteggio. */}
          <div className="text-muted mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
            <span className="inline-flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${STATUS.ready.dot}`} aria-hidden />
              {STATUS.ready.label}
            </span>
            <span className="inline-flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${STATUS.wip.dot}`} aria-hidden />
              {STATUS.wip.label}
            </span>
            <span className="text-muted/80">
              {readyCount} pronte · {DEMOS.length} demo totali
            </span>
          </div>
        </Container>

        {/* Sezioni di card. */}
        {SECTIONS.map((section) => {
          const items = demosBySection(section.key);
          if (items.length === 0) return null;
          return (
            <section
              key={section.key}
              aria-labelledby={`sec-${section.key}`}
              className="pb-12"
            >
              <Container size="wide">
                <p className="text-accent-ink text-xs font-semibold tracking-[0.22em] uppercase">
                  {section.eyebrow}
                </p>
                <h2
                  id={`sec-${section.key}`}
                  className="font-display mt-2 text-2xl font-bold tracking-tight"
                >
                  {section.title}
                </h2>
                <p className="text-muted mt-2 max-w-2xl">{section.description}</p>

                {/* I figli diretti del reveal (le card) entrano in cascata. */}
                <ScrollReveal
                  stagger={0.08}
                  className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
                >
                  {items.map((demo) => (
                    <DemoCard key={demo.key} demo={demo} />
                  ))}
                </ScrollReveal>
              </Container>
            </section>
          );
        })}
      </main>

      {/* Footer della dashboard (annidato in <main>, quindi non nascosto). */}
      <footer className="border-border/70 text-muted/80 mt-auto border-t py-10 text-xs">
        <Container size="wide" className="flex flex-col gap-1">
          <p>Pagina di navigazione interna per la presentazione — non indicizzata.</p>
          <p>
            Tutte le anteprime e gli asset sono placeholder, sostituibili senza toccare il codice.
          </p>
        </Container>
      </footer>
    </>
  );
}
