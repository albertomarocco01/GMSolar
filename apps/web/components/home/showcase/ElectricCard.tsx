/**
 * @descrizione  Pezzo 03 della carrellata — CARD ELETTRICA («Neon»): isola SCURA
 *   su fondo scena chiaro. Bordo a CONIC-GRADIENT che ruota (glow lime/ciano) via
 *   animazione CSS `.shw-conic-spin` (definita nella scena): si congela con la
 *   pausa globale — `html[data-presentation-paused] #top * { animation-play-state:
 *   paused }` di AutoScroll — e si spegne sotto reduced-motion (media query nella
 *   scena). Dentro un dato "live": il numero conta (`.shw-elec-num`, countUp) e la
 *   barra cresce (`.shw-elec-bar`, scaleX). Scanline sottile decorativa.
 *
 *   Contrasto AA: testo bianco/90 su ink #0a0f1e. Modo "grid": stato finale
 *   statico (numero già scritto, barra piena); il bordo continua a ruotare (loop
 *   decorativo, pausa-safe).
 */
import { cn } from "@gmgroup/lib/utils";

export default function ElectricCard({ mode = "stage" }: { mode?: "stage" | "grid" }) {
  const anim = mode === "stage";
  return (
    <div className="relative h-full w-full overflow-hidden rounded-3xl bg-[#0a0f1e] shadow-[0_20px_60px_-18px_rgba(10,15,30,0.7)]">
      {/* Anello conico rotante: elemento sovradimensionato, ruota, ritagliato dal
          bordo della card. Un pannello interno lascia scoperto solo ~1.5px di ring. */}
      <div
        aria-hidden
        className="shw-conic-spin absolute -inset-[60%] -z-0"
        style={{
          background:
            "conic-gradient(from 0deg, transparent 0deg, var(--accent) 60deg, #22d3ee 120deg, transparent 180deg, transparent 300deg, var(--accent) 360deg)",
        }}
      />
      {/* Pannello interno (copre il conico, lascia il ring sul bordo) + glow. */}
      <div className="absolute inset-[1.5px] rounded-[calc(1.5rem-1.5px)] bg-[#0a0f1e] shadow-[0_0_40px_-6px_rgba(34,211,238,0.35)_inset]" />

      {/* Scanline sottile decorativa (statica). */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, #fff 0 1px, transparent 1px 4px)",
        }}
      />

      <div className="relative flex h-full flex-col justify-between p-[8%]">
        <div className="flex items-center gap-2">
          <span className="bg-accent h-2 w-2 animate-none rounded-full shadow-[0_0_10px_2px_var(--accent)]" />
          <span className="font-mono text-[10px] font-semibold tracking-[0.24em] text-white/60 uppercase">
            Produzione ora
          </span>
        </div>

        <div>
          <p className="font-display flex items-end gap-1 text-white tabular-nums">
            <span className={cn("text-5xl font-bold tracking-tight", anim && "shw-elec-num")}>
              {anim ? "0" : "1.284"}
            </span>
            <span className="text-accent-ink mb-1 text-lg font-semibold">kWh</span>
          </p>
          {/* Barra "live" che cresce. */}
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className={cn(
                "h-full rounded-full bg-gradient-to-r from-[var(--accent)] to-[#22d3ee]",
                anim && "shw-elec-bar",
              )}
              style={{ transformOrigin: "left", transform: anim ? "scaleX(0)" : "scaleX(0.78)" }}
            />
          </div>
          <p className="mt-2 text-[11px] font-medium text-white/50">+12% rispetto a ieri</p>
        </div>
      </div>

      <span className="absolute top-4 left-4 z-20 rounded-full border border-white/15 bg-white/10 px-3 py-1 font-mono text-[10px] font-semibold tracking-[0.18em] text-[#7fe3f5] uppercase">
        Neon
      </span>
    </div>
  );
}
