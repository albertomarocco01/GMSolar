"use client";

/**
 * @descrizione  Scena «INTERFACCE GRAFICHE MODERNE» — capitolo 02, v7. NON una
 *   carrellata di card: 4 QUADRI = 4 ARCHETIPI DI LAYOUT DIVERSI dentro un unico
 *   "device", che MUTANO l'uno nell'altro. Contenuti nel mondo FOTOVOLTAICO.
 *     ① LANDING editoriale  (LIGHT) — installatore FV: INCASTRO MULTILAYER a
 *        profondità z (ghost word dietro, headline, foto che sormonta, badge
 *        davanti) con parallasse; numeri di fiducia, marquee certificazioni.
 *     ② MONITORAGGIO impianto (DARK) — pannello di controllo; la card-eroe
 *        «Produzione ora» ha l'EFFETTO PER-ELEMENTO <ElectricBorder/> (canvas che
 *        frigge sul perimetro DELLA CARD), kW a rullo, curva, tile a onda.
 *     ③ PREVENTIVATORE a wizard (MID slate) — funnel: slider trascinato, toggle,
 *        radio-card taglia; la CARD PREZZO ha <ElectricBorder/>; CTA label→spinner→check.
 *     ④ CATALOGO a MOSAICO (LIGHT) — bento armonico di foto/card-prodotto PORTRAIT;
 *        NIENTE beam sul perimetro (rimosso): profondità da una card che sormonta.
 *
 *   EFFETTI PER-ELEMENTO (non sul modulo intero): l'unico effetto "elettrico" è
 *   <ElectricBorder/> attorno a 2 CARD-EROE (② e ③) — canvas per-card, non un
 *   giro sul frame del device. È rimosso ogni beam perimetrale (ex-ElectricBeam).
 *
 *   FILO CONDUTTORE — la STREAK è il match-cut: in ① una sottile linea accent
 *   sottolinea la headline; ad ogni cambio una STREAK elettrica (`.shw-cut`)
 *   attraversa il device (flow orizzontale) e il quadro entrante si riempie a
 *   stagger. Il fondo del device vira LIGHT→DARK→MID→LIGHT via layer OPACHI
 *   sovrapposti in opacity (mai background-color di aree grandi).
 *
 *   PERFORMANCE — un quadro dipinto per volta (gli altri autoAlpha:0); tween a
 *   valori FISSI (solo transform/opacity) → scrub avanti/indietro senza salti;
 *   loop decorativi CSS (marquee, shine, spinner) = keyframe congelabili da
 *   `data-presentation-paused` e spenti sotto reduced-motion. Il canvas di
 *   <ElectricBorder/> ha il SUO gate (visibilità quadro + pausa + reduced).
 *   Reduced-motion / progress(1): resta il MOSAICO ④ completo e armonico.
 */
import { gsap } from "@gmgroup/lib/gsap";
import QuadroLanding from "../showcase/QuadroLanding";
import QuadroMonitor from "../showcase/QuadroMonitor";
import QuadroPreventivo from "../showcase/QuadroPreventivo";
import QuadroMosaico from "../showcase/QuadroMosaico";
import {
  ImmersiveStage,
  CHAPTERS,
  ChapterCard,
  chapterIntro,
  countUp,
  cursorTo,
  drawPath,
  enter,
  hideCursor,
  hold,
  maskReveal,
  pressButton,
  useImmersiveScene,
  DUR,
  EASE_CAMERA,
  EASE_IN_SCENE,
  EASE_OUT_SCENE,
  EASE_SNAP,
} from "../immersive/shared";

// ── Formattatori "live" deterministici (it-IT) ───────────────────────────────
const euro = (n: number) => Math.round(n).toLocaleString("it-IT");
const intIt = (n: number) => Math.round(n).toLocaleString("it-IT");
const dec1 = (n: number) => n.toFixed(1).replace(".", ",");

/** Ingresso "a flusso orizzontale": i figli entrano da destra sfumando, a cascata.
 *  fromTo deterministico → a progress(1) sono a x:0, visibili (reduced-safe). */
function flowIn(
  tl: gsap.core.Timeline,
  sel: string,
  opts?: { stagger?: number; position?: number | string },
) {
  tl.fromTo(
    sel,
    { autoAlpha: 0, x: 42 },
    {
      autoAlpha: 1,
      x: 0,
      duration: DUR.beat,
      ease: EASE_IN_SCENE,
      stagger: opts?.stagger ?? 0.08,
    },
    opts?.position ?? ">",
  );
}

/**
 * MORPH quadro `to-1` → `to`. Una STREAK elettrica attraversa il device (flow
 * orizzontale, valori FISSI); l'uscente sfuma/riduce, l'entrante entra in
 * autoAlpha (cross-fade dei layer OPACHI = vira del fondo). Solo transform/
 * opacity → mutazione seamless e scrub-safe. La streak è parcheggiata fuori campo
 * ai due estremi (device in overflow-hidden) → invisibile a riposo.
 */
function morph(tl: gsap.core.Timeline, to: number) {
  const from = to - 1;
  hideCursor(tl, { position: ">" });
  tl.fromTo(
    ".shw-cut",
    { xPercent: -160 },
    { xPercent: 160, duration: DUR.scene, ease: EASE_CAMERA },
    ">",
  );
  tl.to(
    `.shw-q${from}`,
    { autoAlpha: 0, scale: 0.97, yPercent: -2, duration: DUR.beat, ease: EASE_OUT_SCENE },
    "<0.15",
  );
  tl.to(`.shw-q${to}`, { autoAlpha: 1, duration: DUR.beat, ease: EASE_IN_SCENE }, "<");
}

export default function InterfacceScene() {
  const ref = useImmersiveScene((tl) => {
    // ── Stati iniziali (build → prima del paint) ─────────────────────────────
    gsap.set(".shw-q1, .shw-q2, .shw-q3, .shw-q4", { willChange: "transform, opacity" });
    gsap.set(".shw-q2, .shw-q3, .shw-q4", { autoAlpha: 0 }); // solo ① visibile
    gsap.set(".shw-cut", { xPercent: -160 }); // streak fuori campo a sinistra

    // ⓪ Title card di capitolo.
    chapterIntro(tl);

    // ① LANDING — INCASTRO MULTILAYER: la parola-ghost entra DIETRO (L0), la
    //    headline si compone (L10) con la linea accent che si traccia, la FOTO
    //    (L20) sormonta la coda della ghost, il BADGE stat (L30) "pop" davanti.
    tl.fromTo(
      ".shw-q1-ghost",
      { autoAlpha: 0, x: -40 },
      { autoAlpha: 1, x: 0, duration: DUR.scene, ease: EASE_IN_SCENE },
    );
    maskReveal(tl, ".shw-q1-line", {
      dir: "b",
      stagger: 0.12,
      duration: DUR.beat,
      position: "<0.15",
    });
    tl.to(".shw-q1-rule", { scaleX: 1, duration: DUR.beat, ease: EASE_IN_SCENE }, "<0.25");
    enter(tl, ".shw-q1-item", { y: 20, stagger: 0.08, position: "<0.1" });
    maskReveal(tl, ".shw-q1-photo", { dir: "r", duration: DUR.scene, position: "<" });
    enter(tl, ".shw-q1-float", { y: 26, anticipate: true, position: "<0.2" });
    countUp(tl, [{ el: ".shw-q1-count", to: 2400, format: intIt }], { position: "<0.1" });
    // Parallasse di PROFONDITÀ: i layer derivano a velocità diverse (valori FISSI
    // → scrub-safe): più il layer è avanti, più corre. Ghost lento, badge veloce.
    tl.to(".shw-q1-ghost", { y: -10, duration: DUR.scene, ease: EASE_CAMERA }, ">-0.2");
    tl.to(".shw-q1-photo", { y: -22, duration: DUR.scene, ease: EASE_CAMERA }, "<");
    tl.to(".shw-q1-float", { y: -34, duration: DUR.scene, ease: EASE_CAMERA }, "<");
    hold(tl);

    // ② MORPH → MONITORAGGIO (light→dark): tile a onda, kW e curva prendono vita.
    morph(tl, 2);
    flowIn(tl, ".shw-q2-item", { stagger: 0.08 });
    countUp(
      tl,
      [
        { el: ".shw-q2-kw", to: 7.4, format: dec1 },
        { el: ".shw-q2-kwh", to: 42.6, format: dec1 },
        { el: ".shw-q2-auto", to: 68, format: intIt },
        { el: ".shw-q2-grid", to: 12.1, format: dec1 },
      ],
      { position: "<0.2" },
    );
    drawPath(tl, ".shw-q2-area", { duration: DUR.scene, position: "<0.1" });
    tl.fromTo(
      ".shw-q2-tile",
      { autoAlpha: 0.22 },
      { autoAlpha: 1, duration: DUR.beat, stagger: 0.03, ease: EASE_IN_SCENE },
      "<0.2",
    );
    hold(tl);

    // ③ MORPH → PREVENTIVATORE (dark→mid): slider trascinato, toggle, taglia, CTA.
    morph(tl, 3);
    enter(tl, ".shw-q3-item", { y: 18, stagger: 0.06 });
    cursorTo(tl, ".shw-q3-knob", { mode: "hand" });
    pressButton(tl, ".shw-q3-knob", { down: 0.86 });
    // Slider: knob + fill + cursore traslano dello STESSO delta fisso (restano allineati).
    tl.to(".shw-q3-knob", { x: 193, duration: DUR.scene, ease: EASE_CAMERA });
    tl.to(".shw-q3-fill", { scaleX: 0.62, duration: DUR.scene, ease: EASE_CAMERA }, "<");
    tl.to(".imm-cursor", { x: 193, duration: DUR.scene, ease: EASE_CAMERA }, "<");
    countUp(tl, [{ el: ".shw-q3-m2", to: 78, format: intIt }], { position: "<" });
    // Toggle accumulo.
    tl.to(".shw-q3-knob-b", { x: 20, duration: DUR.micro, ease: EASE_SNAP }, ">0.1");
    tl.to(".shw-q3-on", { autoAlpha: 1, duration: DUR.micro }, "<");
    // Scelta taglia (ring sulla card consigliata) + prezzo a rullo.
    tl.to(".shw-q3-radio", { autoAlpha: 1, duration: DUR.micro }, ">0.05");
    countUp(tl, [{ el: ".shw-q3-price", to: 8900, format: euro }], { position: "<" });
    // CTA: cursore (azzero il ride dello slider), press, poi label→spinner→check.
    cursorTo(tl, ".shw-q3-cta", { mode: "hand" });
    tl.to(".imm-cursor", { x: 0, duration: DUR.scene, ease: EASE_CAMERA }, "<");
    pressButton(tl, ".shw-q3-cta");
    tl.to(".shw-q3-label", { autoAlpha: 0, duration: DUR.micro }, ">-0.05");
    tl.to(".shw-q3-spin", { autoAlpha: 1, duration: DUR.micro }, "<");
    hold(tl, 0.7);
    tl.to(".shw-q3-spin", { autoAlpha: 0, duration: DUR.micro });
    tl.to(".shw-q3-check", { autoAlpha: 1, duration: DUR.micro }, "<");
    hideCursor(tl, { position: ">0.05" });
    hold(tl);

    // ④ MORPH → MOSAICO (mid→light): celle a maschera in cascata; nessun beam sul
    //    perimetro — la card «featured» che sormonta la griglia resta = chiusura.
    morph(tl, 4);
    maskReveal(tl, ".shw-q4-cell", { dir: "b", stagger: 0.09, duration: DUR.beat });
    hold(tl, 1.6);
  });

  return (
    <ImmersiveStage ref={ref} heightVh={700} label={CHAPTERS[1].title} chapterIndex={1}>
      {/* Loop decorativi CSS (marquee, shine, spinner): congelabili da
          `data-presentation-paused` (regola `#top *`), spenti sotto reduced-motion.
          Il bordo elettrico è canvas (ElectricBorder), col suo gate — niente CSS qui. */}
      <style>{`
        @keyframes shwMarquee { to { transform: translateX(-50%); } }
        .shw-q1-marquee { animation: shwMarquee 26s linear infinite; will-change: transform; }
        @keyframes shwShine { 0%,55% { transform: translateX(0) skewX(-12deg); } 100% { transform: translateX(360%) skewX(-12deg); } }
        .shw-q3-shine { animation: shwShine 3.2s ease-in-out infinite; will-change: transform; }
        @keyframes shwSpin { to { transform: rotate(360deg); } }
        .shw-spinner { animation: shwSpin 0.75s linear infinite; will-change: transform; }
        @media (prefers-reduced-motion: reduce) {
          .shw-q1-marquee, .shw-q3-shine, .shw-spinner { animation: none; }
        }
      `}</style>

      <div className="relative flex h-full items-center justify-center overflow-hidden">
        {/* Fondo di scena: alone accent tenue + trama a puntini (decor). */}
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

        {/* DEVICE unico: i 4 quadri sono layer OPACHI sovrapposti che si incrociano. */}
        <div className="border-border bg-background relative aspect-[16/10] w-[min(94%,1060px)] overflow-hidden rounded-[1.75rem] border shadow-[0_40px_100px_-30px_rgba(11,16,32,0.55)]">
          <QuadroLanding />
          <QuadroMonitor />
          <QuadroPreventivo />
          <QuadroMosaico />

          {/* STREAK elettrica del match-cut (transform-only, valori fissi). */}
          <div
            aria-hidden
            className="shw-cut pointer-events-none absolute inset-y-[-14%] left-0 z-20 w-[42%] -skew-x-12"
            style={{
              background:
                "linear-gradient(90deg, transparent, color-mix(in oklab, var(--accent) 60%, transparent) 42%, color-mix(in oklab, #22d3ee 55%, transparent) 62%, transparent)",
              willChange: "transform",
            }}
          />
        </div>
      </div>

      {/* Title card di capitolo (apre la scena). */}
      <ChapterCard chapter={CHAPTERS[1]} subtitle="Quattro layout, un solo linguaggio." />
    </ImmersiveStage>
  );
}
