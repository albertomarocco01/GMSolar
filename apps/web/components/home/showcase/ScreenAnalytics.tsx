/**
 * @descrizione  Schermata 01 della carrellata «Interfacce moderne» — DASHBOARD
 *   ANALYTICS, tema SCURO. UI densa: header con tab e stato live, riga di 3 KPI
 *   con delta e sparkline, pannello principale «elettrico» (bordo conic rotante)
 *   con grafico ad area + barre, lista canali con progress. Nessuno stato React:
 *   l'animazione la guida la scena via classi `.shw-s0-*` (stagger, countUp,
 *   drawPath, scaleY). Il bordo conic è un loop CSS decorativo (pausa-safe).
 *
 *   Layer full-frame (`absolute inset-0`): la scena lo mostra/sfuma nel morph.
 */
const CANALI = [
  { nome: "Ricerca", val: "48%", w: "82%" },
  { nome: "Social", val: "31%", w: "54%" },
  { nome: "Diretto", val: "21%", w: "36%" },
] as const;

const KPI = [
  { label: "Ricavi", pre: "€ ", suf: "", cls: "shw-s0-kpi1", delta: "+18%" },
  { label: "Sessioni", pre: "", suf: "", cls: "shw-s0-kpi2", delta: "+7%" },
  { label: "Conversione", pre: "", suf: "%", cls: "shw-s0-kpi3", delta: "+0,4" },
] as const;

export default function ScreenAnalytics() {
  return (
    <div className="shw-s0 absolute inset-0 overflow-hidden bg-[#0a0f1e] text-white">
      {/* Trama a puntini tenue */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
          backgroundSize: "26px 26px",
        }}
      />
      <div className="relative flex h-full flex-col gap-3.5 p-7">
        {/* Header */}
        <div className="shw-s0-item flex items-center justify-between">
          <div>
            <p className="font-display text-lg font-bold tracking-tight">Panoramica</p>
            <p className="text-xs text-white/45">Ultimi 30 giorni · aggiornato ora</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-white/70">
              <span className="bg-accent h-1.5 w-1.5 rounded-full shadow-[0_0_8px_2px_var(--accent)]" />
              In tempo reale
            </span>
            <div className="flex gap-1 rounded-full border border-white/10 bg-white/5 p-1 text-[11px] font-semibold">
              {["Giorno", "Settimana", "Mese"].map((t, i) => (
                <span
                  key={t}
                  className={
                    i === 1
                      ? "bg-accent text-accent-contrast rounded-full px-3 py-1"
                      : "px-3 py-1 text-white/55"
                  }
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Riga KPI */}
        <div className="grid grid-cols-3 gap-3">
          {KPI.map((k) => (
            <div
              key={k.label}
              className="shw-s0-item rounded-2xl border border-white/10 bg-white/[0.04] p-4"
            >
              <p className="text-[11px] font-medium tracking-wide text-white/45 uppercase">
                {k.label}
              </p>
              <div className="mt-1 flex items-end justify-between">
                <p className="font-display text-2xl font-bold tabular-nums">
                  {k.pre}
                  <span className={k.cls}>0</span>
                  {k.suf}
                </p>
                <span className="text-brand-300 mb-1 text-[11px] font-bold">{k.delta}</span>
              </div>
              {/* Sparkline statica */}
              <svg viewBox="0 0 120 26" className="mt-2 h-6 w-full" preserveAspectRatio="none">
                <polyline
                  points="0,20 20,14 40,16 60,8 80,12 100,4 120,7"
                  className="fill-none stroke-white/25"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          ))}
        </div>

        {/* Riga principale: hero elettrico + canali */}
        <div className="grid min-h-0 flex-1 grid-cols-[1.7fr_1fr] gap-3">
          {/* Hero elettrico: bordo conic rotante */}
          <div className="shw-s0-item shw-s0-hero relative overflow-hidden rounded-2xl">
            <div
              aria-hidden
              className="shw-conic-spin absolute -inset-[55%] -z-0"
              style={{
                background:
                  "conic-gradient(from 0deg, transparent 0deg, var(--accent) 55deg, #22d3ee 120deg, transparent 190deg, transparent 300deg, var(--accent) 360deg)",
              }}
            />
            <div className="absolute inset-[1.5px] rounded-[calc(1rem-1.5px)] bg-[#0c1224] shadow-[0_0_40px_-8px_rgba(34,211,238,0.35)_inset]" />
            <div className="relative flex h-full flex-col p-5">
              <div className="flex items-baseline justify-between">
                <p className="text-[11px] font-medium tracking-wide text-white/45 uppercase">
                  Ricavi giornalieri
                </p>
                <p className="text-brand-300 text-xs font-semibold">↑ 18% vs mese</p>
              </div>
              {/* Grafico ad area */}
              <div className="relative mt-2 min-h-0 flex-1">
                <svg viewBox="0 0 300 96" className="h-full w-full" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="s0area" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0 78 L43 60 L86 66 L129 40 L172 50 L215 24 L258 34 L300 12 L300 96 L0 96 Z"
                    fill="url(#s0area)"
                  />
                  <path
                    className="shw-s0-area fill-none"
                    d="M0 78 L43 60 L86 66 L129 40 L172 50 L215 24 L258 34 L300 12"
                    stroke="var(--accent)"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              {/* Barre settimana */}
              <div className="mt-3 flex h-10 items-end gap-1.5">
                {[52, 34, 68, 46, 82, 60, 74].map((h, i) => (
                  <span
                    key={i}
                    className="shw-s0-bar flex-1 rounded-t bg-gradient-to-t from-[var(--accent)]/40 to-[#22d3ee]"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Canali */}
          <div className="shw-s0-item flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <p className="text-[11px] font-medium tracking-wide text-white/45 uppercase">
              Sorgenti di traffico
            </p>
            {CANALI.map((c) => (
              <div key={c.nome}>
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-white/80">{c.nome}</span>
                  <span className="text-white/50 tabular-nums">{c.val}</span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div className="bg-accent h-full rounded-full" style={{ width: c.w }} />
                </div>
              </div>
            ))}
            <div className="mt-auto flex items-center gap-2 border-t border-white/10 pt-3">
              <div className="flex -space-x-2">
                {["#84cc16", "#22d3ee", "#a78bfa"].map((c) => (
                  <span
                    key={c}
                    className="h-6 w-6 rounded-full border-2 border-[#0a0f1e]"
                    style={{ background: c }}
                  />
                ))}
              </div>
              <span className="text-[11px] text-white/50">+128 utenti attivi</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
