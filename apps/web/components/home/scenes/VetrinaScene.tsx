"use client";

/**
 * @descrizione  Scena #1 della home immersiva — "Siti vetrina moderni" (tema
 *   CHIARO, accent SOLAR verde-lime). NON un hero di apertura: è una FINTA
 *   HOMEPAGE su cui gira il video-scrollytelling cinematografico (stesso
 *   linguaggio visivo delle scene-prodotto successive). Un video drone a tutto
 *   schermo PARTE da solo (autoplay muted, lazy) mentre lo scroll scrubba i beat
 *   sopra di esso — NON si scrubba `video.currentTime` (laggava nel legacy): il
 *   video gira libero, lo scroll muove l'overlay.
 *
 *   Beat in sequenza (scrub, solo desktop in regia):
 *     ① finta homepage: nav + hero SOBRIO (il video è la star, niente titolone)
 *     ② PAN ORIZZONTALE: l'intera pagina scorre a SINISTRA (parallax del video) e
 *        rivela card premium "sospese" con mini-grafici → mostra la qualità del
 *        design. Le card entrano in stagger.
 *
 *   Regole di progetto:
 *   - Section STICKY-SCRUB (niente pin lungo: congelerebbe l'auto-scroll della
 *     home). Sezione alta, figlio `sticky`, lo scroll scrubba la timeline GSAP
 *     che fa il pan e la regia dei beat + un lento zoom del video.
 *   - Performance: video `preload="none"`, parte solo in vista (IO); poster WebP
 *     come LCP leggero; pan/parallax su solo transform.
 *   - Fallback: se il video non parte → resta il poster su gradiente branded.
 *   - reduced-motion → scena STATICA: homepage e card impilate e leggibili,
 *     nessuno ScrollTrigger, nessun pan, video in pausa (solo poster).
 * @indice
 * - VetrinaScene → prima scena della home (dopo l'intro dal nero)
 */
import { useEffect, useRef } from "react";
import { cn } from "@gmgroup/lib/utils";
import { gsap, ScrollTrigger } from "@gmgroup/lib/gsap";
import { VIDEOS, POSTERS } from "@gmgroup/lib/assets";
import { useReducedMotion, useIsoLayoutEffect } from "@gmgroup/lib/motion";
import VetrinaFilmGrade from "../vetrina/VetrinaFilmGrade";
import SuspendedCards from "../vetrina/SuspendedCards";
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

/** Nav della finta homepage (decorativa). */
const SITE_NAV = ["Lavori", "Studio", "Contatti"];

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

  // Coreografia di scroll. `gsap.matchMedia` (scopato alla scena) attiva la regia
  // solo da md+ e si auto-pulisce su unmount / cambio breakpoint / resize.
  // NIENTE pin: la sezione è alta e il figlio è `sticky` → lo scroll scrubba la
  // timeline mentre la pagina continua a scorrere.
  useIsoLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage || reduced) return;

    const mm = gsap.matchMedia(stage);

    mm.add("(min-width: 768px)", () => {
      const progress = progressRef.current;

      // Stato iniziale: ① homepage visibile; pista del pan a x:0; card della
      // vetrina nascoste e abbassate; etichetta della vetrina nascosta.
      gsap.set(".vt-pan", { xPercent: 0 });
      gsap.set(".vt-video", { scale: 1.06, xPercent: 0, transformOrigin: "50% 50%" });
      gsap.set(".vt-card", { autoAlpha: 0, y: 44, scale: 0.9, transformOrigin: "50% 50%" });
      gsap.set(".vt-showcase-head", { autoAlpha: 0, y: 20 });

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
        .to(".vt-video", { scale: 1.2, duration: 3.4 }, 0)
        // Lo scroll-cue sparisce appena si comincia a scorrere.
        .to(".vt-cue", { autoAlpha: 0, duration: 0.3 }, 0)
        // ② PAN: l'intera homepage scorre a sinistra; il video la segue con un
        // leggero parallax (resta sotto, dà profondità) → rivela la vetrina.
        .to(".vt-pan", { xPercent: -50, ease: "power2.inOut", duration: 1.1 }, 0.95)
        .to(".vt-video", { xPercent: -4, ease: "power2.inOut", duration: 1.1 }, 0.95)
        // L'etichetta della vetrina entra mentre il pan si completa.
        .to(".vt-showcase-head", { autoAlpha: 1, y: 0, ease: "power2.out", duration: 0.5 }, 1.7)
        // Le card sospese entrano in stagger (scale/opacity/translate).
        .to(
          ".vt-card",
          { autoAlpha: 1, y: 0, scale: 1, ease: "power2.out", duration: 0.7, stagger: 0.14 },
          1.85,
        )
        // Pausa finale: lascia ammirare la vetrina prima del rilascio dello sticky.
        .to({}, { duration: 0.6 });

      ScrollTrigger.refresh();
    });

    return () => mm.revert();
  }, [reduced]);

  return (
    <section
      ref={stageRef}
      id="vetrina"
      aria-label="Siti vetrina moderni — video scrollytelling"
      className={cn(
        "relative isolate text-white",
        // Tall sticky-scrub SOLO da desktop in regia. Su mobile e in reduced-motion
        // la sezione cresce col contenuto (niente clipping, niente scroll a vuoto):
        // scena statica leggibile in flusso normale.
        !reduced && "md:h-[320svh]",
      )}
      style={SOLAR_ACCENT}
    >
      {/* Figlio STICKY (solo desktop in regia): la "scena" a tutto schermo che
          resta ferma mentre lo scroll scrubba pan + beat (no pin → l'auto-scroll
          della home non si congela). Su mobile/reduced è flusso normale. */}
      <div className={cn("relative", !reduced && "md:sticky md:top-0 md:h-svh md:overflow-hidden")}>
        {/* Fallback branded: dark, garantisce contrasto al testo bianco se il
            video non carica / non parte (resta comunque il poster sopra). */}
        <div
          aria-hidden
          className="absolute inset-0 -z-20 bg-linear-to-br from-[#0b1020] via-[#13210a] to-[#0b1020]"
        />

        {/* Video drone (placeholder). Poster = LCP leggero; play differito. È il
            FONDALE comune dei due beat: durante il pan resta sotto, con parallax. */}
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
          className="absolute inset-x-0 top-0 h-1/3 bg-linear-to-b from-black/55 to-transparent"
        />
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-2/5 bg-linear-to-t from-black/70 to-transparent"
        />

        {/* ── PISTA DEL PAN ──────────────────────────────────────────────────
            Regia (md+): due pannelli a tutto schermo affiancati (track 200vw)
            che GSAP fa scorrere a sinistra. Mobile/reduced: blocco verticale,
            i pannelli si impilano e scorrono in flusso normale. */}
        <div
          className={cn(
            "vt-pan relative z-10",
            !reduced && "md:absolute md:top-0 md:left-0 md:flex md:h-full md:w-[200%]",
          )}
        >
          {/* ① PANNELLO HOMEPAGE — nav + hero sobrio (il video è la star) */}
          <div
            className={cn(
              "vt-home relative flex flex-col",
              reduced
                ? "min-h-svh justify-center px-6 py-24"
                : "min-h-svh justify-end px-6 py-16 md:h-full md:min-h-0 md:w-1/2 md:shrink-0 md:justify-center md:px-[6vw]",
            )}
          >
            {/* Nav della finta homepage */}
            <div
              className="vt-nav absolute inset-x-0 top-0 z-10 flex items-center justify-between px-6 py-5 md:px-[6vw]"
              style={TEXT_SHADOW}
            >
              <span className="flex items-center gap-2">
                <span className="bg-accent h-5 w-5 rounded-[6px]" aria-hidden />
                <span className="font-display text-base font-bold tracking-tight">Studio</span>
              </span>
              <nav className="hidden items-center gap-6 sm:flex" aria-hidden>
                {SITE_NAV.map((l) => (
                  <span key={l} className="text-sm font-medium text-white/80">
                    {l}
                  </span>
                ))}
              </nav>
              <span
                className="rounded-full border border-white/30 px-3.5 py-1.5 text-xs font-semibold text-white/90"
                aria-hidden
              >
                Parliamone
              </span>
            </div>

            {/* Hero SOBRIO: niente titolone-pitch. Eyebrow = marcatore di sezione
                della demo; il titolo è una headline credibile da homepage. */}
            <div className="vt-home-hero max-w-xl" style={TEXT_SHADOW}>
              <p className="flex items-center gap-3">
                <span className="font-mono text-sm font-bold tabular-nums text-white/70">01</span>
                <span className="text-accent inline-flex items-center gap-2 text-sm font-semibold tracking-widest uppercase">
                  <IconSun className="h-4 w-4" />
                  Siti vetrina moderni
                </span>
              </p>
              <h2 className="font-display mt-3 text-3xl font-bold tracking-tight text-balance md:text-4xl lg:text-5xl">
                Idee che prendono vita, <span className="text-accent">sullo schermo.</span>
              </h2>
              <p className="mt-4 max-w-md text-lg text-white/85">
                Esperienze digitali su misura: video a tutto schermo, scene tridimensionali e motion
                guidato dal contenuto. Il sito si monta sotto gli occhi mentre scorri.
              </p>
            </div>

            {/* Scroll-cue: solo in regia (desktop, non reduced). */}
            {!reduced && (
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
            )}
          </div>

          {/* ② PANNELLO VETRINA — card premium "sospese" + mini-grafici */}
          <div
            className={cn(
              "vt-showcase relative",
              !reduced && "md:h-full md:w-1/2 md:shrink-0",
            )}
          >
            {/* Scrim extra: rinforza la leggibilità delle card sul video. */}
            <div aria-hidden className="pointer-events-none absolute inset-0 bg-black/20" />

            {/* Etichetta del beat (entra a pan completato) */}
            <div
              className={cn(
                "relative z-20 px-6 pt-16",
                !reduced && "md:absolute md:top-[8vh] md:left-[6vw] md:max-w-sm md:px-0 md:pt-0",
              )}
              style={TEXT_SHADOW}
            >
              <p className="vt-showcase-head text-accent text-xs font-semibold tracking-[0.22em] uppercase">
                La stessa cura, su ogni dettaglio
              </p>
              <h3 className="vt-showcase-head font-display mt-2 text-2xl font-bold tracking-tight text-balance md:text-3xl">
                Interfacce curate, dati che si leggono al volo.
              </h3>
            </div>

            {/* Card sospese: scatter in prospettiva (md+) / griglia (mobile-reduced) */}
            <div
              className={cn(
                "relative z-10 px-6 pt-6 pb-16",
                !reduced && "md:absolute md:inset-0 md:p-0",
              )}
            >
              <SuspendedCards animated={!reduced} />
            </div>
          </div>
        </div>

        {/* Avanzamento: solo dove c'è la regia (desktop, non reduced). */}
        {!reduced && (
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
        )}
      </div>
    </section>
  );
}
