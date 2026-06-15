"use client";

import { useRef } from "react";
import { gsap } from "@gmgroup/lib/gsap";
import { DURATION, EASE, prefersReducedMotion, useIsoLayoutEffect } from "@gmgroup/lib/motion";
import { cn } from "@gmgroup/lib/utils";

export type ScrollRevealProps = {
  className?: string;
  children: React.ReactNode;
  /** Spostamento verticale iniziale in px. */
  y?: number;
  /** Opacità iniziale. */
  from?: number;
  duration?: number;
  delay?: number;
  /** Start di ScrollTrigger (sintassi "top 85%"). */
  start?: string;
  /** Anima una sola volta (default true). */
  once?: boolean;
  /** Se valorizzato, anima i figli diretti in cascata (stagger in secondi). */
  stagger?: number;
};

/**
 * Wrapper GSAP che rivela il contenuto allo scroll (fade + rise). Rispetta
 * prefers-reduced-motion: in tal caso il contenuto resta semplicemente
 * visibile, senza animazione. Pensato per essere il "default" del reveal.
 */
export default function ScrollReveal({
  className,
  children,
  y = 24,
  from = 0,
  duration = DURATION.slow,
  delay = 0,
  start = "top 85%",
  once = true,
  stagger,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    const targets = stagger != null ? el.children : el;
    const ctx = gsap.context(() => {
      gsap.from(targets, {
        autoAlpha: from, // opacity + visibility: niente flash di contenuto nascosto
        y,
        duration,
        delay,
        ease: EASE.out,
        stagger: stagger ?? 0,
        scrollTrigger: { trigger: el, start, once },
      });
    }, ref);

    return () => ctx.revert();
  }, [y, from, duration, delay, start, once, stagger]);

  return (
    <div ref={ref} className={cn(className)}>
      {children}
    </div>
  );
}
