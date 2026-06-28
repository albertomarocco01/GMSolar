"use client";

import { useRef } from "react";
import { gsap } from "@gmgroup/lib/gsap";
import { useReducedMotion, useIsoLayoutEffect } from "@gmgroup/lib/motion";
import { cn } from "@gmgroup/lib/utils";

/**
 * Bagliore decorativo nell'accent del mondo, con un parallax verticale leggero
 * legato allo scroll: dà profondità alle bande scure (stats, CTA) e tiene
 * coerente la regia cinematografica oltre l'hero. Puramente decorativo
 * (aria-hidden). Con prefers-reduced-motion resta fermo.
 *
 * Dimensione e posizione le decide il chiamante via `className`; va messo in un
 * contenitore `relative overflow-hidden`.
 */
export default function SolarSceneGlow({
  className,
  from = 14,
  to = -14,
  intensity = 0.45,
}: {
  className?: string;
  /** yPercent iniziale del parallax. */
  from?: number;
  /** yPercent finale del parallax. */
  to?: number;
  /** Quota di accent nel bagliore (0–1). */
  intensity?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { yPercent: from },
        {
          yPercent: to,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
        },
      );
    }, el);

    return () => ctx.revert();
  }, [reduced, from, to]);

  return (
    <div
      ref={ref}
      aria-hidden
      className={cn("pointer-events-none absolute -z-10 rounded-full blur-3xl", className)}
      style={{
        // Promuove il bagliore a layer composito: il blur (grande, costoso) si
        // rasterizza una volta e allo scroll si anima solo il transform (cheap).
        // Solo `will-change` (niente transform inline: romperebbe il centraggio
        // `-translate-x-1/2` del chiamante e lo yPercent gestito da GSAP).
        willChange: "transform",
        background: `radial-gradient(closest-side, color-mix(in oklab, var(--accent) ${Math.round(
          intensity * 100,
        )}%, transparent), transparent)`,
      }}
    />
  );
}
