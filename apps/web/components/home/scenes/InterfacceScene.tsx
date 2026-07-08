"use client";

/**
 * @descrizione  Scena "INTERFACCE GRAFICHE MODERNE" — capitolo 02 (P12), restyling
 *   BENTO CHIARO. Niente più pannello scuro contenitore (era un relitto delle
 *   card "vetro su video"): le card sono CHIARE (BentoKit) e vivono direttamente
 *   sulla sezione chiara, coerenti col tema chiaro forzato del progetto.
 *
 *   Regia (timeline scrubbata via useImmersiveScene):
 *     ① ChapterCard «Interfacce grafiche moderne»
 *     ② Heading in-scena (kicker + titolo + copy) — persistente
 *     ③ Card del bento entrano in stagger
 *     ④ Le card PRENDONO VITA allo scrub (il punto del capitolo: componenti
 *        vivi, non screenshot): counter 0→3m42s, sparkline che si disegna,
 *        barre che crescono, ring che spazza 0→98, mockup che si assembla.
 *        Gli hook CSS (.vt-*) sono documentati in BentoKit.
 *     ⑤ Hold finale leggibile
 *
 *   Reduced-motion: la timeline va a progress(1) → heading + bento completi e
 *   statici (i tween sono tutti fromTo/to deterministici; i counter scrivono il
 *   valore finale via onUpdate). Nessun heading statico extra: quello in-scena
 *   è già visibile a progress(1).
 */
import { gsap } from "@gmgroup/lib/gsap";
import BentoKit from "../vetrina/BentoKit";
import {
  ImmersiveStage,
  CHAPTERS,
  ChapterCard,
  chapterIntro,
  useImmersiveScene,
} from "../immersive/shared";

/** Secondi → "3m 42s" (formato del counter della StatCard). */
function fmtMinSec(v: number) {
  return `${Math.floor(v / 60)}m ${String(Math.round(v % 60)).padStart(2, "0")}s`;
}

export default function InterfacceScene() {
  const ref = useImmersiveScene((tl, section) => {
    // Stati iniziali in build (layout effect) → applicati PRIMA del paint.
    gsap.set(".vt-head > *", { autoAlpha: 0, y: 24 });
    gsap.set(".vt-card", { autoAlpha: 0, y: 32, scale: 0.96 });
    gsap.set(".vt-mock-piece", { autoAlpha: 0, y: 12 });
    // Sparkline nascosta: pathLength=1 nel markup → dasharray 1 = intero tratto.
    gsap.set(".vt-spark-path", { strokeDasharray: 1, strokeDashoffset: 1 });
    gsap.set(".vt-spark-fill", { autoAlpha: 0 });
    gsap.set(".vt-bar", { scaleY: 0, transformOrigin: "50% 100%" });
    // Counter azzerati (SSR mostra il valore finale; qui parte la "vita").
    const countEl = section.querySelector<HTMLElement>(".vt-count");
    const ringVal = section.querySelector<HTMLElement>(".vt-ring-val");
    if (countEl) countEl.textContent = fmtMinSec(0);
    if (ringVal) ringVal.textContent = "0";

    // ① Title card di capitolo.
    chapterIntro(tl);

    // ② Heading in-scena: kicker → titolo → copy in cascata.
    tl.to(".vt-head > *", { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.12 });

    // ③ Card del bento in stagger, con lieve overshoot.
    tl.to(
      ".vt-card",
      { autoAlpha: 1, y: 0, scale: 1, duration: 0.7, ease: "back.out(1.4)", stagger: 0.14 },
      "-=0.15",
    );

    // ④ Micro-animazioni: i componenti prendono vita allo scrub.
    // — counter "tempo medio" 0 → 3m 42s, insieme alla sparkline che si disegna
    const count = { v: 0 };
    tl.to(count, {
      v: 222,
      duration: 1,
      ease: "power2.out",
      onUpdate: () => {
        if (countEl) countEl.textContent = fmtMinSec(count.v);
      },
    });
    tl.to(".vt-spark-path", { strokeDashoffset: 0, duration: 1, ease: "power2.inOut" }, "<");
    tl.to(".vt-spark-fill", { autoAlpha: 0.15, duration: 0.4 }, "-=0.3");
    // — barre che crescono dal basso
    tl.to(".vt-bar", { scaleY: 1, duration: 0.6, ease: "back.out(1.6)", stagger: 0.07 }, "-=0.5");
    // — ring: arco che spazza 0→98 (dall'offset "pieno" a quello di riposo,
    //   vedi commento in BentoKit/Ring) + numero che conta in sincrono
    const arc = section.querySelector<SVGCircleElement>(".vt-ring-arc");
    if (arc) {
      const rest = Number(gsap.getProperty(arc, "strokeDashoffset"));
      tl.fromTo(
        arc,
        { strokeDashoffset: arc.getTotalLength() },
        { strokeDashoffset: rest, duration: 0.9, ease: "power2.inOut" },
        "-=0.4",
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
    // — mockup del sito che si assembla pezzo per pezzo
    tl.to(".vt-mock-piece", { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.1 }, "-=0.6");

    // ⑤ Hold finale leggibile (stato finale = tutto composto, coerente con
    //    progress(1) sotto reduced-motion).
    tl.to({}, { duration: 0.8 });
  });

  return (
    <ImmersiveStage
      ref={ref}
      heightVh={340}
      theme="platform"
      label={CHAPTERS[1].title}
      chapterIndex={1}
    >
      {/* Heading + bento centrati INSIEME verticalmente (justify-center):
          niente fascia morta tra i due blocchi. */}
      <div className="relative flex h-full flex-col justify-center overflow-hidden px-[5vw] py-[6vh]">
        {/* Alone accent tenue sulla sezione chiara (solo decorativo). */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            backgroundImage:
              "radial-gradient(60% 55% at 50% 28%, var(--accent-soft), transparent 72%)",
          }}
        />

        {/* Heading in-scena: persistente (a progress(1) resta visibile → copre
            anche il fallback reduced-motion, niente heading statico extra). */}
        <div className="vt-head mx-auto w-full max-w-6xl shrink-0">
          <p className="text-accent-ink font-mono text-xs font-semibold tracking-[0.3em] uppercase">
            {CHAPTERS[1].title}
          </p>
          <h2 className="font-display text-foreground mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            Componenti che si sentono vivi.
          </h2>
          <p className="text-muted mt-2 max-w-xl text-sm md:text-base">
            Card, grafici e controlli costruiti su misura: si animano mentre scorri, come in un
            prodotto vero.
          </p>
        </div>

        {/* Bento: card chiare in griglia asimmetrica (vedi BentoKit). */}
        <div className="mx-auto mt-10 w-full max-w-6xl">
          <BentoKit />
        </div>
      </div>

      {/* Title card di capitolo (apre la scena). */}
      <ChapterCard
        chapter={CHAPTERS[1]}
        subtitle="Componenti curati, animati, pronti all'uso."
      />
    </ImmersiveStage>
  );
}
