"use client";

/**
 * @descrizione  Modulo animato "Segnalazioni": mini-form che si auto-compila
 *   (tipo Bug, titolo, priorità Alta), bottone Invia con pulse scale, toast di
 *   conferma dal basso e riga-ticket con cambio stato «Aperta» → «In lavorazione».
 *   Loop ~5.5 s (repeat: -1, repeatDelay: 0.8). Canale visivo per inviare
 *   problemi o richieste di modifica con tracciamento stato integrato.
 */
import { gsap } from "@gmgroup/lib/gsap";
import { useSelfPlay } from "@/components/home/useSelfPlay";

const TITLE = "Bottone checkout non risponde";
const CHARS = TITLE.split("");

// ─── build ───────────────────────────────────────────────────────────────────

function build(root: HTMLDivElement): gsap.core.Timeline {
  const q = (sel: string) => root.querySelector(sel);
  const qa = (sel: string) => root.querySelectorAll(sel);

  const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.8 });

  tl
    // 0.3 s — Tipo: «—» → «Bug»
    .fromTo(q(".seg-tipo-dash"), { opacity: 1 }, { opacity: 0, duration: 0.2 }, 0.3)
    .fromTo(q(".seg-tipo-bug"), { opacity: 0 }, { opacity: 1, duration: 0.25 }, 0.45)

    // 1.0 s — Titolo: caratteri appaiono uno a uno (30 chars × 0.04 s = 1.2 s)
    .fromTo(
      qa(".seg-char"),
      { opacity: 0 },
      {
        opacity: 1,
        stagger: { each: 0.04, from: "start" },
        duration: 0.01,
        ease: "none",
      },
      1.0,
    )

    // 2.5 s — Priorità: «—» → «Alta»
    .fromTo(q(".seg-prio-dash"), { opacity: 1 }, { opacity: 0, duration: 0.2 }, 2.5)
    .fromTo(q(".seg-prio-alta"), { opacity: 0 }, { opacity: 1, duration: 0.25 }, 2.65)

    // 3.1 s — Bottone Invia: pulse scale
    .fromTo(q(".seg-invia"), { scale: 1 }, { scale: 1.06, duration: 0.18, ease: "power2.out" }, 3.1)
    .to(q(".seg-invia"), { scale: 1, duration: 0.22, ease: "power2.inOut" }, 3.28)

    // 3.7 s — Toast: entra dal basso
    .fromTo(
      q(".seg-toast"),
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" },
      3.7,
    )

    // 4.2 s — Ticket row: appare
    .fromTo(
      q(".seg-ticket"),
      { opacity: 0, y: 8 },
      { opacity: 1, y: 0, duration: 0.35, ease: "power3.out" },
      4.2,
    )

    // 4.8 s — Stato: «Aperta» → «In lavorazione»
    .fromTo(q(".seg-badge-aperta"), { opacity: 1 }, { opacity: 0, duration: 0.2 }, 4.8)
    .fromTo(q(".seg-badge-working"), { opacity: 0 }, { opacity: 1, duration: 0.25 }, 4.95)

    // 5.2 s — Toast: esce silenziosamente prima del loop
    .fromTo(
      q(".seg-toast"),
      { opacity: 1, y: 0 },
      { opacity: 0, y: -4, duration: 0.3, ease: "power2.in" },
      5.2,
    );

  return tl;
}

// ─── componente ──────────────────────────────────────────────────────────────

export default function SegnalazioniModule() {
  const ref = useSelfPlay<HTMLDivElement>((root) => build(root), { holdMs: 6500 });

  return (
    <div
      ref={ref}
      aria-hidden
      className="border-border bg-surface text-foreground shadow-lift relative min-h-[clamp(22rem,46vh,30rem)] w-full overflow-hidden rounded-2xl border p-5 sm:p-6"
    >
      {/* Header */}
      <p className="text-muted mb-3 text-xs font-semibold tracking-widest uppercase">
        Segnalazioni · canale diretto
      </p>

      {/* ── Form card ──────────────────────────────────────────────────── */}
      <div className="bg-surface-2 border-border mb-4 rounded-xl border p-4">
        <p className="text-foreground mb-3 text-sm font-semibold">Nuova segnalazione</p>

        {/* Tipo */}
        <div className="mb-2 flex items-center gap-3">
          <span className="text-muted w-14 shrink-0 text-xs">Tipo</span>
          <div className="relative inline-flex items-center">
            <span className="seg-tipo-dash text-muted text-xs">—</span>
            <span className="seg-tipo-bug pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap text-amber-800 opacity-0">
              Bug
            </span>
          </div>
        </div>

        {/* Titolo */}
        <div className="mb-2 flex items-start gap-3">
          <span className="text-muted w-14 shrink-0 pt-0.5 text-xs">Titolo</span>
          <div className="border-border min-h-[1.25rem] flex-1 border-b pb-0.5 text-sm leading-snug">
            {CHARS.map((c, i) => (
              <span key={i} className="seg-char opacity-0">
                {c === " " ? " " : c}
              </span>
            ))}
          </div>
        </div>

        {/* Priorità */}
        <div className="mb-4 flex items-center gap-3">
          <span className="text-muted w-14 shrink-0 text-xs">Priorità</span>
          <div className="relative inline-flex items-center">
            <span className="seg-prio-dash text-muted text-xs">—</span>
            <span className="seg-prio-alta bg-accent-soft text-accent-ink pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 rounded-full px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap opacity-0">
              Alta
            </span>
          </div>
        </div>

        {/* Bottone Invia */}
        <button
          type="button"
          className="seg-invia bg-accent text-accent-contrast w-full origin-center rounded-lg py-2 text-sm font-semibold"
        >
          Invia segnalazione
        </button>
      </div>

      {/* ── Lista ticket ───────────────────────────────────────────────── */}
      <div>
        <p className="text-muted mb-2 text-xs font-semibold tracking-widest uppercase">
          Tracciamento
        </p>

        {/* Riga ticket — appare dopo l'invio */}
        <div className="seg-ticket border-border bg-surface-2 flex items-center justify-between gap-3 rounded-lg border px-3 py-2 opacity-0">
          <div className="min-w-0">
            <p className="text-muted font-mono text-[10px] font-bold">SEG-2026-0042</p>
            <p className="text-foreground truncate text-xs font-medium">
              Bottone checkout non risponde
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            {/* Badge priorità */}
            <span className="bg-accent-soft text-accent-ink rounded-full px-2 py-0.5 text-[10px] font-semibold">
              Alta
            </span>
            {/* Badge stato — i due si alternano */}
            <div className="relative inline-flex h-5 items-center">
              <span className="seg-badge-aperta rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap text-sky-700">
                Aperta
              </span>
              <span className="seg-badge-working pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap text-emerald-700 opacity-0">
                In lavorazione
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Toast di conferma ──────────────────────────────────────────── */}
      <div className="seg-toast border-border bg-foreground text-background absolute right-5 bottom-5 left-5 flex items-center gap-3 rounded-xl border px-4 py-3 opacity-0 shadow-lg">
        <span className="text-base leading-none text-emerald-400" aria-hidden>
          ✓
        </span>
        <div>
          <p className="text-sm font-semibold">Ticket SEG-2026-0042 creato</p>
          <p className="text-xs opacity-60">Riceverai aggiornamenti sullo stato</p>
        </div>
      </div>
    </div>
  );
}
