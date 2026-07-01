"use client";

/**
 * @descrizione  MOTORE generico per una scena "video scrubbato + callout tecnici".
 *   Un video ALL-KEYFRAME a tutto schermo (ScrubVideo) viene pilotato dallo scroll;
 *   sopra, chip di callout (SVG/HTML, NON incisi nel filmato) compaiono/scompaiono in
 *   sync coi beat, ancorati allo scroll. Riusato dalle scene solare e cavo EV: cambia
 *   solo la config (src/poster/copy/callout), non il comportamento.
 *
 *   Pattern come VetrinaScene (NON useImmersiveScene: il suo zoom .imm-stage
 *   litigherebbe col video full-bleed). UNA ScrollTrigger scrubba una timeline
 *   NORMALIZZATA 0→1: l'onUpdate passa lo stesso progress al ScrubVideo (seek) e muove
 *   la barra; i callout sono tween posizionati sul loro `at` (= frazione di durata del
 *   video). Regia attiva anche su mobile (solo scrub verticale → mobile-first ok).
 *   reduced-motion → scena STATICA: poster + callout impilati e leggibili.
 * @indice
 * - VideoScrubScene → engine riusabile; SolarTwinScene/EvCableScene lo configurano
 * - type Callout → forma di un callout tecnico
 */
import { useRef } from "react";
import { cn } from "@gmgroup/lib/utils";
import { gsap, ScrollTrigger } from "@gmgroup/lib/gsap";
import { useReducedMotion, useIsoLayoutEffect } from "@gmgroup/lib/motion";
import VetrinaFilmGrade from "../vetrina/VetrinaFilmGrade";
import { accentVars } from "../immersive/shared";
import ScrubVideo, { type ScrubVideoHandle } from "../ScrubVideo";

const TEXT_SHADOW = { textShadow: "0 2px 28px rgba(0,0,0,0.55)" } as const;

/**
 * `at` = frazione di durata del video (0→1) in cui il callout compare; `hold` = per
 * quanto resta prima di sfumare. x/y = ancoraggio a schermo. NOTA: gli `at` vanno
 * ri-tarati sui beat REALI del filmato (i valori nelle config sono un primo pacing).
 */
export type Callout = {
  at: number;
  hold: number;
  x: string;
  y: string;
  kicker: string;
  value: string;
  sub?: string;
};

export type VideoScrubSceneProps = {
  src: string;
  poster: string;
  ariaLabel: string;
  eyebrow: string;
  title: React.ReactNode;
  lede: string;
  callouts: Callout[];
  /** Alza un velo CHIARO sul finale — solo se la scena SEGUENTE è chiara (evita il
   *  flash bianco tra scene video scure consecutive). Default false (cut dark→dark). */
  exitToLight?: boolean;
};

/** Chip di un callout. Su dark (video) l'accent lime come testo è leggibile. */
function CalloutChip({ c }: { c: Callout }) {
  return (
    <div className="border-accent/30 bg-black/45 rounded-2xl border px-4 py-3 shadow-xl backdrop-blur-md">
      <p className="text-accent text-[10.5px] font-semibold tracking-[0.18em] uppercase">
        {c.kicker}
      </p>
      <p className="font-display mt-0.5 text-2xl font-bold tracking-tight text-white md:text-3xl">
        {c.value}
      </p>
      {c.sub && <p className="mt-0.5 text-xs font-medium text-white/70">{c.sub}</p>}
    </div>
  );
}

export default function VideoScrubScene({
  src,
  poster,
  ariaLabel,
  eyebrow,
  title,
  lede,
  callouts,
  exitToLight = false,
}: VideoScrubSceneProps) {
  const reduced = useReducedMotion();
  const stageRef = useRef<HTMLElement>(null);
  const videoRef = useRef<ScrubVideoHandle>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useIsoLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage || reduced) return;

    const ctx = gsap.context(() => {
      // Stato iniziale: intestazione e callout nascosti; velo d'uscita giù.
      gsap.set(".sv-head", { autoAlpha: 0, y: 18 });
      gsap.set(".sv-callout", { autoAlpha: 0, y: 14, scale: 0.96 });
      if (exitToLight) gsap.set(".sv-exit-veil", { autoAlpha: 0 });

      // Timeline NORMALIZZATA a durata 1 (spacer) → le posizioni dei tween coincidono
      // con il progress dello scroll e con la frazione di durata del video.
      const tl = gsap.timeline({ defaults: { ease: "none" } });
      tl.to({}, { duration: 1 }, 0);

      // Intestazione: entra all'inizio, esce lasciando spazio a video + callout.
      tl.to(".sv-head", { autoAlpha: 1, y: 0, duration: 0.06, ease: "power2.out" }, 0.02);
      tl.to(".sv-head", { autoAlpha: 0, y: -12, duration: 0.06, ease: "power2.in" }, 0.16);

      // Callout: compaiono al loro `at`, sfumano dopo `hold`.
      const els = gsap.utils.toArray<HTMLElement>(".sv-callout");
      callouts.forEach((c, i) => {
        const el = els[i];
        if (!el) return;
        tl.to(el, { autoAlpha: 1, y: 0, scale: 1, duration: 0.05, ease: "power2.out" }, c.at);
        tl.to(el, { autoAlpha: 0, y: -10, duration: 0.05, ease: "power2.in" }, c.at + c.hold);
      });

      // Velo d'uscita chiaro sul finale → SOLO se la scena seguente è chiara.
      if (exitToLight) {
        tl.to(".sv-exit-veil", { autoAlpha: 1, duration: 0.08, ease: "power2.in" }, 0.9);
      }

      ScrollTrigger.create({
        trigger: stage,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.8,
        animation: tl,
        onUpdate: (self) => {
          videoRef.current?.seek(self.progress); // il video segue lo scroll
          if (progressRef.current) {
            progressRef.current.style.transform = `scaleX(${self.progress})`;
          }
        },
      });

      ScrollTrigger.refresh();
    }, stage);

    return () => ctx.revert();
  }, [reduced, exitToLight]);

  return (
    <section
      ref={stageRef}
      aria-label={ariaLabel}
      className={cn("relative isolate text-white", !reduced && "h-[450svh]")}
      style={accentVars("platform")}
    >
      <div
        className={cn(
          "relative",
          !reduced && "sticky top-0 h-svh overflow-hidden",
          reduced && "flex min-h-svh flex-col justify-center overflow-hidden",
        )}
      >
        {/* Fallback branded scuro (garantisce contrasto se il video non parte). */}
        <div
          aria-hidden
          className="absolute inset-0 -z-20 bg-linear-to-br from-[#0b1020] via-[#13210a] to-[#0b1020]"
        />

        {/* Video scrubbato (o poster statico in reduced-motion). */}
        <ScrubVideo ref={videoRef} src={src} poster={poster} className="absolute inset-0 -z-10" />

        <VetrinaFilmGrade gradeOpacity={0.3} vignetteOpacity={0.55} grainOpacity={0.1} />

        {/* Scrim di leggibilità. */}
        <div aria-hidden className="absolute inset-0 bg-black/35" />
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-1/3 bg-linear-to-b from-black/55 to-transparent"
        />
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-2/5 bg-linear-to-t from-black/70 to-transparent"
        />

        {/* Intestazione del capitolo (entra e poi lascia la scena al video). */}
        <div
          className={cn(
            "relative z-20 px-6 pt-16 md:px-[6vw]",
            !reduced && "sv-head absolute top-[8vh] left-0 max-w-lg",
          )}
          style={TEXT_SHADOW}
        >
          <p className="text-accent text-xs font-semibold tracking-[0.22em] uppercase">{eyebrow}</p>
          <h2 className="font-display mt-2 text-3xl font-bold tracking-tight text-balance md:text-4xl lg:text-5xl">
            {title}
          </h2>
          <p className="mt-3 max-w-md text-lg text-white/85">{lede}</p>
        </div>

        {/* Layer callout. Regia → chip ancorate (assolute), una alla volta.
            reduced-motion → griglia statica, tutte leggibili. */}
        {reduced ? (
          <div className="relative z-10 mx-auto grid w-full max-w-3xl grid-cols-1 gap-3 px-6 pt-8 pb-16 sm:grid-cols-2">
            {callouts.map((c) => (
              <CalloutChip key={c.kicker} c={c} />
            ))}
          </div>
        ) : (
          callouts.map((c) => (
            <div
              key={c.kicker}
              className="sv-callout pointer-events-none absolute z-10 w-max max-w-[42vw] sm:max-w-[16rem]"
              style={{ left: c.x, top: c.y }}
            >
              <CalloutChip c={c} />
            </div>
          ))
        )}

        {/* Barra di avanzamento (solo in regia). */}
        {!reduced && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[3px] bg-white/15"
          >
            <div
              ref={progressRef}
              className="bg-accent h-full w-full origin-left"
              style={{
                transform: "scaleX(0)",
                boxShadow: "0 0 14px 2px color-mix(in oklab, var(--accent) 55%, transparent)",
              }}
            />
          </div>
        )}

        {/* Velo d'uscita → scena chiara successiva (solo se exitToLight). */}
        {!reduced && exitToLight && (
          <div
            aria-hidden
            className="sv-exit-veil bg-background pointer-events-none absolute inset-0 z-40"
            style={{ opacity: 0 }}
          />
        )}
      </div>
    </section>
  );
}
