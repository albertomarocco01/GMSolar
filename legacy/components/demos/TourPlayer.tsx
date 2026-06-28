"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { gsap, ScrollTrigger } from "@gmgroup/lib/gsap";
import { useIsoLayoutEffect, useReducedMotion } from "@gmgroup/lib/motion";
import { cn } from "@gmgroup/lib/utils";
import { useTourControls } from "./useTourControls";
import TourProgress from "./TourProgress";
import TourSlide from "./TourSlide";
import { STATUS } from "./catalog";
import { TOUR_RETURN_FOCUS_KEY } from "./TourEntryButton";
import { SLIDE_SECONDS, slideTitle, type TourSlide as Slide } from "./tour";

/* ---------- Icone inline (niente dipendenze, coerenti col resto del sito) ---------- */
const ICON = "h-6 w-6";
const IconPrev = () => (
  <svg className={ICON} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconNext = () => (
  <svg className={ICON} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconPlay = () => (
  <svg className={ICON} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M8 5v14l11-7z" />
  </svg>
);
const IconPause = () => (
  <svg className={ICON} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M7 5h3v14H7zM14 5h3v14h-3z" />
  </svg>
);
const IconClose = () => (
  <svg className={ICON} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

/** Pulsante tondo dei comandi (tap target ≥ 44px). */
function ControlButton({
  label,
  onClick,
  children,
  className,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "flex h-12 w-12 items-center justify-center rounded-full text-white transition-colors",
        "bg-white/10 hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
        "motion-reduce:transition-none",
        className,
      )}
    >
      {children}
    </button>
  );
}

const SWIPE_THRESHOLD = 45; // px di spostamento orizzontale per contare come swipe
const TAP_MAX_MOVE = 10; // px sotto cui un puntatore è un "tap"

/**
 * Player full-screen del "Demo Wrapped". Orchestratore client unico:
 *  - stato/navigazione/tastiera via useTourControls;
 *  - avanzamento + barra di progresso pilotati da un tween GSAP per slide
 *    (pausa/ripresa = tween.pause()/play(); onComplete → slide successiva);
 *  - crossfade del colore di brand tra slide (la uscente resta ~600ms sotto);
 *  - gesti di puntatore (tap a sinistra/destra, swipe) e pausa mentre si tiene
 *    premuto; pausa a tab nascosta;
 *  - prefers-reduced-motion: niente auto-avanzamento né grandi movimenti, barra
 *    visibile ma statica, navigazione solo manuale.
 * Tutti i timer/tween/listener vengono ripuliti allo smontaggio.
 */
export default function TourPlayer({ slides }: { slides: Slide[] }) {
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const count = slides.length;

  // All'uscita segna il flag così il launcher riprende il focus sul bottone
  // "Avvia il tour" (gestione del focus, WCAG 2.4.3).
  const exit = useCallback(() => {
    try {
      sessionStorage.setItem(TOUR_RETURN_FOCUS_KEY, "1");
    } catch {
      /* sessionStorage non disponibile: nessun ripristino, non bloccante */
    }
    router.push("/demos");
  }, [router]);
  const { index, isPlaying, hidden, next, prev, togglePlay, restart } = useTourControls({
    count,
    reducedMotion,
    onExit: exit,
  });

  const rootRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const incomingRef = useRef<HTMLDivElement>(null);
  const tweenRef = useRef<ReturnType<typeof gsap.to> | null>(null);
  const pointerRef = useRef<{ x: number; y: number; t: number; id: number } | null>(null);

  const [held, setHeld] = useState(false); // dito/mouse premuto → pausa temporanea
  const [renderPrev, setRenderPrev] = useState<number | null>(null); // slide uscente per il crossfade
  const [prevIndex, setPrevIndex] = useState(index);

  const isLast = index === count - 1;

  // "Adjust state during render" (pattern React, NON un effect): quando l'indice
  // cambia, ricorda la slide uscente per il crossfade. Converge subito perché al
  // ri-render prevIndex === index. Con reduced-motion niente crossfade.
  if (prevIndex !== index) {
    setPrevIndex(index);
    setRenderPrev(reducedMotion ? null : prevIndex);
  }

  // Focus iniziale nel player: la tastiera funziona e l'AT entra nel tour.
  useEffect(() => {
    rootRef.current?.focus();
  }, []);

  // Entrata della slide corrente: fade del layer (prima del paint, niente flash)
  // e rimozione della slide uscente a crossfade concluso. I titoli/contatori
  // interni hanno il loro reveal (SplitTextReveal/AnimatedCounter).
  useIsoLayoutEffect(() => {
    if (reducedMotion) return;
    const el = incomingRef.current;
    if (!el) return;
    const tw = gsap.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.45, ease: "power2.out" });
    // Ricalcola i trigger (titoli/contatori) ora che la slide è in viewport.
    ScrollTrigger.refresh();
    // Smonta la slide uscente a fine crossfade (setState in callback: consentito).
    const clear = window.setTimeout(() => setRenderPrev(null), 600);
    return () => {
      tw.kill();
      window.clearTimeout(clear);
    };
  }, [index, reducedMotion]);

  // Tween di avanzamento + stato della barra per la slide attiva.
  useIsoLayoutEffect(() => {
    tweenRef.current?.kill();
    tweenRef.current = null;

    const container = progressRef.current;
    if (!container) return;
    const fills = Array.from(container.querySelectorAll<HTMLElement>("[data-fill]"));
    // Segmenti passati pieni, futuri vuoti.
    fills.forEach((fill, i) => {
      gsap.set(fill, { scaleX: i < index ? 1 : 0, transformOrigin: "left center" });
    });

    const activeFill = fills[index];
    if (!activeFill) return;

    // Niente auto-avanzamento con reduced-motion o sull'ultima slide: segmento
    // attivo pieno per indicare la posizione.
    if (reducedMotion || isLast) {
      gsap.set(activeFill, { scaleX: 1, transformOrigin: "left center" });
      return;
    }

    const tween = gsap.to(activeFill, {
      scaleX: 1,
      transformOrigin: "left center",
      duration: SLIDE_SECONDS,
      ease: "none",
      paused: true,
      onComplete: () => next(),
    });
    tweenRef.current = tween;
    return () => {
      tween.kill();
    };
  }, [index, reducedMotion, isLast, count]);

  // Sincronizza play/pausa del tween con: preferenza utente, hold, tab nascosta.
  useEffect(() => {
    const tween = tweenRef.current;
    if (!tween) return;
    if (isPlaying && !held && !hidden) tween.play();
    else tween.pause();
  }, [isPlaying, held, hidden, index]);

  /* ---------- Gesti di puntatore sulla radice (tap-regioni + swipe + hold) ---------- */
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    pointerRef.current = { x: e.clientX, y: e.clientY, t: e.timeStamp, id: e.pointerId };
    setHeld(true);
  }, []);

  const endHold = useCallback(() => setHeld(false), []);

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      setHeld(false);
      const start = pointerRef.current;
      pointerRef.current = null;
      if (!start || start.id !== e.pointerId) return;

      // Tocco su un elemento interattivo (CTA/controlli): lascia fare a lui.
      const target = e.target as HTMLElement;
      if (target.closest("a, button, [data-tour-interactive]")) return;

      const dx = e.clientX - start.x;
      const dy = e.clientY - start.y;

      // Swipe orizzontale.
      if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) next();
        else prev();
        return;
      }
      // Tap: terzo sinistro = indietro, terzo destro = avanti, centro = niente.
      if (Math.abs(dx) < TAP_MAX_MOVE && Math.abs(dy) < TAP_MAX_MOVE) {
        const rect = rootRef.current?.getBoundingClientRect();
        if (!rect) return;
        const rel = (e.clientX - rect.left) / rect.width;
        if (rel < 0.33) prev();
        else if (rel > 0.66) next();
      }
    },
    [next, prev],
  );

  // Annuncio per screen reader: include lo stato (Pronto/In lavorazione) per le
  // slide demo, così l'affordance non è solo visiva.
  const current = slides[index];
  const liveText =
    `Slide ${index + 1} di ${count}: ${slideTitle(current)}` +
    (current.kind === "demo" ? ` — ${STATUS[current.demo.status].label}` : "");

  return (
    <div
      ref={rootRef}
      tabIndex={-1}
      role="region"
      aria-roledescription="Carosello"
      aria-label="Demo Wrapped — il tour delle demo GM Group"
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={endHold}
      onPointerLeave={endHold}
      className="fixed inset-0 z-60 touch-pan-y overflow-hidden bg-[#07090d] text-white select-none outline-none"
    >
      {/* Slide uscente (crossfade), decorativa e non interattiva. */}
      {renderPrev !== null && renderPrev !== index && (
        <div
          key={`prev-${renderPrev}`}
          aria-hidden
          className="pointer-events-none absolute inset-0"
        >
          <TourSlide slide={slides[renderPrev]} />
        </div>
      )}
      {/* Slide corrente. */}
      <div key={`cur-${index}`} ref={incomingRef} className="absolute inset-0">
        <TourSlide slide={slides[index]} onRestart={restart} />
      </div>

      {/* Overlay superiore: barra di avanzamento + titolo + uscita. */}
      <div
        data-tour-interactive
        className="absolute inset-x-0 top-0 z-40 flex flex-col gap-3 px-4"
        style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
      >
        <TourProgress ref={progressRef} count={count} />
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wide text-white/70">
            GM <span className="text-(--card-accent)">Group</span> · il tour
          </span>
          <ControlButton label="Esci dal tour (Esc)" onClick={exit} className="h-10 w-10">
            <IconClose />
          </ControlButton>
        </div>
      </div>

      {/* Overlay inferiore: comandi raggiungibili col pollice. */}
      <div
        data-tour-interactive
        className="absolute inset-x-0 bottom-0 z-40 flex items-center justify-center gap-4 px-4"
        style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
      >
        <ControlButton label="Slide precedente" onClick={prev}>
          <IconPrev />
        </ControlButton>
        {!reducedMotion && (
          <ControlButton
            label={isPlaying ? "Metti in pausa" : "Riprendi"}
            onClick={togglePlay}
            className="h-14 w-14 bg-white/15"
          >
            {isPlaying ? <IconPause /> : <IconPlay />}
          </ControlButton>
        )}
        <ControlButton label="Slide successiva" onClick={next}>
          <IconNext />
        </ControlButton>
      </div>

      {/* Annuncio del cambio slide per gli screen reader. */}
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {liveText}
      </p>
    </div>
  );
}
