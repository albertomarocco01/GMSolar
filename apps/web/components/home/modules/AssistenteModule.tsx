"use client";

/**
 * @descrizione  Modulo "Assistente AI" per la home scrollytelling: recita in loop
 *   un'interazione chat completa — domanda utente → indicatore di digitazione →
 *   risposta AI → generazione UI (skeleton → card con CTA) → chip azioni rapide.
 *   Solo transform/opacity, niente video/3D. Tematizzato sull'accent del "mondo"
 *   attivo (token CSS: --accent, --accent-ink, ecc.). Reduced-motion: salta al
 *   frame finale (utente + risposta + card + chip tutti visibili).
 * @indice
 * - build(root) → gsap.core.Timeline (repeat -1, ~5.4s/ciclo)
 * - AssistenteModule → default export, nessuna prop
 */

import { gsap } from "@gmgroup/lib/gsap";
import { useSelfPlay } from "@/components/home/useSelfPlay";

// ─── timeline ────────────────────────────────────────────────────────────────

/**
 * Costruisce e ritorna la timeline GSAP che "recita" l'interazione.
 * Usare .from/.fromTo perché useSelfPlay chiama tl.progress(1).pause()
 * in reduced-motion → lo stato finale deve essere completo e leggibile.
 */
function build(root: HTMLDivElement): gsap.core.Timeline {
  // Selettori scoped al root (evita collisioni con altri moduli)
  const q = (sel: string): Element => root.querySelector(sel)!;
  const qa = <T extends Element>(sel: string): T[] => gsap.utils.toArray<T>(sel, root);

  const userBubble = q(".ac-user-bubble");
  const typing = q(".ac-typing");
  const dots = qa<Element>(".ac-dot");
  const assistantBubble = q(".ac-assistant-bubble");
  const skeleton = q(".ac-skeleton");
  const card = q(".ac-card");
  const chips = qa<Element>(".ac-chip");

  const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.8 });

  // 1 — Bolla utente: slide da destra + fade-in
  tl.fromTo(
    userBubble,
    { autoAlpha: 0, x: 36 },
    { autoAlpha: 1, x: 0, duration: 0.45, ease: "power3.out" },
  );

  // 2 — "Sta scrivendo…": appare, poi 3 puntini saltellano in cascata
  tl.fromTo(typing, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.22 }, "+=0.1");
  tl.fromTo(
    dots,
    { y: 0 },
    {
      y: -4,
      duration: 0.2,
      ease: "power2.inOut",
      stagger: 0.14,
      yoyo: true,
      repeat: 2,
    },
  );

  // 3 — Risposta assistente (typing sparisce, bolla entra da sinistra)
  tl.to(typing, { autoAlpha: 0, duration: 0.18 }, "+=0.08");
  tl.fromTo(
    assistantBubble,
    { autoAlpha: 0, x: -20 },
    { autoAlpha: 1, x: 0, duration: 0.45, ease: "power3.out" },
    "<+=0.06",
  );

  // 4a — Skeleton card appare sotto la risposta
  tl.fromTo(
    skeleton,
    { autoAlpha: 0, y: 10 },
    { autoAlpha: 1, y: 0, duration: 0.32, ease: "power3.out" },
    "+=0.18",
  );
  // Breve pausa per mostrare lo stato "skeleton" (loading)
  tl.to({}, { duration: 0.62 });

  // 4b — Card reale: cross-fade + scale-up (skeleton esce, card entra)
  tl.to(skeleton, { autoAlpha: 0, duration: 0.22 });
  tl.fromTo(
    card,
    { autoAlpha: 0, scale: 0.9 },
    { autoAlpha: 1, scale: 1, duration: 0.38, ease: "back.out(1.5)" },
    "<",
  );

  // 5 — Chip suggerimento: entrano con stagger
  tl.fromTo(
    chips,
    { autoAlpha: 0, y: 8 },
    { autoAlpha: 1, y: 0, duration: 0.28, stagger: 0.12, ease: "power3.out" },
    "+=0.14",
  );

  // Pausa finale prima del loop
  tl.to({}, { duration: 0.88 });

  return tl;
}

// ─── componente ──────────────────────────────────────────────────────────────

export default function AssistenteModule() {
  const ref = useSelfPlay<HTMLDivElement>((root) => build(root), {
    holdMs: 6500,
  });

  return (
    <div
      ref={ref}
      aria-hidden
      className="border-border bg-surface text-foreground shadow-lift relative min-h-[clamp(22rem,46vh,30rem)] w-full overflow-hidden rounded-2xl border p-5 sm:p-6"
    >
      {/* Header chat */}
      <div className="border-border mb-4 flex items-center gap-2.5 border-b pb-3">
        <span className="bg-accent text-accent-contrast flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold tracking-tight">
          AI
        </span>
        <span className="text-sm font-semibold">Assistente GM Solar</span>
        <span className="text-muted ml-auto flex items-center gap-1.5 text-xs">
          <span className="bg-accent-ink h-1.5 w-1.5 rounded-full opacity-75" />
          Online
        </span>
      </div>

      {/* Area messaggi */}
      <div className="flex flex-col gap-3">
        {/* 1 — Bolla utente (allineata a destra) */}
        <div className="flex justify-end">
          <div className="ac-user-bubble bg-accent text-accent-contrast max-w-[80%] rounded-2xl rounded-br-sm px-4 py-2.5 text-sm leading-snug">
            Avete impianti per aziende?
          </div>
        </div>

        {/* 2 — Indicatore "sta scrivendo…" */}
        <div className="ac-typing flex items-center gap-1.5 px-1">
          <span className="ac-dot bg-accent-ink h-2 w-2 rounded-full" />
          <span className="ac-dot bg-accent-ink h-2 w-2 rounded-full" />
          <span className="ac-dot bg-accent-ink h-2 w-2 rounded-full" />
          <span className="text-muted ml-1 text-xs">sta scrivendo…</span>
        </div>

        {/* 3 — Bolla assistente (allineata a sinistra) */}
        <div className="flex justify-start">
          <div className="ac-assistant-bubble bg-surface-2 max-w-[85%] rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm leading-snug">
            Sì, progettiamo impianti industriali su misura.
          </div>
        </div>

        {/* 4 — Generazione UI: skeleton → card reale */}
        <div className="relative">
          {/* Skeleton (barre che pulsano = caricamento) */}
          <div className="ac-skeleton border-border rounded-xl border p-4">
            <div className="bg-surface-2 mb-2.5 h-3.5 w-2/3 animate-pulse rounded-full" />
            <div className="bg-surface-2 mb-2 h-2.5 w-full animate-pulse rounded-full" />
            <div className="bg-surface-2 h-2.5 w-3/4 animate-pulse rounded-full" />
            <div className="bg-surface-2 mt-3.5 h-8 w-24 animate-pulse rounded-lg" />
          </div>

          {/* Card reale: sovrapposta allo skeleton, scala in ingresso */}
          <div className="ac-card border-border bg-surface absolute inset-0 flex flex-col gap-2 rounded-xl border p-4">
            <p className="text-sm font-semibold">Impianti industriali</p>
            <p className="text-muted text-xs leading-relaxed">
              Soluzioni scalabili per uso commerciale e industriale, chiavi in mano.
            </p>
            <button
              type="button"
              className="bg-accent text-accent-contrast mt-auto w-fit rounded-lg px-3.5 py-1.5 text-xs font-semibold"
            >
              Vedi la sezione
            </button>
          </div>
        </div>
      </div>

      {/* 5 — Chip di azione rapida */}
      <div className="mt-3.5 flex flex-wrap gap-2">
        <span className="ac-chip border-accent text-accent-ink rounded-full border px-3.5 py-1.5 text-xs font-medium">
          Chiedi un preventivo
        </span>
        <span className="ac-chip border-accent text-accent-ink rounded-full border px-3.5 py-1.5 text-xs font-medium">
          Parla con un umano
        </span>
      </div>
    </div>
  );
}
