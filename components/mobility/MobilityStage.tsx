"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import Container from "@/components/ui/Container";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import SplitTextReveal from "@/components/ui/SplitTextReveal";
import { ScrollTrigger } from "@/lib/gsap";
import { useIsoLayoutEffect, useReducedMotion } from "@/lib/motion";
import { WALLBOX_PARTS } from "@/components/mobility/content";
import WallboxPoster from "./three/WallboxPoster";

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
    return !!(window.WebGLRenderingContext && (c.getContext("webgl") || c.getContext("experimental-webgl")));
  } catch {
    return false;
  }
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
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const [near, setNear] = useState(false);
  const [exploded, setExploded] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const explodedRef = useRef(false);

  // Determina WebGL solo lato client (evita mismatch SSR). Differito a un rAF
  // così non scateniamo un setState sincrono dentro l'effect.
  useEffect(() => {
    const id = requestAnimationFrame(() => setWebgl(detectWebGL()));
    return () => cancelAnimationFrame(id);
  }, []);

  const hasWebGL = webgl === true;
  // animated = scroll storytelling pieno. Finché webgl è null restiamo "static".
  const animated = hasWebGL && !reduced;

  // Monta il Canvas solo quando la scena è vicina al viewport (risparmia GPU).
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el || webgl === null) return;
    const io = new IntersectionObserver(
      ([entry]) => setNear(entry.isIntersecting),
      { rootMargin: "300px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [webgl]);

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
        }
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

  const visual =
    webgl === null ? (
      <CanvasSkeleton />
    ) : hasWebGL ? (
      near ? (
        <WallboxCanvas progressRef={progress} animated={animated} exploded={exploded} />
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

  // -------- Modalità STATICA (reduced-motion / no-WebGL / pre-detect) --------
  if (!animated) {
    return (
      <section className="relative isolate overflow-hidden">
        <StageBackdrop />
        <Container className="grid items-center gap-10 py-24 lg:grid-cols-2 lg:gap-8 lg:py-28">
          {heroCopy}
          <div className="relative mx-auto aspect-square w-full max-w-md">{visual}</div>
        </Container>
        {/* L'explode è "movimento": in static i componenti diventano una lista. */}
        <Container className="pb-20">
          <SpecList />
        </Container>
      </section>
    );
  }

  // -------- Modalità ANIMATA: scena pinnata + scroll storytelling --------
  return (
    <section
      ref={wrapperRef}
      aria-label="Anatomia della colonnina di ricarica"
      className="relative h-[360svh]"
    >
      <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden">
        <StageBackdrop />
        {/* Scena 3D a tutto riquadro */}
        <div className="absolute inset-0">{visual}</div>
        {/* Copy dell'hero (si dissolve scrollando, lasciando posto all'explode) */}
        <Container className="relative z-10">{heroCopy}</Container>
        <ScrollHint />
      </div>
    </section>
  );
}

/* Sfondo della scena: gradiente scuro + alone verde (l'accent del mondo). */
function StageBackdrop() {
  return (
    <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
      <div className="from-brand-950 via-background to-background absolute inset-0 bg-gradient-to-b" />
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

/* Lista statica dei componenti (fallback dell'explode in reduced-motion). */
function SpecList() {
  return (
    <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {WALLBOX_PARTS.map((part, i) => (
        <li key={part.id} className="bg-surface/60 border-border flex gap-3 rounded-lg border p-4">
          <span className="text-accent-ink font-display text-sm font-semibold tabular-nums">
            {String(i + 1).padStart(2, "0")}
          </span>
          <div>
            <p className="text-sm font-semibold">{part.label}</p>
            <p className="text-muted text-xs">{part.hint}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
