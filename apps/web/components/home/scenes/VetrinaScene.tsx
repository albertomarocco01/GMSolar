"use client";

/**
 * @descrizione  Scena #1 della home immersiva — "Siti vetrina moderni" (tema
 *   CHIARO, accent SOLAR verde-lime). È il VIDEO-SCROLLYTELLING cinematografico:
 *   un video drone a tutto schermo che PARTE da solo (autoplay muted, lazy) mentre
 *   lo scroll scrubba i BEAT DI TESTO sopra di esso — NON si scrubba
 *   `video.currentTime` (laggava nel legacy): il video gira libero, lo scroll
 *   muove solo l'overlay. Meccanismo + film-grade ripresi da legacy/SolarHero.
 *
 *   Beat in sequenza (scrub):
 *     ① intro descrittiva (eyebrow + titolo che SPIEGA + sottotitolo)
 *     ② card 3D fluttuanti (le "tecniche": scrollytelling, 3D, performance, motion)
 *     ③ chiusura descrittiva + invito a proseguire
 *
 *   Regole di progetto:
 *   - Section STICKY-SCRUB (niente pin lungo: un pin congelerebbe l'auto-scroll
 *     della home). La sezione è alta, il figlio è `sticky`, lo scroll scrubba la
 *     timeline GSAP che cross-dissolve i beat e fa un lento zoom del video.
 *   - Performance: il video è `preload="none"` e PARTE solo in vista
 *     (IntersectionObserver); poster WebP come LCP leggero.
 *   - Fallback: se il video non parte → resta il poster su gradiente branded.
 *   - reduced-motion → scena STATICA: beat impilati e leggibili, nessuno
 *     ScrollTrigger, card in griglia piana, video in pausa (solo poster).
 * @indice
 * - VetrinaScene → prima scena della home (dopo l'intro dal nero)
 */
import { useEffect, useRef } from "react";
import { cn } from "@gmgroup/lib/utils";
import { gsap, ScrollTrigger } from "@gmgroup/lib/gsap";
import { VIDEOS, POSTERS } from "@gmgroup/lib/assets";
import { useReducedMotion, useIsoLayoutEffect } from "@gmgroup/lib/motion";
import VetrinaFilmGrade from "../vetrina/VetrinaFilmGrade";
import FloatingCards from "../vetrina/FloatingCards";
import { IconSun } from "../vetrina/VetrinaIcons";

/**
 * Accent SOLAR locale alla scena (la home gira sul tema "hub" lime di gruppo).
 * Override completo — anche i derivati soft/ink/ring — perché a :root sono "cotti"
 * sull'accent del gruppo e il solo --accent non basta. Valori = [data-theme=solar].
 */
const SOLAR_ACCENT = {
  "--accent": "#a8d920",
  "--accent-strong": "#8fbc15",
  "--accent-contrast": "#0b1020",
  "--accent-soft": "color-mix(in oklab, #a8d920 14%, transparent)",
  "--accent-ink": "color-mix(in oklab, #a8d920, #0b1020 22%)",
  "--accent-ring": "color-mix(in oklab, #a8d920 55%, transparent)",
} as unknown as React.CSSProperties;

/** Ombra di testo: leggibilità ovunque il beat compaia sul video. */
const TEXT_SHADOW = { textShadow: "0 2px 28px rgba(0,0,0,0.55)" } as const;

export default function VetrinaScene() {
  const reduced = useReducedMotion();
  const stageRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  // Avvio DIFFERITO + pausa fuori-schermo del video (come legacy SolarHero):
  // con `preload="none"` non compete con l'LCP (= poster); parte dopo il primo
  // frame e va in pausa quando la scena lascia il viewport.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (reduced) {
      v.pause();
      return;
    }
    let timer = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.05 },
    );
    const raf = requestAnimationFrame(() => {
      timer = window.setTimeout(() => io.observe(v), 200);
    });
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      io.disconnect();
    };
  }, [reduced]);

  // Coreografia di scroll. `gsap.matchMedia` (scopato alla scena) attiva lo
  // scrub solo da md+ e si auto-pulisce su unmount / cambio breakpoint / resize.
  // NIENTE pin: la sezione è alta e il figlio è `sticky` (vedi markup) → lo
  // scroll scrubba la timeline mentre la pagina continua a scorrere.
  useIsoLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage || reduced) return;

    const mm = gsap.matchMedia(stage);

    mm.add("(min-width: 768px)", () => {
      const progress = progressRef.current;

      // Stato iniziale: ① già visibile (testo leggibile a inizio scena); ②/③
      // nascosti e leggermente abbassati. ① usa `opacity` (NON autoAlpha) così la
      // sua intestazione resta nell'albero di accessibilità anche da nascosta.
      gsap.set(".vt-beat-intro", { opacity: 1, y: 0 });
      gsap.set(".vt-beat-cards", { autoAlpha: 0, y: 40 });
      gsap.set(".vt-beat-cta", { autoAlpha: 0, y: 40 });
      gsap.set(".vt-video", { scale: 1.06, transformOrigin: "50% 50%" });

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: stage,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
          onUpdate: (self) => {
            if (progress) progress.style.transform = `scaleX(${self.progress})`;
          },
        },
      });

      tl
        // Respiro continuo: lento zoom del video per tutta la sequenza.
        .to(".vt-video", { scale: 1.18, duration: 3 }, 0)
        // Le card reagiscono allo scroll: il gruppo si inclina/parallaxa (3D).
        .fromTo(
          ".vt-cards-tilt",
          { rotateX: 6, rotateY: 9, y: 26 },
          { rotateX: -4, rotateY: -9, y: -26, duration: 3 },
          0,
        )
        // Lo scroll-cue sparisce appena si comincia a scorrere.
        .to(".vt-cue", { autoAlpha: 0, duration: 0.3 }, 0)
        // ① esce verso l'alto
        .to(".vt-beat-intro", { opacity: 0, y: -40, ease: "power2.in", duration: 0.5 }, 0.85)
        // ② card: entrano, restano in scena, poi escono
        .to(".vt-beat-cards", { autoAlpha: 1, y: 0, ease: "power2.out", duration: 0.6 }, 0.95)
        .to(".vt-beat-cards", { autoAlpha: 0, y: -28, ease: "power2.in", duration: 0.5 }, 1.95)
        // ③ chiusura: entra e RESTA fino al rilascio dello sticky
        .to(".vt-beat-cta", { autoAlpha: 1, y: 0, ease: "power2.out", duration: 0.6 }, 2.05);

      ScrollTrigger.refresh();
    });

    return () => mm.revert();
  }, [reduced]);

  // Contenitore dei beat: colonna centrata (mobile / reduced) → overlay assoluto
  // a tutta scena (desktop in regia). Stesso DOM per entrambe le modalità.
  const beatsWrap = reduced
    ? "relative z-10 mx-auto flex min-h-svh max-w-2xl flex-col justify-center gap-10 px-6 py-24"
    : "relative z-10 flex min-h-svh flex-col justify-center gap-10 px-6 py-24 md:absolute md:inset-0 md:block md:min-h-0 md:gap-0 md:p-0";

  return (
    <section
      ref={stageRef}
      id="vetrina"
      aria-label="Siti vetrina moderni — video scrollytelling"
      className={cn(
        "relative isolate text-white",
        // Tall sticky-scrub SOLO da desktop in regia. Su mobile e in
        // reduced-motion la sezione cresce col contenuto (niente clipping,
        // niente scroll a vuoto): scena statica leggibile in flusso normale.
        !reduced && "md:h-[260svh]",
      )}
      style={SOLAR_ACCENT}
    >
      {/* Figlio STICKY (solo desktop in regia): la "scena" a tutto schermo che
          resta ferma mentre lo scroll scrubba i beat (no pin → l'auto-scroll
          della home non si congela). Su mobile/reduced è flusso normale. */}
      <div className={cn("relative", !reduced && "md:sticky md:top-0 md:h-svh md:overflow-hidden")}>
        {/* Fallback branded: dark, garantisce contrasto al testo bianco se il
            video non carica / non parte (resta comunque il poster sopra). */}
        <div
          aria-hidden
          className="absolute inset-0 -z-20 bg-gradient-to-br from-[#0b1020] via-[#13210a] to-[#0b1020]"
        />

        {/* Video drone (placeholder). Poster = LCP leggero; play differito. */}
        <video
          ref={videoRef}
          className="vt-video absolute inset-0 -z-10 h-full w-full object-cover"
          muted
          loop={!reduced}
          playsInline
          preload="none"
          poster={POSTERS.solarDrone}
        >
          <source src={VIDEOS.solarDrone} type="video/mp4" />
        </video>

        {/* Look "film": grading caldo + vignette + grana di pellicola. */}
        <VetrinaFilmGrade gradeOpacity={0.3} vignetteOpacity={0.5} grainOpacity={0.1} />

        {/* Scrim di leggibilità: scurisco in modo uniforme e rinforzo sopra/sotto. */}
        <div aria-hidden className="absolute inset-0 bg-black/35" />
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-black/55 to-transparent"
        />
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/70 to-transparent"
        />

        {/* I beat. Stesso DOM per la regia desktop e per il fallback statico: le
            classi di posizione assoluta si aggiungono solo quando la regia è attiva
            (non reduced) e solo da md in su. */}
        <div className={beatsWrap}>
          {/* ① intro descrittiva — alto-sinistra */}
          <div
            className={cn(
              "vt-beat vt-beat-intro max-w-xl",
              !reduced && "md:pointer-events-none md:absolute md:top-[13vh] md:left-[6vw]",
            )}
            style={TEXT_SHADOW}
          >
            <p className="flex items-center gap-3">
              <span className="font-mono text-sm font-bold text-white/70 tabular-nums">01</span>
              <span className="text-accent inline-flex items-center gap-2 text-sm font-semibold tracking-widest uppercase">
                <IconSun className="h-4 w-4" />
                Siti vetrina moderni
              </span>
            </p>
            <h2 className="font-display text-display-sm md:text-display-md mt-3 font-bold tracking-tight text-balance">
              Scrollytelling, 3D e motion che <span className="text-accent">raccontano</span> il
              prodotto.
            </h2>
            <p className="mt-4 max-w-md text-lg text-white/85">
              Un sito che si monta sotto gli occhi mentre scorri: video a tutto schermo, scene
              tridimensionali e animazioni guidate dal contenuto. Non effetti fini a sé stessi, ma
              un modo per far capire — e ricordare — chi siete.
            </p>
          </div>

          {/* ② card 3D fluttuanti — banda centrale */}
          <div
            className={cn(
              "vt-beat vt-beat-cards flex flex-col gap-5",
              !reduced && "md:absolute md:top-[15vh] md:right-[5vw] md:bottom-[15vh] md:left-[5vw]",
            )}
            style={TEXT_SHADOW}
          >
            <p className="text-accent text-center text-xs font-semibold tracking-[0.22em] uppercase">
              Le tecniche, in una sola pagina
            </p>
            <div className="min-h-0 flex-1">
              <FloatingCards animated={!reduced} />
            </div>
          </div>

          {/* ③ chiusura descrittiva — basso-centro */}
          <div
            className={cn(
              "vt-beat vt-beat-cta flex flex-col items-start gap-3 md:items-center md:text-center",
              !reduced && "md:absolute md:right-0 md:bottom-[12vh] md:left-0 md:mx-auto md:w-fit",
            )}
            style={TEXT_SHADOW}
          >
            <p className="font-display text-2xl font-bold text-balance md:text-3xl">
              Lo stesso linguaggio visivo, costruito sul{" "}
              <span className="text-accent">vostro brand.</span>
            </p>
            <p className="text-base text-white/80">Continua a scorrere: il racconto prosegue.</p>
          </div>
        </div>

        {/* Avanzamento + scroll-cue: solo dove c'è la regia (desktop, non reduced). */}
        {!reduced && (
          <>
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 z-20 hidden h-[3px] bg-white/15 md:block"
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

            <div
              aria-hidden
              className="vt-cue pointer-events-none absolute inset-x-0 bottom-6 z-20 mx-auto hidden w-fit flex-col items-center gap-1 text-white/70 md:flex"
            >
              <span className="text-[0.7rem] font-medium tracking-[0.25em] uppercase">Scorri</span>
              <span className="animate-bounce">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </span>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
