"use client";

import { useEffect, useRef } from "react";
import Container from "@gmgroup/ui/Container";
import Badge from "@gmgroup/ui/Badge";
import Button from "@gmgroup/ui/Button";
import SplitTextReveal from "@gmgroup/ui/SplitTextReveal";
import { gsap } from "@gmgroup/lib/gsap";
import { VIDEOS, POSTERS } from "@gmgroup/lib/assets";
import { DURATION, EASE, useReducedMotion, useIsoLayoutEffect } from "@gmgroup/lib/motion";
import { IconArrowRight } from "@/components/solar/SolarIcons";
import SolarFilmGrade from "@/components/solar/SolarFilmGrade";
import solar from "@/data/solar-projects.json";

/** Poster placeholder branded: sostituire con un frame reale del video. */
const HERO_POSTER = POSTERS.solarHero;

/** Numeri di credibilità dal dato reale (data/solar-projects.json). */
const nfIt = new Intl.NumberFormat("it-IT");

/**
 * Hero cinematografico di GM Solar.
 *
 * Regia di scroll (saltata con prefers-reduced-motion):
 * - DESKTOP: la scena viene "pinnata" e lo scroll diventa una sequenza —
 *   il video resta dietro e "si posa" con un lieve zoom-out mentre il
 *   grading caldo e la vignettatura si intensificano; il contenuto esce a
 *   beat sfalsati (badge → titolo → claim → CTA/numeri), con easing curato.
 * - MOBILE: stessa coreografia ma SENZA pin (più robusta), guidata dallo
 *   scorrere naturale dell'hero (niente jump da resize della barra URL).
 * - REDUCED-MOTION: niente pin/scrub, scena statica e leggibile (poster +
 *   grading/vignette di base, video in pausa).
 *
 * Performance: il poster (WebP leggero) fa da LCP; il video è `preload="none"`
 * e parte differito dopo il primo frame, così non compete col primo paint.
 * Il fallback a gradiente dietro al video evita il nero se l'autoplay non parte.
 */
export default function SolarHero() {
  const reduced = useReducedMotion();
  const stageRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Avvio DIFFERITO del video: con `preload="none"` e senza `autoPlay` non si
  // scarica/decodifica al primo paint (LCP = poster). Lo avviamo dopo il primo
  // frame. Con reduced-motion resta in pausa sul poster.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (reduced) {
      v.pause();
      return;
    }
    let timer = 0;
    const raf = requestAnimationFrame(() => {
      timer = window.setTimeout(() => void v.play().catch(() => {}), 200);
    });
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, [reduced]);

  // Coreografia di scroll. `gsap.matchMedia` (scopato alla scena) gestisce in
  // un colpo solo il responsive (pin solo da desktop) e la pulizia automatica.
  useIsoLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage || reduced) return;

    const mm = gsap.matchMedia(stage);

    const build = (pin: boolean) => {
      // Stato iniziale: leggero zoom sul video, che poi "si posa".
      gsap.set(".hero-video", { scale: 1.12, transformOrigin: "50% 50%" });

      // Flourish d'ingresso: la riga accent si apre da sinistra (clip-reveal).
      gsap.from(".hero-rule", {
        scaleX: 0,
        transformOrigin: "0% 50%",
        duration: DURATION.slower,
        ease: EASE.outExpo,
        delay: 0.35,
      });

      // Timeline master legata allo scroll.
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: stage,
          start: "top top",
          end: pin ? "+=120%" : "bottom top",
          scrub: pin ? 1 : 0.6,
          pin,
          // La scena è figlia di `.page-transition` (layout condiviso), che ha
          // una `transform` durante il fade di pagina (~0.4s): un elemento
          // `position:fixed` dentro un antenato trasformato è contenuto da
          // quell'antenato, non dal viewport → il pin sfasa se si scrolla in
          // quella finestra. `pinReparent` riaggancia la scena al <body> mentre
          // è attiva, evitando il problema (fix in-zona, niente shared).
          pinReparent: pin,
          pinSpacing: true,
          anticipatePin: pin ? 1 : 0,
        },
      });

      // Continui per tutta la durata: il video si posa, grading e vignette salgono.
      tl.to(".hero-video", { scale: 1.04, yPercent: -6, duration: 1 }, 0)
        .to(".solar-grade", { opacity: 0.9, duration: 1 }, 0)
        .to(".solar-vignette", { opacity: 1, duration: 1 }, 0)
        // Scroll-cue: esce subito.
        .to(".hero-cue", { autoAlpha: 0, y: 16, duration: 0.12 }, 0)
        // Beat di uscita sfalsati: non un fade unico, ma una cascata curata.
        .to(".hero-badge", { autoAlpha: 0, y: -40, ease: EASE.inOut, duration: 0.3 }, 0.05)
        .to(
          ".hero-rule",
          { autoAlpha: 0, scaleX: 0, transformOrigin: "0% 50%", ease: EASE.inOut, duration: 0.28 },
          0.1,
        )
        .to(".hero-headline", { autoAlpha: 0, y: -72, ease: EASE.inOut, duration: 0.45 }, 0.12)
        .to(".hero-sub", { autoAlpha: 0, y: -52, ease: EASE.inOut, duration: 0.4 }, 0.22)
        .to(
          ".hero-outro",
          { autoAlpha: 0, y: -40, ease: EASE.inOut, duration: 0.45, stagger: 0.06 },
          0.32,
        );
    };

    mm.add("(min-width: 768px)", () => build(true));
    mm.add("(max-width: 767px)", () => build(false));

    return () => mm.revert();
  }, [reduced]);

  return (
    <section
      ref={stageRef}
      className="relative isolate flex min-h-svh items-end overflow-hidden text-white"
      aria-label="GM Solar — EPC fotovoltaico"
    >
      {/* Fallback branded: visibile se il video non carica / non parte. */}
      <div
        aria-hidden
        className="from-brand-950 via-background to-background absolute inset-0 -z-20 bg-linear-to-br"
      />

      {/* Video reale (placeholder), sovradimensionato così zoom e parallax non
          scoprono i bordi. */}
      <video
        ref={videoRef}
        className="hero-video absolute inset-x-0 top-0 -z-10 h-[112%] w-full object-cover"
        muted
        loop={!reduced}
        playsInline
        preload="none"
        poster={HERO_POSTER}
      >
        <source src={VIDEOS.solarHero} type="video/mp4" />
      </video>

      {/* Look "film" condiviso (grana + vignette + grading caldo). Parte tenue e
          allo scroll si intensifica (le classi .solar-grade/.solar-vignette). */}
      <SolarFilmGrade gradeOpacity={0.25} vignetteOpacity={0.4} grainOpacity={0.12} />

      {/* Overlay di leggibilità: scuro dove sta il testo (contenuto ancorato in
          basso) e TRASPARENTE in alto, così il grading caldo + vignette restano
          percepibili sopra il video invece di essere schiacciati dal nero. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-linear-to-t from-black/88 via-black/45 to-transparent"
      />

      <Container className="relative z-10 pt-32 pb-20 md:pb-28">
        <div className="max-w-4xl">
          <Badge className="hero-badge mb-6 backdrop-blur">GM Solar · EPC fotovoltaico</Badge>

          {/* Riga accent (clip-reveal): firma cromatica del mondo solar. */}
          <span aria-hidden className="hero-rule bg-accent mb-6 block h-[3px] w-16 origin-left rounded-full" />

          <SplitTextReveal
            as="h1"
            by="word"
            text="La nostra migliore occasione di salvare il pianeta sei tu"
            className="hero-headline font-display text-display-sm sm:text-display-md md:text-display-lg font-bold text-balance"
          />
          <p className="hero-sub mt-6 max-w-2xl text-lg text-white/80 md:text-xl">
            EPC Contractor per impianti fotovoltaici di media e grande scala: progettiamo,
            realizziamo e manuteniamo l&apos;energia che ti rende indipendente.
          </p>
          <div className="hero-outro mt-8 flex flex-wrap items-center gap-3">
            <Button href="#calcolatore" size="lg">
              Stima il tuo risparmio
              <IconArrowRight className="h-4 w-4" />
            </Button>
            <Button href="#progetti" variant="outline" size="lg" className="text-white">
              Guarda i progetti
            </Button>
          </div>

          {/* Micro-kicker di credibilità: numeri reali dal dato, niente claim inventati. */}
          <p className="hero-outro mt-8 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/75">
            <span>
              <strong className="font-semibold text-white tabular-nums">
                {nfIt.format(solar.stats.potenzaInstallataKWp)} kWp
              </strong>{" "}
              installati
            </span>
            <span aria-hidden className="text-white/30">
              ·
            </span>
            <span>
              <strong className="font-semibold text-white tabular-nums">
                {nfIt.format(solar.stats.progettiRealizzati)}+
              </strong>{" "}
              progetti realizzati
            </span>
          </p>
        </div>
      </Container>

      {/* Scroll-cue animato (animate-bounce è azzerato da reduced-motion via CSS). */}
      <div
        aria-hidden
        className="hero-cue pointer-events-none absolute inset-x-0 bottom-6 mx-auto flex w-fit flex-col items-center gap-2 text-white/70"
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
    </section>
  );
}
