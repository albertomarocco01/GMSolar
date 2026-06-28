"use client";

/**
 * @descrizione  Modulo dashboard "Telemetria" per la home scrollytelling:
 *   simula analytics multi-sito in real-time con KPI animati (Visite,
 *   Conversione %, Interazioni), sparkline SVG che si disegna, barre che
 *   crescono e filtro sito che ruota (Tutti → Solar → Shop). Solo CSS
 *   transform/opacity/SVG — nessun video né WebGL. Reduced-motion: stato
 *   finale visibile e statico.
 */
import { useRef } from "react";
import { gsap } from "@gmgroup/lib/gsap";
import { useSelfPlay } from "@/components/home/useSelfPlay";

// ── Costanti ──────────────────────────────────────────────────────────────────

const SITES = ["Tutti", "Solar", "Shop"] as const;
type Site = (typeof SITES)[number];

/** [Visite, Conversione %, Interazioni] */
const KPI: Record<Site, [number, number, number]> = {
  Tutti: [124_870, 3.8, 47_230],
  Solar: [43_110, 5.2, 18_040],
  Shop: [62_350, 4.1, 23_590],
};

/** Altezze barre (0-100 %); indice ACCENT_BAR riceve bg-accent piena. */
const BARS = [45, 68, 38, 88, 55, 72, 42] as const;
const ACCENT_BAR = 3;

/** Percorso della sparkline (viewBox 0 0 200 40). */
const SPARK_D = "M0,34 L22,26 L44,30 L66,12 L88,20 L110,8 L132,16 L154,22 L176,10 L198,5";
/** Valore sicuro > lunghezza effettiva del path per strokeDasharray/offset. */
const SPARK_LEN = 240;

// ── Helper ────────────────────────────────────────────────────────────────────

/** Formatta un valore KPI con localizzazione italiana. */
function fmtKpi(v: number, i: number): string {
  if (i === 1) {
    return (
      v.toLocaleString("it-IT", {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      }) + " %"
    );
  }
  return Math.round(v).toLocaleString("it-IT");
}

// ── Dati statici per il render ────────────────────────────────────────────────

const KPI_META = [
  { label: "Visite", delta: "+12%" },
  { label: "Conversione", delta: "+0.4 pp" },
  { label: "Interazioni", delta: "+8%" },
] as const;

// ── Componente ────────────────────────────────────────────────────────────────

export default function DashboardModule() {
  const pillRef = useRef<HTMLSpanElement>(null);
  const kpiRef0 = useRef<HTMLSpanElement>(null);
  const kpiRef1 = useRef<HTMLSpanElement>(null);
  const kpiRef2 = useRef<HTMLSpanElement>(null);

  function build(root: HTMLDivElement): gsap.core.Timeline {
    const pill = pillRef.current;
    const spans: (HTMLSpanElement | null)[] = [kpiRef0.current, kpiRef1.current, kpiRef2.current];
    const sparkLine = root.querySelector<SVGPathElement>(".spark-line");
    const bars = root.querySelectorAll<HTMLElement>(".bar-col");

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.8 });

    /** Aggiunge tweens di conteggio per tutti i KPI del sito dato a partire da `t`. */
    function countKpi(site: Site, t: number): void {
      KPI[site].forEach((target, i) => {
        const proxy = { v: 0 };
        const span = spans[i];
        if (!span) return;
        tl.fromTo(
          proxy,
          { v: 0 },
          {
            v: target,
            duration: 1.3,
            ease: "power2.out",
            onUpdate() {
              span.textContent = fmtKpi(proxy.v, i);
            },
          },
          t,
        );
      });
    }

    /** Cambia il testo della pill sito con un micro-fade. */
    function switchPill(text: Site, t: number): void {
      if (!pill) return;
      tl.to(
        pill,
        {
          opacity: 0,
          duration: 0.15,
          onComplete: () => {
            pill.textContent = text;
          },
        },
        t,
      );
      tl.to(pill, { opacity: 1, duration: 0.15 }, t + 0.18);
    }

    // Stato iniziale visibile (anche al termine del ciclo per reduced-motion)
    if (pill) tl.set(pill, { textContent: "Tutti", opacity: 1 });

    // Sparkline: si disegna da sx a dx
    if (sparkLine) {
      tl.fromTo(
        sparkLine,
        { strokeDashoffset: SPARK_LEN },
        { strokeDashoffset: 0, duration: 2.0, ease: "power1.inOut" },
        0,
      );
    }

    // Barre: crescono dal basso con stagger
    tl.fromTo(
      bars,
      { scaleY: 0, transformOrigin: "bottom" },
      { scaleY: 1, duration: 0.65, stagger: 0.07, ease: "power2.out" },
      0.1,
    );

    // Ciclo 1 — sito: Tutti (t=0.2 → 1.5s)
    countKpi("Tutti", 0.2);

    // Ciclo 2 — sito: Solar (t=2.0 → 3.3s)
    switchPill("Solar", 2.0);
    countKpi("Solar", 2.25);

    // Ciclo 3 — sito: Shop (t=3.8 → 5.1s)
    switchPill("Shop", 3.8);
    countKpi("Shop", 4.0);

    // Durata totale ≈ 5.3s + repeatDelay=0.8 → ciclo ≈ 6.1s (holdMs copre)

    return tl;
  }

  const ref = useSelfPlay<HTMLDivElement>((root) => build(root), {
    holdMs: 6500,
  });

  return (
    <div
      ref={ref}
      aria-hidden
      className="border-border bg-surface text-foreground shadow-lift relative min-h-[clamp(22rem,46vh,30rem)] w-full overflow-hidden rounded-2xl border p-5 sm:p-6"
    >
      {/* ── Topbar ── */}
      <div className="mb-5 flex items-center justify-between">
        <span className="text-foreground text-sm font-semibold tracking-tight">Telemetria</span>
        <span className="bg-accent-soft text-accent-ink rounded-full px-3 py-0.5 text-xs font-semibold">
          <span ref={pillRef}>Tutti</span>
        </span>
      </div>

      {/* ── KPI row ── */}
      <div className="mb-5 grid grid-cols-3 gap-3">
        {(
          [
            { kRef: kpiRef0, ...KPI_META[0] },
            { kRef: kpiRef1, ...KPI_META[1] },
            { kRef: kpiRef2, ...KPI_META[2] },
          ] as const
        ).map(({ kRef, label, delta }, i) => (
          <div key={label} className="bg-surface-2 rounded-xl p-3">
            <p className="text-muted mb-1 truncate text-[10px] font-medium tracking-wide uppercase">
              {label}
            </p>
            <p className="text-foreground text-base leading-none font-bold tabular-nums">
              <span ref={kRef}>{fmtKpi(0, i)}</span>
            </p>
            <p className="mt-1 text-[10px] font-semibold text-emerald-500">&#9650; {delta}</p>
          </div>
        ))}
      </div>

      {/* ── Sparkline ── */}
      <div className="border-border mb-4 overflow-hidden rounded-lg border">
        <svg
          viewBox="0 0 200 40"
          preserveAspectRatio="none"
          className="block h-8 w-full"
          aria-hidden="true"
        >
          <path
            className="spark-line stroke-accent"
            d={SPARK_D}
            fill="none"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              strokeDasharray: SPARK_LEN,
              strokeDashoffset: SPARK_LEN,
            }}
          />
        </svg>
      </div>

      {/* ── Bar chart ── */}
      <div className="flex h-16 items-end gap-1.5">
        {BARS.map((h, i) => (
          <div
            key={i}
            className="bar-col bg-accent flex-1 rounded-t-sm"
            style={{
              height: `${h}%`,
              opacity: i === ACCENT_BAR ? 1 : 0.35,
            }}
          />
        ))}
      </div>
    </div>
  );
}
