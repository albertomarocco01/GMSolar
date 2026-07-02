/**
 * @descrizione  CHIUSURA della presentazione. Prima era un fade-to-black; ora è una
 *   slide conclusiva "GM Solar" — tema CHIARO, accent lime, stesso linguaggio delle
 *   scene-prodotto. Riepiloga in un ELENCO i servizi digitali mostrati e invita a
 *   rivedere la presentazione (rewind smooth). Entrata in ScrollReveal (rispetta
 *   reduced-motion). Il solo CTA (ReplayButton) è client; il resto è statico.
 * @indice
 * - ClosingScene → ultima sezione: card riassuntiva GM Solar (sostituisce il nero)
 */
import {
  type LucideIcon,
  Bot,
  BarChart3,
  Database,
  MessageSquareWarning,
  PlugZap,
  Plug2,
} from "lucide-react";
import Section from "@gmgroup/ui/Section";
import ScrollReveal from "@gmgroup/ui/ScrollReveal";
import ReplayButton from "@/components/home/ReplayButton";

// I 6 servizi digitali mostrati nella presentazione, nell'ordine in cui appaiono.
// Tutti mock/placeholder (vedi CLAUDE.md: la demo è la vetrina delle proposte).
const SERVIZI: { label: string; Icon: LucideIcon }[] = [
  { label: "Assistente AI di sito", Icon: Bot },
  { label: "Dashboard & telemetria", Icon: BarChart3 },
  { label: "Gestionale con AI", Icon: Database },
  { label: "Pannello segnalazioni", Icon: MessageSquareWarning },
  { label: "App di ricarica EV", Icon: PlugZap },
  { label: "Integrazioni API", Icon: Plug2 },
];

export default function ClosingScene() {
  return (
    <Section fullBleed className="relative flex min-h-svh items-center justify-center overflow-hidden">
      {/* Riga accent in alto: richiama la barra di progresso delle scene-video. */}
      <div aria-hidden className="bg-accent absolute inset-x-0 top-0 z-10 h-1" />

      {/* Trama a puntini tenue (griglia accent) su tema chiaro. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(color-mix(in oklab, var(--accent) 20%, transparent) 1px, transparent 1.4px)",
          backgroundSize: "22px 22px",
        }}
      />
      {/* Due aloni lime morbidi: alto-sinistra + basso-destra. */}
      <div
        aria-hidden
        className="bg-accent-soft pointer-events-none absolute -top-20 -left-20 z-0 h-[46vh] w-[46vh] rounded-full opacity-70 blur-3xl"
      />
      <div
        aria-hidden
        className="bg-accent-soft pointer-events-none absolute -right-24 -bottom-24 z-0 h-[52vh] w-[52vh] rounded-full opacity-60 blur-3xl"
      />

      <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
        <ScrollReveal stagger={0.08}>
          {/* Mark + wordmark GM Solar (stesso mark lime della nav). */}
          <div className="flex items-center justify-center gap-2.5">
            <span className="bg-accent h-7 w-7 rounded-[8px]" aria-hidden />
            <span className="font-display text-xl font-bold tracking-tight">GM Solar</span>
          </div>

          <h2 className="font-display mt-4 text-3xl font-bold tracking-tight text-balance md:text-4xl lg:text-5xl">
            Un unico partner, <span className="text-accent-ink">dall’impianto alla piattaforma.</span>
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-base text-black/60 md:text-lg">
            Progettiamo l’energia e gli strumenti per governarla: fotovoltaico, accumulo e ricarica,
            con dashboard, gestionale e assistente AI su misura.
          </p>

          {/* Recap: ELENCO dei servizi presentati, nell'ordine mostrato. Ogni voce
              ha l'icona del servizio in un quadrato accent-soft (al posto del numero). */}
          <ol className="mx-auto mt-6 max-w-md space-y-1.5 text-left">
            {SERVIZI.map(({ label, Icon }) => (
              <li key={label} className="flex items-center gap-3">
                <span className="bg-accent-soft text-accent-ink flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
                  <Icon className="h-4 w-4" strokeWidth={2} aria-hidden />
                </span>
                <span className="text-foreground text-base font-medium">{label}</span>
              </li>
            ))}
          </ol>

          <div className="mt-6 flex justify-center">
            <ReplayButton />
          </div>
        </ScrollReveal>
      </div>
    </Section>
  );
}
