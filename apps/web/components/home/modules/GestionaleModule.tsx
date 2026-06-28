"use client";

/**
 * @descrizione  Modulo demo "Gestionale AI" per la home scrollytelling (tema chiaro).
 *   Recita in loop (~5.3s + 0.8s repeatDelay) la sequenza:
 *   1) mini-tabella ordini entra in stagger fade+y;
 *   2) bolla utente compare con reveal clip-path (effetto digitazione);
 *   3) bolla AI risponde («2 ordini trovati»);
 *   4) le 2 righe che matchano si evidenziano, le altre si attenuano;
 *   5) badge «2 risultati» appare in spring.
 *   Reduced-motion → progress(1) → stato finale leggibile (via fromTo).
 */
import { gsap } from "@gmgroup/lib/gsap";
import { cn } from "@gmgroup/lib/utils";
import { useSelfPlay } from "@/components/home/useSelfPlay";

// ── Dati ─────────────────────────────────────────────────────────────────────

interface Ordine {
  cliente: string;
  importo: string;
  stato: "Aperto" | "Inviato" | "Chiuso";
  match: boolean;
}

const ORDINI: Ordine[] = [
  { cliente: "Rossi S.r.l.", importo: "62.000 €", stato: "Aperto", match: true },
  { cliente: "Bianchi S.p.A.", importo: "12.500 €", stato: "Inviato", match: false },
  { cliente: "Ferrari Group", importo: "87.000 €", stato: "Aperto", match: true },
  { cliente: "Conti S.r.l.", importo: "34.200 €", stato: "Chiuso", match: false },
  { cliente: "Masi & Figli", importo: "9.800 €", stato: "Inviato", match: false },
];

const STATO_CLS: Record<Ordine["stato"], string> = {
  Aperto: "text-amber-700",
  Inviato: "text-sky-700",
  Chiuso: "text-emerald-700",
};

// ── Timeline GSAP ─────────────────────────────────────────────────────────────

function build(root: HTMLDivElement): gsap.core.Timeline {
  // Scope selectors to root — evita cross-contamination se il modulo è
  // montato più volte (es. storybook o server-side render multipli).
  const rows = Array.from(root.querySelectorAll<HTMLElement>(".gi-row"));
  const noMatch = Array.from(root.querySelectorAll<HTMLElement>(".gi-row-no-match"));
  const overlays = Array.from(root.querySelectorAll<HTMLElement>(".gi-match-overlay"));
  const bubbleQ = root.querySelector<HTMLElement>(".gi-bubble-query");
  const queryText = root.querySelector<HTMLElement>(".gi-query-text");
  const bubbleR = root.querySelector<HTMLElement>(".gi-bubble-reply");
  const badge = root.querySelector<HTMLElement>(".gi-badge");

  const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.8 });

  // ① Righe entrano in stagger fade + slide-up ──────────────────────────────
  tl.fromTo(
    rows,
    { autoAlpha: 0, y: 10 },
    { autoAlpha: 1, y: 0, stagger: 0.08, duration: 0.35, ease: "power2.out" },
  );

  // ② Bolla utente compare + reveal "digitazione" (clip-path steps) ─────────
  tl.fromTo(
    bubbleQ,
    { autoAlpha: 0, y: 8 },
    { autoAlpha: 1, y: 0, duration: 0.28, ease: "power2.out" },
    "+=0.22",
  );
  // Ogni step rivela ~1 carattere: steps(22) ≈ 42 char / ~2 char per step
  tl.fromTo(
    queryText,
    { clipPath: "inset(0 100% 0 0)" },
    { clipPath: "inset(0 0% 0 0)", duration: 1.0, ease: "steps(22)" },
  );

  // ③ Bolla AI risponde ─────────────────────────────────────────────────────
  tl.fromTo(
    bubbleR,
    { autoAlpha: 0, scale: 0.9 },
    { autoAlpha: 1, scale: 1, duration: 0.32, ease: "back.out(1.4)" },
    "+=0.18",
  );

  // ④ Evidenzia match + attenua no-match (simultanei via "<") ───────────────
  tl.to(overlays, { opacity: 1, duration: 0.45, ease: "power2.out" }, "+=0.22");
  tl.to(noMatch, { opacity: 0.4, duration: 0.35, ease: "power1.inOut" }, "<");

  // ⑤ Badge "2 risultati" in spring ─────────────────────────────────────────
  tl.fromTo(
    badge,
    { autoAlpha: 0, scale: 0.75 },
    { autoAlpha: 1, scale: 1, duration: 0.32, ease: "back.out(1.6)" },
    "+=0.1",
  );

  // Pausa allo stato finale prima del loop (estende la durata della timeline)
  tl.set({}, {}, "+=1.55");

  return tl;
}

// ── Componente ────────────────────────────────────────────────────────────────

export default function GestionaleModule() {
  const ref = useSelfPlay<HTMLDivElement>((root) => build(root), { holdMs: 6500 });

  return (
    <div
      ref={ref}
      aria-hidden
      className="border-border bg-surface text-foreground shadow-lift relative min-h-[clamp(22rem,46vh,30rem)] w-full overflow-hidden rounded-2xl border p-5 sm:p-6"
    >
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Icona: griglia 2×2 con i quadranti accent */}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <rect
              x="0.5"
              y="0.5"
              width="6"
              height="6"
              rx="1.25"
              className="fill-accent-ink"
              opacity="0.75"
            />
            <rect
              x="9.5"
              y="0.5"
              width="6"
              height="6"
              rx="1.25"
              className="fill-accent-ink"
              opacity="0.4"
            />
            <rect
              x="0.5"
              y="9.5"
              width="6"
              height="6"
              rx="1.25"
              className="fill-accent-ink"
              opacity="0.4"
            />
            <rect
              x="9.5"
              y="9.5"
              width="6"
              height="6"
              rx="1.25"
              className="fill-accent-ink"
              opacity="0.75"
            />
          </svg>
          <span className="text-foreground text-sm font-semibold">Gestionale ordini</span>
        </div>

        {/* Badge — inizialmente nascosto, rivelato da GSAP allo step ⑤ */}
        <span className="gi-badge bg-accent text-accent-contrast invisible rounded-full px-2.5 py-0.5 text-xs font-semibold">
          2 risultati
        </span>
      </div>

      {/* ── Mini-tabella ────────────────────────────────────────────────── */}
      <div className="border-border mb-4 overflow-hidden rounded-xl border">
        {/* Intestazione colonne */}
        <div className="bg-surface-2 border-border text-muted grid grid-cols-3 gap-2 border-b px-3 py-2 text-[11px] font-semibold tracking-wider uppercase">
          <span>Cliente</span>
          <span>Importo</span>
          <span>Stato</span>
        </div>

        {/* Righe dati */}
        <div className="divide-border divide-y">
          {ORDINI.map((o, i) => (
            <div
              key={i}
              className={cn(
                "gi-row relative grid grid-cols-3 gap-2 px-3 py-2.5 text-sm",
                o.match ? "gi-row-match" : "gi-row-no-match",
              )}
            >
              {/* Overlay accent-soft per le righe che matchano la query.
                  opacity iniziale: 0; GSAP la porta a 1 allo step ④. */}
              {o.match && (
                <span
                  className="gi-match-overlay bg-accent-soft border-accent pointer-events-none absolute inset-0 border-l-[3px] opacity-0"
                  aria-hidden
                />
              )}

              <span className="text-foreground relative truncate font-medium">{o.cliente}</span>
              <span className="text-foreground relative font-mono">{o.importo}</span>
              <span className={cn("relative text-xs font-semibold", STATO_CLS[o.stato])}>
                {o.stato}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bolla utente (query) ─────────────────────────────────────────── */}
      {/* invisible = visibility:hidden prima che GSAP la riveli (step ②) */}
      <div className="gi-bubble-query invisible mb-2 flex items-start gap-2">
        <span className="text-muted bg-surface-2 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold">
          U
        </span>
        <div className="bg-surface-2 text-foreground max-w-[85%] rounded-2xl rounded-tl-sm px-3 py-2 text-sm">
          {/* Il testo viene rivelato da sinistra a destra con clip-path steps */}
          <span className="gi-query-text block">
            Mostrami gli ordini aperti sopra 50.000&nbsp;€
          </span>
        </div>
      </div>

      {/* ── Bolla AI (risposta) ──────────────────────────────────────────── */}
      <div className="gi-bubble-reply invisible flex items-start gap-2">
        <span className="bg-accent text-accent-contrast mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[9px] font-bold tracking-tight">
          AI
        </span>
        <div className="bg-accent-soft max-w-[85%] rounded-2xl rounded-tl-sm px-3 py-2 text-sm">
          <span className="text-accent-ink font-medium">2 ordini trovati</span>
        </div>
      </div>
    </div>
  );
}
