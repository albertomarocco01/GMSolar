"use client";

/**
 * @descrizione  Scena "INTERFACCE GRAFICHE MODERNE" — capitolo 02 (P12). Nasce
 *   dallo split del capitolo «Siti vetrina»: lì restava SOLO il video, qui vivono
 *   i COMPONENTI UI premium (SuspendedCards) su SFONDO PULITO, SENZA video sotto.
 *   Sezione chiara (bg-background + alone accent-soft tenue) che apre con la
 *   ChapterCard «02 · Interfacce grafiche moderne»; poi le card entrano in stagger
 *   pilotate dallo scroll e restano leggibili.
 *
 *   SCELTA CONTRASTO (commentata come chiede la roadmap): SuspendedCards sono in
 *   «vetro chiaro» (testo bianco) pensate per fondi scuri/video → su sfondo chiaro
 *   si perderebbero. Le mostro su un PANNELLO SCURO morbido (`bg-[#0b1020]`)
 *   DENTRO la sezione chiara: la lettura resta netta a 1920×1080 e il beat sembra
 *   un product-shot premium (sezione chiara, vetrina scura). Nessun `<video>`.
 *
 *   Usa il kit immersive (`../immersive/shared`): ImmersiveStage + useImmersiveScene
 *   (timeline scrubbata), chapterIntro per la title card. Reduced-motion → la
 *   timeline va a progress(1): heading statico «02 · …» in cima + SuspendedCards
 *   in griglia piatta (`animated={false}`), tutto leggibile senza animazioni.
 */
import { gsap } from "@gmgroup/lib/gsap";
import { useReducedMotion } from "@gmgroup/lib/motion";
import SuspendedCards from "../vetrina/SuspendedCards";
import {
  ImmersiveStage,
  Say,
  say,
  CHAPTERS,
  ChapterCard,
  chapterIntro,
  useImmersiveScene,
} from "../immersive/shared";

export default function InterfacceScene() {
  // Reduced-motion: la timeline va a progress(1) → la ChapterCard finisce
  // nascosta. Serve un heading testuale statico del capitolo (vedi markup) e la
  // griglia piatta delle card.
  const reduced = useReducedMotion();

  const ref = useImmersiveScene((tl) => {
    // Stato iniziale delle card: nascoste e leggermente sotto/rimpicciolite.
    // gsap.set in build (layout effect) → applicato PRIMA del paint, niente flash.
    gsap.set(".vt-card", { autoAlpha: 0, y: 40, scale: 0.9 });

    // ① Title card di capitolo (P12): «02 · Interfacce grafiche moderne». PRIMO
    //    beat della timeline (sostituisce la vecchia <Say i={0}> col velo).
    chapterIntro(tl);

    // ② Le card entrano in stagger, con un lieve overshoot (back.out).
    tl.to(
      ".vt-card",
      { autoAlpha: 1, y: 0, scale: 1, duration: 0.7, ease: "back.out(1.5)", stagger: 0.14 },
      "+=0.1",
    );

    // ③ Caption descrittiva + hold finale leggibile (stato finale = card visibili,
    //    coerente con progress(1) sotto reduced-motion).
    say(tl, 1);
    tl.to({}, { duration: 0.6 });
  });

  return (
    <ImmersiveStage
      ref={ref}
      heightVh={280}
      theme="platform"
      label={CHAPTERS[1].title}
      chapterIndex={1}
    >
      <div className="relative flex h-full flex-col overflow-hidden">
        {/* Alone accent tenue sulla sezione chiara (solo decorativo). */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            backgroundImage:
              "radial-gradient(60% 55% at 50% 28%, var(--accent-soft), transparent 72%)",
          }}
        />

        {/* Fallback reduced-motion: a progress(1) la ChapterCard è nascosta →
            heading statico del capitolo in cima (solo `reduced`). */}
        {reduced && (
          <p className="border-border bg-surface text-accent-ink relative z-10 shrink-0 border-b px-6 py-2 font-mono text-xs font-semibold tracking-[0.3em] uppercase">
            {CHAPTERS[1].n} · {CHAPTERS[1].title}
          </p>
        )}

        {/* Vetrina: pannello scuro morbido dentro la sezione chiara (vedi SCELTA
            CONTRASTO). Ospita le SuspendedCards. */}
        <div className="flex flex-1 items-stretch justify-center px-[5vw] py-[6vh]">
          <div className="shadow-lift relative w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#0b1020]">
            {/* Micro-trama a puntini accent per profondità (decorativa). */}
            <div
              aria-hidden
              className="absolute inset-0 opacity-[0.12]"
              style={{
                backgroundImage:
                  "radial-gradient(color-mix(in oklab, var(--accent) 40%, transparent) 1px, transparent 1.4px)",
                backgroundSize: "26px 26px",
              }}
            />
            {reduced ? (
              // Griglia piatta, già composta e leggibile (niente scatter/float).
              <div className="flex h-full items-center justify-center p-8">
                <SuspendedCards animated={false} />
              </div>
            ) : (
              // Scatter animato: `.vt-cards-scene` è h-full → il contenitore gli dà
              // un box concreto (inset-0) su cui posizionare le card in prospettiva.
              <div className="absolute inset-0 p-6">
                <SuspendedCards animated />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Title card di capitolo (apre la scena) + caption descrittiva. */}
      <ChapterCard
        chapter={CHAPTERS[1]}
        subtitle="Componenti curati, animati, pronti all'uso."
      />
      <Say i={1} variant="caption">
        Interfacce che si sentono vive, non solo belle.
      </Say>
    </ImmersiveStage>
  );
}
