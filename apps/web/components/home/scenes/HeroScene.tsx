"use client";

/**
 * @descrizione  Apertura della home (tema CHIARO) con INGRESSO a regia: dopo il
 *   velo nero (IntroOverlay) gli elementi entrano in sequenza — titolo, poi
 *   eyebrow, claim, CTA, e infine la freccia che invita a scorrere. Niente
 *   "scena già accesa": si costruisce davanti al cliente. Reduced-motion: tutto
 *   visibile, nessuna animazione d'ingresso.
 * @indice
 * - HeroScene → prima sezione della pagina
 */
import { useRef } from "react";
import { gsap } from "@gmgroup/lib/gsap";
import { prefersReducedMotion, useIsoLayoutEffect } from "@gmgroup/lib/motion";
import Container from "@gmgroup/ui/Container";
import Button from "@gmgroup/ui/Button";
import SplitTextReveal from "@gmgroup/ui/SplitTextReveal";

export default function HeroScene() {
  const rootRef = useRef<HTMLElement>(null);

  useIsoLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.set([".hero-eyebrow", ".hero-desc", ".hero-cta", ".hero-cue"], { autoAlpha: 0, y: 16 });
      gsap
        .timeline({ delay: 1.2 }) // dopo la dissolvenza dell'IntroOverlay
        .to(".hero-eyebrow", { autoAlpha: 1, y: 0, duration: 0.6, ease: "power3.out" })
        .to(".hero-desc", { autoAlpha: 1, y: 0, duration: 0.6, ease: "power3.out" }, "-=0.3")
        .to(".hero-cta", { autoAlpha: 1, y: 0, duration: 0.6, ease: "power3.out" }, "-=0.3")
        .to(".hero-cue", { autoAlpha: 1, y: 0, duration: 0.6, ease: "power3.out" }, "+=0.6");
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={rootRef}
      className="bg-background text-foreground relative flex min-h-screen items-center overflow-hidden"
    >
      {/* Sfondo: aloni accent tenui su chiaro */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="bg-accent/20 absolute -top-32 -left-24 h-96 w-96 rounded-full blur-2xl motion-safe:animate-pulse" />
        <div className="absolute top-1/3 -right-24 h-96 w-96 rounded-full bg-violet/12 blur-2xl motion-safe:animate-pulse" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_50%,var(--background)_100%)]" />
      </div>

      <Container className="relative">
        {/* Il titolo entra per primo (SplitTextReveal), poi il resto in cascata */}
        <SplitTextReveal
          as="h1"
          text="Tutto quello che possiamo costruire per te."
          className="font-display max-w-4xl text-4xl font-bold tracking-tight text-balance sm:text-6xl md:text-7xl"
        />
        <p className="hero-eyebrow text-accent-ink mt-6 text-sm font-semibold tracking-widest uppercase">
          La nostra offerta, in una scrollata
        </p>
        <p className="hero-desc text-muted mt-4 max-w-xl text-lg">
          Siti vetrina cinematici, assistenti AI, dashboard di telemetria, gestionale, app di
          ricarica e integrazioni con qualunque sistema. Una presentazione interattiva, senza slide:
          scorre da sola.
        </p>

        <div className="hero-cta mt-10">
          <Button href="#vetrina" size="lg">
            Inizia il racconto
          </Button>
        </div>
        <span className="hero-cue text-muted mt-8 flex items-center gap-2 text-sm">
          <span aria-hidden className="motion-safe:animate-bounce">
            ↓
          </span>
          scorre da solo · muovi il mouse per prendere il controllo
        </span>
      </Container>
    </section>
  );
}
