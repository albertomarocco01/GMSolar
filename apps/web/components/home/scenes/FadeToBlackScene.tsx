"use client";

/**
 * @descrizione  Finale della presentazione: un velo nero che si dissolve in
 *   ingresso (scrub sullo scroll) finché lo schermo è completamente nero — chiusura
 *   pulita per la demo dal vivo, senza CTA. Reduced-motion: schermo nero statico.
 * @indice
 * - FadeToBlackScene → ultima sezione: fade to black
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
          ease: "none",
          scrollTrigger: { trigger: section, start: "top 80%", end: "top top", scrub: true },
        },
      );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} aria-hidden className="relative h-[180vh]">
      {/* Strato che pinna a tutto schermo e diventa nero in dissolvenza. */}
      <div className="sticky top-0 h-screen">
        <div ref={veilRef} className="absolute inset-0 bg-black" style={{ opacity: 0 }} />
      </div>
    </section>
  );
}
