"use client";

/**
 * @descrizione  KIT per le scene IMMERSIVE della home. Garantisce coerenza tra i
 *   prodotti: accent per tema (con derivati ricalcolati), wrapper full-screen
 *   sticky-scrub, cursore finto, frasi-intermezzo (tono DESCRITTIVO, non
 *   promozionale) ed ease espressivi. Selettori auto-scoped alla sezione via
 *   gsap.context, quindi più scene possono condividere le stesse classi.
 * @indice
 * - accentVars(theme)         → CSS vars accent (override completo, anche soft/ink)
 * - useImmersiveScene(build)  → ref: sticky-scrub + reduced-motion + init says
 * - say(tl, i) / cursorTo(tl) → helper timeline (intermezzo / cursore)
 * - <ImmersiveStage>, <Say>, <Cursor> → markup riusabile
 */
import { forwardRef, useRef } from "react";
import { gsap, ScrollTrigger } from "@gmgroup/lib/gsap";
import { prefersReducedMotion, useIsoLayoutEffect } from "@gmgroup/lib/motion";

const THEMES: Record<string, { a: string; s: string; c: string }> = {
  platform: { a: "#7c5cff", s: "#6344e6", c: "#ffffff" },
  mobility: { a: "#3c9e3a", s: "#2f7e2e", c: "#ffffff" },
  solar: { a: "#a8d920", s: "#8fbc15", c: "#0b1020" },
  shop: { a: "#c8d400", s: "#a8b200", c: "#0b1020" },
};

/** Accent completo per tema: include i derivati (soft/ink/ring) perché a :root
 *  sono "cotti" sull'accent del gruppo e un override del solo --accent non basta. */
export function accentVars(theme: string): React.CSSProperties {
  const t = THEMES[theme] ?? THEMES.platform;
  const v: Record<string, string> = {
    "--accent": t.a,
    "--accent-strong": t.s,
    "--accent-contrast": t.c,
    "--accent-soft": `color-mix(in oklab, ${t.a} 14%, transparent)`,
    "--accent-ink": `color-mix(in oklab, ${t.a}, #0b1020 22%)`,
    "--accent-ring": `color-mix(in oklab, ${t.a} 55%, transparent)`,
  };
  return v as unknown as React.CSSProperties;
}

/** Sticky-scrub immersivo: il `build` popola la timeline (selettori scoped). */
export function useImmersiveScene(build: (tl: gsap.core.Timeline, section: HTMLElement) => void) {
  const ref = useRef<HTMLElement>(null);
  useIsoLayoutEffect(() => {
    const section = ref.current;
    if (!section) return;
    const reduced = prefersReducedMotion();
    const ctx = gsap.context(() => {
      gsap.set(".imm-say", { autoAlpha: 0, scale: 1.08, y: 26 });
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      build(tl, section);
      if (reduced) {
        tl.progress(1);
        return;
      }
      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.8, // smoothing → lo scrub "insegue" lo scroll (curva, non lineare)
        animation: tl,
      });
      ScrollTrigger.refresh();
    }, section);
    return () => ctx.revert();
  }, []);
  return ref;
}

/** Intermezzo: la frase entra (expo) e poi esce (back-in). Chiamare dentro build. */
export function say(tl: gsap.core.Timeline, i: number) {
  tl.to(`.imm-say-${i}`, { autoAlpha: 1, scale: 1, y: 0, duration: 0.7, ease: "expo.out" });
  tl.to(
    `.imm-say-${i}`,
    { autoAlpha: 0, scale: 0.96, y: -24, duration: 0.5, ease: "back.in(1.4)" },
    "+=0.7",
  );
}

/** Sposta il cursore finto (ease morbido). Chiamare dentro build. */
export function cursorTo(tl: gsap.core.Timeline, left: string, top: string) {
  return tl.to(".imm-cursor", { left, top, duration: 0.9, ease: "power2.inOut" });
}

/** Frase-intermezzo grande, centrata, su velo sfocato. Tono descrittivo. */
export function Say({ i, children }: { i: number; children: React.ReactNode }) {
  return (
    <div
      className={`imm-say imm-say-${i} pointer-events-none absolute inset-0 z-40 flex items-center justify-center`}
      style={{ opacity: 0 }}
      aria-hidden
    >
      <div className="bg-background/85 absolute inset-0 backdrop-blur-sm" />
      <p className="font-display text-foreground relative max-w-3xl px-6 text-center text-3xl font-bold tracking-tight text-balance sm:text-5xl">
        {children}
      </p>
    </div>
  );
}

/** Cursore finto (la timeline lo muove via .imm-cursor). */
export function Cursor() {
  return (
    <div
      className="imm-cursor pointer-events-none absolute z-30"
      style={{ left: "50%", top: "55%" }}
      aria-hidden
    >
      <svg width="22" height="22" viewBox="0 0 24 24" className="drop-shadow">
        <path
          d="M4 2l6 16 2.5-6.5L19 9 4 2z"
          className="fill-foreground stroke-background"
          strokeWidth="1.5"
        />
      </svg>
    </div>
  );
}

/** Cornice full-screen sticky di una scena-prodotto: eyebrow + stage + cursore. */
export const ImmersiveStage = forwardRef<
  HTMLElement,
  {
    heightVh: number;
    theme: string;
    label: string;
    /** Mantenuto per compatibilità delle chiamate; non più reso (era poco immersivo
     *  e collideva con gli header dei prodotti full-screen — lo annuncia l'intermezzo). */
    eyebrow?: string;
    children: React.ReactNode;
  }
>(function ImmersiveStage({ heightVh, theme, label, children }, ref) {
  return (
    <section
      ref={ref}
      aria-label={label}
      className="relative"
      style={{ ...accentVars(theme), height: `${heightVh}vh` }}
    >
      <div className="bg-background sticky top-0 h-screen overflow-hidden">
        {children}
        <Cursor />
      </div>
    </section>
  );
});
