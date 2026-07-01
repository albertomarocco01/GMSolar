"use client";

/**
 * @descrizione  Indicatore "scrolla" del primo viewport: un mousino SVG con dot che
 *   scende in loop + freccia giù, in basso-centro. CSS/SVG puro (niente video). Fade-out
 *   al primo INPUT dell'utente (wheel/touch/pointer/tasti) — NON su scrollY, perché
 *   l'AutoScroll muove la pagina da solo durante l'intro e nasconderebbe l'hint prima
 *   che si veda. Sono gli stessi segnali con cui AutoScroll cede il controllo, così
 *   l'hint resta durante l'autoplay e sparisce quando l'utente prende in mano lo scroll.
 *   Accent lime. reduced-motion → statico (niente loop dot/freccia). Montato una volta
 *   sulla home come AutoScroll; sostituisce il vecchio `.vt-cue` inline di VetrinaScene.
 * @indice
 * - ScrollHint → hint di scroll fixed, si dissolve al primo input utente
 */
import { useEffect, useState } from "react";
import { useReducedMotion } from "@gmgroup/lib/motion";

const TEXT_SHADOW = { textShadow: "0 2px 12px rgba(0,0,0,0.6)" } as const;

export default function ScrollHint() {
  const reduced = useReducedMotion();
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    // Solo mousemove REALI contano (lo scroll genera mousemove sintetici a delta 0).
    const onMove = (e: MouseEvent) => {
      if (e.movementX !== 0 || e.movementY !== 0) hide();
    };
    const hide = () => setHidden(true);
    const opts: AddEventListenerOptions = { passive: true, once: true };
    window.addEventListener("wheel", hide, opts);
    window.addEventListener("touchstart", hide, opts);
    window.addEventListener("pointerdown", hide, opts);
    window.addEventListener("keydown", hide, { once: true });
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("wheel", hide);
      window.removeEventListener("touchstart", hide);
      window.removeEventListener("pointerdown", hide);
      window.removeEventListener("keydown", hide);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <div
      aria-hidden
      className={`pointer-events-none fixed inset-x-0 bottom-6 z-50 mx-auto flex w-fit flex-col items-center gap-2 text-white transition-opacity duration-500 ${
        hidden ? "opacity-0" : "opacity-80"
      }`}
    >
      <span
        className="text-[0.7rem] font-medium tracking-[0.25em] uppercase"
        style={TEXT_SHADOW}
      >
        Scorri
      </span>
      {/* Mousino: guscio + dot che scende in loop */}
      <span className="relative flex h-9 w-[22px] items-start justify-center rounded-full border-2 border-white/70">
        <span
          className={`bg-accent mt-1.5 h-1.5 w-1.5 rounded-full ${reduced ? "" : "sh-dot"}`}
        />
      </span>
      {/* Freccia giù */}
      <svg
        className={reduced ? "" : "sh-arrow"}
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
        @keyframes sh-dot { 0%{transform:translateY(0);opacity:1} 70%{opacity:0} 100%{transform:translateY(12px);opacity:0} }
        @keyframes sh-arrow { 0%,100%{transform:translateY(0)} 50%{transform:translateY(4px)} }
        .sh-dot { animation: sh-dot 1.5s ease-in-out infinite; }
        .sh-arrow { animation: sh-arrow 1.5s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
