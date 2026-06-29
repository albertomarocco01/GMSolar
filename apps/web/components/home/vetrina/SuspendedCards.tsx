"use client";

/**
 * @descrizione  Beat "vetrina di componenti" della scena VETRINA, rivelato DOPO
 *   il pan orizzontale (la homepage scorre a sinistra). Card premium "sospese"
 *   — vetro chiaro su video cinematografico, ombre morbide, accent lime — che
 *   mostrano la QUALITÀ del design: una stat con sparkline, un mini bar-chart,
 *   un ring di performance e un'anteprima di sito. Solo SVG inline + transform:
 *   zero dipendenze 3D/grafici, leggero anche su mobile.
 *
 *   - animated=true  → mobile: griglia statica leggibile; md+: scatter in
 *     prospettiva con auto-float morbido (le card sono i `.vt-card` che la scena
 *     padre fa entrare in stagger via GSAP).
 *   - animated=false → (reduced-motion) griglia statica a ogni larghezza, piana,
 *     nessuna animazione né prospettiva: contenuto leggibile e già composto.
 * @indice
 * - SuspendedCards → il beat (sceglie scatter animato vs griglia statica)
 * - StatCard / BarsCard / RingCard / MockupCard → le card premium
 * - Sparkline / MiniBars / Ring → mini-grafici SVG leggeri
 */
import { cn } from "@gmgroup/lib/utils";

/** CSS custom props inline (TS strict): castiamo come fa lo shared dell'app. */
function vars(v: Record<string, string>): React.CSSProperties {
  return v as unknown as React.CSSProperties;
}

/** Posa 3D + auto-float per card; `pos` posiziona nello scatter (solo md+). */
type Pose = { pos: string; pose: string; dur: string; delay: string };

const POSES: Record<"stat" | "bars" | "ring" | "mockup", Pose> = {
  // Posizioni (md+) pensate per NON collidere con l'etichetta in alto a sinistra
  // del pannello vetrina (vedi VetrinaScene `.vt-showcase-head`).
  stat: {
    pos: "md:left-[5%] md:top-[32%] md:w-[16rem] lg:w-[19rem]",
    pose: "rotateY(16deg) rotateX(6deg) translateZ(40px)",
    dur: "8s",
    delay: "0s",
  },
  bars: {
    pos: "md:left-[6%] md:top-[62%] md:w-[16rem] lg:w-[18rem]",
    pose: "rotateY(14deg) rotateX(-6deg) translateZ(20px)",
    dur: "9.5s",
    delay: "-2.4s",
  },
  ring: {
    pos: "md:left-[66%] md:top-[13%] md:w-[15rem] lg:w-[16rem]",
    pose: "rotateY(-15deg) rotateX(7deg) translateZ(55px)",
    dur: "8.5s",
    delay: "-1.4s",
  },
  mockup: {
    pos: "md:left-[54%] md:top-[45%] md:w-[18rem] lg:w-[20rem]",
    pose: "rotateY(-12deg) rotateX(-5deg) translateZ(80px)",
    dur: "10s",
    delay: "-3.6s",
  },
};

export default function SuspendedCards({ animated }: { animated: boolean }) {
  /* ---- reduced-motion: griglia statica, piana, leggibile (niente 3D) ---- */
  if (!animated) {
    return (
      <div className="mx-auto grid w-full max-w-3xl grid-cols-1 gap-3 sm:grid-cols-2">
        <StatCard />
        <BarsCard />
        <RingCard />
        <MockupCard />
      </div>
    );
  }

  /* ---- animata: griglia (mobile) → scatter in prospettiva (md+) ---- */
  return (
    <div className="vt-cards-scene relative h-full w-full md:perspective-[1400px]">
      {/* Stile auto-contenuto: posa 3D (md+) + auto-float (md+ & motion-safe). */}
      <style>{`
        @media (min-width: 768px) {
          .vt-card-face { transform: var(--pose); }
        }
        @media (min-width: 768px) and (prefers-reduced-motion: no-preference) {
          .vt-card {
            animation: vt-float var(--vt-dur, 8s) var(--vt-delay, 0s) ease-in-out infinite alternate;
          }
        }
        @keyframes vt-float {
          from { translate: 0 -9px; }
          to   { translate: 0 9px; }
        }
      `}</style>

      <div className="h-full w-full md:transform-3d">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:block md:h-full md:transform-3d">
          <CardSlot kind="stat">
            <StatCard face />
          </CardSlot>
          <CardSlot kind="bars">
            <BarsCard face />
          </CardSlot>
          <CardSlot kind="ring">
            <RingCard face />
          </CardSlot>
          <CardSlot kind="mockup">
            <MockupCard face />
          </CardSlot>
        </div>
      </div>
    </div>
  );
}

/** Contenitore di una card: gestisce posizione (scatter md+), float e classe `.vt-card`. */
function CardSlot({
  kind,
  children,
}: {
  kind: keyof typeof POSES;
  children: React.ReactNode;
}) {
  const p = POSES[kind];
  return (
    <div
      className={cn("vt-card relative md:absolute md:transform-3d", p.pos)}
      style={vars({ "--vt-dur": p.dur, "--vt-delay": p.delay })}
    >
      {children}
    </div>
  );
}

/* ---- Cornice card: vetro chiaro sopra il video, ombra morbida, posa 3D. ---- */
function Frame({
  children,
  face,
  pose,
  className,
}: {
  children: React.ReactNode;
  face?: boolean;
  pose?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "shadow-lift h-full rounded-2xl border border-white/15 bg-white/10 p-4 text-white backdrop-blur-md",
        face && "vt-card-face",
        className,
      )}
      style={face ? vars({ "--pose": pose ?? POSES.stat.pose }) : undefined}
    >
      {children}
    </div>
  );
}

/* ---- Card 1 · stat con sparkline ---------------------------------------- */
function StatCard({ face }: { face?: boolean }) {
  return (
    <Frame face={face} pose={POSES.stat.pose}>
      <p className="text-xs font-medium tracking-wide text-white/70">Tempo medio sul sito</p>
      <div className="mt-1 flex items-end justify-between gap-2">
        <p className="font-display text-3xl font-bold tracking-tight tabular-nums">3m 42s</p>
        <span className="bg-accent/90 text-accent-contrast rounded-full px-2 py-0.5 text-xs font-bold">
          +38%
        </span>
      </div>
      <Sparkline className="mt-3 h-12 w-full" />
    </Frame>
  );
}

/* ---- Card 2 · mini bar-chart -------------------------------------------- */
function BarsCard({ face }: { face?: boolean }) {
  return (
    <Frame face={face} pose={POSES.bars.pose}>
      <p className="text-xs font-medium tracking-wide text-white/70">Conversioni / mese</p>
      <MiniBars className="mt-3 h-20 w-full" />
      <p className="mt-2 text-[11px] text-white/55">Ultimi 7 mesi · trend in crescita</p>
    </Frame>
  );
}

/* ---- Card 3 · ring di performance --------------------------------------- */
function RingCard({ face }: { face?: boolean }) {
  return (
    <Frame face={face} pose={POSES.ring.pose}>
      <p className="text-xs font-medium tracking-wide text-white/70">Performance</p>
      <div className="mt-2 flex items-center gap-4">
        <Ring value={98} className="h-16 w-16 shrink-0" />
        <div className="min-w-0">
          <p className="font-display text-2xl font-bold tracking-tight tabular-nums">98</p>
          <p className="text-xs text-white/65">su 100 · Lighthouse</p>
        </div>
      </div>
    </Frame>
  );
}

/* ---- Card 4 · mini-mockup del sito (chrome + skeleton) ------------------- */
function MockupCard({ face }: { face?: boolean }) {
  return (
    <Frame face={face} pose={POSES.mockup.pose} className="overflow-hidden p-0">
      {/* chrome del browser */}
      <div className="flex items-center gap-2 border-b border-white/10 bg-white/5 px-3 py-2">
        <span className="flex gap-1" aria-hidden>
          <span className="h-2 w-2 rounded-full bg-white/40" />
          <span className="h-2 w-2 rounded-full bg-white/40" />
          <span className="h-2 w-2 rounded-full bg-white/40" />
        </span>
        <span className="ml-1 truncate rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/60">
          anteprima.demo
        </span>
      </div>
      {/* skeleton del contenuto */}
      <div className="space-y-2.5 p-4">
        <div className="bg-accent/80 h-10 rounded-lg" />
        <div className="h-2.5 w-4/5 rounded-full bg-white/30" />
        <div className="h-2.5 w-3/5 rounded-full bg-white/20" />
        <div className="grid grid-cols-3 gap-2 pt-1">
          <div className="h-8 rounded-md bg-white/15" />
          <div className="h-8 rounded-md bg-white/15" />
          <div className="h-8 rounded-md bg-white/15" />
        </div>
      </div>
    </Frame>
  );
}

/* ── Mini-grafici SVG (lime via currentColor = text-accent) ───────────────── */

/** Sparkline area+linea (percorso fisso, decorativo). */
function Sparkline({ className }: { className?: string }) {
  const line = "M0 30 L14 22 L28 26 L42 14 L56 18 L70 9 L84 13 L100 3";
  return (
    <svg
      viewBox="0 0 100 36"
      preserveAspectRatio="none"
      className={cn("text-accent", className)}
      aria-hidden
    >
      <path d={`${line} L100 36 L0 36 Z`} fill="currentColor" opacity="0.16" />
      <path
        d={line}
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

/** Ring di progresso: traccia + arco accent (98%). */
function Ring({ value, className }: { value: number; className?: string }) {
  const r = 16;
  const c = 2 * Math.PI * r;
  const dash = (Math.min(100, Math.max(0, value)) / 100) * c;
  return (
    <svg viewBox="0 0 40 40" className={cn("text-accent", className)} aria-hidden>
      <circle cx="20" cy="20" r={r} fill="none" stroke="currentColor" strokeWidth="4" opacity="0.18" />
      <circle
        cx="20"
        cy="20"
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${c}`}
        transform="rotate(-90 20 20)"
      />
    </svg>
  );
}
