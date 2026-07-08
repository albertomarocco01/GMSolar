"use client";

/**
 * @descrizione  Scena "INTERFACCE GRAFICHE MODERNE" — capitolo 02 (P12), v2 "WOW".
 *   La v1 (card chiare + fade-in semplice) risultava piatta: ora il bento alterna
 *   pesi visivi (card accent piena, mockup scuro, card chiare — vedi BentoKit v2)
 *   e la regia è più cinematografica.
 *
 *   Regia (timeline scrubbata via useImmersiveScene):
 *     ① ChapterCard «Interfacce grafiche moderne»
 *     ② Heading in-scena: kicker, poi TITOLO PAROLA-PER-PAROLA (rise da maschera),
 *        poi copy — persistente
 *     ③ Card del bento entrano in 3D (rise + tilt rotationX che si raddrizza)
 *     ④ Le card PRENDONO VITA allo scrub (il punto del capitolo: componenti
 *        vivi, non screenshot): counter 0→3m42s, sparkline che si disegna,
 *        ring che spazza 0→98, barre che crescono; poi il KIT SI USA DA SOLO
 *        (il testo si digita nel campo, il toggle si accende, il badge poppa,
 *        il bottone si preme) e per finale il mockup scuro SI ASSEMBLA pezzo
 *        per pezzo e "clicca" la propria CTA.
 *     ⑤ Hold finale leggibile
 *
 *   Reduced-motion: la timeline va a progress(1) → heading + bento completi e
 *   statici (tween tutti to/fromTo deterministici; i counter scrivono il valore
 *   finale via onUpdate; typeInField finisce rivelato). Nessun heading statico
 *   extra: quello in-scena è già visibile a progress(1).
 */
import { gsap } from "@gmgroup/lib/gsap";
import BentoKit from "../vetrina/BentoKit";
import {
  ImmersiveStage,
  CHAPTERS,
  ChapterCard,
  chapterIntro,
  pressButton,
  typeInField,
  useImmersiveScene,
} from "../immersive/shared";

/** Secondi → "3m 42s" (formato del counter della card accent). */
function fmtMinSec(v: number) {
  return `${Math.floor(v / 60)}m ${String(Math.round(v % 60)).padStart(2, "0")}s`;
}

const TITLE_WORDS = "Componenti che si sentono vivi.".split(" ");

export default function InterfacceScene() {
  const ref = useImmersiveScene((tl, section) => {
    // Stati iniziali in build (layout effect) → applicati PRIMA del paint.
    gsap.set(".vt-head-kicker, .vt-head-copy", { autoAlpha: 0, y: 18 });
    // Parole del titolo: sotto la maschera (i wrapper hanno overflow-hidden).
    gsap.set(".vt-head-word", { yPercent: 115 });
    // Card: rise + tilt 3D che si raddrizza in entrata (perspective per-card).
    gsap.set(".vt-card", {
      autoAlpha: 0,
      y: 70,
      rotationX: -12,
      transformPerspective: 900,
      transformOrigin: "50% 100%",
    });
    gsap.set(".vt-mock-piece", { autoAlpha: 0, y: 12 });
    // Sparkline nascosta: pathLength=1 nel markup → dasharray 1 = intero tratto.
    gsap.set(".vt-spark-path", { strokeDasharray: 1, strokeDashoffset: 1 });
    gsap.set(".vt-spark-fill", { autoAlpha: 0 });
    gsap.set(".vt-bar", { scaleY: 0, transformOrigin: "50% 100%" });
    // Kit "vivo": toggle spento, badge nascosto (si azionano allo scrub).
    gsap.set(".vt-tg-on", { autoAlpha: 0 });
    gsap.set(".vt-tg-knob", { x: 0 });
    gsap.set(".vt-badge-new", { scale: 0, transformOrigin: "50% 50%" });
    // Counter azzerati (SSR mostra il valore finale; qui parte la "vita").
    const countEl = section.querySelector<HTMLElement>(".vt-count");
    const ringVal = section.querySelector<HTMLElement>(".vt-ring-val");
    if (countEl) countEl.textContent = fmtMinSec(0);
    if (ringVal) ringVal.textContent = "0";

    // ① Title card di capitolo.
    chapterIntro(tl);

    // ② Heading: kicker → titolo parola-per-parola → copy.
    tl.to(".vt-head-kicker", { autoAlpha: 1, y: 0, duration: 0.4 });
    tl.to(
      ".vt-head-word",
      { yPercent: 0, duration: 0.7, ease: "power4.out", stagger: 0.07 },
      "-=0.1",
    );
    tl.to(".vt-head-copy", { autoAlpha: 1, y: 0, duration: 0.5 }, "-=0.35");

    // ③ Card del bento: entrata 3D in cascata (rise + tilt che si raddrizza).
    tl.to(
      ".vt-card",
      { autoAlpha: 1, y: 0, rotationX: 0, duration: 0.9, ease: "power3.out", stagger: 0.13 },
      "-=0.2",
    );

    // ④ Micro-animazioni: i componenti prendono vita allo scrub.
    // — counter "tempo medio" 0 → 3m 42s, insieme alla sparkline che si disegna
    const count = { v: 0 };
    tl.to(count, {
      v: 222,
      duration: 1.1,
      ease: "power2.out",
      onUpdate: () => {
        if (countEl) countEl.textContent = fmtMinSec(count.v);
      },
    });
    tl.to(".vt-spark-path", { strokeDashoffset: 0, duration: 1.1, ease: "power2.inOut" }, "<");
    tl.to(".vt-spark-fill", { autoAlpha: 0.15, duration: 0.4 }, "-=0.3");
    // — ring: arco che spazza 0→98 (dall'offset "pieno" a quello di riposo,
    //   vedi commento in BentoKit/Ring) + numero che conta in sincrono
    const arc = section.querySelector<SVGCircleElement>(".vt-ring-arc");
    if (arc) {
      const rest = Number(gsap.getProperty(arc, "strokeDashoffset"));
      tl.fromTo(
        arc,
        { strokeDashoffset: arc.getTotalLength() },
        { strokeDashoffset: rest, duration: 0.9, ease: "power2.inOut" },
        "-=0.5",
      );
    }
    const ring = { v: 0 };
    tl.to(
      ring,
      {
        v: 98,
        duration: 0.9,
        ease: "power2.inOut",
        onUpdate: () => {
          if (ringVal) ringVal.textContent = String(Math.round(ring.v));
        },
      },
      "<",
    );
    // — barre che crescono dal basso
    tl.to(".vt-bar", { scaleY: 1, duration: 0.6, ease: "back.out(1.6)", stagger: 0.08 }, "-=0.5");
    // — il KIT si usa da solo: typing → toggle ON → badge → bottone premuto
    typeInField(tl, ".vt-input-text", { steps: 23, duration: 1.1, position: ">0.1" });
    tl.to(".vt-tg-knob", { x: 16, duration: 0.35, ease: "power2.inOut" }, ">0.15");
    tl.to(".vt-tg-on", { autoAlpha: 1, duration: 0.3 }, "<");
    tl.to(".vt-badge-new", { scale: 1, duration: 0.4, ease: "back.out(2.5)" }, ">-0.05");
    pressButton(tl, ".vt-btn", { down: 0.9, position: ">0.1" });
    // — FINALE: il mockup scuro si assembla pezzo per pezzo e preme la sua CTA
    tl.to(".vt-mock-piece", { autoAlpha: 1, y: 0, duration: 0.45, stagger: 0.12 }, ">0.1");
    pressButton(tl, ".vt-mock-cta", { down: 0.88, back: 2.5, position: ">0.05" });

    // ⑤ Hold finale leggibile (stato finale = tutto composto, coerente con
    //    progress(1) sotto reduced-motion).
    tl.to({}, { duration: 0.9 });
  });

  return (
    <ImmersiveStage
      ref={ref}
      heightVh={440}
      theme="platform"
      label={CHAPTERS[1].title}
      chapterIndex={1}
    >
      {/* Heading + bento centrati INSIEME verticalmente (justify-center):
          niente fascia morta tra i due blocchi. */}
      <div className="relative flex h-full flex-col justify-center overflow-hidden px-[5vw] py-[6vh]">
        {/* Alone accent tenue + griglia di punti sfumata (solo decorativi). */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            backgroundImage:
              "radial-gradient(60% 55% at 50% 28%, var(--accent-soft), transparent 72%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            backgroundImage: "radial-gradient(circle, rgb(11 16 32 / 0.07) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
            maskImage: "radial-gradient(75% 65% at 50% 42%, black, transparent)",
            WebkitMaskImage: "radial-gradient(75% 65% at 50% 42%, black, transparent)",
          }}
        />

        {/* Heading in-scena: persistente (a progress(1) resta visibile → copre
            anche il fallback reduced-motion, niente heading statico extra). */}
        <div className="vt-head mx-auto w-full max-w-6xl shrink-0">
          <p className="vt-head-kicker text-accent-ink font-mono text-xs font-semibold tracking-[0.3em] uppercase">
            {CHAPTERS[1].title}
          </p>
          <h2 className="font-display text-foreground mt-3 text-4xl font-bold tracking-tight md:text-5xl">
            {TITLE_WORDS.map((w, i) => (
              // Wrapper-maschera per parola: la parola sale da sotto il bordo.
              // pb/-mb compensano il clip dei discendenti (p, g, q).
              <span
                key={i}
                className="mb-[-0.15em] inline-block overflow-hidden pb-[0.15em] align-bottom"
              >
                {/* separatore = NBSP (non spazio normale: a fine inline-block
                    verrebbe rimosso dal white-space processing) */}
                <span className="vt-head-word inline-block">
                  {w}
                  {i < TITLE_WORDS.length - 1 ? " " : ""}
                </span>
              </span>
            ))}
          </h2>
          <p className="vt-head-copy text-muted mt-3 max-w-xl text-sm md:text-base">
            Card, grafici e controlli costruiti su misura: si animano mentre scorri, come in un
            prodotto vero.
          </p>
        </div>

        {/* Bento: pesi visivi alternati — accent, scuro, chiari (vedi BentoKit v2). */}
        <div className="mx-auto mt-10 w-full max-w-6xl">
          <BentoKit />
        </div>
      </div>

      {/* Title card di capitolo (apre la scena). */}
      <ChapterCard chapter={CHAPTERS[1]} subtitle="Componenti curati, animati, pronti all'uso." />
    </ImmersiveStage>
  );
}
