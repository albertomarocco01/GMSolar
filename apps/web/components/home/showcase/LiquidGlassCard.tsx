/**
 * @descrizione  Pezzo 01 della carrellata «Interfacce moderne» — VETRO LIQUIDO
 *   (stile Apple 2025). Pannello traslucido che galleggia su blob colorati
 *   PRE-sfocati (filtro statico sui MIEI elementi, NON backdrop-filter: così il
 *   pezzo trasla col binario come un unico layer composito → 60fps in scrub).
 *   La "rifrazione" è simulata a strati (gradienti + bordo speculare 1px/20) e
 *   da un HIGHLIGHT speculare che scivola via (`.shw-lg-spec`, transform-only).
 *
 *   Due modi:
 *     - "stage": nel binario, grande; l'highlight parte fuori campo (lo setta la
 *       scena in build) e scivola via allo scrub.
 *     - "grid":  nel finale compatto, statico; l'highlight resta a riposo (nessun
 *       hook `.shw-*` → la timeline non lo tocca, stato leggibile a progress(1)).
 */
import { cn } from "@gmgroup/lib/utils";

export default function LiquidGlassCard({ mode = "stage" }: { mode?: "stage" | "grid" }) {
  const anim = mode === "stage";
  return (
    <div className="relative h-full w-full overflow-hidden rounded-3xl border border-white/40 shadow-[0_20px_60px_-20px_rgba(11,16,32,0.35)]">
      {/* Fondo: blob colorati PRE-sfocati (filtro statico, rasterizzato una volta).
          È ciò che il "vetro" sopra distorce — senza toccare il backdrop di pagina. */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-surface">
        <div
          className="absolute inset-0 blur-2xl"
          style={{
            background:
              "radial-gradient(40% 55% at 22% 30%, var(--accent) 0%, transparent 70%)," +
              "radial-gradient(45% 50% at 82% 70%, #22d3ee 0%, transparent 72%)," +
              "radial-gradient(40% 45% at 60% 20%, #a3e635 0%, transparent 70%)",
          }}
        />
      </div>

      {/* Pannello di vetro: strati traslucidi + highlight speculare in alto. */}
      <div className="absolute inset-5 rounded-[1.4rem] border border-white/50 bg-gradient-to-br from-white/55 to-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),inset_0_-1px_0_rgba(255,255,255,0.25)]">
        {/* Riflesso che scivola: barra chiara inclinata (solo transform → scrub-safe). */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[1.4rem]">
          <div
            className={cn(
              "absolute top-0 -left-1/3 h-full w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/70 to-transparent",
              anim && "shw-lg-spec",
            )}
            style={anim ? undefined : { transform: "translateX(190%) skewX(-12deg)", opacity: 0.5 }}
          />
        </div>

        {/* Contenuto: controllo "flottante" da liquid glass. */}
        <div className="relative flex h-full flex-col justify-between p-[8%]">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-full border border-white/60 bg-white/50 text-foreground shadow-sm">
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
            <div className="min-w-0">
              <p className="font-display text-foreground text-lg font-bold tracking-tight">
                Pannello vetro
              </p>
              <p className="text-muted text-xs font-medium">Superficie traslucida · live</p>
            </div>
          </div>

          {/* Segmented control fintamente selezionato (statico, decorativo). */}
          <div className="flex gap-1.5 rounded-full border border-white/50 bg-white/30 p-1">
            {["Auto", "Chiaro", "Scuro"].map((t, i) => (
              <span
                key={t}
                className={cn(
                  "flex-1 rounded-full py-1.5 text-center text-[11px] font-semibold",
                  i === 0
                    ? "bg-accent text-accent-contrast shadow-sm"
                    : "text-foreground/70",
                )}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      <Caption>Vetro liquido</Caption>
    </div>
  );
}

/** Micro-caption italiana del pezzo (racconto, non etichetta tecnica). */
function Caption({ children }: { children: React.ReactNode }) {
  return (
    <span className="border-border bg-background/80 text-accent-ink absolute top-4 left-4 z-20 rounded-full border px-3 py-1 font-mono text-[10px] font-semibold tracking-[0.18em] uppercase">
      {children}
    </span>
  );
}
