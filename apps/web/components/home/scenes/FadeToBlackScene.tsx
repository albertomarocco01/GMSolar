"use client";

/**
 * @descrizione  Finale pulito: lo schermo si dissolve nel nero, senza testo né
 *   CTA — chiusura elegante per la demo dal vivo. Velo guidato dallo scroll.
 *   Reduced-motion: nero statico.
 * @indice
 * - FadeToBlackScene → ultima sezione: fade out al nero
 */
import { useRef } from "react";
import { gsap } from "@gmgroup/lib/gsap";
import { prefersReducedMotion, useIsoLayoutEffect } from "@gmgroup/lib/motion";

export default function FadeToBlackScene() {
  const sectionRef = useRef<HTMLElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);

  useIsoLayoutEffect(() => {
    const section = sectionRef.current;
    const veil = veilRef.current;
    if (!section || !veil) return;

    if (prefersReducedMotion()) {
      veil.style.opacity = "1";
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        veil,
        { opacity: 0 },
        {
          opacity: 1,
          ease: "power2.inOut",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom bottom",
            scrub: true,
          },
        },
      );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} aria-hidden className="relative h-[120vh]">
      <div className="sticky top-0 h-screen overflow-hidden">
        <div ref={veilRef} className="absolute inset-0 bg-[#070809]" style={{ opacity: 0 }} />
      </div>
    </section>
  );
}
