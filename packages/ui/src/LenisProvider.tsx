"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@gmgroup/lib/gsap";
import { prefersReducedMotion } from "@gmgroup/lib/motion";

/**
 * Smooth scroll con Lenis, agganciato al ticker di GSAP così ScrollTrigger
 * resta in sync (un solo loop di rAF per tutto il sito).
 *
 * REGOLA DI PROGETTO: rispetta SEMPRE prefers-reduced-motion. Se l'utente
 * preferisce meno movimento NON inizializziamo Lenis: si usa lo scroll
 * nativo del browser (ScrollTrigger continua a funzionare).
 */
export default function LenisProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (prefersReducedMotion()) {
      ScrollTrigger.refresh();
      return;
    }

    const lenis = new Lenis({
      duration: 1.1,
      // ease-out esponenziale: parte veloce e si "posa" dolcemente.
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    // ScrollTrigger si aggiorna a ogni scroll di Lenis…
    lenis.on("scroll", ScrollTrigger.update);
    // …e il rAF di Lenis è guidato dal ticker di GSAP (niente loop doppio).
    const onTick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    // Espone l'istanza per chi deve pilotare lo scroll (es. l'auto-scroll della
    // home). Solo lettura/scrollTo: nessuno ridefinisce il comportamento di Lenis.
    (window as unknown as { __lenis?: Lenis }).__lenis = lenis;

    return () => {
      gsap.ticker.remove(onTick);
      lenis.destroy();
      delete (window as unknown as { __lenis?: Lenis }).__lenis;
    };
  }, []);

  return <>{children}</>;
}
