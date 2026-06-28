"use client";

/**
 * @descrizione  Modulo "Ricarica EV" per la home scrollytelling: recita in loop
 *   l'esperienza dell'app GMobility — la AI trova la colonnina più vicina,
 *   disegna la rotta su una mini-mappa, segue il ricarica (20 → 80 %), calcola
 *   costo e tempo stimato, prenota lo stallo. Solo SVG + transform/opacity,
 *   niente video/3D. Reduced-motion: salta al frame finale (mappa, batteria
 *   all'80 %, costo e prenotazione tutti visibili).
 * @indice
 * - build(root) → gsap.core.Timeline (repeat -1, ~5.5 s/ciclo)
 * - RicaricaModule → default export, nessuna prop
 */

import { gsap } from "@gmgroup/lib/gsap";
import { useSelfPlay } from "@/components/home/useSelfPlay";

// ─── timeline ────────────────────────────────────────────────────────────────

/**
 * Costruisce e ritorna la timeline GSAP che "recita" l'interazione.
 * Usa .fromTo perché useSelfPlay chiama tl.progress(1).pause() in
 * reduced-motion → lo stato finale deve essere completo e leggibile.
 */
function build(root: HTMLDivElement): gsap.core.Timeline {
  const q = (sel: string): Element => root.querySelector(sel)!;

  const route = q("[data-route]") as SVGPathElement;
  const pin = q("[data-pin]") as HTMLElement;
  const bub1 = q("[data-bub1]") as HTMLElement;
  const batFill = q("[data-bat-fill]") as HTMLElement;
  const batPct = q("[data-bat-pct]") as HTMLElement;
  const costEl = q("[data-cost]") as HTMLElement;
  const timerEl = q("[data-timer]") as HTMLElement;
  const bub2 = q("[data-bub2]") as HTMLElement;

  // Imposta strokeDasharray per l'animazione "tratto-a-tratto"
  const pathLen = route.getTotalLength?.() ?? 120;
  gsap.set(route, { strokeDasharray: pathLen });

  // Proxy numerici per i contatori (onUpdate aggiorna il DOM)
  const batProxy = { v: 20 };
  const costProxy = { v: 0 };
  const minProxy = { v: 0 };

  const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.8 });

  // 1 – Rotta SVG: si disegna dal punto auto verso la colonnina (0 → 1.3 s)
  tl.fromTo(
    route,
    { strokeDashoffset: pathLen },
    { strokeDashoffset: 0, duration: 1.3, ease: "power2.inOut" },
    0,
  );

  // 2 – Pin colonnina: pulsazione (0.7 → 1.3 s)
  tl.to(pin, { scale: 1.35, duration: 0.22, yoyo: true, repeat: 3, ease: "sine.inOut" }, 0.7);

  // 3 – Bolla assistente «Trovata colonnina» (1.4 s)
  tl.fromTo(
    bub1,
    { autoAlpha: 0, y: 6 },
    { autoAlpha: 1, y: 0, duration: 0.35, ease: "back.out(1.5)" },
    1.4,
  );

  // 4 – Barra batteria 20 → 80 % + contatore (2.1 → 4.1 s)
  tl.fromTo(batFill, { width: "20%" }, { width: "80%", duration: 2.0, ease: "power1.inOut" }, 2.1);
  tl.to(
    batProxy,
    {
      v: 80,
      duration: 2.0,
      ease: "power1.inOut",
      onUpdate() {
        batPct.textContent = `${Math.round(batProxy.v)}%`;
      },
    },
    2.1,
  );

  // 5 – Ticker costo + timer (2.3 → 4.3 s)
  tl.fromTo([costEl, timerEl], { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2 }, 2.3);
  tl.to(
    costProxy,
    {
      v: 6.4,
      duration: 2.0,
      ease: "power1.inOut",
      onUpdate() {
        costEl.textContent = `${costProxy.v.toFixed(2).replace(".", ",")} €`;
      },
    },
    2.3,
  );
  tl.to(
    minProxy,
    {
      v: 18,
      duration: 2.0,
      ease: "power1.inOut",
      onUpdate() {
        timerEl.textContent = `${Math.round(minProxy.v)} min`;
      },
    },
    2.3,
  );

  // 6 – Bolla finale «Stallo prenotato ✓» (4.5 s)
  tl.fromTo(
    bub2,
    { autoAlpha: 0, y: 6 },
    { autoAlpha: 1, y: 0, duration: 0.35, ease: "back.out(1.5)" },
    4.5,
  );

  // La pausa finale è assorbita dal repeatDelay (0.8 s)
  return tl;
}

// ─── componente ──────────────────────────────────────────────────────────────

export default function RicaricaModule() {
  const ref = useSelfPlay<HTMLDivElement>((root) => build(root), {
    holdMs: 6500,
  });

  return (
    <div
      ref={ref}
      aria-hidden
      className="border-border bg-surface text-foreground shadow-lift relative min-h-[clamp(22rem,46vh,30rem)] w-full overflow-hidden rounded-2xl border p-5 sm:p-6"
    >
      {/* Label sezione */}
      <p className="text-muted mb-3 text-[11px] font-semibold tracking-widest uppercase">
        GMobility · Assistente bordo
      </p>

      {/* Cornice telefono verticale ≈ 16:33 */}
      <div
        className="border-border bg-background mx-auto flex flex-col overflow-hidden rounded-[2.5rem] border-[3px]"
        style={{ width: "min(10.5rem, 54%)", aspectRatio: "16 / 33" }}
      >
        {/* Notch / status bar */}
        <div className="bg-background flex shrink-0 items-center justify-between px-3 pt-2 pb-1">
          <span className="text-muted text-[7px]">09:41</span>
          <div className="bg-foreground h-[5px] w-10 rounded-full opacity-50" />
          <span className="text-muted text-[7px]">&#9679;&#9679;&#9679;</span>
        </div>

        {/* Area mappa */}
        <div className="bg-surface-2 relative flex-1 overflow-hidden">
          <svg
            viewBox="0 0 120 100"
            preserveAspectRatio="xMidYMid slice"
            className="absolute inset-0 h-full w-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern id="rm-grid" width="12" height="12" patternUnits="userSpaceOnUse">
                <path
                  d="M12 0H0V12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.35"
                  className="text-border"
                />
              </pattern>
            </defs>

            {/* Griglia mappa tenue */}
            <rect width="120" height="100" fill="url(#rm-grid)" opacity="0.7" />

            {/* Rotta verso la colonnina – strokeDashoffset animato */}
            <path
              data-route
              d="M 14 88 C 30 72, 52 60, 70 46 S 96 30, 108 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-accent-ink"
            />

            {/* Punto di partenza (auto) */}
            <circle cx="14" cy="88" r="4" className="fill-foreground opacity-60" />
          </svg>

          {/* Pin colonnina */}
          <div
            data-pin
            className="bg-accent absolute flex h-6 w-6 -translate-x-1/2 -translate-y-full items-center justify-center rounded-full shadow-md"
            style={{ top: "22%", left: "89%" }}
          >
            <span className="text-accent-contrast text-[9px] leading-none font-bold">&#9889;</span>
          </div>
        </div>

        {/* Pannello info inferiore */}
        <div className="bg-background shrink-0 space-y-[5px] p-2">
          {/* Bolla 1 – assistente: trova colonnina */}
          <div data-bub1 className="bg-accent-soft border-accent rounded-xl border px-2 py-[5px]">
            <p className="text-accent-ink text-[8px] leading-snug">
              Trovata colonnina ultra-rapida a&nbsp;1,2&nbsp;km
            </p>
          </div>

          {/* Barra batteria 20 → 80 % */}
          <div className="flex items-center gap-[5px]">
            <span className="text-accent-ink text-[9px]">&#9889;</span>
            <div className="bg-surface-2 relative h-[6px] flex-1 overflow-hidden rounded-full">
              <div
                data-bat-fill
                className="bg-accent absolute inset-y-0 left-0 rounded-full"
                style={{ width: "20%" }}
              />
            </div>
            <span
              data-bat-pct
              className="text-accent-ink w-[1.75rem] text-right text-[8px] tabular-nums"
            >
              20%
            </span>
          </div>

          {/* Costo stimato + timer */}
          <div className="flex items-center justify-between">
            <span data-cost className="text-accent-ink text-[9px] font-semibold tabular-nums">
              0,00&nbsp;&#8364;
            </span>
            <span data-timer className="text-muted text-[8px] tabular-nums">
              0&nbsp;min
            </span>
          </div>

          {/* Bolla 2 – stallo prenotato */}
          <div data-bub2 className="bg-accent rounded-xl px-2 py-[5px]">
            <p className="text-accent-contrast text-center text-[8px] leading-snug font-semibold">
              Stallo prenotato&nbsp;&#10003;
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
