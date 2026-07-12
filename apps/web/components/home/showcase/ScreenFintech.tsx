/**
 * @descrizione  Schermata 04 della carrellata — WALLET fintech in BENTO, tema
 *   CHIARO. UI densa a griglia: saldo con countUp (`.shw-s3-num`) e mini-grafico,
 *   carte impilate, lista movimenti, anello di spesa che si «disegna»
 *   (`.shw-s3-ring`, stroke-dashoffset) e riga di azioni rapide (una viene
 *   «premuta» dal cursore finto → `.shw-s3-act`). È l'ULTIMA schermata: a
 *   progress(1) resta completa e leggibile (stato reduced-motion).
 *
 *   Layer full-frame (`absolute inset-0`). Animazione via classi `.shw-s3-*`.
 */
const MOVIMENTI = [
  { m: "Rimborso viaggio", c: "Oggi · 09:24", a: "+ € 120,00", up: true },
  { m: "Abbonamento cloud", c: "Ieri · 20:11", a: "− € 14,99", up: false },
  { m: "Spesa alimentari", c: "Ieri · 18:40", a: "− € 63,20", up: false },
] as const;

export default function ScreenFintech() {
  return (
    <div className="shw-s3 bg-surface text-foreground absolute inset-0 overflow-hidden">
      <div className="grid h-full grid-cols-3 grid-rows-[1.15fr_1.15fr_auto] gap-3 p-7">
        {/* Saldo (col-span-2) */}
        <div className="shw-s3-item border-border col-span-2 flex flex-col rounded-2xl border bg-white p-5 shadow-[0_1px_2px_rgba(2,6,23,0.05)]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-muted text-xs font-semibold">Saldo disponibile</p>
              <p className="font-display mt-1 text-3xl font-bold tracking-tight tabular-nums">
                € <span className="shw-s3-num">0</span>
              </p>
              <p className="text-brand-600 mt-0.5 text-xs font-semibold">+ € 340 questo mese</p>
            </div>
            <div className="border-border flex gap-1 rounded-full border p-1 text-[11px] font-semibold">
              <span className="bg-accent text-accent-contrast rounded-full px-2.5 py-1">
                Mensile
              </span>
              <span className="text-muted px-2.5 py-1">Annuale</span>
            </div>
          </div>
          {/* Mini area chart */}
          <div className="relative mt-auto h-14">
            <svg viewBox="0 0 320 56" className="h-full w-full" preserveAspectRatio="none">
              <defs>
                <linearGradient id="s3area" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M0 44 L46 38 L92 42 L138 24 L184 30 L230 16 L276 22 L320 8 L320 56 L0 56 Z"
                fill="url(#s3area)"
              />
              <path
                d="M0 44 L46 38 L92 42 L138 24 L184 30 L230 16 L276 22 L320 8"
                className="fill-none"
                stroke="var(--accent)"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Carte */}
        <div className="shw-s3-item relative row-span-2 overflow-hidden rounded-2xl border border-white/10 bg-[#0b1020] p-5 text-white">
          <p className="text-[11px] font-semibold tracking-wide text-white/45 uppercase">
            Le tue carte
          </p>
          <div className="relative mt-4 h-full">
            <div className="absolute inset-x-2 top-2 h-28 rounded-xl bg-white/10" />
            <div
              className="absolute inset-x-0 top-0 h-32 rounded-xl p-4 shadow-[0_20px_40px_-16px_rgba(0,0,0,0.6)]"
              style={{ background: "linear-gradient(135deg, #84cc16 0%, #22d3ee 130%)" }}
            >
              <div className="text-accent-contrast flex justify-between">
                <span className="text-xs font-bold">Aura</span>
                <span className="text-xs font-semibold opacity-70">VISA</span>
              </div>
              <div className="mt-6 h-6 w-9 rounded bg-white/40" />
              <p className="text-accent-contrast mt-3 font-mono text-sm font-bold tracking-widest">
                •••• •••• •••• 4921
              </p>
            </div>
          </div>
        </div>

        {/* Movimenti (col-span-2) */}
        <div className="shw-s3-item border-border col-span-2 flex flex-col rounded-2xl border bg-white p-4">
          <div className="flex items-center justify-between">
            <p className="font-display text-sm font-bold">Movimenti recenti</p>
            <span className="text-accent-ink text-xs font-semibold">Vedi tutto</span>
          </div>
          <div className="mt-1 flex flex-1 flex-col justify-center divide-y divide-[var(--border)]">
            {MOVIMENTI.map((t) => (
              <div key={t.m} className="flex items-center gap-3 py-2">
                <span
                  className={`grid h-8 w-8 place-items-center rounded-full text-xs font-bold ${
                    t.up ? "bg-brand-100 text-brand-700" : "bg-surface-2 text-muted"
                  }`}
                >
                  {t.up ? "↓" : "↑"}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{t.m}</p>
                  <p className="text-muted text-[11px]">{t.c}</p>
                </div>
                <span
                  className={`text-sm font-bold tabular-nums ${t.up ? "text-brand-600" : "text-foreground"}`}
                >
                  {t.a}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Anello spesa */}
        <div className="shw-s3-item border-border flex items-center gap-4 rounded-2xl border bg-white p-4">
          <div className="relative h-20 w-20 shrink-0">
            <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
              <circle
                cx="18"
                cy="18"
                r="15"
                fill="none"
                stroke="var(--surface-2)"
                strokeWidth="4"
              />
              <circle
                className="shw-s3-ring"
                cx="18"
                cy="18"
                r="15"
                fill="none"
                stroke="var(--accent)"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 grid place-items-center">
              <span className="font-display text-sm font-bold">68%</span>
            </div>
          </div>
          <div className="min-w-0">
            <p className="text-muted text-xs font-semibold">Budget mensile</p>
            <p className="text-sm font-bold">€ 1.360 / € 2.000</p>
            <p className="text-muted mt-0.5 text-[11px]">Restano € 640</p>
          </div>
        </div>

        {/* Azioni rapide */}
        <div className="shw-s3-item col-span-3 flex gap-2">
          {["Invia", "Richiedi", "Ricarica", "Dettagli"].map((a, i) => (
            <button
              key={a}
              type="button"
              className={`flex-1 rounded-xl py-2.5 text-sm font-bold ${
                i === 0
                  ? "shw-s3-act bg-accent text-accent-contrast shadow-[0_8px_20px_-8px_var(--accent)]"
                  : "border-border text-foreground border bg-white"
              }`}
            >
              {a}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
