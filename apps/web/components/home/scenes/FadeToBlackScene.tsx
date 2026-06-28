"use client";

/**
 * @descrizione  Finale a regia: lo schermo si oscura e, sul nero, appare una
 *   FIRMA (claim di chiusura) che resta come ultimo fotogramma — niente "buio
 *   vuoto" che sembra un errore. Velo + firma guidati dallo scroll (scrub).
 *   Reduced-motion: nero + firma statici.
 * @indice
 * - FadeToBlackScene → ultima sezione: fade to black + firma
 */
import { useRef } from "react";
import { gsap } from "@gmgroup/lib/gsap";
import { prefersReducedMotion, useIsoLayoutEffect } from "@gmgroup/lib/motion";
import { GROUP } from "@gmgroup/lib/site";

export default function FadeToBlackScene() {
  const sectionRef = useRef<HTMLElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);
  const signRef = useRef<HTMLDivElement>(null);

  useIsoLayoutEffect(() => {
    const section = sectionRef.current;
    const veil = veilRef.current;
    const sign = signRef.current;
    if (!section || !veil || !sign) return;

    if (prefersReducedMotion()) {
      veil.style.opacity = "1";
      sign.style.opacity = "1";
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: section, start: "top bottom", end: "bottom bottom", scrub: true },
      });
      tl.fromTo(veil, { opacity: 0 }, { opacity: 1, ease: "none", duration: 0.6 });
      tl.fromTo(
        sign,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, ease: "power2.out", duration: 0.4 },
      );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative h-[140vh]">
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        <div ref={veilRef} className="absolute inset-0 bg-[#070809]" style={{ opacity: 0 }} />
        <div ref={signRef} className="relative z-10 px-6 text-center" style={{ opacity: 0 }}>
          <p className="font-display text-2xl font-bold tracking-tight text-white sm:text-4xl">
            Costruiamo tutto questo. Insieme.
          </p>
          <p className="mt-3 text-sm tracking-widest text-white/55 uppercase">{GROUP.tagline}</p>
        </div>
      </div>
    </section>
  );
}
