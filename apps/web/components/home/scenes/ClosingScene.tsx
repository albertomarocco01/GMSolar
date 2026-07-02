/**
 * @descrizione  CHIUSURA della presentazione, minimale: solo il marchio GM Solar
 *   ben grande e centrato e il bottone «Rivedi la presentazione». Tema CHIARO,
 *   accent lime, tanto spazio bianco. Entrata in ScrollReveal (rispetta
 *   reduced-motion). Il solo CTA (ReplayButton) è client; il resto è statico.
 * @indice
 * - ClosingScene → ultima sezione: logo GM Solar + replay, centrati e puliti
 */
import Section from "@gmgroup/ui/Section";
import ScrollReveal from "@gmgroup/ui/ScrollReveal";
import ReplayButton from "@/components/home/ReplayButton";

export default function ClosingScene() {
  return (
    <Section fullBleed className="relative flex min-h-svh items-center justify-center overflow-hidden">
      {/* Riga accent in alto: richiama la barra di progresso delle scene-video. */}
      <div aria-hidden className="bg-accent absolute inset-x-0 top-0 z-10 h-1" />

      {/* Un solo alone lime molto tenue, decentrato: il resto è spazio bianco. */}
      <div
        aria-hidden
        className="bg-accent-soft pointer-events-none absolute -top-24 -left-24 z-0 h-[50vh] w-[50vh] rounded-full opacity-40 blur-3xl"
      />

      <div className="relative z-10 mx-auto px-6 text-center">
        <ScrollReveal stagger={0.08}>
          {/* Mark + wordmark GM Solar (stesso mark lime della nav, in grande). */}
          <div className="flex items-center justify-center gap-4">
            <span className="bg-accent h-12 w-12 rounded-[12px] md:h-14 md:w-14" aria-hidden />
            <span className="font-display text-4xl font-bold tracking-tight md:text-5xl">
              GM Solar
            </span>
          </div>

          {/* Solo il CTA di replay: riavvia la presentazione come prima. */}
          <div className="mt-10 flex justify-center">
            <ReplayButton />
          </div>
        </ScrollReveal>
      </div>
    </Section>
  );
}
