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
import { ImmersiveStage, Say, say, cursorTo, useImmersiveScene } from "./shared";

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

/** Accent platform hardcoded (le CSS var non sono sempre interpolabili da GSAP). */
const PLT = "#7c5cff";

// ── Componente ─────────────────────────────────────────────────────────────────

export default function ImmersiveDashboard() {
  const ref = useImmersiveScene((tl, section) => {
    // Indicatore scorrevole nella sidebar
    const navItems = Array.from(section.querySelectorAll<HTMLElement>(".imm-nav-item"));
    const navTop = (i: number) => navItems[i]?.offsetTop ?? 0;

    // Riferimenti DOM per i contatori KPI (scritti direttamente in onUpdate)
    const kpiEls = KPI.map((_, i) => section.querySelector<HTMLElement>(`.imm-kpi-val-${i}`));

    // Lunghezza reale del path sparkline
    const sparkPath = section.querySelector<SVGPathElement>(".imm-spark-path");
    const sparkLen = sparkPath?.getTotalLength() ?? 320;

    // ── Set iniziali ───────────────────────────────────────────────────────────
    gsap.set(".imm-spark-path", { strokeDasharray: sparkLen, strokeDashoffset: sparkLen });
    gsap.set(".imm-bar", { scaleY: 0, transformOrigin: "bottom" });
    gsap.set(".imm-kpi-card", { autoAlpha: 0, y: 20 });
    gsap.set(".imm-ord-row", { autoAlpha: 0, x: -16 });
    gsap.set(".imm-new-card", { autoAlpha: 0, scale: 0.85 });
    gsap.set(".imm-img-fill", { autoAlpha: 0 });
    gsap.set(".imm-typed", { clipPath: "inset(0 100% 0 0)" });
    gsap.set(".imm-nav-ind", { top: navTop(0) });
    tl.set(".imm-cursor", { left: "50%", top: "50%" });

    // ── ① Contenuti ───────────────────────────────────────────────────────────
    say(tl, 0); // «Una regìa unica per tutti i tuoi siti.»

    // Cursore si muove sull'area upload → simula un click (scale bounce)
    cursorTo(tl, "40%", "36%");
    tl.to({}, { duration: 0.3 });
    tl.to(".imm-img-placeholder", { scale: 0.96, duration: 0.12, ease: "power2.in" });
    tl.to(".imm-img-placeholder", { scale: 1, duration: 0.22, ease: "back.out(2.2)" }, ">");
    // L'immagine placeholder si riempie
    tl.to(".imm-img-fill", { autoAlpha: 1, duration: 0.6, ease: "power2.out" }, "<0.1");

    // Cursore scende sul campo titolo → il testo appare (clip steps, effetto macchina da scrivere)
    cursorTo(tl, "55%", "56%");
    tl.to({}, { duration: 0.25 });
    tl.to(".imm-typed", { clipPath: "inset(0 0% 0 0)", duration: 0.85, ease: "steps(22)" }, "<0.1");

    // ── ② Prodotti ────────────────────────────────────────────────────────────
    say(tl, 1); // «Carichi foto e testi, aggiungi prodotti.»
    cursorTo(tl, "7%", "36%"); // click "Prodotti" nella sidebar
    tl.to(".imm-nav-ind", { top: navTop(1), duration: 0.45, ease: "power3.inOut" }, "<0.3");
    tl.to(".imm-track", { xPercent: -25, duration: 1.1, ease: "expo.inOut" }, "<0.1");

    // Cursore si posiziona sul bottone "Aggiungi prodotto" e lo preme
    tl.to({}, { duration: 0.35 });
    cursorTo(tl, "72%", "17%");
    tl.to(".imm-add-btn", { scale: 0.93, duration: 0.1, ease: "power2.in" });
    tl.to(".imm-add-btn", { scale: 1, duration: 0.18, ease: "back.out(2.5)" }, ">");
    // La nuova card prodotto entra con back.out
    tl.to(
      ".imm-new-card",
      { autoAlpha: 1, scale: 1, duration: 0.55, ease: "back.out(1.8)" },
      "<0.08",
    );

    // ── ③ Visite ──────────────────────────────────────────────────────────────
    say(tl, 2); // «Vedi visite, utenti e ordini in tempo reale.»
    cursorTo(tl, "7%", "48%"); // click "Visite"
    tl.to(".imm-nav-ind", { top: navTop(2), duration: 0.45, ease: "power3.inOut" }, "<0.3");
    tl.to(".imm-track", { xPercent: -50, duration: 1.1, ease: "expo.inOut" }, "<0.1");

    // Card KPI entrano con back.out staggered
    tl.to(
      ".imm-kpi-card",
      { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "back.out(1.6)" },
      "<0.25",
    );
    // Proxy counter: i 3 valori salgono in parallelo
    const proxy = { v0: 0, v1: 0, v2: 0 };
    tl.to(
      proxy,
      {
        v0: KPI[0].target,
        v1: KPI[1].target,
        v2: KPI[2].target,
        duration: 1.4,
        ease: "power2.out",
        onUpdate() {
          if (kpiEls[0]) kpiEls[0].textContent = FMT.format(Math.round(proxy.v0));
          if (kpiEls[1]) kpiEls[1].textContent = FMT.format(Math.round(proxy.v1));
          if (kpiEls[2]) kpiEls[2].textContent = FMT.format(Math.round(proxy.v2));
        },
      },
      "<0.3",
    );
    // Sparkline si disegna da sinistra (dashoffset → 0)
    tl.to(".imm-spark-path", { strokeDashoffset: 0, duration: 1.2, ease: "power2.inOut" }, "<0.4");
    // Barre crescono dal basso con stagger
    tl.to(".imm-bar", { scaleY: 1, duration: 0.6, stagger: 0.07, ease: "back.out(1.7)" }, "<0.3");

    // ── ④ Ordini ──────────────────────────────────────────────────────────────
    cursorTo(tl, "7%", "60%"); // click "Ordini"
    tl.to(".imm-nav-ind", { top: navTop(3), duration: 0.45, ease: "power3.inOut" }, "<0.3");
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
    <ImmersiveStage ref={ref} heightVh={500} theme="platform" label="Dashboard multi-sito">
      {/* Forza tema chiaro su tutta la scena — sovrascrive bg-background del wrapper */}
      <div className="flex h-full bg-white pt-10 text-slate-800">
        {/* ── Sidebar ────────────────────────────────────────────────────────── */}
        <aside className="relative hidden w-52 shrink-0 border-r border-slate-200 bg-slate-50 p-4 sm:block">
          <div className="mb-6 flex items-center gap-2 px-2 font-semibold text-slate-800">
            <span className="h-4 w-4 rounded-[5px]" style={{ background: PLT }} />
            Dashboard
          </div>

          <nav className="relative space-y-1">
            {/* Indicatore scorrevole della voce attiva */}
            <span
              className="imm-nav-ind pointer-events-none absolute inset-x-0 h-10 rounded-lg"
              style={{ top: 0, background: `${PLT}18` }}
              aria-hidden
            />
            {NAV.map((n) => (
              <div
                key={n}
                className="imm-nav-item relative rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700"
              >
                {n}
              </div>
            ))}
          </nav>

          {/* Siti connessi */}
          <div className="mt-6 border-t border-slate-200 pt-4">
            <p className="mb-2 px-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              Siti
            </p>
            {["Solar", "Mobility", "Shop"].map((s) => (
              <div
                key={s}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-500"
              >
                <span className="h-2 w-2 rounded-full" style={{ background: `${PLT}99` }} />
                {s}
              </div>
            ))}
          </div>
        </aside>

        {/* ── Area principale ───────────────────────────────────────────────── */}
        <div className="relative flex-1 overflow-hidden">
          {/* Topbar */}
          <div className="flex h-12 items-center gap-3 border-b border-slate-200 bg-white/80 px-5 backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="text-xs font-semibold text-slate-500">3 siti connessi</span>
            <div className="ml-auto flex items-center gap-1.5">
              {["Solar", "Mobility"].map((s) => (
                <span
                  key={s}
                  className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-500"
                >
                  {s}
                </span>
              ))}
              <span
                className="rounded-full px-3 py-1 text-[11px] font-semibold text-white"
                style={{ background: PLT }}
              >
                Shop ✓
              </span>
            </div>
          </div>

          {/* Track orizzontale: 4 schermate → width 400%, ogni pannello w-1/4 */}
          <div className="imm-track flex h-[calc(100%-3rem)]" style={{ width: "400%" }}>
            {/* ① CONTENUTI ──────────────────────────────────────────────────── */}
            <div className="w-1/4 shrink-0 overflow-hidden p-6">
              <p className="mb-4 font-semibold text-slate-700">Editor contenuti</p>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                {/* Area upload immagine */}
                <div className="imm-img-placeholder relative mb-4 flex h-32 cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-slate-300 bg-slate-50">
                  {/* Stato vuoto: icona upload */}
                  <div className="flex flex-col items-center gap-1.5 text-slate-400">
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
                        "repeating-linear-gradient(45deg, #7c5cff11 0px, #7c5cff11 2px, transparent 2px, transparent 10px), linear-gradient(135deg, #7c5cff22, #7c5cff44)",
                    }}
                    aria-hidden
                  >
                    <div className="flex h-full items-center justify-center">
                      <span className="rounded-lg bg-white/85 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm">
                        foto-solare.jpg
                      </span>
                    </div>
                  </div>
                </div>

                {/* Campi testo */}
                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                      Titolo
                    </label>
                    <div className="min-h-[34px] rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                      {/* Il testo appare per clip-path (effect macchina da scrivere) */}
                      <span className="imm-typed inline-block whitespace-nowrap">
                        Energia solare per la tua azienda
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                      Descrizione
                    </label>
                    <div className="min-h-[52px] rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-400">
                      Inserisci una descrizione…
                    </div>
                  </div>
                </div>

                <button
                  className="mt-4 rounded-lg px-4 py-2 text-sm font-semibold text-white"
                  style={{ background: PLT }}
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
                <p className="font-semibold text-slate-700">Catalogo prodotti</p>
                <button
                  className="imm-add-btn rounded-lg px-4 py-1.5 text-xs font-semibold text-white shadow-sm"
                  style={{ background: PLT }}
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
                    className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-xl">
                      {p.ico}
                    </div>
                    <p className="text-sm font-semibold text-slate-700">{p.nome}</p>
                    <p className="text-xs font-bold" style={{ color: PLT }}>
                      {p.prezzo}
                    </p>
                  </div>
                ))}

                {/* Nuova card: entra con back.out al click del cursore */}
                <div
                  className="imm-new-card rounded-xl border-2 bg-white p-4 shadow-sm"
                  style={{ borderColor: `${PLT}66`, background: `${PLT}08` }}
                >
                  <div
                    className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg text-xl"
                    style={{ background: `${PLT}18` }}
                  >
                    🔋
                  </div>
                  <p className="text-sm font-semibold text-slate-700">Batteria 10 kWh</p>
                  <p className="text-xs font-bold" style={{ color: PLT }}>
                    3.200 €
                  </p>
                </div>
              </div>
            </div>

            {/* ③ VISITE ─────────────────────────────────────────────────────── */}
            <div className="w-1/4 shrink-0 overflow-hidden p-6">
              <p className="mb-4 font-semibold text-slate-700">Visite · ultimi 30 giorni</p>

              {/* 3 card KPI: counter animato via proxy GSAP */}
              <div className="mb-4 grid grid-cols-3 gap-3">
                {KPI.map(({ label }, i) => (
                  <div
                    key={label}
                    className="imm-kpi-card rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <p
                      className={`imm-kpi-val-${i} font-display text-2xl font-bold tabular-nums`}
                      style={{ color: PLT }}
                    >
                      0
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">{label}</p>
                  </div>
                ))}
              </div>

              {/* Sparkline: disegnata tramite strokeDashoffset → 0 */}
              <div className="mb-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="mb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
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
                      <stop offset="0%" stopColor={PLT} stopOpacity="0.15" />
                      <stop offset="100%" stopColor={PLT} stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d={`${SPARK_D} L200,60 L0,60 Z`} fill="url(#imm-db2-spark-grad)" />
                  <path
                    className="imm-spark-path"
                    d={SPARK_D}
                    fill="none"
                    stroke={PLT}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              {/* Barre giornaliere: scaleY 0→1 dal basso con stagger */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex h-20 items-end gap-1.5">
                  {BARS.map((h, i) => (
                    <span
                      key={i}
                      className="imm-bar flex-1 rounded-t"
                      style={{
                        height: `${h}%`,
                        background: i === BARS.length - 1 ? PLT : `${PLT}44`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* ④ ORDINI ─────────────────────────────────────────────────────── */}
            <div className="w-1/4 shrink-0 overflow-hidden p-6">
              <p className="mb-4 font-semibold text-slate-700">Ordini recenti</p>

              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                {/* Intestazione tabella */}
                <div className="grid grid-cols-[auto_1fr_auto_auto] gap-3 bg-slate-50 px-4 py-2.5 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                  <span>N°</span>
                  <span>Cliente</span>
                  <span>Importo</span>
                  <span>Stato</span>
                </div>

                {/* Righe: entrano con slide+fade staggered */}
                <div className="divide-y divide-slate-100">
                  {ORDINI.map((o) => (
                    <div
                      key={o.n}
                      className="imm-ord-row grid grid-cols-[auto_1fr_auto_auto] items-center gap-3 px-4 py-3 text-sm"
                    >
                      <span className="font-mono text-xs text-slate-400">{o.n}</span>
                      <span className="font-medium text-slate-700">{o.cliente}</span>
                      <span className="font-mono text-slate-600">{o.importo}</span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${STATO_CLS[o.stato] ?? "bg-slate-100 text-slate-600"}`}
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

      {/* Frasi-intermezzo DESCRITTIVE (spiegano, non vendono) */}
      <Say i={0}>Una regìa unica per tutti i tuoi siti.</Say>
      <Say i={1}>Carichi foto e testi, aggiungi prodotti.</Say>
      <Say i={2}>Vedi visite, utenti e ordini in tempo reale.</Say>
    </ImmersiveStage>
  );
}
