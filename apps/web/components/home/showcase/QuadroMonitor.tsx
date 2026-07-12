"use client";

/**
 * @descrizione  QUADRO 2 — MONITORAGGIO IMPIANTO (tema SCURO). Archetipo
 *   "pannello di controllo denso" ARMONIZZATO: UNA griglia (grid-cols-[1.7fr_1fr]),
 *   UNA scala di spacing (gap/padding 12·16·24), radii coerenti (card rounded-2xl
 *   = 16, pill rounded-full), gerarchia tipografica a 3 livelli (label uppercase
 *   xs · valore display · nota xs). Le superfici card condividono lo STESSO
 *   trattamento (`border-white/10 bg-white/[0.04]`).
 *
 *   EFFETTO PER-ELEMENTO — la sola card-eroe «Produzione ora» è avvolta da
 *   <ElectricBorder/> (canvas che frigge sul suo perimetro, non sul device): kW a
 *   rullo (`.shw-q2-kw`, countUp) + curva che si disegna (`.shw-q2-area`, drawPath).
 *   A destra 3 KPI uniformi; in basso la fila di TILE moduli che si accende a onda
 *   (`.shw-q2-tile`, stagger). Layer full-frame OPACO (`absolute inset-0`): la
 *   scena lo incrocia nei morph.
 */
import ElectricBorder from "./ElectricBorder";

const KPI = [
  { l: "Energia oggi", cls: "shw-q2-kwh", suf: " kWh", d: "+8%" },
  { l: "Autoconsumo", cls: "shw-q2-auto", suf: "%", d: "buono" },
  { l: "Immessa in rete", cls: "shw-q2-grid", suf: " kWh", d: "stabile" },
] as const;

export default function QuadroMonitor() {
  return (
    <div
      className="shw-q2 absolute inset-0 overflow-hidden bg-[#0a0f1e] text-white"
      data-quadro="2"
    >
      {/* Trama a puntini tenue */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
          backgroundSize: "26px 26px",
        }}
      />
      <div className="relative flex h-full flex-col gap-4 p-6">
        {/* Header — livello tipografico 1 (titolo) + 3 (nota) */}
        <div className="shw-q2-item flex items-center justify-between">
          <div>
            <p className="font-display text-lg font-bold tracking-tight">Impianto · Via Carso</p>
            <p className="mt-1 text-xs text-white/45">
              Potenza di picco 9,8 kWp · monitoraggio live
            </p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-white/70">
            <span className="bg-accent h-1.5 w-1.5 rounded-full shadow-[0_0_8px_2px_var(--accent)]" />
            In linea
          </span>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-[1.7fr_1fr] gap-4">
          {/* Card-eroe ELETTRICA: <ElectricBorder/> per-elemento (radius = rounded-2xl). */}
          <ElectricBorder radius={16} className="shw-q2-item h-full">
            <div className="flex h-full flex-col rounded-2xl border border-white/10 bg-[#0c1224] p-5">
              <div className="flex items-baseline justify-between">
                <p className="text-[11px] font-medium tracking-wide text-white/45 uppercase">
                  Produzione ora
                </p>
                <p className="text-brand-300 text-xs font-semibold">↑ resa 96%</p>
              </div>
              <p className="font-display mt-2 text-4xl leading-none font-bold tabular-nums">
                <span className="shw-q2-kw">0</span>
                <span className="ml-1 text-lg font-semibold text-white/50">kW</span>
              </p>
              {/* Curva che si disegna */}
              <div className="relative mt-4 min-h-0 flex-1">
                <svg viewBox="0 0 300 92" className="h-full w-full" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="q2area" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0 80 L40 70 L80 74 L120 44 L160 52 L200 26 L240 34 L300 10 L300 92 L0 92 Z"
                    fill="url(#q2area)"
                  />
                  <path
                    className="shw-q2-area fill-none"
                    d="M0 80 L40 70 L80 74 L120 44 L160 52 L200 26 L240 34 L300 10"
                    stroke="var(--accent)"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <p className="mt-3 text-[11px] text-white/40">
                Ultime 6 ore · picco 8,9 kW alle 13:20
              </p>
            </div>
          </ElectricBorder>

          {/* KPI a destra — 3 card con lo STESSO trattamento superficie */}
          <div className="flex flex-col gap-4">
            {KPI.map((k) => (
              <div
                key={k.l}
                className="shw-q2-item flex flex-1 flex-col justify-center rounded-2xl border border-white/10 bg-white/[0.04] p-4"
              >
                <p className="text-[11px] font-medium tracking-wide text-white/45 uppercase">
                  {k.l}
                </p>
                <div className="mt-2 flex items-end justify-between">
                  <p className="font-display text-2xl leading-none font-bold tabular-nums">
                    <span className={k.cls}>0</span>
                    {k.suf}
                  </p>
                  <span className="text-brand-300 text-[11px] font-bold">{k.d}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fila TILE moduli: stessa superficie, si accendono a onda (stagger) */}
        <div className="shw-q2-item rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-medium tracking-wide text-white/45 uppercase">
              Stringa moduli · 24 pannelli
            </p>
            <span className="text-brand-300 text-[11px] font-semibold">tutti attivi</span>
          </div>
          <div className="mt-3 flex gap-1.5">
            {Array.from({ length: 24 }).map((_, i) => (
              <span
                key={i}
                className="shw-q2-tile h-7 flex-1 rounded-[4px] bg-gradient-to-t from-[var(--accent)]/45 to-[#22d3ee] shadow-[0_0_10px_-3px_rgba(34,211,238,0.6)]"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
