"use client";

/**
 * @descrizione  Kit BENTO del capitolo «Interfacce grafiche moderne» (sostituisce
 *   le vecchie SuspendedCards "vetro su video"): card CHIARE direttamente sulla
 *   sezione chiara — niente pannello scuro, niente scatter 3D, niente float.
 *   Griglia bento asimmetrica (12 colonne, mockup grande su 2 righe). La VITA la
 *   mette la scena padre (InterfacceScene), che allo scrub disegna i grafici via
 *   hook CSS:
 *     .vt-card        → entrata card (stagger)
 *     .vt-count       → counter "3m 42s" (textContent, la scena lo scrubba)
 *     .vt-spark-path  → sparkline che si disegna (pathLength=1, dashoffset 1→0)
 *     .vt-spark-fill  → area sotto la sparkline (fade-in dopo il draw)
 *     .vt-bar         → barre che crescono (scaleY da 0, origin bottom)
 *     .vt-ring-arc / .vt-ring-val → ring che spazza 0→98 + numero che conta
 *     .vt-mock-piece  → mockup sito che si assembla pezzo per pezzo
 *   Solo SVG inline + transform: zero dipendenze grafici, leggero.
 * @indice
 * - BentoKit → la griglia bento (unica variante: statica di suo, anima la scena)
 * - StatCard / BarsCard / RingCard / MockupCard / KitCard → le card
 * - Sparkline / MiniBars / Ring → mini-grafici SVG leggeri
 */
import { cn } from "@gmgroup/lib/utils";

export default function BentoKit() {
  return (
    // Righe ad ALTEZZA FISSA (non h-full): le card abbracciano il contenuto
    // invece di stirarsi sul viewport — il vuoto sotto era il difetto n°1.
    <div className="grid w-full grid-cols-2 gap-3 md:grid-cols-12 md:grid-rows-[13rem_13rem] md:gap-4">
      <StatCard className="md:col-span-4" />
      <RingCard className="md:col-span-3" />
      <MockupCard className="md:col-span-5 md:row-span-2" />
      <BarsCard className="md:col-span-4" />
      <KitCard className="md:col-span-3" />
    </div>
  );
}

/* ---- Cornice card: superficie chiara, bordo token, ombra morbida. --------- */
function Frame({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "vt-card border-border bg-surface shadow-lift min-w-0 rounded-2xl border p-4",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Label piccola in testa a ogni card (stile unico → gerarchia coerente). */
function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-muted text-xs font-medium tracking-wide">{children}</p>;
}

/* ---- Card 1 · stat con counter + sparkline -------------------------------- */
function StatCard({ className }: { className?: string }) {
  return (
    <Frame className={className}>
      <Label>Tempo medio sul sito</Label>
      <div className="mt-1 flex items-end justify-between gap-2">
        {/* SSR mostra il valore finale; la scena lo azzera e lo conta allo scrub. */}
        <p className="vt-count font-display text-foreground text-3xl font-bold tracking-tight tabular-nums">
          3m 42s
        </p>
        <span className="bg-accent text-accent-contrast rounded-full px-2 py-0.5 text-xs font-bold">
          +38%
        </span>
      </div>
      <Sparkline className="mt-3 h-16 w-full" />
    </Frame>
  );
}

/* ---- Card 2 · ring di performance ----------------------------------------- */
function RingCard({ className }: { className?: string }) {
  return (
    <Frame className={className}>
      <Label>Performance</Label>
      <div className="mt-2 flex items-center gap-4">
        <Ring value={98} className="h-16 w-16 shrink-0" />
        <div className="min-w-0">
          <p className="vt-ring-val font-display text-foreground text-2xl font-bold tracking-tight tabular-nums">
            98
          </p>
          <p className="text-muted text-xs">su 100 · Lighthouse</p>
        </div>
      </div>
      <p className="text-muted mt-3 text-[11px]">Ottimizzato per Core Web Vitals</p>
    </Frame>
  );
}

/* ---- Card 3 · mini bar-chart ----------------------------------------------- */
function BarsCard({ className }: { className?: string }) {
  return (
    <Frame className={className}>
      <Label>Conversioni / mese</Label>
      <MiniBars className="mt-3 h-20 w-full" />
      <p className="text-muted mt-2 text-[11px]">Ultimi 7 mesi · trend in crescita</p>
    </Frame>
  );
}

/* ---- Card 4 · mini-mockup del sito (chrome + skeleton, tema chiaro) --------
   Ogni pezzo ha `.vt-mock-piece`: la scena li fa comparire in sequenza
   (il sito "si costruisce" sotto gli occhi). */
function MockupCard({ className }: { className?: string }) {
  return (
    <Frame className={cn("overflow-hidden p-0", className)}>
      {/* chrome del browser (barra header) */}
      <div className="vt-mock-piece border-border flex items-center gap-2 border-b bg-black/3 px-3 py-2">
        <span className="flex gap-1" aria-hidden>
          <span className="h-2 w-2 rounded-full bg-black/15" />
          <span className="h-2 w-2 rounded-full bg-black/15" />
          <span className="h-2 w-2 rounded-full bg-black/15" />
        </span>
        <span className="text-muted ml-1 truncate rounded-full bg-black/5 px-2 py-0.5 text-[10px]">
          anteprima.demo
        </span>
      </div>
      {/* skeleton del contenuto (più denso: la card è il pezzo grosso del bento) */}
      <div className="space-y-2.5 p-4">
        <div className="vt-mock-piece bg-accent h-20 rounded-lg" />
        <div className="vt-mock-piece h-2.5 w-4/5 rounded-full bg-black/10" />
        <div className="vt-mock-piece h-2.5 w-3/5 rounded-full bg-black/7" />
        <div className="grid grid-cols-3 gap-2 pt-1">
          <div className="vt-mock-piece h-12 rounded-md bg-black/5" />
          <div className="vt-mock-piece h-12 rounded-md bg-black/5" />
          <div className="vt-mock-piece h-12 rounded-md bg-black/5" />
        </div>
        <div className="vt-mock-piece h-2.5 w-2/3 rounded-full bg-black/7" />
        <div className="pt-0.5">
          <span className="vt-mock-piece bg-accent text-accent-contrast inline-block rounded-md px-3 py-1.5 text-[11px] font-bold">
            Scopri
          </span>
        </div>
      </div>
    </Frame>
  );
}

/* ---- Card 5 · kit di controlli (bottoni, toggle, badge — mock decorativi) --
   Lookalike statici delle primitive (niente <button> reali: la card è
   decorativa, non deve entrare nel tab-order della pagina). */
function KitCard({ className }: { className?: string }) {
  return (
    <Frame className={className} aria-hidden>
      <Label>Componenti pronti</Label>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="bg-accent text-accent-contrast rounded-lg px-3 py-1.5 text-xs font-bold">
          Primario
        </span>
        <span className="border-border text-foreground rounded-lg border px-3 py-1.5 text-xs font-semibold">
          Secondario
        </span>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {/* toggle acceso */}
        <span className="bg-accent relative inline-flex h-5 w-9 rounded-full">
          <span className="absolute top-0.5 right-0.5 h-4 w-4 rounded-full bg-white shadow" />
        </span>
        <span className="bg-accent-soft text-accent-ink rounded-full px-2 py-0.5 text-[10px] font-semibold">
          Nuovo
        </span>
        <span className="border-border text-muted rounded-full border px-2 py-0.5 text-[10px] font-semibold">
          v2.0
        </span>
      </div>
      {/* input mock (riempie la card alla stessa altezza delle vicine) */}
      <span className="border-border text-muted mt-3 flex h-8 items-center rounded-lg border px-2.5 text-[10px]">
        Cerca…
      </span>
    </Frame>
  );
}

/* ── Mini-grafici SVG (lime via currentColor = text-accent) ───────────────── */

/** Sparkline area+linea. `pathLength=1` → la scena disegna il tratto animando
 *  `strokeDashoffset` 1→0 (dasharray 1 = intero percorso). */
function Sparkline({ className }: { className?: string }) {
  const line = "M0 30 L14 22 L28 26 L42 14 L56 18 L70 9 L84 13 L100 3";
  return (
    <svg
      viewBox="0 0 100 36"
      preserveAspectRatio="none"
      className={cn("text-accent", className)}
      aria-hidden
    >
      <path
        className="vt-spark-fill"
        d={`${line} L100 36 L0 36 Z`}
        fill="currentColor"
        opacity="0.15"
      />
      <path
        className="vt-spark-path"
        d={line}
        pathLength={1}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/** Mini bar-chart: 7 barre crescenti, accent lime, angoli arrotondati. */
function MiniBars({ className }: { className?: string }) {
  const heights = [34, 48, 40, 62, 54, 78, 92]; // percentuali (decorative)
  const slot = 100 / heights.length;
  const bw = slot * 0.52;
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className={cn("text-accent", className)} aria-hidden>
      {heights.map((h, i) => {
        const x = i * slot + (slot - bw) / 2;
        const y = 100 - h;
        const last = i === heights.length - 1;
        return (
          <rect
            key={i}
            className="vt-bar"
            x={x}
            y={y}
            width={bw}
            height={h}
            rx="2"
            fill="currentColor"
            opacity={last ? 1 : 0.45 + i * 0.07}
          />
        );
      })}
    </svg>
  );
}

/** Ring di progresso: traccia + arco accent (98%). Dasharray SINGOLO (= intera
 *  circonferenza) e la frazione visibile è data dal solo `strokeDashoffset`
 *  (rest = c-shown): la scena "spazza" l'arco 0→valore leggendo l'offset di
 *  riposo e animandolo, senza conoscere la percentuale. */
function Ring({ value, className }: { value: number; className?: string }) {
  const r = 16;
  const c = 2 * Math.PI * r;
  const shown = (Math.min(100, Math.max(0, value)) / 100) * c;
  return (
    <svg viewBox="0 0 40 40" className={cn("text-accent", className)} aria-hidden>
      <circle cx="20" cy="20" r={r} fill="none" stroke="currentColor" strokeWidth="4" opacity="0.18" />
      <circle
        className="vt-ring-arc"
        cx="20"
        cy="20"
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c - shown}
        transform="rotate(-90 20 20)"
      />
    </svg>
  );
}
