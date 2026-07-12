"use client";

/**
 * @descrizione  Cue "Scorri su e giù" PRESENTAZIONALE (label + mousino SVG con
 *   dot + doppia freccia ↑/↓). NON gestisce visibilità né loop: la scena madre
 *   lo mostra all'inizio, lo sfuma appena parte lo scroll e PILOTA dot e frecce
 *   (hook `.sc-dot`, `.sc-up`, `.sc-down`) via GSAP in sync con la micro-demo
 *   che scrubba il video avanti E indietro (vedi SolarTwinScene): la freccia
 *   attiva segue la direzione della demo → il cue "insegna" che lo
 *   scrollytelling funziona in ENTRAMBI i versi. Con la demo ferma (reduced,
 *   pausa, kill) le due frecce restano entrambe visibili: il messaggio
 *   bidirezionale si legge anche da fermo.
 * @indice
 * - ScrollCue → mousino "Scorri su e giù" riusabile; la scena madre pilota tutto
 */
import { cn } from "@gmgroup/lib/utils";

const TEXT_SHADOW = { textShadow: "0 2px 12px rgba(0,0,0,0.6)" } as const;

/** Chevron riusabile (su/giù): stroke corrente, dimensione fissa 20px. */
function Chevron({ up, className }: { up?: boolean; className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={up ? "m6 15 6-6 6 6" : "m6 9 6 6 6-6"} />
    </svg>
  );
}

export default function ScrollCue({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("flex w-fit flex-col items-center gap-1.5 text-white", className)}
    >
      <span className="mb-1 text-sm font-medium tracking-[0.25em] uppercase" style={TEXT_SHADOW}>
        Scorri su e giù
      </span>
      {/* Freccia SU: la demo la accende quando il video torna indietro. */}
      <Chevron up className="sc-up opacity-70" />
      {/* Mousino: guscio + dot. Il dot NON ha keyframe propri: lo muove la scena
          madre (GSAP, `.sc-dot`) in sync con lo scrub-demo del video. */}
      <span className="relative flex h-14 w-8 items-start justify-center rounded-full border-2 border-white/70">
        <span className="sc-dot bg-accent mt-2 h-2 w-2 rounded-full" />
      </span>
      {/* Freccia GIÙ: accesa quando la demo manda il video avanti. */}
      <Chevron className="sc-down opacity-70" />
    </div>
  );
}
