/**
 * @descrizione  Schermata 03 della carrellata — APP MUSICALE / player, tema
 *   SCURO (viola/indaco). UI densa: «now playing» con copertina, barra di
 *   avanzamento che cresce (`.shw-s2-prog`), controlli di trasporto, slider
 *   volume e VISUALIZER a barre (loop CSS `.shw-s2-eq`, pausa-safe); a destra la
 *   coda di riproduzione con brano attivo. Animazione via classi `.shw-s2-*`,
 *   nessuno stato React.
 *
 *   Layer full-frame (`absolute inset-0`): la scena lo mostra/sfuma nel morph.
 */
const CODA = [
  { t: "Onde di città", a: "Nova Atlas", d: "3:40", on: true },
  { t: "Vetro e pioggia", a: "Mira Sole", d: "4:12", on: false },
  { t: "Corrente calda", a: "Kavi", d: "2:58", on: false },
  { t: "Ultima fermata", a: "Nova Atlas", d: "3:21", on: false },
  { t: "Nord", a: "Halvo", d: "5:03", on: false },
] as const;

export default function ScreenMedia() {
  return (
    <div className="shw-s2 absolute inset-0 overflow-hidden text-white">
      {/* Fondo scuro con alone viola/indaco */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(70% 80% at 20% 10%, #241b45 0%, transparent 60%), radial-gradient(80% 90% at 90% 90%, #16213e 0%, transparent 55%), #0b1020",
        }}
      />
      <div className="relative grid h-full grid-cols-[1fr_1.05fr] gap-5 p-7">
        {/* Now playing */}
        <div className="flex min-h-0 flex-col gap-3">
          <div className="shw-s2-item flex items-center justify-between">
            <span className="text-[11px] font-semibold tracking-[0.2em] text-white/45 uppercase">
              In riproduzione
            </span>
            <div className="flex gap-2 text-white/45">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-white/5 text-xs">
                ⤮
              </span>
              <span className="text-accent grid h-7 w-7 place-items-center rounded-full bg-white/10 text-xs">
                ↻
              </span>
            </div>
          </div>
          {/* Copertina */}
          <div
            className="shw-s2-item shw-s2-hero relative min-h-0 flex-1 overflow-hidden rounded-2xl"
            style={{
              background: "linear-gradient(135deg, #a78bfa 0%, #6366f1 40%, #22d3ee 100%)",
            }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_70%_20%,rgba(255,255,255,0.35),transparent)]" />
            <div className="absolute bottom-4 left-4">
              <p className="font-display text-xl font-bold tracking-tight drop-shadow">
                Onde di città
              </p>
              <p className="text-sm text-white/80">Nova Atlas · Aurora</p>
            </div>
          </div>
          {/* Progress */}
          <div className="shw-s2-item">
            <div className="h-1.5 overflow-hidden rounded-full bg-white/15">
              <div
                className="shw-s2-prog bg-accent h-full rounded-full"
                style={{ transformOrigin: "left", transform: "scaleX(0.34)" }}
              />
            </div>
            <div className="mt-1.5 flex justify-between text-[11px] text-white/45 tabular-nums">
              <span>1:12</span>
              <span>3:40</span>
            </div>
          </div>
          {/* Controlli + volume + equalizer */}
          <div className="shw-s2-item flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-lg text-white/60">⏮</span>
              <span className="bg-accent text-accent-contrast grid h-11 w-11 place-items-center rounded-full text-lg shadow-[0_0_24px_-2px_var(--accent)]">
                ▶
              </span>
              <span className="text-lg text-white/60">⏭</span>
            </div>
            {/* Visualizer */}
            <div className="flex h-8 items-end gap-1">
              {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                <span
                  key={i}
                  className="shw-s2-eq w-1.5 rounded-full bg-gradient-to-t from-[#6366f1] to-[var(--accent)]"
                  style={{ height: "100%", animationDelay: `${i * 0.12}s` }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Coda */}
        <div className="shw-s2-item flex min-h-0 flex-col rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <div className="flex items-center justify-between">
            <p className="font-display text-sm font-bold">In coda</p>
            <span className="text-[11px] text-white/45">5 brani · 19 min</span>
          </div>
          <div className="mt-2 flex min-h-0 flex-1 flex-col gap-1 overflow-hidden">
            {CODA.map((b, i) => (
              <div
                key={b.t}
                className={`flex items-center gap-3 rounded-xl px-3 py-2 ${
                  b.on ? "bg-accent/10 ring-accent/40 ring-1" : ""
                }`}
              >
                <span
                  className={`w-4 text-center text-[11px] tabular-nums ${b.on ? "text-accent" : "text-white/35"}`}
                >
                  {b.on ? "♪" : i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p
                    className={`truncate text-sm font-semibold ${b.on ? "text-white" : "text-white/80"}`}
                  >
                    {b.t}
                  </p>
                  <p className="truncate text-[11px] text-white/45">{b.a}</p>
                </div>
                <span className="text-[11px] text-white/40 tabular-nums">{b.d}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
