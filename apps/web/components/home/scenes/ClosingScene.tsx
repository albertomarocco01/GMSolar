"use client";

/**
 * @descrizione  CHIUSURA della presentazione: titolo «GM Solar Demo», bottone
 *   «Rivedi la presentazione» e contatti del team, su uno sfondo animato
 *   discreto (bolle accent che rimbalzano — vedi ClosingBubbles — + trama a
 *   puntini). Lo sfondo rispetta reduced-motion (frame statico) e la pausa
 *   globale della presentazione (`presentation:pausechange` +
 *   `data-presentation-paused`).
 * @indice
 * - ClosingScene → ultima sezione: titolo + replay + contatti + sfondo a bolle
 */
import Section from "@gmgroup/ui/Section";
import ClosingBubbles from "@/components/home/ClosingBubbles";
import ReplayButton from "@/components/home/ReplayButton";

export default function ClosingScene() {
  return (
    <Section
      fullBleed
      className="relative flex min-h-svh items-center justify-center overflow-hidden"
    >
      {/* Riga accent in alto: richiama la barra di progresso delle scene-video. */}
      <div aria-hidden className="bg-accent absolute inset-x-0 top-0 z-10 h-1" />

      {/* Sfondo animato discreto: bolle accent che rimbalzano (canvas) + trama
          a puntini accent tenue (richiama le ChapterCard). */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage:
              "radial-gradient(color-mix(in oklab, var(--accent) 22%, transparent) 1px, transparent 1.4px)",
            backgroundSize: "24px 24px",
          }}
        />
        <ClosingBubbles />
      </div>

      {/* Chiusura: titolo, replay e contatti del team. */}
      <div className="relative z-10 flex flex-col items-center gap-10 px-6 py-16 text-center">
        <h2 className="font-display text-foreground text-5xl font-bold tracking-tight md:text-6xl">
          GM Solar Demo
        </h2>

        <ReplayButton />

        {/* Contatti (richiesti dal cliente per la chiusura della demo). */}
        <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
          {[
            {
              nome: "Alberto Marocco",
              tel: "389 660 5643",
              telHref: "+393896605643",
              email: "albertomarocco.dev@gmail.com",
            },
            {
              nome: "Jacopo Finzi",
              tel: "366 352 0980",
              telHref: "+393663520980",
              email: "jacopofinzi.dev@gmail.com",
            },
          ].map((c) => (
            <div
              key={c.nome}
              className="border-border bg-background/80 rounded-2xl border px-8 py-5 text-left shadow-lg backdrop-blur-sm"
            >
              <p className="font-display text-foreground text-base font-bold tracking-tight">
                {c.nome}
              </p>
              <p className="mt-1.5 text-sm">
                <a href={`tel:${c.telHref}`} className="text-muted hover:text-foreground">
                  {c.tel}
                </a>
              </p>
              <p className="text-sm">
                <a href={`mailto:${c.email}`} className="text-accent-ink hover:underline">
                  {c.email}
                </a>
              </p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
