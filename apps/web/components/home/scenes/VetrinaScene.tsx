"use client";

/**
 * @descrizione  Scena #1 della home immersiva — "Siti vetrina moderni" (tema
 *   CHIARO, accent LIME di gruppo). NON un hero di apertura: è una FINTA
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
import { IconLayers } from "../vetrina/VetrinaIcons";
import { accentVars, drawPath, countUp } from "../immersive/shared";

// Accent unificato: la scena usa il LIME di gruppo via accentVars("platform")
// (override completo dei derivati soft/ink/ring, come le scene-prodotto).

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

      // Stato iniziale: ① homepage visibile; pista del pan a x:0; etichetta della
      // vetrina nascosta. (Le card partono dalla posa di RACCOLTA calcolata sotto.)
      gsap.set(".vt-pan", { xPercent: 0 });
      gsap.set(".vt-video", { scale: 1.06, xPercent: 0, transformOrigin: "50% 50%" });
      gsap.set(".vt-showcase-head", { autoAlpha: 0, y: 20 });
      gsap.set(".vt-exit-veil", { autoAlpha: 0 });

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
      // Trappola A: VetrinaScene non usa useImmersiveScene → il suo `tl` non ha
      // `tl.data`. Lo impostiamo a mano così gli helper con selettore-stringa
      // (drawPath, countUp) misurano/scrivono i nodi DENTRO questa scena.
      tl.data = stage;

      // ── GRID→SCATTER · posa di raccolta ────────────────────────────────────
      // Le card partono RACCOLTE verso il centro della scena-card (formazione
      // ordinata, "griglia") e si "rompono" nello scatter 3D sospeso entrando.
      // Offset calcolati a runtime rispetto al centro di `.vt-cards-scene` (che
      // pan-a con le card) → solo transform, nessuna animazione di layout.
      // ponytail: la posa 3D delle facce resta CSS-driven (var --pose); il morph
      // è di sola POSIZIONE (raccolta→scatter), sufficiente per l'effetto voluto.
      const cardsScene = stage.querySelector<HTMLElement>(".vt-cards-scene");
      const cards = Array.from(stage.querySelectorAll<HTMLElement>(".vt-card"));
      if (cardsScene && cards.length) {
        const box = cardsScene.getBoundingClientRect();
        const cx = box.left + box.width / 2;
        const cy = box.top + box.height / 2;
        cards.forEach((card) => {
          const r = card.getBoundingClientRect();
          const gx = (cx - (r.left + r.width / 2)) * 0.62; // verso il centro (griglia)
          const gy = (cy - (r.top + r.height / 2)) * 0.62;
          gsap.set(card, { x: gx, y: gy, scale: 0.86, autoAlpha: 0, transformOrigin: "50% 50%" });
        });
      } else {
        gsap.set(".vt-card", { autoAlpha: 0, y: 44, scale: 0.9, transformOrigin: "50% 50%" });
      }

      // ── Set iniziali dei beat di BEAT B (grafici + mockup) ──────────────────
      // Barre del mini bar-chart: crescono dal basso (scaleY).
      gsap.set(".vt-bar", { scaleY: 0, transformOrigin: "50% 100%" });
      // Ring: nascondi l'arco (offset = intera circonferenza); riposo = 98%.
      const ringArc = stage.querySelector<SVGCircleElement>(".vt-ring-arc");
      const ringCirc = ringArc?.getTotalLength() ?? 0;
      const ringRest = ringCirc * 0.02; // 98% mostrato (vedi Ring in SuspendedCards)
      if (ringArc) gsap.set(ringArc, { strokeDashoffset: ringCirc });
      // Mockup che si auto-assembla: ogni gruppo di pezzi parte da un offset diverso.
      gsap.set(".vt-mock-head", { autoAlpha: 0, y: -14 });
      gsap.set(".vt-mock-hero", { autoAlpha: 0, y: 12, scale: 0.9, transformOrigin: "left center" });
      gsap.set(".vt-mock-row", { autoAlpha: 0, x: -18 });
      gsap.set(".vt-mock-cell", { autoAlpha: 0, y: 14 });
      gsap.set(".vt-mock-cta", { autoAlpha: 0, scale: 0.6, transformOrigin: "left center" });

      tl
        // Respiro continuo: lento zoom del video per tutta la sequenza.
        .to(".vt-video", { scale: 1.22, duration: 5.4 }, 0)
        // Lo scroll-cue sparisce appena si comincia a scorrere.
        .to(".vt-cue", { autoAlpha: 0, duration: 0.3 }, 0)
        // ② PAN: l'intera homepage scorre a sinistra; il video la segue con un
        // leggero parallax (resta sotto, dà profondità) → rivela la vetrina.
        .to(".vt-pan", { xPercent: -50, ease: "power2.inOut", duration: 1.1 }, 0.95)
        .to(".vt-video", { xPercent: -4, ease: "power2.inOut", duration: 1.1 }, 0.95)
        // L'etichetta della vetrina entra mentre il pan si completa.
        .to(".vt-showcase-head", { autoAlpha: 1, y: 0, ease: "power2.out", duration: 0.5 }, 1.7)
        // ③ MORPH griglia→scatter: le card lasciano la raccolta e si dispongono
        // nello scatter (torna x/y/scale a riposo) in stagger.
        .to(
          ".vt-card",
          { x: 0, y: 0, scale: 1, autoAlpha: 1, ease: "power3.out", duration: 0.95, stagger: 0.12 },
          1.85,
        );

      // ④ MINI-GRAFICI che si DISEGNANO all'ingresso (riusano i primitivi del kit).
      drawPath(tl, ".vt-spark-path", { duration: 0.9, ease: "power2.inOut", position: 2.9 });
      tl.to(".vt-bar", { scaleY: 1, duration: 0.55, stagger: 0.06, ease: "back.out(1.7)" }, 2.9);
      if (ringArc) {
        // Ring che spazza 0→98% (strokeDashoffset) + contatore sincronizzato.
        tl.to(ringArc, { strokeDashoffset: ringRest, duration: 1, ease: "power2.out" }, 2.95);
      }
      countUp(tl, [{ el: ".vt-ring-val", to: 98 }], { duration: 1, position: 2.95 });

      // ⑤ MOCKUP che si auto-assembla: i pezzi entrano da offset diversi, in
      // stagger (back.out) → "il sito si monta sotto gli occhi".
      const asm = 3.05;
      tl.to(".vt-mock-head", { autoAlpha: 1, y: 0, duration: 0.4, ease: "back.out(2)" }, asm)
        .to(".vt-mock-hero", { autoAlpha: 1, y: 0, scale: 1, duration: 0.45, ease: "back.out(1.8)" }, asm + 0.12)
        .to(".vt-mock-row", { autoAlpha: 1, x: 0, duration: 0.4, stagger: 0.1, ease: "back.out(1.6)" }, asm + 0.24)
        .to(".vt-mock-cell", { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.08, ease: "back.out(1.8)" }, asm + 0.42)
        .to(".vt-mock-cta", { autoAlpha: 1, scale: 1, duration: 0.4, ease: "back.out(2.4)" }, asm + 0.62);
      // ⑥ "Click" sulla CTA del mockup (Vetrina non ha <Cursor/> → press MANUALE
      //    a posizioni ASSOLUTE: il lungo zoom-video a pos 0 governa la durata del
      //    timeline, quindi ">" punterebbe alla fine — inaffidabile qui). Finisce
      //    a scale 1 ⇒ stato di riposo pulito.
      tl.to(".vt-mock-cta", { scale: 0.92, duration: 0.12, ease: "power2.in" }, asm + 1.05);
      tl.to(".vt-mock-cta", { scale: 1, duration: 0.34, ease: "back.out(3)" }, asm + 1.17);

      // HAND-OFF → scena 02 (chiara): dopo un respiro (il video continua lo zoom)
      // un velo bg-background sale sul video scuro, così il passaggio dark→light
      // non è uno stacco netto; poi la scena 02 (ImmersiveStage) entra dal chiaro.
      tl.to(".vt-exit-veil", { autoAlpha: 1, duration: 0.5, ease: "power2.in" }, 5.3);

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
        // scena statica leggibile in flusso normale. Alta: BEAT B ha ora una
        // sequenza ricca (assemble mockup + grafici che si disegnano + morph),
        // più spazio-scroll = pacing comodo (vedi timeline in useIsoLayoutEffect).
        !reduced && "md:h-[460svh]",
      )}
      style={accentVars("platform")}
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
                  <IconLayers className="h-4 w-4" />
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

        {/* Velo di uscita → scena 02 (chiara): sale sul finale del video scuro,
            solo in regia (desktop, non reduced). */}
        {!reduced && (
          <div
            aria-hidden
            className="vt-exit-veil bg-background pointer-events-none absolute inset-0 z-40"
            style={{ opacity: 0 }}
          />
        )}
      </div>
    </section>
  );
}
