"use client";

/**
 * @descrizione  Scena immersiva DASHBOARD multi-sito (tema CHIARO). Full-screen
 *   admin panel in light mode: sidebar con 4 voci (Contenuti / Prodotti / Visite /
 *   Ordini), topbar e track orizzontale a 4 schermate scrubbed dallo scroll.
 *   Il cursore naviga la sidebar e mostra ogni sezione in sequenza con interazione
 *   fedele: caricamento immagine, digitazione, aggiunta prodotto, contatori KPI,
 *   sparkline e righe ordine. Tono DESCRITTIVO. Usa il kit condiviso ./shared.
 *   Reduced-motion: timeline portata a progress(1) → stato finale leggibile.
 */
import { gsap } from "@gmgroup/lib/gsap";
import { useReducedMotion } from "@gmgroup/lib/motion";
import {
  ImmersiveStage,
  Say,
  say,
  cursorTo,
  clickZoom,
  useImmersiveScene,
  pressButton,
  typeInField,
  drawPath,
  countUp,
} from "./shared";

// ── Dati statici ───────────────────────────────────────────────────────────────

const NAV = ["Contenuti", "Prodotti", "Visite", "Ordini"] as const;

/** KPI schermata Visite. */
const KPI = [
  { label: "Visite", target: 18_340 },
  { label: "Utenti unici", target: 11_290 },
  { label: "Conversioni", target: 342 },
] as const;

/**
 * Formattatori Intl cached a livello modulo — non vengono mai ricreati
 * dentro onUpdate (rispetta il requisito della specifica).
 */
const FMT = new Intl.NumberFormat("it-IT");

/** Path SVG sparkline (viewBox 0 0 200 60). */
const SPARK_D = "M0,54 L28,42 L56,46 L84,28 L112,32 L140,15 L168,19 L200,8";

/** Altezze barre giornaliere (%). */
const BARS = [32, 48, 41, 67, 58, 80, 72] as const;

/** Prodotti già presenti nel catalogo. */
const PRODOTTI_INIT: ReadonlyArray<{ nome: string; prezzo: string; ico: string }> = [
  { nome: "Cavo Type-C 5m", prezzo: "29,90 €", ico: "🔌" },
  { nome: "Wallbox 22 kW", prezzo: "899 €", ico: "⚡" },
  { nome: "Pannello 400 W", prezzo: "210 €", ico: "☀️" },
];

/** Righe tabella ordini. */
const ORDINI: ReadonlyArray<{ n: string; cliente: string; importo: string; stato: string }> = [
  { n: "#1042", cliente: "Rossi S.r.l.", importo: "2.340 €", stato: "Completato" },
  { n: "#1041", cliente: "Bianchi S.p.A.", importo: "899 €", stato: "Spedito" },
  { n: "#1040", cliente: "Ferrari Group", importo: "12.600 €", stato: "In attesa" },
  { n: "#1039", cliente: "Conti S.r.l.", importo: "630 €", stato: "Completato" },
  { n: "#1038", cliente: "Masi & Figli", importo: "420 €", stato: "Spedito" },
];

/** Classi badge colore per stato ordine (sky / amber / emerald — minimi token). */
const STATO_CLS: Record<string, string> = {
  Completato: "bg-emerald-100 text-emerald-700",
  Spedito: "bg-sky-100 text-sky-700",
  "In attesa": "bg-amber-100 text-amber-700",
};

// ── Componente ─────────────────────────────────────────────────────────────────

export default function ImmersiveDashboard() {
  // Reduced-motion: niente pan scrubbato → il binario a 4 pannelli diventa un
  // carosello scrollabile in orizzontale (tutti i pannelli raggiungibili).
  const reduced = useReducedMotion();
  const ref = useImmersiveScene((tl, section) => {
    // Indicatore scorrevole nella sidebar. `() => navTop(i)`: valori FUNZIONE così
    // `invalidateOnRefresh` li ri-misura su resize/cambio breakpoint (la sidebar è
    // `hidden sm:block`: a build sotto sm gli offsetTop sono 0).
    const navItems = Array.from(section.querySelectorAll<HTMLElement>(".imm-nav-item"));
    const navTop = (i: number) => navItems[i]?.offsetTop ?? 0;

    // ── Set iniziali ───────────────────────────────────────────────────────────
    // Sparkline (draw) e campo titolo (typing) sono nascosti dai loro helper.
    gsap.set(".imm-bar", { scaleY: 0, transformOrigin: "bottom" });
    gsap.set(".imm-kpi-card", { autoAlpha: 0, y: 20 });
    gsap.set(".imm-ord-row", { autoAlpha: 0, x: -16 });
    gsap.set(".imm-new-card", { autoAlpha: 0, scale: 0.85 });
    gsap.set(".imm-img-fill", { autoAlpha: 0 });
    tl.set(".imm-nav-ind", { top: () => navTop(0) });
    tl.set(".imm-cursor", { left: "50%", top: "50%" });

    // ── ① Contenuti ───────────────────────────────────────────────────────────
    say(tl, 0); // «Una regìa unica per tutti i tuoi siti.»

    // Cursore (mano) sull'area upload → click + punch-zoom del cluster card editor
    cursorTo(tl, ".imm-img-placeholder", { mode: "hand" });
    tl.to({}, { duration: 0.3 });
    pressButton(tl, ".imm-img-placeholder", { down: 0.96, downDur: 0.12, upDur: 0.22, back: 2.2 });
    clickZoom(tl, ".imm-zoom-local", { position: "<" }); // punch al click (non tocca .imm-stage)
    // L'immagine placeholder si riempie
    tl.to(".imm-img-fill", { autoAlpha: 1, duration: 0.6, ease: "power2.out" }, "<0.1");

    // Cursore (caret) sul campo titolo → digitazione + punch-zoom durante il typing
    cursorTo(tl, ".imm-typed", { mode: "text" });
    tl.to({}, { duration: 0.25 });
    typeInField(tl, ".imm-typed", { steps: 22, duration: 0.85, position: "<0.1" });
    clickZoom(tl, ".imm-zoom-local", { position: "<" });

    // ── ② Prodotti ────────────────────────────────────────────────────────────
    say(tl, 1); // «Carichi foto e testi, aggiungi prodotti.»
    cursorTo(tl, navItems[1], { mode: "hand" }); // click "Prodotti" nella sidebar
    tl.to(".imm-nav-ind", { top: () => navTop(1), duration: 0.45, ease: "power3.inOut" }, "<0.3");
    tl.to(".imm-track", { xPercent: -25, duration: 1.1, ease: "expo.inOut" }, "<0.1");

    // Cursore (mano) sul bottone "Aggiungi prodotto" e lo preme
    tl.to({}, { duration: 0.35 });
    cursorTo(tl, ".imm-add-btn", { mode: "hand" });
    pressButton(tl, ".imm-add-btn", { down: 0.93, downDur: 0.1, upDur: 0.18, back: 2.5 });
    // La nuova card prodotto entra con back.out
    tl.to(
      ".imm-new-card",
      { autoAlpha: 1, scale: 1, duration: 0.55, ease: "back.out(1.8)" },
      "<0.08",
    );

    // ── ③ Visite ──────────────────────────────────────────────────────────────
    say(tl, 2); // «Vedi visite, utenti e ordini in tempo reale.»
    cursorTo(tl, navItems[2], { mode: "hand" }); // click "Visite"
    tl.to(".imm-nav-ind", { top: () => navTop(2), duration: 0.45, ease: "power3.inOut" }, "<0.3");
    tl.to(".imm-track", { xPercent: -50, duration: 1.1, ease: "expo.inOut" }, "<0.1");

    // Card KPI entrano con back.out staggered
    tl.to(
      ".imm-kpi-card",
      { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "back.out(1.6)" },
      "<0.25",
    );
    // Proxy counter: i 3 valori salgono in parallelo
    countUp(
      tl,
      KPI.map((k, i) => ({
        el: `.imm-kpi-val-${i}`,
        to: k.target,
        format: (n: number) => FMT.format(Math.round(n)),
      })),
      { duration: 1.4, ease: "power2.out", position: "<0.3" },
    );
    // Sparkline si disegna da sinistra (dashoffset → 0)
    drawPath(tl, ".imm-spark-path", { duration: 1.2, ease: "power2.inOut", position: "<0.4" });
    // Barre crescono dal basso con stagger
    tl.to(".imm-bar", { scaleY: 1, duration: 0.6, stagger: 0.07, ease: "back.out(1.7)" }, "<0.3");
    // Tocco: il cursore "apre" una card KPI (punch-zoom verso il dettaglio).
    cursorTo(tl, ".imm-kpi-zoom", { mode: "hand" });
    clickZoom(tl, ".imm-kpi-zoom", { position: ">-0.05", scale: 1.08 });

    // ── ④ Ordini ──────────────────────────────────────────────────────────────
    say(tl, 3);
    cursorTo(tl, navItems[3], { mode: "hand" }); // click "Ordini"
    tl.to(".imm-nav-ind", { top: () => navTop(3), duration: 0.45, ease: "power3.inOut" }, "<0.3");
    tl.to(".imm-track", { xPercent: -75, duration: 1.1, ease: "expo.inOut" }, "<0.1");
    // Righe tabella entrano con slide+fade staggered
    tl.to(
      ".imm-ord-row",
      { autoAlpha: 1, x: 0, duration: 0.5, stagger: 0.09, ease: "power3.out" },
      "<0.3",
    );

    tl.to({}, { duration: 0.6 }); // pausa finale
  });

  return (
    <ImmersiveStage
      ref={ref}
      heightVh={500}
      theme="platform"
      label="Dashboard multi-sito"
      eyebrow="02 · Dashboard multi-sito"
    >
      {/* Stessi token della scena Gestionale adiacente: fondi, grigi e accent
          identici (prima era bg-white + scala slate hardcoded → salto di tono). */}
      <div className="bg-background text-foreground flex h-full pt-10">
        {/* ── Sidebar ────────────────────────────────────────────────────────── */}
        <aside className="border-border bg-surface relative hidden w-52 shrink-0 border-r p-4 sm:block">
          <div className="text-foreground mb-6 flex items-center gap-2 px-2 font-semibold">
            <span className="bg-accent h-4 w-4 rounded-[5px]" />
            Dashboard
          </div>

          <nav className="relative space-y-1">
            {/* Indicatore scorrevole della voce attiva */}
            <span
              className="imm-nav-ind bg-accent-soft pointer-events-none absolute inset-x-0 h-10 rounded-lg"
              style={{ top: 0 }}
              aria-hidden
            />
            {NAV.map((n) => (
              <div
                key={n}
                className="imm-nav-item text-foreground relative rounded-lg px-3 py-2.5 text-sm font-medium"
              >
                {n}
              </div>
            ))}
          </nav>

          {/* Siti connessi */}
          <div className="border-border mt-6 border-t pt-4">
            <p className="text-muted mb-2 px-2 text-[11px] font-semibold tracking-wider uppercase">
              Siti
            </p>
            {["Solar", "Mobility", "Shop"].map((s) => (
              <div
                key={s}
                className="text-muted flex items-center gap-2 rounded-lg px-3 py-2 text-sm"
              >
                <span className="bg-accent/60 h-2 w-2 rounded-full" />
                {s}
              </div>
            ))}
          </div>
        </aside>

        {/* ── Area principale ───────────────────────────────────────────────── */}
        {/* Reduced-motion: overflow-x-auto → il binario a 4 pannelli si scorre a mano
            (il pan scrubbato non c'è, vedi useReducedMotion sopra). */}
        <div
          className={`relative flex-1 ${
            reduced ? "overflow-x-auto overflow-y-hidden" : "overflow-hidden"
          }`}
        >
          {/* Topbar */}
          <div className="border-border bg-background/80 flex h-12 items-center gap-3 border-b px-5 backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="text-muted text-xs font-semibold">3 siti connessi</span>
            <div className="ml-auto flex items-center gap-1.5">
              {["Solar", "Mobility"].map((s) => (
                <span
                  key={s}
                  className="bg-surface-2 text-muted rounded-full px-3 py-1 text-[11px] font-semibold"
                >
                  {s}
                </span>
              ))}
              <span className="bg-accent text-accent-contrast rounded-full px-3 py-1 text-[11px] font-semibold">
                Shop ✓
              </span>
            </div>
          </div>

          {/* Track orizzontale: 4 schermate → width 400%, ogni pannello w-1/4 */}
          <div className="imm-track flex h-[calc(100%-3rem)]" style={{ width: "400%" }}>
            {/* ① CONTENUTI ──────────────────────────────────────────────────── */}
            <div className="w-1/4 shrink-0 overflow-hidden p-6">
              <p className="text-foreground mb-4 font-semibold">Editor contenuti</p>

              <div className="imm-zoom-local border-border bg-surface rounded-xl border p-5 shadow-sm">
                {/* Area upload immagine */}
                <div className="imm-img-placeholder border-border bg-surface-2 relative mb-4 flex h-32 cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed">
                  {/* Stato vuoto: icona upload */}
                  <div className="text-muted flex flex-col items-center gap-1.5">
                    <svg
                      className="h-8 w-8"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      viewBox="0 0 24 24"
                      aria-hidden
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                      />
                    </svg>
                    <span className="text-xs font-medium">Carica immagine</span>
                  </div>

                  {/* Stato pieno: appare con autoAlpha 0→1 nell'animazione */}
                  <div
                    className="imm-img-fill absolute inset-0 rounded-lg"
                    style={{
                      background:
                        "repeating-linear-gradient(45deg, color-mix(in oklab, var(--accent) 7%, transparent) 0px, color-mix(in oklab, var(--accent) 7%, transparent) 2px, transparent 2px, transparent 10px), linear-gradient(135deg, color-mix(in oklab, var(--accent) 13%, transparent), color-mix(in oklab, var(--accent) 27%, transparent))",
                    }}
                    aria-hidden
                  >
                    <div className="flex h-full items-center justify-center">
                      <span className="bg-background/85 text-foreground rounded-lg px-3 py-1.5 text-xs font-semibold shadow-sm">
                        foto-solare.jpg
                      </span>
                    </div>
                  </div>
                </div>

                {/* Campi testo */}
                <div className="space-y-3">
                  <div>
                    <label className="text-muted mb-1 block text-[11px] font-semibold tracking-wider uppercase">
                      Titolo
                    </label>
                    <div className="border-border bg-surface-2 text-foreground min-h-[34px] rounded-lg border px-3 py-2 text-sm">
                      {/* Il testo appare per clip-path (effect macchina da scrivere) */}
                      <span className="imm-typed inline-block whitespace-nowrap">
                        Energia solare per la tua azienda
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-muted mb-1 block text-[11px] font-semibold tracking-wider uppercase">
                      Descrizione
                    </label>
                    <div className="border-border bg-surface-2 text-muted min-h-[52px] rounded-lg border px-3 py-2 text-sm">
                      Inserisci una descrizione…
                    </div>
                  </div>
                </div>

                <button
                  className="bg-accent text-accent-contrast mt-4 rounded-lg px-4 py-2 text-sm font-semibold"
                  tabIndex={-1}
                  aria-hidden
                >
                  Salva
                </button>
              </div>
            </div>

            {/* ② PRODOTTI ───────────────────────────────────────────────────── */}
            <div className="w-1/4 shrink-0 overflow-hidden p-6">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-foreground font-semibold">Catalogo prodotti</p>
                <button
                  className="imm-add-btn bg-accent text-accent-contrast rounded-lg px-4 py-1.5 text-xs font-semibold shadow-sm"
                  tabIndex={-1}
                  aria-hidden
                >
                  + Aggiungi prodotto
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {PRODOTTI_INIT.map((p) => (
                  <div
                    key={p.nome}
                    className="border-border bg-surface rounded-xl border p-4 shadow-sm"
                  >
                    <div className="bg-surface-2 mb-2 flex h-10 w-10 items-center justify-center rounded-lg text-xl">
                      {p.ico}
                    </div>
                    <p className="text-foreground text-sm font-semibold">{p.nome}</p>
                    <p className="text-accent-ink text-xs font-bold">{p.prezzo}</p>
                  </div>
                ))}

                {/* Nuova card: entra con back.out al click del cursore */}
                <div className="imm-new-card border-accent/40 bg-accent/5 rounded-xl border-2 p-4 shadow-sm">
                  <div className="bg-accent-soft mb-2 flex h-10 w-10 items-center justify-center rounded-lg text-xl">
                    🔋
                  </div>
                  <p className="text-foreground text-sm font-semibold">Batteria 10 kWh</p>
                  <p className="text-accent-ink text-xs font-bold">3.200 €</p>
                </div>
              </div>
            </div>

            {/* ③ VISITE ─────────────────────────────────────────────────────── */}
            {/* overflow-y-auto: su viewport molto bassi (landscape) le barre in fondo
                restano raggiungibili invece di essere clippate. */}
            <div className="w-1/4 shrink-0 overflow-y-auto p-6">
              <p className="text-foreground mb-4 font-semibold">Visite · ultimi 30 giorni</p>

              {/* 3 card KPI: counter animato via proxy GSAP */}
              <div className="mb-4 grid grid-cols-3 gap-3">
                {KPI.map(({ label }, i) => (
                  <div
                    key={label}
                    className={`imm-kpi-card border-border bg-surface rounded-xl border p-4 shadow-sm ${
                      i === 0 ? "imm-kpi-zoom" : ""
                    }`}
                  >
                    <p
                      className={`imm-kpi-val-${i} text-accent-ink font-display text-2xl font-bold tabular-nums`}
                    >
                      0
                    </p>
                    <p className="text-muted mt-0.5 text-xs">{label}</p>
                  </div>
                ))}
              </div>

              {/* Sparkline: disegnata tramite strokeDashoffset → 0 */}
              <div className="border-border bg-surface mb-4 rounded-xl border p-4 shadow-sm">
                <p className="text-muted mb-2 text-[11px] font-semibold tracking-wider uppercase">
                  Trend visite
                </p>
                <svg
                  viewBox="0 0 200 60"
                  className="h-14 w-full"
                  preserveAspectRatio="none"
                  aria-hidden
                >
                  <defs>
                    <linearGradient id="imm-db2-spark-grad" x1="0" y1="0" x2="0" y2="1">
                      {/* var() non è valido negli attributi SVG di presentazione → style */}
                      <stop offset="0%" style={{ stopColor: "var(--accent)" }} stopOpacity="0.15" />
                      <stop offset="100%" style={{ stopColor: "var(--accent)" }} stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d={`${SPARK_D} L200,60 L0,60 Z`} fill="url(#imm-db2-spark-grad)" />
                  <path
                    className="imm-spark-path stroke-accent"
                    d={SPARK_D}
                    fill="none"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              {/* Barre giornaliere: scaleY 0→1 dal basso con stagger */}
              <div className="border-border bg-surface rounded-xl border p-4 shadow-sm">
                <div className="flex h-20 items-end gap-1.5">
                  {BARS.map((h, i) => (
                    <span
                      key={i}
                      className={`imm-bar flex-1 rounded-t ${
                        i === BARS.length - 1 ? "bg-accent" : "bg-accent/25"
                      }`}
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* ④ ORDINI ─────────────────────────────────────────────────────── */}
            <div className="w-1/4 shrink-0 overflow-hidden p-6">
              <p className="text-foreground mb-4 font-semibold">Ordini recenti</p>

              <div className="border-border bg-surface overflow-hidden rounded-xl border shadow-sm">
                {/* Intestazione tabella */}
                <div className="bg-surface-2 text-muted grid grid-cols-[auto_1fr_auto_auto] gap-3 px-4 py-2.5 text-[11px] font-semibold tracking-wider uppercase">
                  <span>N°</span>
                  <span>Cliente</span>
                  <span>Importo</span>
                  <span>Stato</span>
                </div>

                {/* Righe: entrano con slide+fade staggered */}
                <div className="divide-border divide-y">
                  {ORDINI.map((o) => (
                    <div
                      key={o.n}
                      className="imm-ord-row grid grid-cols-[auto_1fr_auto_auto] items-center gap-3 px-4 py-3 text-sm"
                    >
                      <span className="text-muted font-mono text-xs">{o.n}</span>
                      <span className="text-foreground font-medium">{o.cliente}</span>
                      <span className="text-foreground font-mono">{o.importo}</span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${STATO_CLS[o.stato] ?? "bg-surface-2 text-muted"}`}
                      >
                        {o.stato}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Frasi-intermezzo DESCRITTIVE (spiegano, non vendono).
          Prima frase = veil (annuncia la scena); le altre = caption lower-third. */}
      <Say i={0}>Una regìa unica per tutti i tuoi siti.</Say>
      <Say i={1} variant="caption">
        Carichi foto e testi, aggiungi prodotti.
      </Say>
      <Say i={2} variant="caption">
        Vedi visite, utenti e ordini in tempo reale.
      </Say>
      <Say i={3} variant="caption">
        Ordini e incassi, sempre sotto controllo.
      </Say>
    </ImmersiveStage>
  );
}
