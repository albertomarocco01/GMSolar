"use client";

import { useRef } from "react";
import { gsap } from "@gmgroup/lib/gsap";
import { prefersReducedMotion, useIsoLayoutEffect } from "@gmgroup/lib/motion";

/**
 * Visual "Segnalazioni": una scheda ticket che passa da "Aperta" a "Risolta" —
 * la barra di avanzamento si riempie, lo stato cambia e spunta il check.
 * Reduced-motion: mostra direttamente lo stato finale (risolta) leggibile.
 */
export default function SegnalazioniVisual() {
  const rootRef = useRef<HTMLDivElement>(null);

  useIsoLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      // Stato iniziale dell'animazione: ticket "aperto", check nascosto.
      gsap.set(".tk-open", { autoAlpha: 1 });
      gsap.set(".tk-done", { autoAlpha: 0 });
      gsap.set(".tk-check", { scale: 0, autoAlpha: 0 });

      gsap
        .timeline({ scrollTrigger: { trigger: root, start: "top 75%", once: true } })
        .from(".tk-progress", {
          scaleX: 0,
          transformOrigin: "left",
          duration: 1.1,
          ease: "power2.inOut",
        })
        .to(".tk-open", { autoAlpha: 0, y: -8, duration: 0.4, ease: "power2.in" }, "+=0.1")
        .to(".tk-done", { autoAlpha: 1, y: 0, duration: 0.45, ease: "power3.out" }, "<")
        .to(".tk-check", { scale: 1, autoAlpha: 1, duration: 0.5, ease: "back.out(2)" }, "<0.1");
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={rootRef}
      aria-hidden
      className="border-border bg-background shadow-card rounded-xl border p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-muted font-mono text-xs">SEGN-204</p>
          <p className="mt-1 font-semibold">Allineare il footer su mobile</p>
        </div>
        {/* Stati sovrapposti (crossfade) */}
        <div className="relative h-7 w-24 shrink-0">
          <span className="tk-open bg-surface-2 text-muted absolute inset-0 flex items-center justify-center rounded-full text-xs font-medium opacity-0">
            ● Aperta
          </span>
          <span className="tk-done bg-accent-soft text-accent-ink absolute inset-0 flex items-center justify-center rounded-full text-xs font-medium">
            ✓ Risolta
          </span>
        </div>
      </div>

      {/* Barra di avanzamento */}
      <div className="bg-surface-2 mt-5 h-1.5 overflow-hidden rounded-full">
        <div className="tk-progress bg-accent h-full w-full origin-left rounded-full" />
      </div>

      {/* Timeline + check finale */}
      <div className="mt-5 flex items-center justify-between">
        <p className="text-muted text-xs">Aperta 09:12 → Risolta 09:40</p>
        <span className="tk-check bg-accent text-accent-contrast flex size-7 items-center justify-center rounded-full text-sm font-bold">
          ✓
        </span>
      </div>
    </div>
  );
}
