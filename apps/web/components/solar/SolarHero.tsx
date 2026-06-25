"use client";

import { useEffect, useRef } from "react";
import Button from "@gmgroup/ui/Button";
import { cn } from "@gmgroup/lib/utils";
import { gsap } from "@gmgroup/lib/gsap";
import { VIDEOS, POSTERS } from "@gmgroup/lib/assets";
import { useReducedMotion, useIsoLayoutEffect } from "@gmgroup/lib/motion";
import SolarFilmGrade from "@/components/solar/SolarFilmGrade";
import { IconArrowRight, IconSun } from "@/components/solar/SolarIcons";
import solar from "@/data/solar-projects.json";

/** Numeri formattati all'italiana, presi dal dato reale (niente claim inventati). */
const nf = new Intl.NumberFormat("it-IT");

/**
 * Posizioni DESKTOP (md+) dei quattro beat: un percorso a "zig-zag" attorno
 * alla scena (alto-sx → destra → basso-sx → basso-centro). Su mobile e con
 * reduced-motion queste classi NON si applicano: i beat tornano in colonna,
 * impilati e leggibili. Il centraggio usa i margini auto (left/right o
 * top/bottom = 0 + margin auto), MAI le translate di Tailwind, così non
 * collide con le transform che GSAP anima (x/y).
 */
const BEAT_POS = [
  // ① alto-sinistra
  "md:absolute md:top-[15vh] md:left-[6vw] md:max-w-md",
  // ② destra, centrato in verticale
  "md:absolute md:top-0 md:right-[6vw] md:bottom-0 md:my-auto md:h-fit md:max-w-sm md:text-right",
  // ③ basso-sinistra — è l'h1 della pagina: niente pointer-events così, da
  //    trasparente (opacity:0), il suo box non intercetta i click sulla CTA.
  "md:absolute md:bottom-[22vh] md:left-[6vw] md:max-w-xl md:pointer-events-none",
  // ④ basso-centro (CTA), centrato in orizzontale
  "md:absolute md:right-0 md:bottom-[12vh] md:left-0 md:mx-auto md:w-fit",
] as const;

/** Ombra di testo: garantisce leggibilità ovunque il beat compaia sul video. */
const TEXT_SHADOW = { textShadow: "0 2px 28px rgba(0,0,0,0.55)" } as const;

/**
 * Hero scrollytelling di GM Solar — il "momento wow" cinematografico.
 *
 * Regia (saltata con prefers-reduced-motion):
 * - DESKTOP (≥768px): il video drone resta PINNATO a tutta scena mentre si
 *   scorre; lo scrub fa entrare/uscire quattro beat in sequenza lungo un
 *   percorso a zig-zag (mai più di ~2 a schermo), il video fa un lento zoom e
 *   una barra accent in basso segna l'avanzamento. Finita la sequenza il pin
 *   si rilascia e la pagina prosegue normalmente verso le sezioni successive.
 * - MOBILE (<768px): niente pin (la barra URL che si ridimensiona lo renderebbe
 *   instabile) → stesso contenuto impaginato in colonna, statico e leggibile.
 * - REDUCED-MOTION: identico fallback statico, a qualsiasi larghezza.
 *
 * Performance: il poster WebP fa da LCP; il <video> è `preload="none"`, parte
 * differito dopo il primo frame e va in pausa quando esce dal viewport. Un
 * gradiente branded dietro al video evita il nero se l'autoplay non parte.
 */
export default function SolarHero() {
  const reduced = useReducedMotion();
  const stageRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  // Avvio DIFFERITO + pausa fuori-schermo del video. Con `preload="none"` e
  // senza `autoPlay` il video non compete con l'LCP (= poster); lo avviamo dopo
  // il primo frame e lo mettiamo in pausa quando la scena lascia il viewport.
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

  // Coreografia di scroll. `gsap.matchMedia` (scopato alla scena) attiva il pin
  // solo da desktop e si auto-pulisce su unmount / cambio breakpoint / resize.
  useIsoLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage || reduced) return;

    const mm = gsap.matchMedia(stage);

    mm.add("(min-width: 768px)", () => {
      const beats = gsap.utils.toArray<HTMLElement>(".hero-beat", stage);
      if (beats.length < 4) return;
      const progress = progressRef.current;

      // Vettori (px) d'ingresso e d'uscita: definiscono il verso del movimento.
      const ENTER = [
        { x: 0, y: 0 },
        { x: 72, y: 0 },
        { x: -72, y: 0 },
        { x: 0, y: 64 },
      ];
      const EXIT = [
        { x: -64, y: -48 },
        { x: 72, y: 0 },
        { x: -72, y: 28 },
      ];

      // Stato iniziale: ① già visibile (contenuto leggibile a inizio scena),
      // gli altri nascosti e sfalsati nel verso del loro ingresso.
      // ③ è l'h1 della pagina: si stacca con `opacity` (NON `autoAlpha`) così
      // resta sempre nell'albero di accessibilità — `visibility:hidden` lo
      // toglierebbe dall'outline dei titoli. ④ è la CTA (interattiva): usa
      // `autoAlpha`/visibility, corretto per toglierla dal tab order finché è
      // nascosta. ① ② sono testo decorativo: `autoAlpha` va bene.
      gsap.set(beats[0], { autoAlpha: 1, x: 0, y: 0 });
      gsap.set(beats[1], { autoAlpha: 0, ...ENTER[1] });
      gsap.set(beats[2], { opacity: 0, ...ENTER[2] });
      gsap.set(beats[3], { autoAlpha: 0, ...ENTER[3] });
      gsap.set(".hero-video", { scale: 1.06, transformOrigin: "50% 50%" });

      const SEG = 2.4; // durata di un "segmento" (un beat) nella timeline
      const IN = 0.9; // durata dell'ingresso
      const OUT = 0.8; // durata dell'uscita

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: stage,
          start: "top top",
          end: "+=320%",
          scrub: 1,
          pin: true,
          // La scena è figlia di `.page-transition`, che ha una `transform`
          // durante il fade di pagina: un figlio `position:fixed` sarebbe
          // contenuto da quell'antenato trasformato, non dal viewport, e il pin
          // sfaserebbe. `pinReparent` riaggancia la scena al <body> mentre è
          // attiva ed evita il problema (fix in-zona, niente shared).
          pinReparent: true,
          pinSpacing: true,
          anticipatePin: 1,
          // Avanzamento lineare 0→1 sull'intera sequenza pinnata.
          onUpdate: (self) => {
            if (progress) progress.style.transform = `scaleX(${self.progress})`;
          },
        },
      });

      tl
        // Respiro continuo: il video fa un lento zoom per tutta la sequenza.
        .to(".hero-video", { scale: 1.16, duration: SEG * 4 }, 0)
        // Lo scroll-cue sparisce appena si comincia a scorrere.
        .to(".hero-cue", { autoAlpha: 0, duration: 0.5 }, 0)
        // ① esce in alto-sinistra
        .to(beats[0], { autoAlpha: 0, ...EXIT[0], ease: "power2.in", duration: OUT }, SEG - 0.2)
        // ② entra da destra, poi esce a destra
        .to(beats[1], { autoAlpha: 1, x: 0, y: 0, ease: "power2.out", duration: IN }, SEG)
        .to(beats[1], { autoAlpha: 0, ...EXIT[1], ease: "power2.in", duration: OUT }, SEG * 2 - 0.2)
        // ③ entra da sinistra, poi esce a sinistra (opacity: vedi nota sopra)
        .to(beats[2], { opacity: 1, x: 0, y: 0, ease: "power2.out", duration: IN }, SEG * 2)
        .to(beats[2], { opacity: 0, ...EXIT[2], ease: "power2.in", duration: OUT }, SEG * 3 - 0.2)
        // ④ CTA: entra dal basso e RESTA fino al rilascio del pin
        .to(beats[3], { autoAlpha: 1, x: 0, y: 0, ease: "power2.out", duration: IN }, SEG * 3);
      // (il tween del video, lungo SEG*4, tiene la CTA leggibile prima dello sblocco)
    });

    return () => mm.revert();
  }, [reduced]);

  // Contenitore dei beat: colonna centrata (mobile / reduced) → overlay assoluto
  // a tutta scena (desktop in regia). Stesso DOM per entrambe le modalità.
  const beatsWrap = reduced
    ? "relative z-10 mx-auto flex min-h-svh max-w-2xl flex-col justify-center gap-8 px-6 py-28"
    : "relative z-10 flex min-h-svh flex-col justify-center gap-8 px-6 py-28 md:absolute md:inset-0 md:block md:min-h-0 md:gap-0 md:p-0";

  return (
    <section
      ref={stageRef}
      className="relative isolate min-h-svh overflow-hidden text-white"
      aria-label="GM Solar — EPC fotovoltaico"
    >
      {/* Fallback branded: visibile se il video non carica / non parte. */}
      <div
        aria-hidden
        className="from-brand-950 via-background to-background absolute inset-0 -z-20 bg-linear-to-br"
      />

      {/* Video drone (placeholder). Poster = LCP leggero; play differito. */}
      <video
        ref={videoRef}
        className="hero-video absolute inset-0 -z-10 h-full w-full object-cover"
        muted
        loop={!reduced}
        playsInline
        preload="none"
        poster={POSTERS.solarHero}
      >
        <source src={VIDEOS.solarHero} type="video/mp4" />
      </video>

      {/* Look "film": grading caldo + vignette + grana di pellicola. */}
      <SolarFilmGrade gradeOpacity={0.3} vignetteOpacity={0.5} grainOpacity={0.1} />

      {/* Scrim di leggibilità: i beat compaiono in punti diversi, quindi scurisco
          in modo uniforme e rinforzo sopra (① ) e sotto (④/CTA). */}
      <div aria-hidden className="absolute inset-0 bg-black/30" />
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-1/3 bg-linear-to-b from-black/55 to-transparent"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-2/5 bg-linear-to-t from-black/75 to-transparent"
      />

      {/* I quattro beat. Stesso DOM per la regia desktop e per il fallback
          statico: le classi di posizione assoluta si aggiungono solo quando la
          regia è attiva (non reduced) e solo da md in su. */}
      <div className={beatsWrap}>
        {/* ① alto-sinistra — progetti realizzati */}
        <div className={cn("hero-beat", !reduced && BEAT_POS[0])} style={TEXT_SHADOW}>
          <span className="text-accent inline-flex items-center gap-2 text-xs font-semibold tracking-[0.22em] uppercase">
            <IconSun className="h-4 w-4" />
            Esperienza sul campo
          </span>
          <p className="font-display text-display-sm md:text-display-md mt-3 font-bold tabular-nums">
            {nf.format(solar.stats.progettiRealizzati)}
            <span className="text-accent">+</span>
          </p>
          <p className="mt-1 text-lg text-white/85">progetti realizzati</p>
        </div>

        {/* ② destra — potenza installata */}
        <div className={cn("hero-beat", !reduced && BEAT_POS[1])} style={TEXT_SHADOW}>
          <span className="text-accent inline-flex items-center gap-2 text-xs font-semibold tracking-[0.22em] uppercase">
            <IconSun className="h-4 w-4" />
            Potenza a regime
          </span>
          <p className="font-display text-display-sm md:text-display-md mt-3 font-bold tabular-nums">
            {nf.format(solar.stats.potenzaInstallataKWp)} <span className="text-accent">kWp</span>
          </p>
          <p className="mt-1 text-lg text-white/85">installati e monitorati</p>
        </div>

        {/* ③ sinistra — il claim di valore (h1 della pagina) */}
        <h1
          className={cn(
            "hero-beat font-display text-display-sm md:text-display-md font-bold text-balance",
            !reduced && BEAT_POS[2],
          )}
          style={TEXT_SHADOW}
        >
          Progettiamo, installiamo, manuteniamo{" "}
          <span className="text-accent">l&apos;energia che ti rende indipendente.</span>
        </h1>

        {/* ④ basso-centro — la CTA finale verso la mappa dei progetti */}
        <div
          className={cn(
            "hero-beat flex flex-col items-start gap-5 md:items-center",
            !reduced && BEAT_POS[3],
          )}
          style={TEXT_SHADOW}
        >
          <p className="font-display text-2xl font-bold text-balance md:text-3xl">
            Guarda dove abbiamo già acceso il sole.
          </p>
          <Button href="#mappa" size="lg">
            Esplora i progetti sulla mappa
            <IconArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Indicatore di avanzamento + scroll-cue: solo dove c'è la regia (desktop,
          non reduced). Su mobile/reduced non c'è una sequenza da segnare. */}
      {!reduced && (
        <>
          {/* Barra di avanzamento (pilotata dallo scrub, vedi onUpdate). */}
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

          {/* Scroll-cue: invita a scorrere; sparisce all'inizio dello scroll. */}
          <div
            aria-hidden
            className="hero-cue pointer-events-none absolute inset-x-0 bottom-6 z-20 mx-auto hidden w-fit flex-col items-center gap-1 text-white/70 md:flex"
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
    </section>
  );
}
