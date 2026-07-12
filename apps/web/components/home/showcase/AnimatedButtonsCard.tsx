/**
 * @descrizione  Pezzo 04 della carrellata — BOTTONI ANIMATI («Micro-interazioni»):
 *   tre bottoni, tre micro-interazioni diverse guidate dallo scrub (il cursore
 *   finto fa da dito):
 *     · Magnetico  — il bottone si sposta verso il cursore (`.shw-btnA`, x/y).
 *     · Riempimento — un fill scorre da sinistra (`.shw-btnB-fill`, scaleX).
 *     · Conferma   — morph etichetta → spinner → check (`.shw-btnC-*`).
 *   Solo transform/opacity → scrub-safe e 60fps. Modo "grid": stato finale a
 *   riposo (fill pieno, check visibile), nessun hook `.shw-*`.
 */
import { cn } from "@gmgroup/lib/utils";

export default function AnimatedButtonsCard({ mode = "stage" }: { mode?: "stage" | "grid" }) {
  const anim = mode === "stage";
  return (
    <div className="bg-surface border-border relative h-full w-full overflow-hidden rounded-3xl border shadow-[0_20px_60px_-24px_rgba(11,16,32,0.4)]">
      {/* Trama a puntini tenue (coerente col fondo scena). */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage: "radial-gradient(circle, rgb(11 16 32 / 0.05) 1px, transparent 1px)",
          backgroundSize: "18px 18px",
        }}
      />

      {/* Padding e gap dalla scala 4/8 (regola R3 n.4): azioni distanziate 16px. */}
      <div className="relative flex h-full flex-col justify-center gap-4 p-8">
        {/* ① Magnetico */}
        <button
          type="button"
          className={cn(
            "border-border bg-background text-foreground w-fit rounded-xl border px-5 py-2.5 text-sm font-bold shadow-sm",
            anim && "shw-btnA",
          )}
        >
          Magnetico
        </button>

        {/* ② Riempimento che scorre */}
        <span
          className={cn(
            "border-accent relative w-fit overflow-hidden rounded-xl border px-5 py-2.5 text-sm font-bold",
            anim && "shw-btnB",
          )}
        >
          <span
            aria-hidden
            className={cn("bg-accent absolute inset-0", anim && "shw-btnB-fill")}
            style={{ transformOrigin: "left", transform: anim ? "scaleX(0)" : "scaleX(1)" }}
          />
          {/* accent-contrast (scuro): leggibile sia sul fondo card sia sul fill lime. */}
          <span className="text-accent-contrast relative">Riempimento</span>
        </span>

        {/* ③ Conferma: label → spinner → check (stack sovrapposto) */}
        <span
          className={cn(
            "bg-accent text-accent-contrast relative grid w-fit min-w-[8.5rem] place-items-center rounded-xl px-5 py-2.5 text-sm font-bold shadow-sm",
            anim && "shw-btnC",
          )}
        >
          <span
            className={cn("col-start-1 row-start-1", anim && "shw-btnC-label")}
            style={anim ? undefined : { opacity: 0 }}
          >
            Conferma
          </span>
          {/* Spinner (solo stage): compare, gira e sparisce prima del check. */}
          {anim ? (
            <svg
              className="shw-btnC-spin col-start-1 row-start-1 h-5 w-5 fill-none stroke-current"
              style={{ opacity: 0 }}
              viewBox="0 0 24 24"
              strokeWidth={3}
              aria-hidden
            >
              <path d="M12 3a9 9 0 1 0 9 9" strokeLinecap="round" />
            </svg>
          ) : null}
          <svg
            className={cn(
              "col-start-1 row-start-1 h-5 w-5 fill-none stroke-current",
              anim && "shw-btnC-check",
            )}
            style={anim ? { opacity: 0 } : undefined}
            viewBox="0 0 24 24"
            strokeWidth={3}
            aria-hidden
          >
            <path d="M4 12l5 5L20 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>

      <span className="border-border bg-background/80 text-accent-ink absolute top-4 left-4 z-20 rounded-full border px-3 py-1 font-mono text-[11px] font-semibold tracking-[0.18em] uppercase">
        Micro-interazioni
      </span>
    </div>
  );
}
