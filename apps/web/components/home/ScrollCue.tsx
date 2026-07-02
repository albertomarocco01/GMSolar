"use client";

/**
 * @descrizione  Cue "Scorri" PRESENTAZIONALE grande (label + mousino SVG con dot
 *   + freccia giù). NON gestisce visibilità né loop del dot: la scena madre lo
 *   mostra all'inizio, lo sfuma appena parte lo scroll e PILOTA il dot (hook
 *   `.sc-dot`) via GSAP in sync con la micro-demo che scrubba il video avanti e
 *   indietro (vedi SolarTwinScene) → il cue "insegna" il gesto mostrandone
 *   l'effetto sul video. La freccia tiene un keyframe CSS scoped (la pausa
 *   globale lo congela via `html[data-presentation-paused]`, vedi AutoScroll).
 *   `reduced` → glifo statico (nessuna animazione).
 * @indice
 * - ScrollCue → mousino "Scorri" riusabile; la scena madre pilota opacità e dot
 */
import { cn } from "@gmgroup/lib/utils";

const TEXT_SHADOW = { textShadow: "0 2px 12px rgba(0,0,0,0.6)" } as const;

export default function ScrollCue({
  reduced,
  className,
}: {
  reduced: boolean;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={cn("flex w-fit flex-col items-center gap-2.5 text-white", className)}
    >
      <span className="text-sm font-medium tracking-[0.25em] uppercase" style={TEXT_SHADOW}>
        Scorri
      </span>
      {/* Mousino: guscio + dot. Il dot NON ha keyframe propri: lo muove la scena
          madre (GSAP, `.sc-dot`) in sync con lo scrub-demo del video. */}
      <span className="relative flex h-14 w-8 items-start justify-center rounded-full border-2 border-white/70">
        <span className="sc-dot bg-accent mt-2 h-2 w-2 rounded-full" />
      </span>
      {/* Freccia giù */}
      <svg
        className={cn(!reduced && "sc-arrow")}
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>

      {/* Keyframe scoped (niente tocchi a globals.css condiviso). */}
      <style>{`
        @keyframes sc-arrow { 0%,100%{transform:translateY(0)} 50%{transform:translateY(4px)} }
        .sc-arrow { animation: sc-arrow 1.5s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
