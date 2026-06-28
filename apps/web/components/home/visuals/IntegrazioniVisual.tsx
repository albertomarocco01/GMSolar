"use client";

import { useRef } from "react";
import { gsap } from "@gmgroup/lib/gsap";
import { prefersReducedMotion, useIsoLayoutEffect } from "@gmgroup/lib/motion";

/** Nodi satellite (posizioni in % nel box quadrato). */
const NODES = [
  { label: "WhatsApp", x: 16, y: 20 },
  { label: "Email", x: 84, y: 20 },
  { label: "CRM", x: 16, y: 82 },
  { label: "Pagamenti", x: 84, y: 82 },
] as const;

/**
 * Visual "Integrazioni API": un hub centrale a cui si collegano i sistemi
 * esterni; le linee si disegnano e i nodi spuntano allo scroll-in.
 * Reduced-motion: diagramma completo e statico.
 */
export default function IntegrazioniVisual() {
  const rootRef = useRef<HTMLDivElement>(null);

  useIsoLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.utils.toArray<SVGLineElement>(".int-line", root).forEach((line) => {
        const len = line.getTotalLength();
        line.style.strokeDasharray = `${len}`;
        line.style.strokeDashoffset = `${len}`;
      });

      gsap
        .timeline({ scrollTrigger: { trigger: root, start: "top 80%", once: true } })
        .from(".int-hub", { scale: 0, autoAlpha: 0, duration: 0.5, ease: "back.out(1.7)" }, 0)
        .to(
          ".int-line",
          { strokeDashoffset: 0, duration: 0.8, stagger: 0.15, ease: "power2.out" },
          0.15,
        )
        .from(
          ".int-node",
          { scale: 0, autoAlpha: 0, stagger: 0.12, duration: 0.45, ease: "back.out(1.7)" },
          0.3,
        );
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={rootRef}
      aria-hidden
      className="border-border bg-background shadow-card relative h-72 rounded-xl border md:h-80"
    >
      {/* Linee di collegamento */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {NODES.map((n) => (
          <line
            key={n.label}
            className="int-line stroke-accent"
            x1="50"
            y1="50"
            x2={n.x}
            y2={n.y}
            strokeWidth="0.5"
            strokeLinecap="round"
          />
        ))}
      </svg>

      {/* Hub centrale (translate sull'outer, scale sull'inner per non confliggere) */}
      <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <span className="int-hub bg-accent text-accent-contrast shadow-lift flex size-14 items-center justify-center rounded-full text-xs font-bold">
          API
        </span>
      </span>

      {/* Nodi satellite */}
      {NODES.map((n) => (
        <span
          key={n.label}
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${n.x}%`, top: `${n.y}%` }}
        >
          <span className="int-node border-accent bg-surface text-foreground block rounded-full border px-3 py-1.5 text-xs font-medium whitespace-nowrap">
            {n.label}
          </span>
        </span>
      ))}
    </div>
  );
}
