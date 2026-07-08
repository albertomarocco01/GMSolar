"use client";

/**
 * @descrizione  Scena "SITI VETRINA" — PRIMA scena della home: la presentazione
 *   apre in fade dal nero direttamente qui. È l'anteprima di un sito vetrina
 *   premium: un FINTO SITO (header con logo, nav mock e CTA) il cui hero è il
 *   video solare ALL-KEYFRAME (`/assets/solar-twin.mp4`) scrubbato dallo scroll.
 *   Regia: TITLE CARD di capitolo 01 (P12, ChapterCard del kit immersive — la
 *   scena NON usa ImmersiveStage ma importa il kit capitoli) sui primissimi px
 *   di scroll → scrub del video avanti/indietro per TUTTA la corsa (le card 3D
 *   premium vivono ora nel capitolo dedicato «Interfacce grafiche moderne»,
 *   vedi InterfacceScene — qui resta SOLO il video). Il cue "Scorri" grande in
 *   basso a sinistra parte con una MICRO-DEMO in loop (proxy → seek del video +
 *   dot del mousino in sync) che si uccide al primo scroll reale e rispetta la
 *   pausa globale della presentazione (`presentation:pausechange`).
 *   Porta l'ancora `id="vetrina"` (target dei link /#vetrina, es. kb assistente).
 *   Poiché la scena successiva è CHIARA, alza un velo chiaro sul finale →
 *   ingresso pulito, senza flash scuro.
 *   reduced-motion → variante statica impilata e leggibile: heading di capitolo
 *   «01 · Siti vetrina» + header finto + poster + frase statica.
 * @indice
 * - SolarTwinScene → scena autonoma (sticky + ScrollTrigger scrub + micro-demo)
 * - FakeSiteHeader → header mock del finto sito (decorativo, nessun link reale)
 */
import { useRef } from "react";
import { gsap, ScrollTrigger } from "@gmgroup/lib/gsap";
import { useReducedMotion, useIsoLayoutEffect } from "@gmgroup/lib/motion";
import ScrubVideo, { type ScrubVideoHandle } from "../ScrubVideo";
import ScrollCue from "../ScrollCue";
import { CHAPTERS, ChapterCard, maskReveal } from "../immersive/shared";

// Derivati ALL-KEYFRAME obbligatori: il seek è istantaneo SOLO con questi.
const SRC = "/assets/solar-twin.mp4";
const POSTER = "/assets/solar-twin-poster.webp";

const ARIA_LABEL = "Siti vetrina — anteprima di un sito con hero video scrollytelling";
/** Sottotitolo della title card di capitolo 01 — ex frase popup d'apertura. */
const FRASE = "Con una forte narrativa, costruita tramite scrollytelling video.";

/** Il video esaurisce la sua durata a questo progress di scroll. A 0.82 l'ultimo
 *  frame (pannelli accesi) resta FERMO per un tratto leggibile (0.82 → 0.92)
 *  prima che il velo chiaro d'uscita cominci a salire (0.92). */
const VIDEO_END = 0.82;
/** Escursione (in frazione di video) della micro-demo del cue: avanti/indietro. */
const DEMO_SPAN = 0.06;
/** Corsa verticale (px) del dot dentro il mousino, in sync con la micro-demo. */
const DEMO_DOT_TRAVEL = 20;

export default function SolarTwinScene() {
  const reduced = useReducedMotion();
  const stageRef = useRef<HTMLElement>(null);
  const videoRef = useRef<ScrubVideoHandle>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useIsoLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage || reduced) return;

    /** Smonta i listener globali della micro-demo. Assegnata dentro il ctx;
     *  chiamata sia alla kill (primo scroll) sia nel cleanup dell'effect. */
    let disposeDemo: () => void = () => {};

    const ctx = gsap.context(() => {
      // Stato iniziale: velo d'uscita nascosto; cue visibile.
      gsap.set(".st-cue", { autoAlpha: 1 });
      gsap.set(".st-exit-veil", { autoAlpha: 0 });

      // ── TITLE CARD DI CAPITOLO 01 — INTRO ONE-SHOT (NON scrubbata) ─────────
      // La card NON dipende dallo scroll: è mostrata e TENUTA FERMA PRIMA che la
      // presentazione parta. Velo CHIARO (lo stesso della ChapterCard) attivo dal
      // frame 0: copre l'hero finché la card non si solleva → si legge il TITOLO,
      // poi si rivela l'hero e SOLO allora l'auto-scroll parte (evento
      // `presentation:introdone` → AutoScroll). Il nero di IntroOverlay sfuma
      // PRIMA del reveal del titolo (`delay` ~1.9s) → nessun flash brutale.
      // gsap.context la uccide al cleanup; sotto reduced-motion l'effect è saltato
      // (early-return) → resta l'heading statico e la card inline resta nascosta.
      gsap.set(".imm-chapter", { autoAlpha: 1 });
      gsap.set(".imm-chapter-line", { scaleX: 0, transformOrigin: "left center" });
      gsap.set(".imm-chapter-sub", { autoAlpha: 0, y: 14 });
      const introTl = gsap.timeline({
        delay: 1.15,
        onComplete: () => window.dispatchEvent(new CustomEvent("presentation:introdone")),
      });
      // Titolo: si genera con un unico wipe continuo sinistra→destra.
      maskReveal(introTl, ".imm-chapter-title", {
        dir: "l",
        duration: 1.0,
        ease: "power2.inOut",
      });
      introTl
        .to(".imm-chapter-line", { scaleX: 1, duration: 0.5, ease: "power2.inOut" }, "-=0.2")
        .to(".imm-chapter-sub", { autoAlpha: 1, y: 0, duration: 0.45, ease: "power3.out" }, "-=0.25")
        // HOLD leggibile: il titolo resta FERMO ~2.4s (gap "+=2.4" prima dell'uscita).
        .to(".imm-chapter", { autoAlpha: 0, y: -48, duration: 0.7, ease: "power2.in" }, "+=2.4");

      // Timeline SCRUBBATA (normalizzata a durata 1 = progress): guida video, cue,
      // card 3D e velo d'uscita. La title card d'apertura NON è qui dentro.
      const tl = gsap.timeline({ defaults: { ease: "none" } });
      tl.to({}, { duration: 1 }, 0);

      // Cue "Scorri": sfuma appena parte lo scroll.
      tl.to(".st-cue", { autoAlpha: 0, duration: 0.04, ease: "power2.in" }, 0.05);

      // Velo chiaro d'uscita → la scena successiva è chiara.
      tl.to(".st-exit-veil", { autoAlpha: 1, duration: 0.08, ease: "power2.in" }, 0.92);

      // Guardia di sviluppo: un tween oltre lo spacer allunga la timeline e
      // ScrollTrigger rimapperebbe TUTTI i beat in anticipo sul frame video.
      if (process.env.NODE_ENV !== "production" && tl.duration() > 1) {
        console.warn(
          `[SolarTwinScene] timeline ${tl.duration().toFixed(3)} > 1: beat rimappati in anticipo`,
        );
      }

      // ── MICRO-DEMO del cue: tween repeat:-1 FUORI dalla timeline scrubbata ──
      // Un proxy va 0→DEMO_SPAN→0 (sine.inOut, ~2.5s a ciclo): a ogni update
      // porta il VIDEO avanti e indietro (seek) e muove il dot del mousino in
      // sync (stessa durata/ease) → si vede che il video segue il gesto di
      // scroll. Si UCCIDE definitivamente al primo scroll reale; rispetta la
      // pausa globale via `presentation:pausechange`.
      const dot = stage.querySelector<HTMLElement>(".st-cue .sc-dot");
      const proxy = { p: 0 };
      const demo = gsap.to(proxy, {
        p: DEMO_SPAN,
        duration: 1.25,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        // Montaggio a presentazione GIÀ in pausa (es. remount): parte congelata.
        paused: document.documentElement.hasAttribute("data-presentation-paused"),
        onUpdate: () => {
          videoRef.current?.seek(proxy.p);
          if (dot) gsap.set(dot, { y: (proxy.p / DEMO_SPAN) * DEMO_DOT_TRAVEL });
        },
      });

      // PAUSA GLOBALE (click → AutoScroll): congela/riprende la demo E la
      // title card d'apertura (introTl è one-shot fuori dallo scrub: senza
      // questo, "ferma demo" durante l'intro non aveva effetto e la card
      // proseguiva/svaniva da sola). Dopo la kill il listener resta no-op
      // finché la dispose non lo rimuove (removeEventListener è idempotente).
      const onPauseChange = (e: Event) => {
        const paused = Boolean((e as CustomEvent<{ paused: boolean }>).detail?.paused);
        if (paused) {
          demo.pause();
          if (introTl.progress() < 1) introTl.pause();
        } else {
          demo.resume();
          if (introTl.progress() < 1) introTl.resume();
        }
      };
      window.addEventListener("presentation:pausechange", onPauseChange);

      // Primo scroll REALE (wheel/touch, o progress oltre soglia nell'onUpdate
      // dello ScrollTrigger — copre anche l'auto-scroll) → demo uccisa: da qui
      // in poi il seek appartiene SOLO allo ScrollTrigger.
      let demoAlive = true;
      const killDemo = () => {
        if (!demoAlive) return;
        demoAlive = false;
        demo.kill();
        // Dot a riposo: se si torna in cima (scrub indietro) il cue ricompare pulito.
        if (dot) gsap.set(dot, { y: 0 });
        disposeDemo();
      };
      disposeDemo = () => {
        window.removeEventListener("presentation:pausechange", onPauseChange);
        window.removeEventListener("wheel", killDemo);
        window.removeEventListener("touchstart", killDemo);
      };
      window.addEventListener("wheel", killDemo, { passive: true });
      window.addEventListener("touchstart", killDemo, { passive: true });

      ScrollTrigger.create({
        trigger: stage,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.5,
        animation: tl,
        onUpdate: (self) => {
          if (self.progress > 0.01) killDemo();
          // Il video esaurisce la corsa a VIDEO_END → ultimo frame fermo sotto le card.
          videoRef.current?.seek(Math.min(1, self.progress / VIDEO_END));
          if (progressRef.current) {
            progressRef.current.style.transform = `scaleX(${self.progress})`;
          }
        },
      });

      ScrollTrigger.refresh();
    }, stage);

    return () => {
      disposeDemo();
      ctx.revert();
    };
  }, [reduced]);

  /* ---- reduced-motion: variante statica impilata, leggibile ---- */
  if (reduced) {
    return (
      <section
        id="vetrina"
        aria-label={ARIA_LABEL}
        // Capitolo 01 per l'HUD, a mano (la scena non passa da ImmersiveStage).
        data-chapter={0}
        className="bg-background text-foreground relative isolate"
      >
        <FakeSiteHeader />
        <div className="mx-auto w-full max-w-5xl px-6 py-12">
          {/* Heading di capitolo statico (P12): sotto reduced-motion la title
              card animata resta nascosta → il numero/nome capitolo vive qui,
              come testo normale senza velo scuro. */}
          <h2 className="font-display text-foreground mb-8 text-xl font-bold tracking-tight">
            {CHAPTERS[0].title}
          </h2>
          {/* Poster statico al posto del video scrubbato */}
          <img
            src={POSTER}
            alt=""
            aria-hidden
            className="border-border w-full rounded-2xl border object-cover"
          />
          {/* Frase d'apertura come testo statico */}
          <p className="font-display mt-10 text-center text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            {FRASE}
          </p>
        </div>
      </section>
    );
  }

  /* ---- regia: finto sito sticky con hero video scrubbato ---- */
  return (
    <section
      ref={stageRef}
      id="vetrina"
      aria-label={ARIA_LABEL}
      // Capitolo 01 per l'HUD (ChapterHUD osserva le section [data-chapter]);
      // a mano perché la scena non passa da ImmersiveStage (prop chapterIndex).
      data-chapter={0}
      className="relative isolate h-[320svh]"
    >
      <div className="sticky top-0 flex h-svh flex-col overflow-hidden">
        {/* FINTO SITO — header di sito vetrina (decorativo) */}
        <FakeSiteHeader />

        {/* HERO del finto sito: video scrubbato full-bleed sotto l'header */}
        <div className="relative flex-1 overflow-hidden text-white">
          {/* Fallback branded scuro (contrasto garantito se il video non parte) */}
          <div
            aria-hidden
            className="absolute inset-0 -z-20 bg-linear-to-br from-[#0b1020] via-[#13210a] to-[#0b1020]"
          />
          {/* Video scrubbato dallo scroll (sorgente ALL-KEYFRAME obbligatoria) */}
          <ScrubVideo ref={videoRef} src={SRC} poster={POSTER} className="absolute inset-0 -z-10" />

          {/* Scrim leggero di contrasto */}
          <div aria-hidden className="absolute inset-0 bg-black/20" />
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-black/45 to-transparent"
          />

          {/* Cue "Scorri" grande in basso a sinistra: il dot del mousino è
              pilotato dalla micro-demo (GSAP), non da keyframe CSS. */}
          <div className="st-cue pointer-events-none absolute bottom-8 left-[6vw] z-30">
            <ScrollCue reduced={reduced} />
          </div>
        </div>

        {/* TITLE CARD DI CAPITOLO 01 — velo SCURO numerato con titolo lime,
            full-screen (copre anche l'header). Parte nascosta (opacity 0 inline);
            l'INTRO ONE-SHOT (non scrubbata, vedi effect) la mostra e la tiene
            ferma PRIMA dello scroll, poi la solleva rivelando l'hero. */}
        {/* TARATURA MANUALE: `lift` alza il blocco titolo sul video — il valore
            (-translate-y-12 ≈ 3rem) si cambia QUI; il punto di applicazione è il
            blocco interno della ChapterCard (shared.tsx, commento omonimo). */}
        <ChapterCard chapter={CHAPTERS[0]} subtitle={FRASE} lift="-translate-y-12" />

        {/* Barra di avanzamento accent (scaleX = progress) */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-[3px] bg-white/15"
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

        {/* Velo chiaro d'uscita → la scena successiva (Assistente) è chiara */}
        <div
          aria-hidden
          className="st-exit-veil bg-background pointer-events-none absolute inset-0 z-50"
          style={{ opacity: 0 }}
        />
      </div>
    </section>
  );
}

/**
 * Header mock del finto sito vetrina, modellato sul sito attuale GM Solar:
 * logo (anello accent + wordmark «GM SOLAR» con tagline) + nav generica
 * (Home · Chi Siamo · Tipologia di Impianti · Servizi · Gallery · Privacy) +
 * CTA «Contattaci». TUTTO decorativo: nessun link reale (solo <span>/<div>
 * con aria-hidden) — è scenografia, non navigazione.
 */
function FakeSiteHeader() {
  return (
    <div
      aria-hidden
      className="border-border bg-background/90 relative z-30 flex h-14 shrink-0 items-center justify-between border-b px-6 backdrop-blur md:px-[4vw]"
    >
      {/* Logo: anello accent + wordmark con tagline (stile GM Solar) */}
      <div className="flex items-center gap-2.5">
        <span className="border-accent flex h-7 w-7 items-center justify-center rounded-full border-2">
          <span className="bg-accent h-2.5 w-2.5 rounded-full" />
        </span>
        <span className="leading-none">
          <span className="font-display text-foreground block text-base font-extrabold tracking-tight">
            GM SOLAR
          </span>
          <span className="text-accent-ink mt-0.5 block text-[9px] font-semibold tracking-[0.18em] uppercase">
            Energie Rinnovabili
          </span>
        </span>
      </div>
      {/* Nav mock + CTA — voci del sito attuale GM Solar (decorative) */}
      <div className="flex items-center gap-8">
        <div className="text-muted hidden items-center gap-6 text-sm font-medium lg:flex">
          <span>Home</span>
          <span>Chi Siamo</span>
          <span>Tipologia di Impianti</span>
          <span>Servizi</span>
          <span>Gallery</span>
          <span>Privacy</span>
        </div>
        <span className="bg-accent text-accent-contrast rounded-full px-5 py-1.5 text-sm font-semibold">
          Contattaci
        </span>
      </div>
    </div>
  );
}
