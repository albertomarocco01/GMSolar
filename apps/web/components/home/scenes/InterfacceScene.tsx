"use client";

/**
 * @descrizione  Scena "INTERFACCE GRAFICHE MODERNE" — capitolo 02, v5.
 *   Non più una carrellata di card singole ma una CARRELLATA DI SCHERMATE COMPLETE
 *   e dense che MUTANO l'una nell'altra, dentro un unico "device" al centro. 4
 *   schermate a tema alternato scuro/chiaro (un file per schermata in
 *   `../showcase/`):
 *     ① Analytics  (SCURO)  — KPI, grafico ad area, barre, canali, bordo elettrico
 *     ② Commerce   (CHIARO) — pagina prodotto: galleria, prezzo, varianti, CTA
 *     ③ Media      (SCURO)  — player: copertina, progress, visualizer, coda
 *     ④ Fintech    (CHIARO) — wallet a bento: saldo, carte, movimenti, anello
 *
 *   Regia (timeline scrubbata via useImmersiveScene):
 *     · ChapterCard di capitolo.
 *     · Per ogni schermata: i componenti COMPAIONO progressivamente in un flow
 *       orizzontale (`flowIn` = fromTo x+opacity a cascata) + micro-vita "live"
 *       (countUp, disegno path, crescita barre/anello/progress). Su Commerce e
 *       Fintech il cursore finto "preme" un bottone (pressButton).
 *     · MORPH tra schermate (`morph`): lo sfondo cross-fada scuro↔chiaro (le due
 *       schermate sono layer opachi sovrapposti, si incrociano in autoAlpha), la
 *       uscente si solleva e riduce, un NASTRO diagonale accent (`.shw-sweep`)
 *       spazza il cambio → mutazione seamless, non un taglio. Tutti valori FISSI
 *       (transform/opacity), niente misure runtime → scrub avanti/indietro pulito.
 *
 *   Reduced-motion / progress(1): resta l'ULTIMA schermata (Fintech) completa e
 *   leggibile; le altre sono sfumate via, il nastro è parcheggiato fuori campo.
 *   Loop decorativi (bordo conico, visualizer, sweep del bottone) = keyframe CSS
 *   congelabili dalla pausa globale (`#top *` di AutoScroll) e spenti sotto
 *   reduced-motion (media query in fondo).
 */
import { gsap } from "@gmgroup/lib/gsap";
import ScreenAnalytics from "../showcase/ScreenAnalytics";
import ScreenCommerce from "../showcase/ScreenCommerce";
import ScreenMedia from "../showcase/ScreenMedia";
import ScreenFintech from "../showcase/ScreenFintech";
import {
  ImmersiveStage,
  CHAPTERS,
  ChapterCard,
  chapterIntro,
  countUp,
  cursorTo,
  drawPath,
  hideCursor,
  hold,
  pressButton,
  useImmersiveScene,
  DUR,
  EASE_CAMERA,
  EASE_IN_SCENE,
  EASE_OUT_SCENE,
} from "../immersive/shared";

// ── Formattatori dei numeri "live" (deterministici, it-IT) ───────────────────
const euro = (n: number) => Math.round(n).toLocaleString("it-IT");
const intIt = (n: number) => Math.round(n).toLocaleString("it-IT");
const dec1 = (n: number) => n.toFixed(1).replace(".", ",");

/** Circonferenza dell'anello di spesa (r=15) → per lo stroke-dashoffset fisso. */
const RING_LEN = 2 * Math.PI * 15; // ≈ 94.25
const RING_FILL = 0.68; // 68% speso

/**
 * Ingresso "a flusso orizzontale": i figli entrano da destra (x) sfumando, a
 * cascata (stagger). fromTo deterministico → a progress(1) sono a x:0, visibili.
 */
function flowIn(
  tl: gsap.core.Timeline,
  sel: string,
  opts?: { x?: number; stagger?: number; position?: number | string },
) {
  tl.fromTo(
    sel,
    { autoAlpha: 0, x: opts?.x ?? 46 },
    {
      autoAlpha: 1,
      x: 0,
      duration: DUR.beat,
      ease: EASE_IN_SCENE,
      stagger: opts?.stagger ?? 0.09,
    },
    opts?.position ?? ">",
  );
}

/**
 * MORPH schermata `from` → `from+1`. Il nastro accent spazza (verso alternato:
 * fuori campo a fine tratto → invisibile, frame in overflow-hidden), l'uscente si
 * solleva/riduce e sfuma, l'entrante entra in autoAlpha (cross-fade dei fondi).
 * Solo transform/opacity, valori fissi → mutazione seamless e scrub-safe.
 */
function morph(tl: gsap.core.Timeline, from: number) {
  const to = from + 1;
  hideCursor(tl, { position: ">" });
  tl.to(
    ".shw-sweep",
    { xPercent: from % 2 === 0 ? 155 : -155, duration: DUR.scene, ease: EASE_CAMERA },
    ">",
  );
  tl.to(
    `.shw-s${from}`,
    { autoAlpha: 0, scale: 0.96, yPercent: -3, duration: DUR.beat, ease: EASE_OUT_SCENE },
    "<0.12",
  );
  tl.to(`.shw-s${to}`, { autoAlpha: 1, duration: DUR.beat, ease: EASE_IN_SCENE }, "<");
}

export default function InterfacceScene() {
  const ref = useImmersiveScene((tl) => {
    // ── Stati iniziali (build → prima del paint) ─────────────────────────────
    gsap.set(".shw-s0, .shw-s1, .shw-s2, .shw-s3", { willChange: "transform, opacity" });
    gsap.set(".shw-s1, .shw-s2, .shw-s3", { autoAlpha: 0 }); // solo la 1ª visibile
    gsap.set(".shw-sweep", { xPercent: -155 }); // nastro fuori campo a sinistra
    gsap.set(".shw-s1-ok", { autoAlpha: 0 }); // conferma "Aggiunto" nascosta
    gsap.set(".shw-s0-bar", { scaleY: 0, transformOrigin: "bottom" }); // barre a terra
    gsap.set(".shw-s2-prog", { scaleX: 0, transformOrigin: "left" }); // player a 0
    gsap.set(".shw-s3-num", { transformOrigin: "left" });
    gsap.set(".shw-s3-ring", { strokeDasharray: RING_LEN, strokeDashoffset: RING_LEN });

    // ① Title card di capitolo.
    chapterIntro(tl);

    // ② Schermata 1 · ANALYTICS (scuro) — i blocchi entrano, i dati prendono vita.
    flowIn(tl, ".shw-s0-item", { stagger: 0.08 });
    countUp(
      tl,
      [
        { el: ".shw-s0-kpi1", to: 48250, format: euro },
        { el: ".shw-s0-kpi2", to: 12840, format: intIt },
        { el: ".shw-s0-kpi3", to: 3.8, format: dec1 },
      ],
      { duration: DUR.scene, position: "<0.2" },
    );
    drawPath(tl, ".shw-s0-area", { duration: DUR.scene, position: "<0.1" });
    tl.to(
      ".shw-s0-bar",
      { scaleY: 1, duration: DUR.beat, stagger: 0.04, ease: EASE_IN_SCENE },
      "<0.2",
    );
    hold(tl);

    // ③ MORPH 1→2, poi COMMERCE (chiaro) — galleria + acquisto + CTA premuta.
    morph(tl, 0);
    flowIn(tl, ".shw-s1-item", { stagger: 0.07 });
    cursorTo(tl, ".shw-s1-cta", { mode: "hand" });
    pressButton(tl, ".shw-s1-cta");
    tl.to(".shw-s1-ok", { autoAlpha: 1, duration: DUR.micro, ease: EASE_IN_SCENE }, ">-0.05");
    hold(tl);

    // ④ MORPH 2→3, poi MEDIA (scuro) — player: blocchi + progress che cresce.
    morph(tl, 1);
    flowIn(tl, ".shw-s2-item", { stagger: 0.08 });
    tl.to(".shw-s2-prog", { scaleX: 0.34, duration: DUR.scene, ease: EASE_IN_SCENE }, "<0.2");
    hold(tl);

    // ⑤ MORPH 3→4, poi FINTECH (chiaro) — bento: saldo, anello, azione premuta.
    morph(tl, 2);
    flowIn(tl, ".shw-s3-item", { stagger: 0.07 });
    countUp(tl, [{ el: ".shw-s3-num", to: 18430, format: euro }], {
      duration: DUR.scene,
      position: "<0.2",
    });
    tl.to(
      ".shw-s3-ring",
      { strokeDashoffset: RING_LEN * (1 - RING_FILL), duration: DUR.scene, ease: EASE_IN_SCENE },
      "<",
    );
    cursorTo(tl, ".shw-s3-act", { mode: "hand" });
    pressButton(tl, ".shw-s3-act");
    hideCursor(tl, { position: ">0.1" });

    // Hold finale leggibile (stato = quello di progress(1) per reduced-motion).
    hold(tl, 1.5);
  });

  return (
    <ImmersiveStage ref={ref} heightVh={660} label={CHAPTERS[1].title} chapterIndex={1}>
      {/* Loop decorativi CSS (bordo conico, visualizer, sweep del bottone):
          congelati dalla pausa globale (regola `#top *` di AutoScroll), spenti
          sotto reduced-motion (media query in fondo). */}
      <style>{`
        @keyframes shwSpin { to { transform: rotate(360deg); } }
        .shw-conic-spin { animation: shwSpin 6.4s linear infinite; will-change: transform; }
        @keyframes shwEq { 0% { transform: scaleY(0.28); } 100% { transform: scaleY(1); } }
        .shw-s2-eq { transform-origin: bottom; animation: shwEq 1.05s ease-in-out infinite alternate; will-change: transform; }
        @keyframes shwShimmer { 0% { transform: translateX(0) skewX(-12deg); } 100% { transform: translateX(360%) skewX(-12deg); } }
        .shw-s1-shimmer { animation: shwShimmer 2.6s ease-in-out infinite; will-change: transform; }
        @media (prefers-reduced-motion: reduce) {
          .shw-conic-spin, .shw-s2-eq, .shw-s1-shimmer { animation: none; }
        }
      `}</style>

      <div className="relative flex h-full items-center justify-center overflow-hidden">
        {/* Fondo chiaro di scena: alone accent tenue + trama a puntini (decor). */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            backgroundImage:
              "radial-gradient(62% 58% at 50% 34%, var(--accent-soft), transparent 72%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            backgroundImage: "radial-gradient(circle, rgb(11 16 32 / 0.06) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
            maskImage: "radial-gradient(78% 66% at 50% 46%, black, transparent)",
            WebkitMaskImage: "radial-gradient(78% 66% at 50% 46%, black, transparent)",
          }}
        />

        {/* DEVICE unico: le 4 schermate sono layer sovrapposti che si incrociano. */}
        <div className="border-border relative aspect-[16/10] w-[min(94%,1060px)] overflow-hidden rounded-[1.75rem] border bg-[#0a0f1e] shadow-[0_40px_100px_-30px_rgba(11,16,32,0.55)]">
          <ScreenAnalytics />
          <ScreenCommerce />
          <ScreenMedia />
          <ScreenFintech />

          {/* Nastro accent che spazza il cambio schermata (transform-only). */}
          <div
            aria-hidden
            className="shw-sweep pointer-events-none absolute inset-y-[-12%] left-0 z-20 w-[52%] -skew-x-12"
            style={{
              background:
                "linear-gradient(90deg, transparent, color-mix(in oklab, var(--accent) 55%, transparent) 45%, color-mix(in oklab, #22d3ee 45%, transparent) 60%, transparent)",
              willChange: "transform",
            }}
          />
        </div>
      </div>

      {/* Title card di capitolo (apre la scena). */}
      <ChapterCard chapter={CHAPTERS[1]} subtitle="Schermate diverse, la stessa cura." />
    </ImmersiveStage>
  );
}
