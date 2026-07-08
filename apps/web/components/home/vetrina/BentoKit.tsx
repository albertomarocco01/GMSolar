"use client";

/**
 * @descrizione  Kit BENTO del capitolo «Interfacce grafiche moderne» — v2 "WOW".
 *   La v1 era tutta card chiare sul fondo chiaro (piatta, poco memorabile): ora
 *   il bento alterna TRE pesi visivi, come nei bento di riferimento:
 *     · una card ACCENT PIENA (lime) con la stat principale — il colpo d'occhio;
 *     · una card SCURA (mockup browser su fondo ink) — l'àncora di contrasto;
 *     · card chiare di supporto (ring, barre, kit controlli).
 *   La VITA la mette la scena padre (InterfacceScene), che allo scrub anima via
 *   hook CSS — i controlli del kit SI AZIONANO DA SOLI (toggle, bottone, typing):
 *     .vt-card        → entrata card (stagger 3D)
 *     .vt-count       → counter "3m 42s" (textContent, la scena lo scrubba)
 *     .vt-spark-path  → sparkline che si disegna (pathLength=1, dashoffset 1→0)
 *     .vt-spark-fill  → area sotto la sparkline (fade-in dopo il draw)
 *     .vt-bar         → barre che crescono (scaleY da 0, origin bottom)
 *     .vt-ring-arc / .vt-ring-val → ring che spazza 0→98 + numero che conta
 *     .vt-mock-piece  → mockup sito che si assembla pezzo per pezzo
 *     .vt-mock-cta    → CTA del mockup (pressButton a fine assemblaggio)
 *     .vt-input-text  → testo che si digita nel campo del kit (typeInField)
 *     .vt-tg-knob / .vt-tg-on → toggle che si accende (knob + crossfade track)
 *     .vt-badge-new   → badge "Nuovo" che poppa
 *     .vt-btn         → bottone primario che si preme da solo
 *   Solo SVG inline + transform: zero dipendenze grafici, leggero.
 * @indice
 * - BentoKit → la griglia bento (statica di suo, anima la scena)
 * - AccentStatCard / RingCard / MockupCard / BarsCard / KitCard → le card
 * - Sparkline / MiniBars / Ring → mini-grafici SVG leggeri
 */
import { cn } from "@gmgroup/lib/utils";

export default function BentoKit() {
  return (
    // Righe ad ALTEZZA FISSA (non h-full): le card abbracciano il contenuto
    // invece di stirarsi sul viewport.
    <div className="grid w-full grid-cols-2 gap-3 md:grid-cols-12 md:grid-rows-[13rem_13rem] md:gap-4">
      <AccentStatCard className="md:col-span-4" />
      <RingCard className="md:col-span-3" />
      <MockupCard className="md:col-span-5 md:row-span-2" />
      <BarsCard className="md:col-span-4" />
      <KitCard className="md:col-span-3" />
    </div>
  );
}

/* ---- Cornice card CHIARA: superficie, bordo token, ombra morbida. --------- */
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

/** Label piccola in testa a ogni card chiara (gerarchia coerente). */
function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-muted text-xs font-medium tracking-wide">{children}</p>;
}

/* ---- Card 1 · ACCENT PIENA: stat principale + sparkline scura --------------
   Il "pop" del bento: lime pieno, testo ink, counter grande. */
function AccentStatCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "vt-card bg-accent shadow-lift relative min-w-0 overflow-hidden rounded-2xl p-4",
        className,
      )}
    >
      {/* alone chiaro decorativo nell'angolo (dà profondità al lime pieno) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(70% 60% at 85% 0%, rgb(255 255 255 / 0.35), transparent 65%)",
        }}
      />
      <p className="text-accent-contrast/70 relative text-xs font-semibold tracking-wide">
        Tempo medio sul sito
      </p>
      <div className="relative mt-1 flex items-end justify-between gap-2">
        {/* SSR mostra il valore finale; la scena lo azzera e lo conta allo scrub. */}
        <p className="vt-count font-display text-accent-contrast text-4xl font-bold tracking-tight tabular-nums">
          3m 42s
        </p>
        <span className="text-accent-contrast rounded-full bg-white/85 px-2 py-0.5 text-xs font-bold">
          +38%
        </span>
      </div>
      <Sparkline className="text-accent-contrast relative mt-3 h-14 w-full" />
    </div>
  );
}

/* ---- Card 2 · ring di performance ----------------------------------------- */
function RingCard({ className }: { className?: string }) {
  return (
    <Frame className={className}>
      <Label>Performance</Label>
      <div className="mt-3 flex items-center gap-4">
        <Ring value={98} className="h-18 w-18 shrink-0" />
        <div className="min-w-0">
          <p className="vt-ring-val font-display text-foreground text-3xl font-bold tracking-tight tabular-nums">
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
      <div className="flex items-center justify-between">
        <Label>Conversioni / mese</Label>
        <span className="bg-accent-soft text-accent-ink rounded-full px-2 py-0.5 text-[10px] font-bold">
          ↗ trend
        </span>
      </div>
      <MiniBars className="mt-3 h-20 w-full" />
      <p className="text-muted mt-2 text-[11px]">Ultimi 7 mesi · trend in crescita</p>
    </Frame>
  );
}

/* ---- Card 4 · mockup del sito, SCURO (àncora di contrasto del bento) -------
   Browser chrome su fondo ink; ogni pezzo ha `.vt-mock-piece`: la scena li fa
   comparire in sequenza (il sito "si costruisce" sotto gli occhi) e alla fine
   "preme" la CTA (.vt-mock-cta). Card decorativa: nessun elemento interattivo. */
function MockupCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "vt-card bg-foreground shadow-lift flex min-w-0 flex-col overflow-hidden rounded-2xl",
        className,
      )}
    >
      {/* chrome del browser (dots semaforo colorati: leggibili sul fondo scuro) */}
      <div className="vt-mock-piece flex items-center gap-2 border-b border-white/10 bg-white/5 px-3 py-2">
        <span className="flex gap-1" aria-hidden>
          <span className="h-2 w-2 rounded-full bg-rose-400" />
          <span className="h-2 w-2 rounded-full bg-amber-400" />
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
        </span>
        <span className="ml-1 truncate rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/60">
          anteprima.demo
        </span>
      </div>
      {/* skeleton del contenuto: hero lime + strutture bianche traslucide */}
      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <div className="vt-mock-piece bg-accent relative h-24 overflow-hidden rounded-lg">
          {/* accenno di headline dentro l'hero */}
          <span className="absolute bottom-3 left-3 block h-2.5 w-24 rounded-full bg-black/25" />
          <span className="absolute bottom-8 left-3 block h-3.5 w-36 rounded-full bg-black/40" />
        </div>
        <div className="vt-mock-piece h-2.5 w-4/5 rounded-full bg-white/20" />
        <div className="vt-mock-piece h-2.5 w-3/5 rounded-full bg-white/12" />
        <div className="grid grid-cols-3 gap-2 pt-1">
          <div className="vt-mock-piece h-14 rounded-md bg-white/8" />
          <div className="vt-mock-piece h-14 rounded-md bg-white/8" />
          <div className="vt-mock-piece h-14 rounded-md bg-white/8" />
        </div>
        <div className="vt-mock-piece h-2.5 w-2/3 rounded-full bg-white/12" />
        <div className="mt-auto flex items-center justify-between pt-1">
          <span className="vt-mock-piece vt-mock-cta bg-accent text-accent-contrast inline-block rounded-md px-3.5 py-1.5 text-[11px] font-bold">
            Scopri
          </span>
          <span className="vt-mock-piece flex gap-1" aria-hidden>
            <span className="bg-accent h-1.5 w-4 rounded-full" />
            <span className="h-1.5 w-1.5 rounded-full bg-white/25" />
            <span className="h-1.5 w-1.5 rounded-full bg-white/25" />
          </span>
        </div>
      </div>
    </div>
  );
}

/* ---- Card 5 · kit di controlli VIVI (la scena li aziona da sola) -----------
   Lookalike statici delle primitive (niente <button> reali: card decorativa,
   fuori dal tab-order). Toggle/typing/bottone hanno gli hook per la scena. */
function KitCard({ className }: { className?: string }) {
  return (
    <Frame className={className} aria-hidden>
      <Label>Componenti pronti</Label>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="vt-btn bg-accent text-accent-contrast rounded-lg px-3 py-1.5 text-xs font-bold">
          Primario
        </span>
        <span className="border-border text-foreground rounded-lg border px-3 py-1.5 text-xs font-semibold">
          Secondario
        </span>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {/* toggle: si ACCENDE allo scrub (knob .vt-tg-knob + track .vt-tg-on) */}
        <span className="relative inline-flex h-5 w-9 shrink-0">
          <span className="absolute inset-0 rounded-full bg-black/15" />
          <span className="vt-tg-on bg-accent absolute inset-0 rounded-full" />
          <span className="vt-tg-knob absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow" />
        </span>
        {/* badge che "poppa" quando il toggle si accende */}
        <span className="vt-badge-new bg-accent-soft text-accent-ink rounded-full px-2 py-0.5 text-[10px] font-semibold">
          Nuovo
        </span>
        <span className="border-border text-muted rounded-full border px-2 py-0.5 text-[10px] font-semibold">
          v2.0
        </span>
      </div>
      {/* input mock: il testo si DIGITA da solo (typeInField della scena) */}
      <span className="border-border text-foreground mt-3 flex h-8 items-center overflow-hidden rounded-lg border px-2.5 text-[11px]">
        <span className="vt-input-text block whitespace-nowrap">richiedi un preventivo…</span>
      </span>
    </Frame>
  );
}

/* ── Mini-grafici SVG (colore via currentColor: lo dà il chiamante) ─────────── */

/** Sparkline area+linea. `pathLength=1` → la scena disegna il tratto animando
 *  `strokeDashoffset` 1→0 (dasharray 1 = intero percorso). */
function Sparkline({ className }: { className?: string }) {
  const line = "M0 30 L14 22 L28 26 L42 14 L56 18 L70 9 L84 13 L100 3";
  return (
    <svg viewBox="0 0 100 36" preserveAspectRatio="none" className={className} aria-hidden>
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
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className={cn("text-accent", className)}
      aria-hidden
    >
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
      <circle
        cx="20"
        cy="20"
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        opacity="0.18"
      />
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
