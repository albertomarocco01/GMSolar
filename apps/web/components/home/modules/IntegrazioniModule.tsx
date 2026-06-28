"use client";

/** @descrizione Modulo animato "Integrazioni API": hub centrale collegato a 4
 *  nodi (WhatsApp, Email, CRM, Calendar) tramite linee SVG con strokeDashoffset.
 *  Pacchetti (dot bg-accent) viaggiano hub→nodo in sequenza; un log in basso
 *  appende ogni esito. Loop continuo (~5.5 s). Reduced-motion → stato finale
 *  leggibile statico. Niente video / Three.js — solo GSAP transform/opacity/SVG. */

import { useSelfPlay } from "@/components/home/useSelfPlay";
import { gsap } from "@gmgroup/lib/gsap";
import { MessageCircle, Mail, Users, CalendarDays } from "lucide-react";
import type { LucideIcon } from "lucide-react";

// ── Geometry (SVG viewBox="0 0 100 100", preserveAspectRatio="none")
// CSS left/top percentages == SVG x/y coordinates → perfect overlap.
const HUB = { x: 50, y: 47 } as const;

interface NodeDef {
  id: string;
  label: string;
  Icon: LucideIcon;
  x: number;
  y: number;
  log: string;
}

const NODES: NodeDef[] = [
  { id: "wa", label: "WhatsApp", Icon: MessageCircle, x: 12, y: 15, log: "WhatsApp inviato" },
  { id: "em", label: "Email", Icon: Mail, x: 84, y: 15, log: "Email (Resend) consegnata" },
  { id: "crm", label: "CRM", Icon: Users, x: 84, y: 81, log: "Contatto CRM creato" },
  {
    id: "cal",
    label: "Calendar",
    Icon: CalendarDays,
    x: 12,
    y: 81,
    log: "Evento Calendar aggiunto",
  },
];

// Stroke length in SVG user-units for the dasharray/dashoffset trick.
// Adding a small buffer so the stroke is fully hidden at the start.
const LINE_LENGTHS: number[] = NODES.map(
  (n) => Math.ceil(Math.hypot(n.x - HUB.x, n.y - HUB.y)) + 4,
);

// ── Timeline builder ─────────────────────────────────────────────────────────
// Called by useSelfPlay on first intersection. Returns a repeat:-1 timeline.
// Duration estimate:
//   Phase 1 – lines:  0.45 s × 4 + stagger 0.13 × 3 = ~0.84 s
//   Phase 2 – nodes:  (0 + 0.48 + 0.10 + 0.22 + 0.20) × 4  = ~4.0 s
//   Total active:     ~4.84 s  +  repeatDelay 0.8 s  ≈ 5.5 s  ✓
function build(root: HTMLDivElement): gsap.core.Timeline {
  const qs = (sel: string): Element => root.querySelector(sel)!;
  const qa = (sel: string): NodeListOf<Element> => root.querySelectorAll(sel);

  const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.8 });

  // — Per-loop reset (all at t = 0) —
  tl.set(qa(".int-log-item"), { opacity: 0, x: -6 }, 0);
  tl.set(qa(".int-dot"), { opacity: 0 }, 0);
  NODES.forEach((_, i) => {
    tl.set(qs(`.int-line-${i}`), { attr: { strokeDashoffset: LINE_LENGTHS[i] } }, 0);
  });

  // Phase 1 — draw lines (staggered, simultaneous start)
  tl.to(qa(".int-line"), {
    attr: { strokeDashoffset: 0 },
    duration: 0.45,
    stagger: 0.13,
    ease: "power2.inOut",
  });

  // Phase 2 — for each node: send packet, then reveal log entry
  NODES.forEach((n, i) => {
    const dot = qs(`.int-dot-${i}`);
    const logEl = qs(`.int-log-${i}`);

    tl.set(dot, { attr: { cx: HUB.x, cy: HUB.y }, opacity: 1 })
      .to(dot, { attr: { cx: n.x, cy: n.y }, duration: 0.48, ease: "power2.inOut" })
      .to(dot, { opacity: 0, duration: 0.1 })
      .to(logEl, { opacity: 1, x: 0, duration: 0.22, ease: "power2.out" }, "-=0.06")
      .to({}, { duration: 0.2 }); // breathing gap between nodes
  });

  return tl;
}

// ── Component ────────────────────────────────────────────────────────────────
export default function IntegrazioniModule() {
  const ref = useSelfPlay<HTMLDivElement>((root) => build(root), { holdMs: 6500 });

  return (
    <div
      ref={ref}
      aria-hidden
      className="border-border bg-surface text-foreground shadow-lift relative min-h-[clamp(22rem,46vh,30rem)] w-full overflow-hidden rounded-2xl border p-5 sm:p-6"
    >
      {/* Label + heading */}
      <p className="text-accent-ink mb-0.5 text-[10px] font-semibold tracking-widest uppercase">
        Integrazioni API
      </p>
      <h3 className="text-foreground mb-4 text-sm leading-snug font-bold">
        Flussi automatici tra sistemi esterni
      </h3>

      {/* Hub + nodes canvas */}
      <div className="relative w-full" style={{ height: "clamp(11rem,24vh,15rem)" }}>
        {/* SVG layer: lines + travelling dots */}
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden
        >
          {/* Connector lines */}
          {NODES.map((n, i) => (
            <line
              key={n.id}
              className={`int-line int-line-${i} stroke-accent`}
              x1={HUB.x}
              y1={HUB.y}
              x2={n.x}
              y2={n.y}
              strokeWidth="0.75"
              strokeLinecap="round"
              fill="none"
              strokeDasharray={LINE_LENGTHS[i]}
              strokeDashoffset={LINE_LENGTHS[i]}
            />
          ))}

          {/* Animated packet dots (initially hidden) */}
          {NODES.map((_, i) => (
            <circle
              key={`dot-${i}`}
              className={`int-dot int-dot-${i}`}
              cx={HUB.x}
              cy={HUB.y}
              r="2"
              opacity={0}
              style={{ fill: "var(--accent)" }}
            />
          ))}
        </svg>

        {/* Central hub badge */}
        <div
          className="bg-accent text-accent-contrast absolute z-10 flex h-11 w-11 items-center justify-center rounded-full text-[11px] font-extrabold shadow-md"
          style={{
            left: `${HUB.x}%`,
            top: `${HUB.y}%`,
            transform: "translate(-50%,-50%)",
          }}
        >
          API
        </div>

        {/* Node cards */}
        {NODES.map((n) => {
          const Icon = n.Icon;
          return (
            <div
              key={n.id}
              className="bg-background border-border absolute z-10 flex items-center gap-1.5 rounded-lg border px-2 py-1.5 shadow-sm"
              style={{
                left: `${n.x}%`,
                top: `${n.y}%`,
                transform: "translate(-50%,-50%)",
              }}
            >
              <Icon className="text-accent-ink h-3.5 w-3.5 shrink-0" />
              <span className="text-foreground text-[10px] font-medium whitespace-nowrap">
                {n.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Activity log */}
      <div className="bg-surface-2 mt-3 space-y-1 rounded-xl px-3 py-2.5 font-mono text-[11px]">
        {NODES.map((n, i) => (
          <p
            key={n.id + "-log"}
            className={`int-log-item int-log-${i} text-foreground opacity-0`}
            style={{ willChange: "transform, opacity" }}
          >
            <span className="font-bold text-green-600">✓</span> {n.log}
          </p>
        ))}
      </div>
    </div>
  );
}
