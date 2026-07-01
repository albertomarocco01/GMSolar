"use client";

/**
 * @descrizione  Cue "Scorri" PRESENTAZIONALE (mousino SVG + dot che scende in loop +
 *   freccia giù). NON gestisce visibilità né listener: è la scena madre (via la sua
 *   timeline di scroll) a mostrarlo all'inizio e a sfumarlo appena parte lo scroll,
 *   così RICOMPARE a ogni video (meccanica ripetuta). CSS/SVG puro, keyframe scoped
 *   (niente tocchi a globals condiviso). `reduced` → glifo statico (niente loop).
 *   Sostituisce il vecchio ScrollHint globale (che spariva una volta sola).
 * @indice
 * - ScrollCue → mousino "Scorri" riusabile; la scena madre ne pilota l'opacità
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
      className={cn("flex w-fit flex-col items-center gap-2 text-white", className)}
    >
      <span
        className="text-[0.7rem] font-medium tracking-[0.25em] uppercase"
        style={TEXT_SHADOW}
      >
        Scorri
      </span>
      {/* Mousino: guscio + dot che scende in loop */}
      <span className="relative flex h-9 w-[22px] items-start justify-center rounded-full border-2 border-white/70">
        <span className={cn("bg-accent mt-1.5 h-1.5 w-1.5 rounded-full", !reduced && "sc-dot")} />
      </span>
      {/* Freccia giù */}
      <svg
        className={cn(!reduced && "sc-arrow")}
        width="18"
        height="18"
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
        @keyframes sc-dot { 0%{transform:translateY(0);opacity:1} 70%{opacity:0} 100%{transform:translateY(12px);opacity:0} }
        @keyframes sc-arrow { 0%,100%{transform:translateY(0)} 50%{transform:translateY(4px)} }
        .sc-dot { animation: sc-dot 1.5s ease-in-out infinite; }
        .sc-arrow { animation: sc-arrow 1.5s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
