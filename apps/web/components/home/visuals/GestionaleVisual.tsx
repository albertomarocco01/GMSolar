"use client";

import { useRef } from "react";
import { gsap } from "@gmgroup/lib/gsap";
import { cn } from "@gmgroup/lib/utils";
import { prefersReducedMotion, useIsoLayoutEffect } from "@gmgroup/lib/motion";

/** Righe di esempio della tabella ordini. */
const ROWS = [
  { id: "#1042", cliente: "Rossi S.r.l.", stato: "Evaso", ok: true },
  { id: "#1043", cliente: "Bianchi S.p.A.", stato: "In corso", ok: false },
  { id: "#1044", cliente: "Verdi & Co.", stato: "Evaso", ok: true },
  { id: "#1045", cliente: "Neri Group", stato: "In corso", ok: false },
  { id: "#1046", cliente: "Gialli S.r.l.", stato: "Evaso", ok: true },
] as const;

/**
 * Visual "Gestionale": le righe della tabella si popolano una a una allo
 * scroll-in, sotto una toolbar con un prompt in linguaggio naturale.
 * Reduced-motion: tutte le righe già visibili.
 */
export default function GestionaleVisual() {
  const rootRef = useRef<HTMLDivElement>(null);

  useIsoLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.from(".grid-row", {
        autoAlpha: 0,
        x: -16,
        stagger: 0.12,
        duration: 0.5,
        ease: "power3.out",
        scrollTrigger: { trigger: root, start: "top 80%", once: true },
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={rootRef}
      aria-hidden
      className="border-border bg-background shadow-card overflow-hidden rounded-xl border"
    >
      {/* Toolbar con prompt AI */}
      <div className="border-border bg-surface flex items-center gap-2 border-b px-4 py-3">
        <span className="bg-accent size-2 rounded-full" />
        <span className="text-muted text-xs">Ordini · chiedi: “quanti ne ho evasi oggi?”</span>
      </div>

      {/* Intestazione tabella */}
      <div className="text-muted grid grid-cols-[auto_1fr_auto] gap-3 px-4 py-2 text-[0.7rem] font-medium tracking-wide uppercase">
        <span>Ordine</span>
        <span>Cliente</span>
        <span>Stato</span>
      </div>

      {/* Righe */}
      <div className="divide-border divide-y">
        {ROWS.map((r) => (
          <div
            key={r.id}
            className="grid-row grid grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-2.5 text-sm"
          >
            <span className="text-muted font-mono text-xs">{r.id}</span>
            <span className="truncate font-medium">{r.cliente}</span>
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 text-xs font-medium",
                r.ok ? "bg-accent-soft text-accent-ink" : "bg-surface-2 text-muted",
              )}
            >
              {r.stato}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
