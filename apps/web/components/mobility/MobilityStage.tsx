"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import Container from "@gmgroup/ui/Container";
import Badge from "@gmgroup/ui/Badge";
import Button from "@gmgroup/ui/Button";
import SplitTextReveal from "@gmgroup/ui/SplitTextReveal";
import { ScrollTrigger } from "@gmgroup/lib/gsap";
import { useIsoLayoutEffect, useReducedMotion } from "@gmgroup/lib/motion";
import { WALLBOX_PARTS } from "@/components/mobility/content";
import WallboxPoster from "./three/WallboxPoster";
import PartDetailPanel from "./PartDetailPanel";

/* Canvas R3F: caricato SOLO lato client (ssr:false) e in chunk separato. Lo
   skeleton fa da fallback durante il download del bundle 3D. */
const WallboxCanvas = dynamic(() => import("./three/WallboxCanvas"), {
  ssr: false,
  loading: () => <CanvasSkeleton />,
});

function clamp01(n: number) {
  return n < 0 ? 0 : n > 1 ? 1 : n;
}
function smoothstep(a: number, b: number, x: number) {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
}

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

  let dprMax = 1.5; // tetto più prudente del precedente 1.75
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

/**
 * Sezioni 1 + 2 unificate: un'unica scena 3D "pinnata" che fa da hero e da
 * storytelling. Scrollando, la colonnina ruota e i componenti si separano
 * (explode) con label e impulso di energia sul cavo.
 *
 * Fallback (regola di progetto): se prefers-reduced-motion o WebGL assente →
 * render STATICO, niente rotazione allo scroll. Il copy è sempre in SSR.
 */
export default function MobilityStage() {
  const reduced = useReducedMotion();
  // null = non ancora deciso (SSR + primo render client). Decidere PRIMA del
  // paint (useIsoLayoutEffect, sotto) evita lo "swap" statico→animato a schermo.
  const [quality, setQuality] = useState<Quality | null>(null);
  // Mount gate del Canvas. Default true: l'hero è in cima alla pagina, quindi a
  // schermo al load — montare subito evita un frame di skeleton. L'observer lo
  // mette a false solo quando la scena esce dal viewport (≤300px).
  const [near, setNear] = useState(true);
  // Render-loop gate sul viewport reale (vedi WallboxCanvas). Default true.
  const [visible, setVisible] = useState(true);
  const [exploded, setExploded] = useState(false);
  // True se la GPU perde il contesto WebGL → fallback automatico al poster.
  const [contextLost, setContextLost] = useState(false);
  // Explode interattivo: componente selezionato (apre il pannello di dettaglio).
  const [selected, setSelected] = useState<string | null>(null);
  const selectedPart = selected ? (WALLBOX_PARTS.find((p) => p.id === selected) ?? null) : null;

  const wrapperRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const explodedRef = useRef(false);
  // Ponte verso il render-loop "demand": il Canvas registra qui la sua invalidate.
  const invalidateRef = useRef<(() => void) | null>(null);
  // Timer della "coda" di frame dopo lo stop dello scroll (vedi onUpdate).
  const tailTimer = useRef<number | undefined>(undefined);

  // Decisione di qualità/WebGL lato client, PRIMA del paint: il primo render
  // (= SSR, indipendente da reduced/webgl) mostra il contenitore "in attesa",
  // poi il layout effect risolve la qualità e ricommitta prima che il browser
  // dipinga → niente flash/CLS nel caso comune (WebGL presente).
  useIsoLayoutEffect(() => {
    setQuality(detectQuality());
  }, []);

  const decided = quality !== null;
  const hasWebGL = quality?.webgl === true && !contextLost;
  // animated = scroll storytelling pieno. Finché non deciso restiamo "in attesa".
  const animated = hasWebGL && !reduced;
  // Contenitore alto (pinnato): mostrato sia "in attesa" sia in modalità animata,
  // così non cambia forma quando il WebGL viene confermato.
  const showStage = !decided || animated;

  // Due IntersectionObserver sullo stesso wrapper:
  // - mountIO (margine 300px): MONTA il Canvas in anticipo, niente pop-in.
  // - viewIO (nessun margine): gating del RENDER LOOP sul viewport reale, così
  //   il loop continuo gira solo mentre la scena è davvero a schermo.
  useEffect(() => {
    if (!animated) return;
    const el = wrapperRef.current;
    if (!el) return;
    const mountIO = new IntersectionObserver(([entry]) => setNear(entry.isIntersecting), {
      rootMargin: "300px 0px",
    });
    const viewIO = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      rootMargin: "0px",
    });
    mountIO.observe(el);
    viewIO.observe(el);
    return () => {
      mountIO.disconnect();
      viewIO.disconnect();
    };
  }, [animated]);

  // Rientro nel viewport: il frameloop torna "demand", chiediamo un repaint.
  useEffect(() => {
    if (visible) invalidateRef.current?.();
  }, [visible]);

  // Pulizia della coda di frame al dismount.
  useEffect(() => () => clearTimeout(tailTimer.current), []);

  // ScrollTrigger (solo in modalità animata): pilota progress + dissolve il copy.
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
        const hero = heroRef.current;
        if (hero) {
          const fade = 1 - smoothstep(0, 0.14, self.progress);
          hero.style.opacity = String(fade);
          hero.style.transform = `translateY(${-40 * (1 - fade)}px)`;
          hero.style.pointerEvents = fade < 0.1 ? "none" : "auto";
          // Quando è dissolto, l'hero esce dal flusso di focus/AT: niente "trap"
          // di tastiera su bottoni invisibili (inert li toglie anche dagli SR).
          hero.inert = fade < 0.1;
        }
        // Render-loop "demand": ogni tick di scroll chiede UN frame.
        invalidateRef.current?.();
        // Coda: dopo lo stop dello scroll, qualche frame per far convergere il
        // lerp morbido di rotazione/camera (altrimenti si fermerebbe "appena
        // dietro" al target). Bounded → la CPU torna comunque idle.
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
        selected={selected}
        onSelect={setSelected}
      />
    ) : (
      <CanvasSkeleton />
    )
  ) : (
    <WallboxPoster />
  );

  const heroCopy = (
    <div ref={heroRef} className="max-w-xl will-change-transform">
      <Badge className="mb-5">GMobility · ricarica elettrica</Badge>
      <SplitTextReveal
        as="h1"
        text="La ricarica che muove l'Italia."
        className="font-display text-display-sm sm:text-display-md font-bold text-balance"
      />
      <p className="text-muted mt-6 text-lg text-pretty">
        Wallbox e colonnine Mennekes per casa, azienda e spazi pubblici. Scorri per esplorare la
        colonnina componente per componente.
      </p>
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Button href="#soluzioni" size="lg">
          Scopri le soluzioni
        </Button>
        <Button href="#configuratore" variant="outline" size="lg">
          Configura la tua ricarica
        </Button>
      </div>
    </div>
  );

  // -------- Modalità STATICA (decisa: reduced-motion / no-WebGL) --------
  // Solo a decisione presa: finché è "in attesa" usiamo il contenitore alto
  // sotto, così il caso comume (WebGL) non cambia layout (niente flash/CLS).
  if (!showStage) {
    return (
      <section className="relative isolate overflow-hidden">
        <StageBackdrop />
        <Container className="grid items-center gap-10 py-24 lg:grid-cols-2 lg:gap-8 lg:py-28">
          {heroCopy}
          <div className="relative mx-auto aspect-square w-full max-w-md">{visual}</div>
        </Container>
        {/* L'explode è "movimento": in static i componenti diventano una lista
            cliccabile (stesso pannello di dettaglio dell'explode interattivo). */}
        <Container className="pb-20">
          <SpecList selected={selected} onSelect={setSelected} />
        </Container>
        <PartDetailPanel part={selectedPart} onClose={() => setSelected(null)} />
      </section>
    );
  }

  // -------- IN ATTESA / ANIMATA: stesso contenitore alto pinnato --------
  // Finché non deciso mostra hero + skeleton (nessuno ScrollTrigger); appena il
  // WebGL è confermato il Canvas si attiva nello stesso contenitore.
  return (
    <section
      ref={wrapperRef}
      aria-label="Anatomia della colonnina di ricarica"
      className="relative h-[360svh]"
    >
      <div className="sticky top-0 flex h-svh items-center overflow-hidden">
        <StageBackdrop />
        {/* Scena 3D a tutto riquadro */}
        <div className="absolute inset-0">{visual}</div>
        {/* Copy dell'hero (si dissolve scrollando, lasciando posto all'explode) */}
        <Container className="relative z-10">{heroCopy}</Container>
        <ScrollHint />
        {/* Pannello di dettaglio dell'explode interattivo (click su un pezzo). */}
        <PartDetailPanel part={selectedPart} onClose={() => setSelected(null)} />
      </div>
      {/* Anatomia accessibile + interattiva da tastiera: in 3D le label dei pezzi
          sono decorative (<Html>) e i mesh non sono focusabili. Questi bottoni —
          nascosti finché non ricevono focus (pattern skip-link) — danno a screen
          reader e tastiera l'elenco dei componenti E l'apertura del dettaglio. */}
      <ul aria-label="Componenti della colonnina — apri il dettaglio">
        {WALLBOX_PARTS.map((part) => (
          <li key={part.id}>
            <button
              type="button"
              onClick={() => setSelected(part.id)}
              className="bg-surface border-accent text-foreground sr-only rounded-md border px-3 py-2 text-sm font-semibold shadow-lg focus:not-sr-only focus:fixed focus:bottom-4 focus:left-4 focus:z-30"
            >
              {part.label} — {part.hint}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* Sfondo della scena: gradiente scuro + alone verde (l'accent del mondo). */
function StageBackdrop() {
  return (
    <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
      <div className="from-brand-950 via-background to-background absolute inset-0 bg-linear-to-b" />
      <div
        className="absolute top-1/2 left-1/2 h-[60vmin] w-[60vmin] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30 blur-3xl"
        style={{ background: "radial-gradient(circle, var(--accent) 0%, transparent 65%)" }}
      />
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

/* Indicatore di scroll in basso. */
function ScrollHint() {
  return (
    <span
      aria-hidden
      className="text-muted pointer-events-none absolute inset-x-0 bottom-5 mx-auto w-fit text-xs tracking-widest uppercase"
    >
      Scorri per esplorare
    </span>
  );
}

/* Lista dei componenti (fallback dell'explode in reduced-motion / no-WebGL).
   Cliccabile: apre lo stesso pannello di dettaglio dell'explode interattivo. */
function SpecList({
  selected,
  onSelect,
}: {
  selected: string | null;
  onSelect: (id: string | null) => void;
}) {
  return (
    <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {WALLBOX_PARTS.map((part, i) => {
        const active = selected === part.id;
        return (
          <li key={part.id}>
            <button
              type="button"
              onClick={() => onSelect(active ? null : part.id)}
              aria-pressed={active}
              className={
                "flex w-full gap-3 rounded-lg border p-4 text-left transition-colors " +
                (active
                  ? "border-accent bg-accent-soft text-accent-ink"
                  : "bg-surface/60 border-border hover:border-accent/50 hover:bg-surface-2")
              }
            >
              <span className="text-accent-ink font-display text-sm font-semibold tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="block">
                <span className="block text-sm font-semibold">{part.label}</span>
                <span className="text-muted block text-xs">{part.hint}</span>
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
