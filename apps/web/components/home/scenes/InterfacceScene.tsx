"use client";

/**
 * @descrizione  Scena "INTERFACCE GRAFICHE MODERNE" — capitolo 02, v4.
 *   Le v1/v2 mostravano un bento di componenti UI astratti; la v3 snippet di un
 *   sito vetrina (ridondante col capitolo 01). La v4 è una CARRELLATA di card
 *   super-moderne in stili diversi — vetro liquido, glassmorfismo, card elettrica
 *   neon, bottoni animati — che dimostra capacità UI avanzata («questi sanno fare
 *   interfacce»). Un pezzo per file in `../showcase/`.
 *
 *   Regia (timeline scrubbata via useImmersiveScene):
 *     ① ChapterCard di capitolo
 *     ② Binario orizzontale: 4 pezzi attraversano lo stage (translateX del
 *        binario, NON scroll nativo). Ogni pezzo entra, si ferma al centro, fa la
 *        sua micro-vita (il cursore finto fa da dito), il binario passa al dopo.
 *          · Vetro liquido — riflesso speculare che scivola via
 *          · Glassmorphism — mini-form: campo che si compila, bottone premuto
 *          · Neon (card elettrica) — dato "live" che conta, barra che cresce
 *          · Micro-interazioni — 3 bottoni: magnetico, riempimento, morph→check
 *     ③ Finale: il binario sfuma e i pezzi si ricompongono in una GRIGLIA 2×2
 *        compatta e leggibile (heading di capitolo sopra).
 *
 *   Reduced-motion: la timeline va a progress(1) → binario nascosto, griglia
 *   finale statica + heading visibili; ogni pezzo nel suo stato finale (numero
 *   scritto, fill pieno, check mostrato). Tutti i tween sono to/fromTo
 *   deterministici (solo transform/opacity). Il bordo conico della card elettrica
 *   è un loop CSS decorativo (`.shw-conic-spin`): la pausa globale lo congela
 *   (regola `#top *` di AutoScroll), reduced-motion lo spegne (media query sotto).
 */
import { gsap } from "@gmgroup/lib/gsap";
import LiquidGlassCard from "../showcase/LiquidGlassCard";
import GlassFormCard from "../showcase/GlassFormCard";
import ElectricCard from "../showcase/ElectricCard";
import AnimatedButtonsCard from "../showcase/AnimatedButtonsCard";
import {
  ImmersiveStage,
  CHAPTERS,
  ChapterCard,
  chapterIntro,
  countUp,
  cursorTo,
  hideCursor,
  maskReveal,
  pressButton,
  typeInField,
  useImmersiveScene,
} from "../immersive/shared";

/** Formato italiano dei numeri "live" (1.284…). */
const fmtIt = (n: number) => Math.round(n).toLocaleString("it-IT");

/** I 4 pezzi della carrellata, nell'ordine del binario. Fonte unica: alimenta sia
 *  gli slot del binario sia le celle della griglia finale (stesso componente). */
const PIECES = [
  { key: "glass", Comp: LiquidGlassCard },
  { key: "form", Comp: GlassFormCard },
  { key: "neon", Comp: ElectricCard },
  { key: "btns", Comp: AnimatedButtonsCard },
] as const;

export default function InterfacceScene() {
  const ref = useImmersiveScene((tl) => {
    // ── Stati iniziali (build → prima del paint) ─────────────────────────────
    gsap.set(".shw-grid", { autoAlpha: 0 }); // la griglia finale entra solo alla fine
    gsap.set(".shw-rail", { xPercent: 0 }); // binario al primo pezzo
    gsap.set(".shw-lg-spec", { xPercent: -120 }); // riflesso del vetro fuori campo

    // ① Title card di capitolo.
    chapterIntro(tl);

    // ② — Pezzo 1 · Vetro liquido: entra a maschera, il riflesso scivola via.
    maskReveal(tl, ".shw-card-0", { dir: "l", duration: 0.6 });
    tl.to(
      ".shw-lg-spec",
      { xPercent: 220, duration: 1.15, ease: "power2.inOut" },
      ">-0.05",
    );

    // — Pezzo 2 · Glassmorphism: il binario scorre, poi il mini-form prende vita.
    tl.to(".shw-rail", { xPercent: -25, duration: 1.0, ease: "expo.inOut" }, ">0.3");
    hideCursor(tl, { position: "<" }); // cursore via durante il pan
    cursorTo(tl, ".shw-glass-txt", { mode: "text" });
    tl.to(".shw-glass-label", { y: -14, scale: 0.72, duration: 0.3, ease: "power2.out" }, "<0.15");
    typeInField(tl, ".shw-glass-txt", { steps: 16, duration: 1.1, position: "<0.1" });
    cursorTo(tl, ".shw-glass-btn", { mode: "hand" });
    pressButton(tl, ".shw-glass-btn");
    tl.to(".shw-glass-ok", { autoAlpha: 1, duration: 0.3, ease: "power2.out" }, ">-0.05");

    // — Pezzo 3 · Neon: il binario scorre, il dato conta e la barra cresce.
    tl.to(".shw-rail", { xPercent: -50, duration: 1.0, ease: "expo.inOut" }, ">0.3");
    hideCursor(tl, { position: "<" });
    countUp(tl, [{ el: ".shw-elec-num", to: 1284, format: fmtIt }], {
      duration: 1.2,
      position: ">0.05",
    });
    tl.to(".shw-elec-bar", { scaleX: 0.78, duration: 1.0, ease: "power2.out" }, "<");

    // — Pezzo 4 · Micro-interazioni: il binario scorre, poi i tre bottoni.
    tl.to(".shw-rail", { xPercent: -75, duration: 1.0, ease: "expo.inOut" }, ">0.3");
    // A · magnetico: il bottone si sposta verso il cursore, poi rimbalza a posto.
    cursorTo(tl, ".shw-btnA", { mode: "hand" });
    tl.to(".shw-btnA", { x: 8, y: -5, duration: 0.28, ease: "power2.out" }, ">-0.15");
    tl.to(".shw-btnA", { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.5)" }, ">0.05");
    // B · riempimento che scorre.
    cursorTo(tl, ".shw-btnB", { mode: "hand" });
    tl.to(".shw-btnB-fill", { scaleX: 1, duration: 0.5, ease: "power2.inOut" }, ">-0.1");
    // C · morph: etichetta → spinner (gira e sfuma) → check.
    cursorTo(tl, ".shw-btnC", { mode: "hand" });
    pressButton(tl, ".shw-btnC");
    tl.to(".shw-btnC-label", { autoAlpha: 0, duration: 0.15 }, ">");
    tl.to(".shw-btnC-spin", { autoAlpha: 1, duration: 0.12 }, "<");
    tl.fromTo(".shw-btnC-spin", { rotate: 0 }, { rotate: 360, duration: 0.7, ease: "none" }, "<");
    tl.to(".shw-btnC-spin", { autoAlpha: 0, duration: 0.14 }, ">-0.02");
    tl.fromTo(
      ".shw-btnC-check",
      { autoAlpha: 0, scale: 0.6 },
      { autoAlpha: 1, scale: 1, duration: 0.3, ease: "back.out(2)" },
      ">-0.06",
    );

    // ③ Finale: cursore via, binario sfuma, griglia compatta 2×2 in cascata.
    hideCursor(tl, { position: ">0.1" });
    tl.to(".shw-rail", { autoAlpha: 0, duration: 0.5, ease: "power2.in" }, ">0.1");
    tl.to(".shw-grid", { autoAlpha: 1, duration: 0.4, ease: "power2.out" }, "<0.15");
    tl.fromTo(
      ".shw-grid-cell",
      { autoAlpha: 0, y: 22 },
      { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.08, ease: "power3.out" },
      "<0.1",
    );

    // Hold finale leggibile (stato = quello di progress(1)).
    tl.to({}, { duration: 0.8 });
  });

  return (
    <ImmersiveStage ref={ref} heightVh={540} label={CHAPTERS[1].title} chapterIndex={1}>
      {/* Loop CSS del bordo conico neon: congelato dalla pausa globale (regola
          `#top *` di AutoScroll), spento sotto reduced-motion. */}
      <style>{`
        @keyframes shwSpin { to { transform: rotate(360deg); } }
        .shw-conic-spin { animation: shwSpin 7s linear infinite; will-change: transform; }
        @media (prefers-reduced-motion: reduce) { .shw-conic-spin { animation: none; } }
      `}</style>

      <div className="relative flex h-full flex-col justify-center overflow-hidden">
        {/* Fondo chiaro: alone accent tenue + griglia di punti sfumata (decor). */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            backgroundImage:
              "radial-gradient(60% 55% at 50% 30%, var(--accent-soft), transparent 72%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            backgroundImage: "radial-gradient(circle, rgb(11 16 32 / 0.07) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
            maskImage: "radial-gradient(75% 65% at 50% 45%, black, transparent)",
            WebkitMaskImage: "radial-gradient(75% 65% at 50% 45%, black, transparent)",
          }}
        />

        {/* BINARIO orizzontale: 4 slot larghi un viewport, uno per pezzo. */}
        <div className="shw-rail flex h-full" style={{ width: "400%" }}>
          {PIECES.map(({ key, Comp }, i) => (
            <div key={key} className="flex w-1/4 shrink-0 items-center justify-center px-[3vw]">
              <div className={`shw-card-${i} aspect-[16/11] w-full max-w-[620px]`}>
                <Comp mode="stage" />
              </div>
            </div>
          ))}
        </div>

        {/* GRIGLIA finale: gli stessi pezzi, compatti e a riposo (heading sopra). */}
        <div className="shw-grid pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-[5vw]">
          <div className="mb-7 text-center">
            <p className="text-accent-ink font-mono text-[11px] font-semibold tracking-[0.24em] uppercase">
              Interfacce grafiche moderne
            </p>
            <h3 className="font-display text-foreground mt-2 text-2xl font-bold tracking-tight md:text-3xl">
              Stili diversi, la stessa cura
            </h3>
          </div>
          <div className="grid w-full max-w-[880px] grid-cols-2 gap-5">
            {PIECES.map(({ key, Comp }) => (
              <div key={key} className="shw-grid-cell aspect-[16/11] w-full">
                <Comp mode="grid" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Title card di capitolo (apre la scena). */}
      <ChapterCard chapter={CHAPTERS[1]} subtitle="Stili diversi, la stessa cura." />
    </ImmersiveStage>
  );
}
