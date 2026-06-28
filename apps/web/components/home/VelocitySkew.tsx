"use client";

/**
 * @descrizione  Tocco premium "fisico": inclina leggermente il contenuto delle
 *   scene (.imm-skew) in base alla VELOCITÀ di scroll di Lenis → senso di inerzia.
 *   Gira nel ticker GSAP (un solo loop). Reduced-motion: non fa nulla.
 * @indice
 * - VelocitySkew → montato una volta nella home, agisce su tutte le .imm-skew
 */
import { useEffect } from "react";
import { gsap } from "@gmgroup/lib/gsap";
import { prefersReducedMotion } from "@gmgroup/lib/motion";

export default function VelocitySkew() {
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const clamp = (v: number) => Math.max(-2, Math.min(2, v));
    const tick = () => {
      const v = (window as unknown as { __lenis?: { velocity?: number } }).__lenis?.velocity ?? 0;
      gsap.set(".imm-skew", { skewY: clamp(v * 0.012) });
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, []);
  return null;
}
