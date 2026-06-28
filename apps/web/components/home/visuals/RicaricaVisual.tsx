"use client";

import { useRef } from "react";
import { gsap } from "@gmgroup/lib/gsap";
import { prefersReducedMotion, useIsoLayoutEffect } from "@gmgroup/lib/motion";
import AnimatedCounter from "@gmgroup/ui/AnimatedCounter";

/** Livello di carica raggiunto. */
const TARGET = 80;

/**
 * Visual "App ricarica EV": una batteria che si riempie mentre la percentuale
 * conta verso l'alto e il fulmine pulsa. Reduced-motion: batteria già all'80%,
 * counter sul valore finale, niente pulsazione.
 */
export default function RicaricaVisual() {
  const rootRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);

  useIsoLayoutEffect(() => {
    const root = rootRef.current;
    const fill = fillRef.current;
    if (!root || !fill || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.from(fill, {
        scaleX: 0,
        transformOrigin: "left center",
        duration: 1.6,
        ease: "power2.out",
        scrollTrigger: { trigger: root, start: "top 80%", once: true },
      });
      gsap.to(".charge-bolt", {
        scale: 1.12,
        opacity: 1,
        duration: 0.9,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={rootRef}
      aria-hidden
      className="border-border bg-background shadow-card rounded-xl border p-6"
    >
      <div className="flex items-center justify-between">
        <span className="text-muted text-xs font-medium tracking-wide uppercase">
          Ricarica in corso
        </span>
        <span className="text-accent-ink font-display text-2xl font-bold tabular-nums">
          <AnimatedCounter value={TARGET} suffix="%" />
        </span>
      </div>

      {/* Batteria */}
      <div className="mt-5 flex items-center gap-2">
        <div className="border-border relative h-20 flex-1 overflow-hidden rounded-lg border-2 p-1.5">
          <div
            ref={fillRef}
            className="bg-accent h-full origin-left rounded-sm"
            style={{ width: `${TARGET}%` }}
          />
          {/* Fulmine di ricarica */}
          <svg
            className="charge-bolt text-accent-contrast absolute inset-0 m-auto h-9 w-9 opacity-80"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z" />
          </svg>
        </div>
        {/* Polo positivo */}
        <span className="bg-border h-8 w-1.5 rounded-r-sm" />
      </div>

      <p className="text-muted mt-4 text-sm">~22 min al 100% · 11 kW · stallo B3</p>
    </div>
  );
}
