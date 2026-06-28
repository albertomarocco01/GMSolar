"use client";

import { useRef } from "react";
import { gsap } from "@gmgroup/lib/gsap";
import { cn } from "@gmgroup/lib/utils";
import { prefersReducedMotion, useIsoLayoutEffect } from "@gmgroup/lib/motion";
import AnimatedCounter from "@gmgroup/ui/AnimatedCounter";

/** Altezze (%) delle barre del grafico. */
const BARS = [40, 65, 50, 80, 62, 92, 74] as const;

/** KPI mostrati in alto. */
const KPIS = [
  { value: 128, suffix: "k", label: "Visite", decimals: 0 },
  { value: 4.8, suffix: "%", label: "Conversione", decimals: 1 },
  { value: 36, suffix: "", label: "Siti attivi", decimals: 0 },
] as const;

/**
 * Visual "Dashboard": KPI con counter, una sparkline che si disegna e barre che
 * crescono allo scroll-in. Reduced-motion: valori finali, linea e barre statiche.
 */
export default function DashboardVisual() {
  const rootRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  useIsoLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.from(".dash-bar", {
        scaleY: 0,
        transformOrigin: "bottom",
        stagger: 0.08,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: { trigger: root, start: "top 80%", once: true },
      });

      const path = pathRef.current;
      if (path) {
        const len = path.getTotalLength();
        path.style.strokeDasharray = `${len}`;
        gsap.fromTo(
          path,
          { strokeDashoffset: len },
          {
            strokeDashoffset: 0,
            duration: 1.4,
            ease: "power2.out",
            scrollTrigger: { trigger: root, start: "top 80%", once: true },
          },
        );
      }
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={rootRef}
      aria-hidden
      className="border-border bg-background shadow-card rounded-xl border p-5"
    >
      {/* KPI */}
      <div className="grid grid-cols-3 gap-4">
        {KPIS.map((k) => (
          <div key={k.label}>
            <p className="text-accent-ink font-display text-2xl font-bold tabular-nums">
              <AnimatedCounter value={k.value} suffix={k.suffix} decimals={k.decimals} />
            </p>
            <p className="text-muted mt-0.5 text-xs">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Sparkline */}
      <svg viewBox="0 0 300 80" className="mt-5 h-20 w-full" fill="none" preserveAspectRatio="none">
        <path
          ref={pathRef}
          d="M0 60 L40 50 L80 56 L120 34 L160 42 L200 20 L240 28 L300 8"
          className="stroke-accent"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Barre */}
      <div className="mt-5 flex h-24 items-end gap-2">
        {BARS.map((h, i) => (
          <span
            key={i}
            className={cn("dash-bar flex-1 rounded-t-sm", i === 5 ? "bg-accent" : "bg-accent/35")}
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  );
}
