"use client";

/**
 * @descrizione  Scena "INTERFACCE GRAFICHE MODERNE" — capitolo 02, v3.
 *   Le v1/v2 mostravano un bento di componenti UI astratti (BentoKit): un
 *   catalogo, fuori tema. Ora la scena mostra SNIPPET di un sito vetrina reale
 *   (sezioni modellate su gmsolar.it: «Chi è GM Solar», i numeri, «Tipologia di
 *   impianti», «I nostri servizi» — vedi `vetrina/VetrinaTeaser`), ritagliati
 *   dentro finestre che li tagliano ai bordi: sono assaggi, non pagine.
 *
 *   Regia (timeline scrubbata via useImmersiveScene):
 *     ① ChapterCard di capitolo
 *     ② Le quattro finestre si aprono a wipe, una dopo l'altra (maskReveal)
 *     ③ Dentro, gli snippet prendono vita: la headline di «Cosa facciamo» si
 *        digita e la sua CTA si preme; i quattro numeri contano; le tile degli
 *        impianti si scoprono dal basso; le righe dei servizi entrano in cascata
 *     ④ Hold finale leggibile
 *
 *   Reduced-motion: la timeline va a progress(1) → quattro snippet rivelati,
 *   headline scritta, numeri al valore finale. Tutti i tween sono to/fromTo
 *   deterministici; i counter scrivono il valore finale via countUp. Il capitolo
 *   non ha heading in-scena: lo annuncia la ChapterCard.
 */
import { gsap } from "@gmgroup/lib/gsap";
import VetrinaTeaser, { STATS } from "../vetrina/VetrinaTeaser";
import {
  ImmersiveStage,
  CHAPTERS,
  ChapterCard,
  chapterIntro,
  countUp,
  maskReveal,
  pressButton,
  typeInField,
  useImmersiveScene,
} from "../immersive/shared";

/** Formato dei numeri della sezione statistiche (20.000, 300…). */
const fmtIt = (n: number) => Math.round(n).toLocaleString("it-IT");

export default function InterfacceScene() {
  const ref = useImmersiveScene((tl, section) => {
    // Stati iniziali in build (layout effect) → applicati PRIMA del paint.
    // Micro-vita dentro gli snippet: righe dei servizi fuori campo.
    gsap.set(".vw-f4-row", { autoAlpha: 0, x: -14 });
    // Counter azzerati (SSR mostra il valore finale; qui parte la "vita").
    section.querySelectorAll<HTMLElement>(".vw-stat").forEach((el) => (el.textContent = "0"));

    // ① Title card di capitolo.
    chapterIntro(tl);

    // ② Le quattro finestre si aprono a wipe, in cascata.
    maskReveal(tl, ".vw-frag", {
      dir: "l",
      duration: 0.75,
      ease: "power2.out",
      stagger: 0.2,
    });

    // ③ Gli snippet prendono vita.
    // — «Chi è GM Solar»: la headline si scrive, poi la CTA si preme da sola
    typeInField(tl, ".vw-f1-type", { steps: 14, duration: 1.3, position: ">-0.15" });
    pressButton(tl, ".vw-f1-cta", { down: 0.92, back: 2.5, position: ">0.1" });
    // — i numeri della sezione statistiche contano insieme
    countUp(
      tl,
      STATS.map((s, i) => ({ el: `.vw-stat-${i}`, to: s.to, format: fmtIt })),
      { duration: 1.2, position: ">-0.3" },
    );
    // — «Tipologia di impianti»: le tile si scoprono dal basso, in cascata
    maskReveal(tl, ".vw-f3-tile", {
      dir: "b",
      duration: 0.55,
      ease: "power2.out",
      stagger: 0.12,
      position: ">-0.2",
    });
    // — «I nostri servizi»: le righe entrano da sinistra, una dopo l'altra
    tl.to(
      ".vw-f4-row",
      { autoAlpha: 1, x: 0, duration: 0.4, ease: "power3.out", stagger: 0.09 },
      ">-0.35",
    );

    // ④ Hold finale leggibile (stato finale = quello di progress(1)).
    tl.to({}, { duration: 0.9 });
  });

  return (
    <ImmersiveStage ref={ref} heightVh={440} label={CHAPTERS[1].title} chapterIndex={1}>
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

        {/* I quattro snippet ritagliati + sipario. */}
        <VetrinaTeaser />
      </div>

      {/* Title card di capitolo (apre la scena). */}
      <ChapterCard chapter={CHAPTERS[1]} subtitle="Sezioni di un sito vetrina, in movimento." />
    </ImmersiveStage>
  );
}
