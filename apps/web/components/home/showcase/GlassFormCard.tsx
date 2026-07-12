/**
 * @descrizione  Pezzo 02 della carrellata — GLASSMORFISMO classico: pannello
 *   smerigliato su blob colorati sfocati, con dentro un MINI-FORM VIVO. Allo
 *   scrub il cursore finto fa da dito: il campo si compila da solo
 *   (`.shw-glass-txt`, typeInField), la label flotta in alto (`.shw-glass-label`)
 *   e il bottone «Invia» si preme (`.shw-glass-btn`, pressButton) scoprendo la
 *   conferma (`.shw-glass-ok`).
 *
 *   Come per gli altri pezzi, il "vetro" sfoca i MIEI blob (filtro statico), non
 *   il backdrop di pagina → il pezzo trasla col binario senza ricalcolare blur.
 *   Modo "grid": tutto a riposo nello stato finale (nessun hook `.shw-*`).
 */
import { cn } from "@gmgroup/lib/utils";

export default function GlassFormCard({ mode = "stage" }: { mode?: "stage" | "grid" }) {
  const anim = mode === "stage";
  return (
    <div className="relative h-full w-full overflow-hidden rounded-3xl border border-white/40 shadow-[0_20px_60px_-20px_rgba(11,16,32,0.35)]">
      {/* Blob colorati pre-sfocati sotto il vetro. */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-surface">
        <div
          className="absolute inset-0 blur-2xl"
          style={{
            background:
              "radial-gradient(45% 55% at 18% 78%, var(--accent) 0%, transparent 70%)," +
              "radial-gradient(50% 55% at 85% 22%, #34d399 0%, transparent 72%)",
          }}
        />
      </div>

      {/* Pannello smerigliato. */}
      <div className="absolute inset-5 flex flex-col justify-center gap-4 rounded-[1.4rem] border border-white/50 bg-white/45 p-[8%] shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
        <p className="font-display text-foreground text-lg font-bold tracking-tight">Richiedi contatto</p>

        {/* Campo con label flottante. */}
        <div className="relative rounded-xl border border-white/60 bg-white/50 px-3 pt-5 pb-2">
          <span
            className={cn(
              "text-muted pointer-events-none absolute left-3 origin-left text-sm font-medium",
              anim ? "shw-glass-label top-3.5" : "top-1.5 scale-[0.72] text-[11px] text-accent-ink",
            )}
          >
            Email
          </span>
          {/* Testo che si "digita" (clip-path a scatti); a riposo interamente visibile. */}
          <span className="text-foreground block overflow-hidden text-sm font-semibold">
            <span className={cn("inline-block whitespace-nowrap", anim && "shw-glass-txt")}>
              mario.rossi@gmail.com
            </span>
          </span>
        </div>

        {/* Bottone + conferma. */}
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "shw-glass-btn bg-accent text-accent-contrast rounded-xl px-5 py-2.5 text-sm font-bold shadow-sm",
              !anim && "shw-glass-btn-static",
            )}
          >
            Invia
          </span>
          <span
            className={cn(
              "text-accent-ink inline-flex items-center gap-1.5 text-sm font-semibold",
              anim && "shw-glass-ok",
            )}
            style={anim ? { opacity: 0 } : undefined}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={3}>
              <path d="M4 12l5 5L20 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Inviato
          </span>
        </div>
      </div>

      <span className="border-border bg-background/80 text-accent-ink absolute top-4 left-4 z-20 rounded-full border px-3 py-1 font-mono text-[10px] font-semibold tracking-[0.18em] uppercase">
        Glassmorphism
      </span>
    </div>
  );
}
