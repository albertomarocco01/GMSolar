"use client";

/**
 * @descrizione  Scena "SITI VETRINA" — PRIMA scena della home: la presentazione
 *   apre in fade dal nero direttamente qui. È l'anteprima di un sito vetrina
 *   premium: un FINTO SITO (header con logo, nav mock e CTA) il cui hero è il
 *   video solare ALL-KEYFRAME (`/assets/solar-twin.mp4`) scrubbato dallo scroll.
 *   Regia: TITLE CARD di capitolo 01 (P12, ChapterCard del kit immersive — la
 *   scena NON usa ImmersiveStage ma importa il kit capitoli) sui primissimi px
 *   di scroll → scrub del video fino a VIDEO_END → SPLIT FINALE: il video "si
 *   apre in due" (due metà-canvas con l'ULTIMO frame, catturato a runtime,
 *   traslano a sinistra e a destra — transform-only) scoprendo un pannello
 *   scuro con TRE card 3D di servizio; quella centrale (wallbox) ha il bordo
 *   elettrico (ElectricBorder). Il cue "Scorri" grande in basso a sinistra
 *   parte con una MICRO-DEMO in loop (proxy → seek del video + dot del mousino
 *   in sync) che si uccide al primo scroll reale e rispetta la pausa globale
 *   della presentazione (`presentation:pausechange`).
 *   Porta l'ancora `id="vetrina"` (target dei link /#vetrina, es. kb assistente).
 *   Poiché la scena successiva è CHIARA, alza un velo chiaro sul finale →
 *   ingresso pulito, senza flash scuro.
 *   reduced-motion → variante statica impilata e leggibile: heading di capitolo
 *   «01 · Siti vetrina» + header finto + poster + frase statica + card statiche.
 * @indice
 * - SolarTwinScene → scena autonoma (sticky + ScrollTrigger scrub + micro-demo)
 * - ServiceCard → card verticale di servizio (immagine quadrata + testo)
 * - FakeBrowserBar → barra browser mock (traffic dots + URL) sopra il finto sito
 * - FakeSiteHeader → header mock del finto sito (decorativo, nessun link reale)
 */
import { useRef } from "react";
import { gsap, ScrollTrigger } from "@gmgroup/lib/gsap";
import { useReducedMotion, useIsoLayoutEffect } from "@gmgroup/lib/motion";
import ScrubVideo, { type ScrubVideoHandle } from "../ScrubVideo";
import ScrollCue from "../ScrollCue";
import ElectricBorder from "../showcase/ElectricBorder";
import {
  CHAPTERS,
  ChapterCard,
  DUR,
  EASE_CAMERA,
  EASE_IN_SCENE,
  EASE_OUT_SCENE,
  maskReveal,
  scheduleRefresh,
} from "../immersive/shared";

// Derivati ALL-KEYFRAME obbligatori: il seek è istantaneo SOLO con questi.
const SRC = "/assets/solar-twin.mp4";
const POSTER = "/assets/solar-twin-poster.webp";

const ARIA_LABEL = "Siti vetrina — anteprima di un sito con hero video scrollytelling";
/** Sottotitolo della title card di capitolo 01 — ex frase popup d'apertura. */
const FRASE = "Con una forte narrativa, costruita tramite scrollytelling video.";

/** Il video esaurisce la sua durata a questo progress di scroll: da qui in poi
 *  l'ultimo frame resta fermo e parte la sequenza di SPLIT (vedi sotto). */
const VIDEO_END = 0.52;
/** Da questo progress i due canvas-metà catturano l'ultimo frame del video
 *  (finestra "live" fino a SPLIT_AT: il lerp di ScrubVideo sta ancora
 *  arrivando all'ultimo frame, l'ultima cattura vince). */
const SNAP_FROM = 0.53;
/** Le due metà diventano visibili e iniziano a traslare fuori. */
const SPLIT_AT = 0.56;
/** Colore del riempimento di sicurezza delle metà (se il frame non è pronto). */
const HALF_FALLBACK = "#0b1020";
/** Escursione (in frazione di video) della micro-demo del cue: avanti/indietro. */
const DEMO_SPAN = 0.06;
/** Corsa verticale (px) del dot dentro il mousino, in sync con la micro-demo. */
const DEMO_DOT_TRAVEL = 20;

/** Contenuto delle tre card di servizio del pannello finale (in-world: sono la
 *  sezione "servizi" del finto sito GM Solar). Foto = prodotto REALE indicato. */
const SERVIZI = [
  {
    kind: "Fotovoltaico",
    title: "Impianti chiavi in mano",
    desc: "Progettazione, posa e collaudo.",
    img: "/assets/products/pannello-01.jpg",
  },
  {
    kind: "Ricarica EV",
    title: "Wallbox & carico dinamico",
    desc: "L'energia del tetto, fino all'auto.",
    img: "/assets/products/wallbox-detail.jpg",
  },
  {
    kind: "Accessori",
    title: "Cavi e ricarica smart",
    desc: "Modo 3, monofase e trifase.",
    img: "/assets/products/cavo-03.jpg",
  },
] as const;

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
      // Stato iniziale: velo d'uscita, metà-sipario e pannello card nascosti.
      gsap.set(".st-cue", { autoAlpha: 1 });
      gsap.set(".st-exit-veil", { autoAlpha: 0 });
      gsap.set(".st-half, .st-cards", { autoAlpha: 0 });
      // Card 3D: prospettiva per-card + tilt PERSISTENTE "a galleria" delle due
      // laterali (rotationY non è mai toccata dai tween d'entrata → resta).
      gsap.set(".st-card", { transformPerspective: 1100, transformOrigin: "50% 60%" });
      gsap.set(".st-card-l", { rotationY: 10 });
      gsap.set(".st-card-r", { rotationY: -10 });

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
      gsap.set(".imm-chapter-sub", { autoAlpha: 0, y: 14 });
      const introTl = gsap.timeline({
        delay: 1.15,
        onComplete: () => window.dispatchEvent(new CustomEvent("presentation:introdone")),
      });
      // Titolo (protagonista del beat): wipe sinistra→destra con ANTICIPAZIONE —
      // micro-contromovimento e settle (EASE_SNAP) mentre la maschera lo scopre.
      maskReveal(introTl, ".imm-chapter-title", {
        dir: "l",
        duration: DUR.scene,
        anticipate: true,
      });
      introTl
        .to(
          ".imm-chapter-sub",
          { autoAlpha: 1, y: 0, duration: DUR.beat, ease: EASE_IN_SCENE },
          "-=0.2",
        )
        // HOLD leggibile: il titolo resta FERMO ~2.4s (gap "+=2.4" prima dell'uscita).
        .to(
          ".imm-chapter",
          { autoAlpha: 0, y: -48, duration: DUR.beat, ease: EASE_OUT_SCENE },
          "+=2.4",
        );

      // ── SNAPSHOT dell'ultimo frame nelle due metà-canvas ────────────────────
      // Niente ffmpeg/asset dedicato: quando lo scrub arriva a fine video, il
      // frame corrente del <video> viene disegnato UNA volta (per canvas) con la
      // stessa mappatura di object-cover → le metà sono pixel-identiche all'hero.
      // Riempimento scuro di sicurezza prima del drawImage: nel caso peggiore
      // (frame non decodificato) si aprono due pannelli scuri, mai un buco.
      const hero = stage.querySelector<HTMLElement>(".st-hero");
      const heroVideo = stage.querySelector<HTMLVideoElement>(".st-hero video");
      const halfCanvases = Array.from(stage.querySelectorAll<HTMLCanvasElement>(".st-half canvas"));
      let snappedW = 0; // larghezza hero all'ultima cattura (0 = mai catturato)
      const snapshot = (live: boolean) => {
        if (!hero) return;
        const cw = hero.clientWidth;
        const ch = hero.clientHeight;
        if (!cw || !ch) return;
        // Fuori dalla finestra live si ridisegna solo se mai catturato o resize.
        if (!live && snappedW === cw) return;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        for (const c of halfCanvases) {
          if (c.width !== Math.round(cw * dpr)) {
            c.width = Math.round(cw * dpr);
            c.height = Math.round(ch * dpr);
            c.style.width = `${cw}px`;
            c.style.height = `${ch}px`;
          }
          const cx = c.getContext("2d");
          if (!cx) continue;
          cx.setTransform(dpr, 0, 0, dpr, 0, 0);
          cx.fillStyle = HALF_FALLBACK;
          cx.fillRect(0, 0, cw, ch);
          if (heroVideo && heroVideo.videoWidth) {
            // Mappatura object-cover: scala max, centrato (come il <video>).
            const s = Math.max(cw / heroVideo.videoWidth, ch / heroVideo.videoHeight);
            const dw = heroVideo.videoWidth * s;
            const dh = heroVideo.videoHeight * s;
            try {
              cx.drawImage(heroVideo, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
            } catch {
              /* frame non pronto: resta il riempimento scuro */
            }
          }
        }
        snappedW = cw;
      };

      // Timeline SCRUBBATA (normalizzata a durata 1 = progress): guida video, cue,
      // split finale e velo d'uscita. La title card d'apertura NON è qui dentro.
      const tl = gsap.timeline({ defaults: { ease: "none" } });
      tl.to({}, { duration: DUR.scene }, 0);

      // Cue "Scorri": sfuma appena parte lo scroll.
      tl.to(".st-cue", { autoAlpha: 0, duration: 0.04, ease: EASE_OUT_SCENE }, 0.05); // motion: dissolve lampo al primo scroll (unità scrub, non secondi)

      // ── SPLIT FINALE: il video "si apre in due" sulle card 3D ──────────────
      // Le metà appaiono INSIEME al pannello (stesso istante: mostrano lo stesso
      // frame del video, il passaggio è invisibile) e traslano fuori — solo
      // transform, scrub-safe e reversibile: tornando indietro si richiudono.
      tl.set(".st-half", { autoAlpha: 1 }, SPLIT_AT);
      tl.set(".st-cards", { autoAlpha: 1 }, SPLIT_AT);
      tl.to(".st-half-l", { xPercent: -101, duration: 0.14, ease: EASE_CAMERA }, SPLIT_AT);
      tl.to(".st-half-r", { xPercent: 101, duration: 0.14, ease: EASE_CAMERA }, SPLIT_AT);
      // Heading del pannello: kicker in rise + titolo con wipe a maschera.
      tl.fromTo(
        ".st-cards-kicker",
        { autoAlpha: 0, y: 16 },
        { autoAlpha: 1, y: 0, duration: 0.05, ease: EASE_IN_SCENE },
        0.6,
      );
      maskReveal(tl, ".st-cards-title", { dir: "l", duration: 0.07, position: 0.62 });
      // Card 3D in cascata: salgono da sotto con push di profondità (z) e si
      // assestano; le laterali conservano il tilt impostato al mount. Valori
      // FISSI (fromTo) → scrub-safe in entrambe le direzioni.
      tl.fromTo(
        ".st-card-l",
        { autoAlpha: 0, y: 90, z: -180, scale: 0.92 },
        { autoAlpha: 1, y: 0, z: -26, scale: 1, duration: 0.1, ease: EASE_IN_SCENE },
        0.64,
      );
      tl.fromTo(
        ".st-card-c",
        { autoAlpha: 0, y: 90, z: -180, scale: 0.92 },
        { autoAlpha: 1, y: 0, z: 0, scale: 1, duration: 0.1, ease: EASE_IN_SCENE },
        0.68,
      );
      tl.fromTo(
        ".st-card-r",
        { autoAlpha: 0, y: 90, z: -180, scale: 0.92 },
        { autoAlpha: 1, y: 0, z: -26, scale: 1, duration: 0.1, ease: EASE_IN_SCENE },
        0.72,
      );

      // Velo chiaro d'uscita → la scena successiva è chiara. Sale sul finale,
      // dopo un hold leggibile del pannello card (0.82 → 0.95).
      tl.to(".st-exit-veil", { autoAlpha: 1, duration: 0.05, ease: EASE_OUT_SCENE }, 0.95); // motion: 0.95+0.05=1 — il velo chiude ESATTAMENTE a fine scrub

      // Guardia di sviluppo: un tween oltre lo spacer allunga la timeline e
      // ScrollTrigger rimapperebbe TUTTI i beat in anticipo sul frame video.
      if (process.env.NODE_ENV !== "production" && tl.duration() > 1) {
        console.warn(
          `[SolarTwinScene] timeline ${tl.duration().toFixed(3)} > 1: beat rimappati in anticipo`,
        );
      }

      // ── MICRO-DEMO del cue: tween repeat:-1 FUORI dalla timeline scrubbata ──
      // Un proxy va 0→DEMO_SPAN→0 (EASE_CAMERA, 3.2s a ciclo): a ogni update
      // porta il VIDEO avanti e indietro (seek) e muove il dot del mousino in
      // sync (stessa durata/ease) → si vede che il video segue il gesto di
      // scroll. Si UCCIDE definitivamente al primo scroll reale; rispetta la
      // pausa globale via `presentation:pausechange`.
      const dot = stage.querySelector<HTMLElement>(".st-cue .sc-dot");
      // Frecce ↑/↓ del cue: la demo accende quella nel verso corrente → si vede
      // che lo scrollytelling va avanti E indietro (richiesta: interazione chiara).
      const upArrow = stage.querySelector<HTMLElement>(".st-cue .sc-up");
      const downArrow = stage.querySelector<HTMLElement>(".st-cue .sc-down");
      const proxy = { p: 0 };
      let lastP = 0;
      const demo = gsap.to(proxy, {
        p: DEMO_SPAN,
        duration: 1.6, // motion: metà del periodo comune 3.2s dei loop decorativi (yoyo)
        ease: EASE_CAMERA,
        repeat: -1,
        yoyo: true,
        // Montaggio a presentazione GIÀ in pausa (es. remount): parte congelata.
        paused: document.documentElement.hasAttribute("data-presentation-paused"),
        onUpdate: () => {
          videoRef.current?.seek(proxy.p);
          if (dot) gsap.set(dot, { y: (proxy.p / DEMO_SPAN) * DEMO_DOT_TRAVEL });
          // Direzione della demo → enfasi sulla freccia corrispondente (set
          // istantaneo, scrub-safe: nessun tween annidato dentro l'onUpdate).
          const dir = proxy.p - lastP;
          lastP = proxy.p;
          if (dir !== 0 && upArrow && downArrow) {
            gsap.set(downArrow, { opacity: dir > 0 ? 1 : 0.3 });
            gsap.set(upArrow, { opacity: dir < 0 ? 1 : 0.3 });
          }
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
        // Dot a riposo e frecce neutre (entrambe visibili): se si torna in cima
        // (scrub indietro) il cue ricompare pulito e ancora bidirezionale.
        if (dot) gsap.set(dot, { y: 0 });
        if (upArrow && downArrow) gsap.set([upArrow, downArrow], { opacity: 0.7 });
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
          // Il video esaurisce la corsa a VIDEO_END → ultimo frame fermo, poi split.
          videoRef.current?.seek(Math.min(1, self.progress / VIDEO_END));
          // Cattura dell'ultimo frame: finestra "live" prima dello split (il lerp
          // di ScrubVideo sta ancora convergendo, l'ultima cattura vince), poi
          // una-tantum se si atterra direttamente oltre (salto/anchor/resize).
          if (self.progress > SNAP_FROM && self.progress < SPLIT_AT) snapshot(true);
          else if (self.progress >= SPLIT_AT) snapshot(false);
          if (progressRef.current) {
            progressRef.current.style.transform = `scaleX(${self.progress})`;
          }
        },
      });

      scheduleRefresh();
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
        <div className="mx-auto w-full max-w-5xl px-6 py-12">
          {/* Heading di capitolo statico (P12): sotto reduced-motion la title
              card animata resta nascosta → il numero/nome capitolo vive qui,
              come testo normale senza velo scuro. */}
          <h2 className="font-display text-foreground mb-8 text-xl font-bold tracking-tight">
            {CHAPTERS[0].title}
          </h2>
          {/* Finto sito in device frame (browser mock): barra + header + poster
              con aspect esplicito 16/9 al posto del video scrubbato. */}
          <div className="border-border overflow-hidden rounded-2xl border shadow-lg">
            <FakeBrowserBar />
            <FakeSiteHeader />
            <img src={POSTER} alt="" aria-hidden className="aspect-video w-full object-cover" />
          </div>
          {/* Frase d'apertura come testo statico */}
          <p className="font-display mt-10 text-center text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            {FRASE}
          </p>
          {/* Card di servizio del finale, statiche (senza split né 3D). */}
          <div className="mt-10 grid grid-cols-1 justify-items-center gap-6 sm:grid-cols-3">
            {SERVIZI.map((s) => (
              <ServiceCard key={s.title} {...s} className="w-60" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  /* ---- regia: finto sito sticky con hero video scrubbato + split finale ---- */
  return (
    <section
      ref={stageRef}
      id="vetrina"
      aria-label={ARIA_LABEL}
      // Capitolo 01 per l'HUD (ChapterHUD osserva le section [data-chapter]);
      // a mano perché la scena non passa da ImmersiveStage (prop chapterIndex).
      data-chapter={0}
      // AutoScroll: anchor extra a FINE SCRUB → il tratto vuoto (velo chiaro +
      // hand-off) verso l'Assistente si attraversa veloce invece che a passo bell.
      data-fast-handoff="true"
      className="relative isolate h-[340svh]"
    >
      <div className="bg-background sticky top-0 flex h-svh items-center justify-center overflow-hidden">
        {/* FINTO SITO in DEVICE FRAME (R3 regola 1): browser mock centrato,
            ~16:10 da laptop, max-w-6xl — mai full-bleed da bordo a bordo. */}
        <div className="border-border bg-background relative flex aspect-[16/10] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border shadow-2xl">
          {/* Barra browser mock: vende il "sito vero" (traffic dots + URL) */}
          <FakeBrowserBar />

          {/* Header di sito vetrina (decorativo) */}
          <FakeSiteHeader />

          {/* HERO del finto sito: video scrubbato che riempie il frame sotto l'header.
              `isolate` è OBBLIGATORIO: video (-z-10) e fallback (-z-20) hanno z
              negativo — senza uno stacking context locale finirebbero DIETRO il
              `bg-background` del device frame (schermo grigio, fix post-R3). */}
          <div className="st-hero relative isolate flex-1 overflow-hidden text-white">
            {/* Fallback branded scuro (contrasto garantito se il video non parte) */}
            <div
              aria-hidden
              className="absolute inset-0 -z-20 bg-linear-to-br from-[#0b1020] via-[#13210a] to-[#0b1020]"
            />
            {/* Video scrubbato dallo scroll (sorgente ALL-KEYFRAME obbligatoria) */}
            <ScrubVideo
              ref={videoRef}
              src={SRC}
              poster={POSTER}
              className="absolute inset-0 -z-10"
            />

            {/* Scrim leggero di contrasto */}
            <div aria-hidden className="absolute inset-0 bg-black/20" />
            <div
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-black/45 to-transparent"
            />

            {/* PANNELLO CARD 3D — sotto le metà-sipario: rivelato quando il video
                si apre in due. Sfondo OPACO scuro (copre video e scrim), continua
                il mood dell'hero e fa friggere il lime del bordo elettrico.
                `data-quadro` = gate di visibilità di ElectricBorder: il suo rAF
                gira SOLO quando questo pannello è visibile (autoAlpha 0→1). */}
            <div
              data-quadro
              className="st-cards absolute inset-0 z-10 flex flex-col items-center justify-center gap-7 bg-linear-to-br from-[#0b1020] via-[#111b0e] to-[#0b1020] px-8"
              style={{ opacity: 0, visibility: "hidden" }}
            >
              <div className="text-center">
                <p className="st-cards-kicker text-accent text-xs font-semibold tracking-[0.22em] uppercase">
                  I nostri servizi
                </p>
                <p className="st-cards-title font-display mt-2 text-3xl font-bold tracking-tight text-white md:text-4xl">
                  Dal tetto alla ricarica.
                </p>
              </div>
              {/* Galleria 3D: prospettiva sul contenitore, tilt persistente sulle
                  laterali (gsap.set al mount). SOLO la card centrale ha il bordo
                  elettrico — effetto per-elemento, mai sul contenitore. */}
              <div
                className="flex items-center justify-center gap-6"
                style={{ perspective: "1100px" }}
              >
                <ServiceCard {...SERVIZI[0]} className="st-card st-card-l w-60" />
                <ElectricBorder radius={16} className="st-card st-card-c w-60">
                  <ServiceCard {...SERVIZI[1]} className="h-full w-full" />
                </ElectricBorder>
                <ServiceCard {...SERVIZI[2]} className="st-card st-card-r w-60" />
              </div>
            </div>

            {/* METÀ-SIPARIO: due canvas con l'ULTIMO frame del video (cattura a
                runtime, vedi snapshot() — niente asset dedicato). Insieme coprono
                l'hero al 100%; allo split traslano fuori (solo transform) e
                scoprono il pannello card dal centro verso i bordi. */}
            <div
              aria-hidden
              className="st-half st-half-l absolute inset-y-0 left-0 z-20 w-1/2 overflow-hidden will-change-transform"
              style={{ opacity: 0, visibility: "hidden" }}
            >
              <canvas className="absolute top-0 left-0" />
            </div>
            <div
              aria-hidden
              className="st-half st-half-r absolute inset-y-0 right-0 z-20 w-1/2 overflow-hidden will-change-transform"
              style={{ opacity: 0, visibility: "hidden" }}
            >
              <canvas className="absolute top-0 right-0" />
            </div>

            {/* Cue "Scorri" in basso a sinistra DENTRO l'hero (sfondo video scuro
                → testo bianco leggibile): il dot del mousino è pilotato dalla
                micro-demo (GSAP), non da keyframe CSS. */}
            <div className="st-cue pointer-events-none absolute bottom-6 left-6 z-30">
              <ScrollCue />
            </div>
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
          className="bg-border pointer-events-none absolute inset-x-0 bottom-0 z-30 h-[3px]"
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
 * Card verticale di servizio del pannello finale: immagine QUADRATA sopra
 * (regola: mai strisce orizzontali), testo sotto — kicker accent, titolo, riga
 * descrittiva. Contenitore PULITO (niente effetti/badge sopra l'immagine):
 * l'unico effetto per-elemento è l'ElectricBorder che avvolge la card centrale.
 */
function ServiceCard({
  kind,
  title,
  desc,
  img,
  className = "",
}: {
  kind: string;
  title: string;
  desc: string;
  img: string;
  className?: string;
}) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border border-white/10 bg-[#0e1524] shadow-2xl ${className}`}
    >
      <img src={img} alt="" aria-hidden className="aspect-square w-full object-cover" />
      <div className="px-5 pt-4 pb-5 text-left">
        <p className="text-accent text-[10px] font-semibold tracking-[0.18em] uppercase">{kind}</p>
        <p className="font-display mt-1 text-base font-bold text-white">{title}</p>
        <p className="mt-1 text-xs leading-relaxed text-white/60">{desc}</p>
      </div>
    </div>
  );
}

/**
 * Barra browser mock sopra il finto sito: traffic dots neutri + URL centrata.
 * Decorativa (aria-hidden), serve solo a leggere il mock come "sito vero"
 * dentro il device frame.
 */
function FakeBrowserBar() {
  return (
    <div
      aria-hidden
      className="border-border bg-surface relative flex h-10 shrink-0 items-center justify-center border-b px-4"
    >
      {/* Traffic dots (neutri, solo token) */}
      <span className="absolute left-4 flex items-center gap-1.5">
        <span className="bg-border h-2.5 w-2.5 rounded-full" />
        <span className="bg-border h-2.5 w-2.5 rounded-full" />
        <span className="bg-border h-2.5 w-2.5 rounded-full" />
      </span>
      {/* URL pill centrata */}
      <span className="border-border bg-background text-muted rounded-md border px-3 py-1 text-xs font-medium">
        gmsolar.it
      </span>
    </div>
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
      className="border-border bg-background/90 relative z-30 flex h-14 shrink-0 items-center justify-between border-b px-6 backdrop-blur"
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
          {/* Voce attiva evidenziata → nav più credibile */}
          <span className="text-foreground font-semibold">Home</span>
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
