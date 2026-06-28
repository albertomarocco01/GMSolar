"use client";

/**
 * @descrizione  Modulo demo "Gestionale AI" (tema chiaro) con MOVIMENTO
 *   ORIZZONTALE: una pila di 3 schermate (Panoramica → Clienti → Ordini) che
 *   scorre lateralmente (xPercent del track, GSAP — niente scroll-pin, niente
 *   freeze), poi sull'ultima recita la query in linguaggio naturale → filtro:
 *   bolla utente (effetto digitazione clip-path) → risposta AI → righe match
 *   evidenziate → badge "2 risultati". Reduced-motion → stato finale (vista
 *   Ordini con match) leggibile via fromTo.
 */
import { gsap } from "@gmgroup/lib/gsap";
import { cn } from "@gmgroup/lib/utils";
import { useSelfPlay } from "@/components/home/useSelfPlay";

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

const KPI = [
  { v: "23", l: "Ordini aperti" },
  { v: "1,2 M€", l: "Pipeline" },
  { v: "148", l: "Clienti" },
];

const CLIENTI = [
  { n: "Rossi S.r.l.", c: "Torino", v: "62.000 €" },
  { n: "Ferrari Group", c: "Modena", v: "87.000 €" },
  { n: "Bianchi S.p.A.", c: "Milano", v: "12.500 €" },
  { n: "Conti S.r.l.", c: "Roma", v: "34.200 €" },
];

function build(root: HTMLDivElement): gsap.core.Timeline {
  const q = <T extends Element>(s: string) => root.querySelector<T>(s);
  const qa = <T extends Element>(s: string) => Array.from(root.querySelectorAll<T>(s));
  const track = q<HTMLElement>(".gi-track");
  const view = q<HTMLElement>(".gi-view");
  const rows = qa<HTMLElement>(".gi-row");
  const noMatch = qa<HTMLElement>(".gi-row-no-match");
  const overlays = qa<HTMLElement>(".gi-match-overlay");
  const bubbleQ = q<HTMLElement>(".gi-bubble-query");
  const queryText = q<HTMLElement>(".gi-query-text");
  const bubbleR = q<HTMLElement>(".gi-bubble-reply");
  const badge = q<HTMLElement>(".gi-badge");
  const setView = (t: string) => () => {
    if (view) view.textContent = t;
  };

  const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.9 });

  // ① Schermata 1 — Panoramica: i KPI entrano
  tl.call(setView("Panoramica"));
  tl.fromTo(
    qa<HTMLElement>(".gi-kpi"),
    { autoAlpha: 0, y: 12 },
    { autoAlpha: 1, y: 0, stagger: 0.08, duration: 0.4, ease: "power2.out" },
    "+=0.1",
  );

  // ② Pan ORIZZONTALE → Clienti
  tl.to(
    track,
    { xPercent: -33.333, duration: 0.7, ease: "power2.inOut", onStart: setView("Clienti") },
    "+=0.9",
  );
  tl.fromTo(
    qa<HTMLElement>(".gi-client"),
    { autoAlpha: 0, x: 14 },
    { autoAlpha: 1, x: 0, stagger: 0.07, duration: 0.32, ease: "power2.out" },
    "<0.15",
  );

  // ③ Pan ORIZZONTALE → Ordini
  tl.to(
    track,
    { xPercent: -66.666, duration: 0.7, ease: "power2.inOut", onStart: setView("Ordini") },
    "+=0.9",
  );
  tl.fromTo(
    rows,
    { autoAlpha: 0, y: 10 },
    { autoAlpha: 1, y: 0, stagger: 0.08, duration: 0.32, ease: "power2.out" },
    "<0.15",
  );

  // ④ Query in linguaggio naturale (effetto digitazione) → risposta AI
  tl.fromTo(
    bubbleQ,
    { autoAlpha: 0, y: 8 },
    { autoAlpha: 1, y: 0, duration: 0.28, ease: "power2.out" },
    "+=0.25",
  );
  tl.fromTo(
    queryText,
    { clipPath: "inset(0 100% 0 0)" },
    { clipPath: "inset(0 0% 0 0)", duration: 0.9, ease: "steps(20)" },
  );
  tl.fromTo(
    bubbleR,
    { autoAlpha: 0, scale: 0.9 },
    { autoAlpha: 1, scale: 1, duration: 0.3, ease: "back.out(1.4)" },
    "+=0.15",
  );

  // ⑤ Evidenzia match / attenua il resto + badge
  tl.to(overlays, { opacity: 1, duration: 0.4, ease: "power2.out" }, "+=0.2");
  tl.to(noMatch, { opacity: 0.4, duration: 0.32, ease: "power1.inOut" }, "<");
  tl.fromTo(
    badge,
    { autoAlpha: 0, scale: 0.75 },
    { autoAlpha: 1, scale: 1, duration: 0.32, ease: "back.out(1.6)" },
    "+=0.1",
  );

  tl.set({}, {}, "+=1.4"); // respiro finale prima del loop

  return tl;
}

export default function GestionaleModule() {
  const ref = useSelfPlay<HTMLDivElement>((root) => build(root), { holdMs: 9000 });

  return (
    <div
      ref={ref}
      aria-hidden
      className="border-border bg-surface text-foreground shadow-lift relative min-h-[clamp(22rem,46vh,30rem)] w-full overflow-hidden rounded-2xl border p-5 sm:p-6"
    >
      {/* Header persistente: titolo + vista corrente + badge risultati */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-foreground text-sm font-semibold">Gestionale</span>
          <span className="bg-surface-2 text-muted gi-view rounded-full px-2 py-0.5 text-[11px] font-medium">
            Panoramica
          </span>
        </div>
        <span
          className="gi-badge bg-accent text-accent-contrast invisible rounded-full px-2.5 py-0.5 text-xs font-semibold"
          style={{ willChange: "transform, opacity" }}
        >
          2 risultati
        </span>
      </div>

      {/* Track orizzontale: 3 schermate larghe quanto il frame */}
      <div className="gi-track flex" style={{ willChange: "transform" }}>
        {/* ── Schermata 1: Panoramica (KPI) ── */}
        <div className="w-full shrink-0">
          <div className="grid grid-cols-3 gap-3">
            {KPI.map((k) => (
              <div key={k.l} className="gi-kpi border-border bg-background rounded-xl border p-4">
                <p className="text-accent-ink font-display text-2xl font-bold tabular-nums">
                  {k.v}
                </p>
                <p className="text-muted mt-1 text-xs">{k.l}</p>
              </div>
            ))}
          </div>
          <div className="border-border bg-background mt-3 flex h-28 items-end gap-2 rounded-xl border p-4">
            {[40, 62, 48, 78, 90, 70].map((h, i) => (
              <span
                key={i}
                className={cn("flex-1 rounded-t-sm", i === 4 ? "bg-accent" : "bg-accent/35")}
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>

        {/* ── Schermata 2: Clienti ── */}
        <div className="w-full shrink-0">
          <div className="border-border overflow-hidden rounded-xl border">
            {CLIENTI.map((c, i) => (
              <div
                key={i}
                className="gi-client border-border flex items-center justify-between border-b px-4 py-3 last:border-b-0"
              >
                <div className="flex items-center gap-3">
                  <span className="bg-accent-soft text-accent-ink flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold">
                    {c.n.charAt(0)}
                  </span>
                  <div>
                    <p className="text-foreground text-sm font-medium">{c.n}</p>
                    <p className="text-muted text-xs">{c.c}</p>
                  </div>
                </div>
                <span className="text-foreground font-mono text-sm">{c.v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Schermata 3: Ordini (con query AI) ── */}
        <div className="w-full shrink-0">
          <div className="border-border mb-3 overflow-hidden rounded-xl border">
            <div className="bg-surface-2 border-border text-muted grid grid-cols-3 gap-2 border-b px-3 py-2 text-[11px] font-semibold tracking-wider uppercase">
              <span>Cliente</span>
              <span>Importo</span>
              <span>Stato</span>
            </div>
            <div className="divide-border divide-y">
              {ORDINI.map((o, i) => (
                <div
                  key={i}
                  className={cn(
                    "gi-row relative grid grid-cols-3 gap-2 px-3 py-2 text-sm",
                    o.match ? "gi-row-match" : "gi-row-no-match",
                  )}
                >
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

          <div
            className="gi-bubble-query invisible mb-2 flex items-start gap-2"
            style={{ willChange: "transform, opacity" }}
          >
            <span className="text-muted bg-surface-2 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold">
              U
            </span>
            <div className="bg-surface-2 text-foreground max-w-[85%] rounded-2xl rounded-tl-sm px-3 py-1.5 text-sm">
              <span className="gi-query-text block">Ordini aperti sopra 50.000&nbsp;€</span>
            </div>
          </div>

          <div
            className="gi-bubble-reply invisible flex items-start gap-2"
            style={{ willChange: "transform, opacity" }}
          >
            <span className="bg-accent text-accent-contrast mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[9px] font-bold">
              AI
            </span>
            <div className="bg-accent-soft max-w-[85%] rounded-2xl rounded-tl-sm px-3 py-1.5 text-sm">
              <span className="text-accent-ink font-medium">2 ordini trovati</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
