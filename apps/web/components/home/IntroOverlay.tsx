"use client";

/**
 * @descrizione  Velo iniziale: la pagina parte NERA (non mostra nulla), poi
 *   dissolve per rivelare l'hero — ingresso cinematografico per la demo dal vivo.
 *   Reduced-motion: il velo non compare proprio (nessuna attesa).
 *   Qui vive anche il reset dello scroll: un refresh (F5) deve SEMPRE ripartire
 *   dall'inizio della presentazione, non da metà scrollytelling.
 * @indice
 * - IntroOverlay → montato in cima alla home, si auto-rimuove dopo la dissolvenza
 */
import { useEffect, useRef } from "react";
import { gsap } from "@gmgroup/lib/gsap";
import { prefersReducedMotion, useIsoLayoutEffect } from "@gmgroup/lib/motion";

// A livello di modulo: gira all'import del bundle client, PRIMA che il browser
// ripristini lo scroll sul `load`. Nell'effect sarebbe troppo tardi.
if (typeof window !== "undefined") window.history.scrollRestoration = "manual";

export default function IntroOverlay() {
  const ref = useRef<HTMLDivElement>(null);

  // Cintura di sicurezza: se un ripristino è già avvenuto (o si arriva da
  // bfcache), riporta a zero prima del paint. Salta se c'è un hash (/#vetrina).
  useIsoLayoutEffect(() => {
    if (window.location.hash) return;
    window.scrollTo(0, 0);
  }, []);

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
      className="pointer-events-none fixed inset-0 z-100 bg-[#070809]"
      style={{ opacity: 1 }}
    />
  );
}
