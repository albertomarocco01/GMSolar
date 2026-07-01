/**
 * @descrizione  CHIUSURA della presentazione. Prima era un fade-to-black; ora è una
 *   slide conclusiva "GM Solar" — tema CHIARO, accent lime, stesso linguaggio delle
 *   scene-prodotto. Riepiloga in un ELENCO i servizi digitali mostrati e invita a
 *   rivedere la presentazione (rewind smooth). Entrata in ScrollReveal (rispetta
 *   reduced-motion). Il solo CTA (ReplayButton) è client; il resto è statico.
 * @indice
 * - ClosingScene → ultima sezione: card riassuntiva GM Solar (sostituisce il nero)
 */
import Section from "@gmgroup/ui/Section";
import ScrollReveal from "@gmgroup/ui/ScrollReveal";
import ReplayButton from "@/components/home/ReplayButton";

// I 7 servizi digitali della demo, nell'ordine in cui la presentazione li mostra.
// Tutti mock/placeholder (vedi CLAUDE.md: la demo è la vetrina delle proposte).
const SERVIZI = [
  "Siti vetrina moderni",
  "Assistente AI di sito",
  "Dashboard & telemetria",
  "Gestionale con AI",
  "Pannello segnalazioni",
  "App di ricarica EV",
  "Integrazioni API",
];

export default function ClosingScene() {
  return (
    <Section fullBleed className="relative overflow-hidden">
      {/* Alone lime morbido dietro al contenuto. */}
      <div
        aria-hidden
        className="bg-accent-soft pointer-events-none absolute top-1/4 left-1/2 z-0 h-[55vh] w-[55vh] -translate-x-1/2 rounded-full opacity-60 blur-3xl"
      />

      <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
        <ScrollReveal stagger={0.08}>
          {/* Mark + wordmark GM Solar (stesso mark lime della nav). */}
          <div className="flex items-center justify-center gap-2.5">
            <span className="bg-accent h-7 w-7 rounded-[8px]" aria-hidden />
            <span className="font-display text-xl font-bold tracking-tight">GM Solar</span>
          </div>

          <h2 className="font-display mt-6 text-4xl font-bold tracking-tight text-balance md:text-5xl lg:text-6xl">
            Un unico partner, <span className="text-accent-ink">dall’impianto alla piattaforma.</span>
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-lg text-black/60">
            Progettiamo l’energia e gli strumenti per governarla: fotovoltaico, accumulo e ricarica,
            con dashboard, gestionale e assistente AI su misura.
          </p>

          {/* Recap: ELENCO numerato dei servizi presentati, nell'ordine mostrato. */}
          <ol className="mx-auto mt-9 max-w-md space-y-2.5 text-left">
            {SERVIZI.map((s, i) => (
              <li key={s} className="flex items-center gap-3">
                <span className="bg-accent-soft text-accent-ink flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold tabular-nums">
                  {i + 1}
                </span>
                <span className="text-foreground text-base font-medium">{s}</span>
              </li>
            ))}
          </ol>

          <div className="mt-10 flex justify-center">
            <ReplayButton />
          </div>
        </ScrollReveal>
      </div>
    </Section>
  );
}
