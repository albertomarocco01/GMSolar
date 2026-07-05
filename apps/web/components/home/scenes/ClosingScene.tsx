"use client";

/**
 * @descrizione  CHIUSURA della presentazione, minimale: SOLO il bottone
 *   «Rivedi la presentazione» centrato, su un loop di sfondo discreto (due aloni
 *   accent che "respirano" in scale/opacity). Il loop rispetta reduced-motion
 *   (aloni statici) e la pausa globale della presentazione
 *   (`presentation:pausechange` + attributo `data-presentation-paused` al mount).
 * @indice
 * - ClosingScene → ultima sezione: replay centrato + aloni in loop
 */
import { useRef } from "react";
import Section from "@gmgroup/ui/Section";
import { gsap } from "@gmgroup/lib/gsap";
import { prefersReducedMotion, useIsoLayoutEffect } from "@gmgroup/lib/motion";
import ReplayButton from "@/components/home/ReplayButton";

export default function ClosingScene() {
  const haloRef = useRef<HTMLDivElement>(null);

  useIsoLayoutEffect(() => {
    const root = haloRef.current;
    if (!root || prefersReducedMotion()) return; // reduced-motion: aloni statici

    const ctx = gsap.context(() => {
      // Un solo tween yoyo infinito sui due aloni (solo transform/opacity);
      // FUORI da ogni timeline scrubbata → repeat:-1 è ammesso qui.
      const breathe = gsap.to(".cl-halo", {
        scale: 1.18,
        opacity: 0.7,
        duration: 5, // ~10s a ciclo completo (andata+ritorno)
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        stagger: { each: 1.6, repeat: -1, yoyo: true },
        // Montaggio a presentazione GIÀ in pausa (es. remount): parte congelato.
        paused: document.documentElement.hasAttribute("data-presentation-paused"),
      });
      const onPauseChange = (e: Event) => {
        const paused = Boolean((e as CustomEvent<{ paused: boolean }>).detail?.paused);
        if (paused) breathe.pause();
        else breathe.resume();
      };
      window.addEventListener("presentation:pausechange", onPauseChange);
      return () => window.removeEventListener("presentation:pausechange", onPauseChange);
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <Section
      fullBleed
      className="relative flex min-h-svh items-center justify-center overflow-hidden"
    >
      {/* Riga accent in alto: richiama la barra di progresso delle scene-video. */}
      <div aria-hidden className="bg-accent absolute inset-x-0 top-0 z-10 h-1" />

      {/* Loop di sfondo discreto: due aloni accent che respirano dietro il CTA. */}
      <div ref={haloRef} aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <span className="cl-halo bg-accent-soft absolute -top-24 -left-24 h-[55vh] w-[55vh] rounded-full opacity-40 blur-3xl" />
        <span className="cl-halo bg-accent/5 absolute -right-32 -bottom-32 h-[65vh] w-[65vh] rounded-full opacity-50 blur-3xl" />
      </div>

      {/* Solo il CTA di replay, centrato: riavvia la presentazione. */}
      <div className="relative z-10 flex justify-center px-6">
        <ReplayButton />
      </div>
    </Section>
  );
}
