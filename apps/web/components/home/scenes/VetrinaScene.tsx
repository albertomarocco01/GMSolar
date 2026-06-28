"use client";

/**
 * @descrizione  Servizio #1 "Siti vetrina" (tema CHIARO): una VERA scena 3D.
 *   Al centro la colonnina/wallbox R3F costruita da primitive (col CAVO Mode 3 e
 *   l'impulso di energia che scorre) + a fianco un PANNELLO SOLARE isometrico in
 *   SVG (sole + celle che si illuminano). La scena è incorniciata come un sito
 *   ("siti vetrina") e si "monta da sola" scrubbata dallo scroll: la colonnina
 *   ruota e i componenti si separano (explode) man mano che si scende.
 *
 *   Performance / regole di progetto:
 *   - Canvas R3F in `next/dynamic` (ssr:false) + render-on-demand + dpr cap +
 *     Bloom solo su device capaci (profiling come MobilityStage del legacy).
 *   - NIENTE pin lungo: la scena è "sticky" e lo scroll la scrubba per ~70svh
 *     (un pin lungo congelerebbe l'auto-scroll della home — bug evitato).
 *   - WebGL assente / contesto perso → poster SVG. prefers-reduced-motion →
 *     scena ferma (posa assemblata), nessuno ScrollTrigger, SVG senza animazioni.
 * @indice
 * - VetrinaScene → seconda sezione della home (dopo l'hero)
 * - SolarPanelMotif → pannello solare isometrico in SVG (motivo "solare")
 * - Showcase → cornice "sito" (chrome browser + pannello solare + 3D)
 */
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import Container from "@gmgroup/ui/Container";
import { ScrollTrigger } from "@gmgroup/lib/gsap";
import { useIsoLayoutEffect, useReducedMotion } from "@gmgroup/lib/motion";
import WallboxPoster from "../vetrina3d/WallboxPoster";

/* Canvas R3F: SOLO lato client (ssr:false) e in chunk separato. Lo skeleton fa
   da fallback durante il download del bundle 3D. */
const WallboxCanvas = dynamic(() => import("../vetrina3d/WallboxCanvas"), {
  ssr: false,
  loading: () => <CanvasSkeleton />,
});

/** Rilevazione WebGL: se assente → fallback poster (niente Canvas). */
function detectWebGL(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const c = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (c.getContext("webgl") || c.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

/**
 * Profilo di qualità deciso una volta lato client: oltre a WebGL, adatta il
 * carico GPU al device. Su mobile/low-end o con `prefers-reduced-data` abbassiamo
 * il tetto del dpr e spegniamo il Bloom (il postprocessing è la voce più cara).
 */
type Quality = { webgl: boolean; bloom: boolean; dprMax: number };

function detectQuality(): Quality {
  const webgl = detectWebGL();
  const nav = navigator as Navigator & { deviceMemory?: number };
  const cores = typeof nav.hardwareConcurrency === "number" ? nav.hardwareConcurrency : 8;
  const mem = typeof nav.deviceMemory === "number" ? nav.deviceMemory : 8;
  const mm = (q: string) => (window.matchMedia ? window.matchMedia(q).matches : false);
  const reducedData = mm("(prefers-reduced-data: reduce)");
  const coarse = mm("(pointer: coarse)"); // puntatore grossolano → tipicamente mobile
  const lowEnd = cores <= 4 || mem <= 4;

  let dprMax = 1.5;
  let bloom = true;
  if (coarse) dprMax = 1.35; // mobile: meno pixel da riempire
  if (lowEnd) {
    dprMax = Math.min(dprMax, 1.25);
    bloom = false;
  }
  if (reducedData) {
    dprMax = 1;
    bloom = false;
  }
  return { webgl, bloom, dprMax };
}

export default function VetrinaScene() {
  const reduced = useReducedMotion();
  // null = non ancora deciso (SSR + primo render client). Si decide PRIMA del
  // paint (useIsoLayoutEffect) per evitare lo swap statico→animato a schermo.
  const [quality, setQuality] = useState<Quality | null>(null);
  // Mount gate del Canvas (la sezione è sotto l'hero → di default off-screen).
  const [near, setNear] = useState(false);
  // Render-loop gate sul viewport reale (vedi WallboxCanvas). Default true.
  const [visible, setVisible] = useState(true);
  // True quando i componenti sono "esplosi": rivela le label dei pezzi.
  const [exploded, setExploded] = useState(false);
  // True se la GPU perde il contesto WebGL → fallback automatico al poster.
  const [contextLost, setContextLost] = useState(false);

  const wrapperRef = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const explodedRef = useRef(false);
  // Ponte verso il render-loop "demand": il Canvas registra qui la sua invalidate.
  const invalidateRef = useRef<(() => void) | null>(null);
  // Timer della "coda" di frame dopo lo stop dello scroll (vedi onUpdate).
  const tailTimer = useRef<number | undefined>(undefined);

  // Decisione qualità/WebGL lato client, prima del paint.
  useIsoLayoutEffect(() => {
    setQuality(detectQuality());
  }, []);

  const decided = quality !== null;
  const hasWebGL = quality?.webgl === true && !contextLost;
  // animated = scroll storytelling pieno (rotazione + explode + impulso cavo).
  const animated = hasWebGL && !reduced;
  // Contenitore alto (sticky) mostrato sia "in attesa" sia in modalità animata,
  // così non cambia forma quando il WebGL viene confermato.
  const showStage = !decided || animated;
  // Possiamo montare il Canvas? (anche in static, per la posa assemblata 3D).
  const canMount = decided && quality?.webgl === true && !contextLost;

  // Mount observer (margine 300px): MONTA il Canvas poco prima dell'ingresso,
  // niente WebGL context creato al load mentre la sezione è sotto il fold.
  useEffect(() => {
    if (!canMount) return;
    const el = wrapperRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setNear(entry.isIntersecting), {
      rootMargin: "300px 0px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, [canMount]);

  // View observer (margine 0): gating del RENDER LOOP sul viewport reale, così il
  // loop "demand" lavora solo mentre la scena è davvero a schermo (solo animato).
  useEffect(() => {
    if (!animated) return;
    const el = wrapperRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      rootMargin: "0px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, [animated]);

  // Rientro nel viewport: il frameloop torna "demand", chiediamo un repaint.
  useEffect(() => {
    if (visible) invalidateRef.current?.();
  }, [visible]);

  // Pulizia della coda di frame al dismount.
  useEffect(() => () => clearTimeout(tailTimer.current), []);

  // ScrollTrigger (solo animato): NIENTE pin. La sezione è alta 170svh e il suo
  // figlio è "sticky": lo scroll scrubba `progress` 0→1 lungo i ~70svh di corsa
  // dello sticky (la pagina continua a scorrere → l'auto-scroll non si congela).
  useIsoLayoutEffect(() => {
    if (!animated) return;
    const el = wrapperRef.current;
    if (!el) return;

    const st = ScrollTrigger.create({
      trigger: el,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        progress.current = self.progress;
        // Render-loop "demand": ogni tick di scroll chiede UN frame.
        invalidateRef.current?.();
        // Coda: dopo lo stop dello scroll, qualche frame per far convergere il
        // lerp morbido di rotazione/camera. Bounded → la CPU torna idle.
        clearTimeout(tailTimer.current);
        tailTimer.current = window.setTimeout(() => {
          let n = 0;
          const tick = () => {
            invalidateRef.current?.();
            if (++n < 8) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }, 80);
        // Rivela le label dei componenti quando l'explode è avviato (1 setState).
        const ex = self.progress > 0.16;
        if (ex !== explodedRef.current) {
          explodedRef.current = ex;
          setExploded(ex);
        }
      },
    });
    ScrollTrigger.refresh();
    return () => st.kill();
  }, [animated]);

  // Visual nel riquadro 3D: poster su contesto perso / no-WebGL, skeleton finché
  // non deciso o non ancora montato, altrimenti il Canvas.
  const visual = contextLost ? (
    <WallboxPoster />
  ) : !decided ? (
    <CanvasSkeleton />
  ) : hasWebGL ? (
    near ? (
      <WallboxCanvas
        progressRef={progress}
        animated={animated}
        exploded={exploded}
        inView={visible}
        invalidateRef={invalidateRef}
        bloom={quality.bloom}
        dprMax={quality.dprMax}
        onContextLost={() => setContextLost(true)}
        selected={null}
        onSelect={() => {}}
      />
    ) : (
      <CanvasSkeleton />
    )
  ) : (
    <WallboxPoster />
  );

  const heading = (
    <div className="max-w-2xl">
      <p className="text-muted flex items-center gap-3">
        <span className="font-mono text-sm font-bold tabular-nums">01</span>
        <span className="text-accent-ink text-sm font-semibold tracking-widest uppercase">
          Siti vetrina moderni
        </span>
      </p>
      <h2 className="font-display mt-2 text-3xl font-bold tracking-tight text-balance sm:text-5xl">
        Scrollytelling, 3D in tempo reale e motion che spiegano il prodotto.
      </h2>
    </div>
  );

  // -------- Modalità STATICA (reduced-motion / no-WebGL): un solo viewport --------
  if (!showStage) {
    return (
      <section id="vetrina" className="bg-background relative flex min-h-screen items-center py-20">
        <VetrinaBackdrop />
        <Container size="wide" className="relative">
          {heading}
          <div className="mt-8">
            <Showcase visual={visual} animated={false} />
          </div>
        </Container>
      </section>
    );
  }

  // -------- IN ATTESA / ANIMATA: sezione alta + figlio sticky scrubbato --------
  return (
    <section
      ref={wrapperRef}
      id="vetrina"
      aria-label="Siti vetrina moderni — scena 3D"
      className="bg-background relative h-[170svh]"
    >
      <div className="sticky top-0 flex h-svh flex-col justify-center overflow-hidden">
        <VetrinaBackdrop />
        <Container size="wide" className="relative">
          {heading}
          <div className="mt-6">
            <Showcase visual={visual} animated={animated} />
          </div>
        </Container>
      </div>
    </section>
  );
}

/* =============================================================
   Cornice "sito vetrina": chrome browser + pannello solare + riquadro 3D.
   ============================================================= */
function Showcase({ visual, animated }: { visual: React.ReactNode; animated: boolean }) {
  return (
    <div className="border-border shadow-lift relative flex h-[58svh] max-h-[600px] min-h-[340px] flex-col overflow-hidden rounded-2xl border bg-white">
      {/* Chrome del browser (segnala onestamente: è un SITO vetrina) */}
      <div className="border-border/70 flex items-center gap-3 border-b bg-white/70 px-4 py-2.5 backdrop-blur">
        <span className="flex gap-1.5" aria-hidden>
          <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
        </span>
        <span className="bg-surface-2/70 text-muted mx-auto flex max-w-[60%] items-center gap-2 truncate rounded-full px-3 py-1 text-xs">
          <span aria-hidden>🔒</span>
          gmgroup.it
        </span>
      </div>

      {/* Palco: pannello solare a fianco del 3D. Su mobile impilati (3D sopra). */}
      <div className="relative flex flex-1 flex-col-reverse overflow-hidden lg:grid lg:grid-cols-[0.85fr_1.15fr] lg:grid-rows-1">
        {/* Pannello solare (motivo "solare") */}
        <div className="border-border/60 relative grid h-[34%] place-items-center border-t bg-gradient-to-br from-sky-50 via-white to-white p-3 lg:h-auto lg:border-t-0 lg:border-r lg:p-6">
          <SolarPanelMotif animated={animated} />
        </div>

        {/* Riquadro 3D (la colonnina col cavo + impulso di energia) */}
        <div className="relative min-h-[200px] flex-1 bg-gradient-to-b from-white to-sky-50/40 lg:min-h-0">
          {visual}
          <span
            aria-hidden
            className="text-muted/80 pointer-events-none absolute bottom-3 left-3 rounded-full bg-white/60 px-2.5 py-1 text-[10px] font-medium tracking-wide backdrop-blur"
          >
            Pannello solare + ricarica EV · scena 3D{animated ? " · scorre con lo scroll" : ""}
          </span>
        </div>
      </div>
    </div>
  );
}

/* =============================================================
   Pannello solare isometrico (SVG). Sole + griglia di celle; alcune celle si
   illuminano con l'accent (solo `animated` via motion-safe → reduced-motion off).
   Geometria generata da due vettori (R, D) = look "3D" senza WebGL.
   ============================================================= */
function SolarPanelMotif({ animated }: { animated: boolean }) {
  const COLS = 5;
  const ROWS = 4;
  const ox = 52;
  const oy = 120;
  const R: [number, number] = [25, -12.5];
  const D: [number, number] = [25, 12.5];
  const pt = (c: number, r: number) =>
    [ox + c * R[0] + r * D[0], oy + c * R[1] + r * D[1]] as const;
  const poly = (pts: ReadonlyArray<readonly [number, number]>) =>
    pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");

  const cells: { key: string; points: string; lit: boolean; i: number }[] = [];
  let i = 0;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      cells.push({
        key: `${r}-${c}`,
        points: poly([pt(c, r), pt(c + 1, r), pt(c + 1, r + 1), pt(c, r + 1)]),
        lit: (r + c) % 3 === 1, // alcune celle "accese"
        i: i++,
      });
    }
  }
  const outline = poly([pt(0, 0), pt(COLS, 0), pt(COLS, ROWS), pt(0, ROWS)]);

  return (
    <svg
      viewBox="0 0 300 240"
      role="img"
      aria-label="Pannello solare fotovoltaico"
      className="h-full max-h-[34svh] w-full"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <radialGradient id="vt-sun" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="55%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </radialGradient>
        <linearGradient id="vt-cell" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#243247" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
      </defs>

      {/* Sole con alone morbido (pulsa solo se animato) */}
      <g>
        <circle
          cx="238"
          cy="54"
          r="34"
          fill="#fbbf24"
          opacity="0.18"
          className={animated ? "motion-safe:animate-pulse" : undefined}
        />
        <circle cx="238" cy="54" r="20" fill="url(#vt-sun)" />
        {Array.from({ length: 8 }).map((_, k) => {
          const a = (k / 8) * Math.PI * 2;
          const x1 = 238 + Math.cos(a) * 26;
          const y1 = 54 + Math.sin(a) * 26;
          const x2 = 238 + Math.cos(a) * 33;
          const y2 = 54 + Math.sin(a) * 33;
          return (
            <line
              key={k}
              x1={x1.toFixed(1)}
              y1={y1.toFixed(1)}
              x2={x2.toFixed(1)}
              y2={y2.toFixed(1)}
              stroke="#f59e0b"
              strokeWidth="2.4"
              strokeLinecap="round"
              opacity="0.7"
            />
          );
        })}
      </g>

      {/* Ombra a terra (ancora il pannello) */}
      <ellipse cx="165" cy="182" rx="92" ry="13" fill="#0f172a" opacity="0.07" />

      {/* Celle + cornice del pannello */}
      <g>
        {cells.map((cell) => (
          <polygon
            key={cell.key}
            points={cell.points}
            fill={cell.lit ? "var(--accent)" : "url(#vt-cell)"}
            stroke="#0b1220"
            strokeWidth="1"
            opacity={cell.lit ? 0.92 : 1}
            className={cell.lit && animated ? "motion-safe:animate-pulse" : undefined}
            style={cell.lit && animated ? { animationDelay: `${(cell.i % 5) * 240}ms` } : undefined}
          />
        ))}
        <polygon points={outline} fill="none" stroke="#1e293b" strokeWidth="2.5" />
      </g>
    </svg>
  );
}

/* Sfondo della sezione (tema chiaro): aloni accent tenui su bianco. */
function VetrinaBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="bg-accent/15 absolute -top-24 -left-20 h-80 w-80 rounded-full blur-3xl" />
      <div className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-sky-200/30 blur-3xl" />
    </div>
  );
}

/* Skeleton mostrato durante il download del bundle 3D o quando off-screen. */
function CanvasSkeleton() {
  return (
    <div className="absolute inset-0 grid place-items-center">
      <div className="border-accent/30 bg-surface/40 h-2/3 w-1/2 max-w-xs animate-pulse rounded-2xl border" />
    </div>
  );
}
