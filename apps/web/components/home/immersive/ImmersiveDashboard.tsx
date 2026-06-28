"use client";

/**
 * @descrizione  Scena immersiva DASHBOARD multi-sito. Full-screen admin console:
 *   sidebar (Traffico / Interazioni / Contenuti), topbar con selettore sito
 *   (Tutti / Solar / Mobility / Shop) e range temporale, track orizzontale a
 *   3 viste scrubbed dallo scroll. Il cursore cambia filtro sito, naviga tra
 *   le viste e pubblica un contenuto in bozza. Usa il kit condiviso ./shared.
 *   Reduced-motion: timeline portata a progress(1) → stato finale leggibile.
 */
import { gsap } from "@gmgroup/lib/gsap";
import { ImmersiveStage, Say, say, cursorTo, useImmersiveScene } from "./shared";

// ── Dati statici ───────────────────────────────────────────────────────────────

const NAV_ITEMS = ["Traffico", "Interazioni", "Contenuti"] as const;

/** Valori finali dei 4 KPI (Traffico view). */
const KPI_TARGETS = [12_450, 8_390, 3_210, 124] as const;
const KPI_LABELS = ["Visite", "Utenti unici", "Interazioni", "Conversioni"] as const;

/**
 * Formattatori Intl cached a livello modulo: non vengono mai ricreati
 * all'interno di onUpdate (rispetta il requisito della specifica).
 */
const FMT = new Intl.NumberFormat("it-IT");

const SITES = ["Tutti", "Solar", "Mobility", "Shop"] as const;
const RANGES = ["7 gg", "30 gg", "90 gg"] as const;

/** Altezze (%) delle barre per sito nella vista Interazioni. */
const INT_BARS: ReadonlyArray<{ label: string; h: number }> = [
  { label: "Solar", h: 68 },
  { label: "Mobility", h: 45 },
  { label: "Shop", h: 52 },
  { label: "Diretto", h: 31 },
];

type PageStatus = "pub" | "draft";
const PAGES: ReadonlyArray<{ name: string; status: PageStatus; ago: string }> = [
  { name: "Home Solar", status: "pub", ago: "1 ora fa" },
  { name: "Calcolatore ROI", status: "draft", ago: "3 giorni fa" }, // viene pubblicata
  { name: "Mappa Progetti", status: "pub", ago: "2 ore fa" },
  { name: "Chi Siamo", status: "pub", ago: "4 ore fa" },
];

/** Path SVG per la sparkline (viewBox 0 0 200 60). */
const SPARK_D = "M0,52 L28,40 L56,44 L84,26 L112,30 L140,13 L168,17 L200,7";

/**
 * Colori hardcoded per le animazioni GSAP del selettore sito.
 * Corrispondono al tema "platform" (shared.tsx THEMES.platform + tokens.css).
 * Le CSS var non sono sempre interpolabili da GSAP come target di colore.
 */
const PLT_ACCENT = "#7c5cff";
const PLT_CONTRAST = "#ffffff";
const PLT_MUTED = "#5b6472";

// ── Componente ─────────────────────────────────────────────────────────────────

export default function ImmersiveDashboard() {
  const ref = useImmersiveScene((tl, section) => {
    // Elementi nav per l'indicatore scorrevole
    const navItems = Array.from(section.querySelectorAll<HTMLElement>(".imm-nav-item"));
    const navTop = (i: number) => navItems[i]?.offsetTop ?? 0;

    // DOM refs dei contatori KPI (aggiornati direttamente in onUpdate)
    const kpiEls = Array.from({ length: 4 }, (_, i) =>
      section.querySelector<HTMLElement>(`.imm-kpi-val-${i}`),
    );

    // Lunghezza reale del path sparkline (letta post-mount via useIsoLayoutEffect)
    const sparkPath = section.querySelector<SVGPathElement>(".imm-spark-path");
    const sparkLen = sparkPath?.getTotalLength() ?? 320;

    // ── Set iniziali ───────────────────────────────────────────────────────────
    gsap.set(".imm-spark-path", {
      strokeDasharray: sparkLen,
      strokeDashoffset: sparkLen,
    });
    gsap.set(".imm-int-bar", { scaleY: 0, transformOrigin: "bottom" });
    gsap.set(".imm-toggle-pub", { autoAlpha: 0 });
    gsap.set(".imm-kpi-card", { autoAlpha: 0, y: 20 });
    gsap.set(".imm-nav-ind", { top: navTop(0) });
    tl.set(".imm-cursor", { left: "50%", top: "48%" });

    // ── ① Vista TRAFFICO ───────────────────────────────────────────────────────
    say(tl, 0); // "Una sola dashboard per tutti i tuoi siti."

    // Card KPI entrano con back.out staggered
    tl.to(
      ".imm-kpi-card",
      { autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.1, ease: "back.out(1.7)" },
      "<0.2",
    );

    // Counter proxy: i 4 valori salgono in parallelo (onUpdate scrive nel DOM)
    const proxy: { v0: number; v1: number; v2: number; v3: number } = {
      v0: 0,
      v1: 0,
      v2: 0,
      v3: 0,
    };
    tl.to(
      proxy,
      {
        v0: KPI_TARGETS[0],
        v1: KPI_TARGETS[1],
        v2: KPI_TARGETS[2],
        v3: KPI_TARGETS[3],
        duration: 1.4,
        ease: "power2.out",
        onUpdate() {
          if (kpiEls[0]) kpiEls[0].textContent = FMT.format(Math.round(proxy.v0));
          if (kpiEls[1]) kpiEls[1].textContent = FMT.format(Math.round(proxy.v1));
          if (kpiEls[2]) kpiEls[2].textContent = FMT.format(Math.round(proxy.v2));
          if (kpiEls[3]) kpiEls[3].textContent = FMT.format(Math.round(proxy.v3));
        },
      },
      "<0.3",
    );

    // Sparkline si disegna da sinistra via strokeDashoffset → 0
    tl.to(".imm-spark-path", { strokeDashoffset: 0, duration: 1.2, ease: "power2.inOut" }, "<0.4");

    // Cursore si sposta sulla pill "Solar" e la attiva
    cursorTo(tl, "38%", "5%");
    tl.to(
      ".imm-pill-tutti",
      {
        backgroundColor: "transparent",
        color: PLT_MUTED,
        duration: 0.3,
        ease: "power2.inOut",
      },
      ">-0.1",
    );
    tl.to(
      ".imm-pill-solar",
      {
        backgroundColor: PLT_ACCENT,
        color: PLT_CONTRAST,
        duration: 0.3,
        ease: "power2.inOut",
      },
      "<",
    );

    // ── ② Vista INTERAZIONI ────────────────────────────────────────────────────
    say(tl, 1); // "Traffico, utenti e interazioni in tempo reale."
    cursorTo(tl, "7%", "37%");
    tl.to(".imm-nav-ind", { top: navTop(1), duration: 0.45, ease: "power3.inOut" }, "<0.3");
    tl.to(".imm-track", { xPercent: -(100 / 3), duration: 1.1, ease: "expo.inOut" }, "<0.1");

    // Breve pausa, poi le barre crescono dal basso (scaleY 0→1, stagger)
    tl.to({}, { duration: 0.35 });
    tl.to(".imm-int-bar", {
      scaleY: 1,
      duration: 0.7,
      stagger: 0.1,
      ease: "back.out(1.7)",
    });

    // ── ③ Vista CONTENUTI ──────────────────────────────────────────────────────
    say(tl, 2); // "Aggiorni i contenuti senza toccare il codice."
    cursorTo(tl, "7%", "52%");
    tl.to(".imm-nav-ind", { top: navTop(2), duration: 0.45, ease: "power3.inOut" }, "<0.3");
    tl.to(".imm-track", { xPercent: -(200 / 3), duration: 1.1, ease: "expo.inOut" }, "<0.1");

    // Cursore si sposta sul badge "Bozza" di "Calcolatore ROI"
    tl.to({}, { duration: 0.45 });
    cursorTo(tl, "80%", "33%");
    tl.to({}, { duration: 0.35 });

    // "Click" — Bozza → Pubblicato con highlight della riga
    tl.to(".imm-toggle-bozza", {
      autoAlpha: 0,
      duration: 0.25,
      ease: "power2.in",
    });
    tl.to(".imm-toggle-pub", { autoAlpha: 1, duration: 0.4, ease: "back.out(1.4)" }, "<0.05");
    tl.to(
      ".imm-draft-row",
      {
        backgroundColor: "rgba(124,92,255,0.08)",
        duration: 0.45,
        ease: "power2.out",
      },
      "<",
    );

    tl.to({}, { duration: 0.6 }); // pausa finale
  });

  return (
    <ImmersiveStage
      ref={ref}
      heightVh={440}
      theme="platform"
      label="Dashboard multi-sito"
      eyebrow="03 · Dashboard & telemetria"
    >
      <div className="flex h-full pt-10">
        {/* ── Sidebar ────────────────────────────────────────────────────────── */}
        <aside className="border-border bg-surface relative hidden w-52 shrink-0 border-r p-4 sm:block">
          {/* Logo / titolo prodotto */}
          <div className="text-foreground mb-6 flex items-center gap-2 px-2 font-semibold">
            <span className="bg-accent h-4 w-4 rounded-[5px]" />
            Dashboard
          </div>

          {/* Navigazione principale */}
          <nav className="relative space-y-1">
            <span
              className="imm-nav-ind bg-accent-soft pointer-events-none absolute inset-x-0 h-10 rounded-lg"
              style={{ top: 0 }}
              aria-hidden
            />
            {NAV_ITEMS.map((n) => (
              <div
                key={n}
                className="imm-nav-item text-foreground relative rounded-lg px-3 py-2.5 text-sm font-medium"
              >
                {n}
              </div>
            ))}
          </nav>

          {/* Elenco siti connessi */}
          <div className="border-border mt-6 border-t pt-4">
            <p className="text-muted mb-2 px-2 text-[11px] font-semibold tracking-wider uppercase">
              Siti
            </p>
            {SITES.slice(1).map((s) => (
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
        <div className="relative flex-1 overflow-hidden">
          {/* Topbar: selettore SITO + range temporale */}
          <div className="border-border bg-surface/80 flex h-12 items-center gap-3 border-b px-5 backdrop-blur">
            <span className="text-foreground text-xs font-semibold">Sito:</span>

            {/* Pill selettore SITO — il cursore cambierà la pill attiva */}
            <div className="flex gap-1">
              {SITES.map((s) => (
                <span
                  key={s}
                  className={`imm-pill-${s.toLowerCase()} rounded-full px-3 py-1 text-[11px] font-semibold`}
                  style={{
                    backgroundColor: s === "Tutti" ? PLT_ACCENT : "transparent",
                    color: s === "Tutti" ? PLT_CONTRAST : PLT_MUTED,
                  }}
                >
                  {s}
                </span>
              ))}
            </div>

            {/* Divisore verticale */}
            <div className="bg-border mx-1 h-5 w-px" />

            {/* Range temporale */}
            <div className="flex gap-1">
              {RANGES.map((r, i) => (
                <span
                  key={r}
                  className="rounded-full px-3 py-1 text-[11px] font-semibold"
                  style={{
                    backgroundColor: i === 1 ? "var(--surface-2)" : "transparent",
                    color: i === 1 ? "var(--foreground)" : PLT_MUTED,
                  }}
                >
                  {r}
                </span>
              ))}
            </div>
          </div>

          {/* Track orizzontale a 3 viste (width 300% → ogni vista = 100% del parent) */}
          <div className="imm-track flex h-[calc(100%-3rem)]" style={{ width: "300%" }}>
            {/* ① TRAFFICO ─────────────────────────────────────────────────── */}
            <div className="w-1/3 shrink-0 overflow-hidden p-5">
              {/* 4 KPI card: counter animato via proxy GSAP */}
              <div className="mb-4 grid grid-cols-2 gap-4">
                {KPI_LABELS.map((label, i) => (
                  <div
                    key={label}
                    className="imm-kpi-card border-border bg-surface rounded-xl border p-4"
                  >
                    <p
                      className={`imm-kpi-val-${i} text-accent-ink font-display text-2xl font-bold tabular-nums`}
                    >
                      0
                    </p>
                    <p className="text-muted mt-1 text-xs">{label}</p>
                  </div>
                ))}
              </div>

              {/* Sparkline: linea SVG disegnata via strokeDashoffset → 0 */}
              <div className="border-border bg-surface rounded-xl border p-4">
                <p className="text-muted mb-3 text-[11px] font-semibold tracking-wider uppercase">
                  Visite · ultimi 30 gg
                </p>
                <svg
                  viewBox="0 0 200 60"
                  className="h-16 w-full"
                  preserveAspectRatio="none"
                  aria-hidden
                >
                  <defs>
                    <linearGradient id="imm-dash-spark-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.18" />
                      <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {/* Area fill statica (non animata) */}
                  <path d={`${SPARK_D} L200,60 L0,60 Z`} fill="url(#imm-dash-spark-grad)" />
                  {/* Linea principale: disegnata dallo scroll via dashoffset */}
                  <path
                    className="imm-spark-path"
                    d={SPARK_D}
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            {/* ② INTERAZIONI ────────────────────────────────────────────────── */}
            <div className="w-1/3 shrink-0 overflow-hidden p-5">
              <p className="text-foreground mb-4 font-semibold">Interazioni per sito</p>
              <div className="border-border bg-surface rounded-xl border p-5">
                {/* Barre: scaleY 0 → 1 dal basso con stagger */}
                <div className="flex h-52 items-end justify-around gap-3">
                  {INT_BARS.map(({ label, h }) => (
                    <div key={label} className="flex flex-1 flex-col items-center gap-1.5">
                      <span className="text-muted text-[10px] font-semibold">{h}%</span>
                      {/* Contenitore barra: altezza fissa, la barra si estende dal basso */}
                      <div className="relative w-full flex-1">
                        <span
                          className="imm-int-bar from-accent to-accent/40 absolute inset-x-0 bottom-0 rounded-t bg-gradient-to-t"
                          style={{ height: `${h}%` }}
                        />
                      </div>
                      <span className="text-muted text-[10px] font-medium">{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mini-metriche di contesto */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                {[
                  { l: "Pagine / sessione", v: "4,2" },
                  { l: "Durata media", v: "2 min 18 s" },
                ].map((item) => (
                  <div key={item.l} className="border-border bg-surface rounded-lg border p-3">
                    <p className="text-accent-ink text-sm font-semibold">{item.v}</p>
                    <p className="text-muted mt-0.5 text-[11px]">{item.l}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ③ CONTENUTI ──────────────────────────────────────────────────── */}
            <div className="w-1/3 shrink-0 overflow-hidden p-5">
              <p className="text-foreground mb-4 font-semibold">Pagine e blocchi</p>
              <div className="border-border overflow-hidden rounded-xl border">
                {/* Intestazione tabella */}
                <div className="bg-surface-2 text-muted grid grid-cols-[1fr_auto_6rem] gap-3 px-4 py-2.5 text-[11px] font-semibold tracking-wider uppercase">
                  <span>Pagina</span>
                  <span>Modifica</span>
                  <span className="text-right">Stato</span>
                </div>

                {/* Righe contenuto */}
                {PAGES.map((page, i) => (
                  <div
                    key={page.name}
                    className={[
                      "grid grid-cols-[1fr_auto_6rem] items-center gap-3 px-4 py-3 text-sm",
                      i < PAGES.length - 1 ? "border-border border-b" : "",
                      page.status === "draft" ? "imm-draft-row" : "",
                    ].join(" ")}
                  >
                    <span className="text-foreground truncate font-medium">{page.name}</span>
                    <span className="text-muted text-[11px]">{page.ago}</span>

                    {/* Badge stato: Bozza / Pubblicato (con switch animato) */}
                    <div className="flex justify-end">
                      {page.status === "draft" ? (
                        /* Contenitore fisso che ospita entrambi gli stati sovrapposti */
                        <span className="relative inline-block h-[22px] w-[90px]">
                          {/* Stato iniziale: Bozza */}
                          <span className="imm-toggle-bozza border-border text-muted absolute inset-0 flex items-center justify-center rounded-full border text-[11px] font-semibold">
                            Bozza
                          </span>
                          {/* Stato finale: Pubblicato (entra con autoAlpha 0→1) */}
                          <span
                            className="imm-toggle-pub absolute inset-0 flex items-center justify-center rounded-full text-[11px] font-semibold"
                            style={{
                              backgroundColor: PLT_ACCENT,
                              color: PLT_CONTRAST,
                            }}
                          >
                            Pubblicato
                          </span>
                        </span>
                      ) : (
                        <span
                          className="inline-flex h-[22px] w-[90px] items-center justify-center rounded-full text-[11px] font-semibold"
                          style={{
                            backgroundColor: "var(--accent-soft)",
                            color: "var(--accent-ink)",
                          }}
                        >
                          Pubblicato
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Frasi-intermezzo DESCRITTIVE (spiegano lo strumento, non lo vendono) */}
      <Say i={0}>Una sola dashboard per tutti i tuoi siti.</Say>
      <Say i={1}>Traffico, utenti e interazioni in tempo reale.</Say>
      <Say i={2}>Aggiorni i contenuti senza toccare il codice.</Say>
    </ImmersiveStage>
  );
}
