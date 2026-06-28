"use client";

/**
 * @descrizione  Velo iniziale: la pagina parte NERA (non mostra nulla), poi
 *   dissolve per rivelare l'hero — ingresso cinematografico per la demo dal vivo.
 *   Reduced-motion: il velo non compare proprio (nessuna attesa).
 * @indice
 * - IntroOverlay → montato in cima alla home, si auto-rimuove dopo la dissolvenza
 */
import { useEffect, useRef } from "react";
import { gsap } from "@gmgroup/lib/gsap";
import { prefersReducedMotion } from "@gmgroup/lib/motion";

export default function IntroOverlay() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      el.style.display = "none";
      return;
    }
    const tween = gsap.to(el, {
      opacity: 0,
      duration: 1.4,
      ease: "power2.inOut",
      delay: 0.5, // un istante di nero pieno, poi rivela "Siti vetrina moderni"
      onComplete: () => {
        el.style.display = "none";
      },
    });
    return () => {
      tween.kill();
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[100] bg-[#070809]"
      style={{ opacity: 1 }}
    />
  );
}
