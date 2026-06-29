"use client";

/**
 * @descrizione  Motore di SCORRIMENTO AUTOMATICO per la home scrollytelling.
 *   UN SOLO orologio: avanza dentro `gsap.ticker` (lo stesso che pilota Lenis e
 *   ScrollTrigger), a velocità in px/SECONDO via deltaTime → ritmo identico su
 *   60/120Hz. Il mouse REALE (o rotella/touch/tastiera) cede il controllo; dopo
 *   l'inattività riparte. I moduli chiedono pause "recitazione" via
 *   `autoscroll:hold`. Il fondo è uno stato NEUTRO e ripartibile (mai un lock da
 *   `lenis.limit` stale). La pill si nasconde da sola e riappare al movimento.
 *   Reduced-motion: non fa nulla (scroll nativo).
 * @indice
 * - AutoScroll → componente client da montare una volta sulla pagina home
 */
import { useEffect, useRef, useState } from "react";
import { gsap } from "@gmgroup/lib/gsap";
import { prefersReducedMotion, useReducedMotion } from "@gmgroup/lib/motion";

/** Sottoinsieme dell'API Lenis che ci serve (no `any`). */
type LenisLike = {
  scroll: number;
  limit: number;
  scrollTo: (target: number, opts?: { immediate?: boolean }) => void;
};

/** Velocità in px/SECONDO (indip. dal refresh rate). */
const SPEED = 110;
/** Inattività mouse prima che l'auto riparta (sala: il presentatore parla). */
const IDLE_MS = 9000;
/** Dopo quanto la pill si auto-nasconde. */
const PILL_HIDE_MS = 3500;

export default function AutoScroll() {
  const reduced = useReducedMotion();
  const [auto, setAuto] = useState(true);
  const [pillShown, setPillShown] = useState(true);
  const [holding, setHolding] = useState(false);

  const autoRef = useRef(true);
  const lockedRef = useRef(false); // blocco VOLONTARIO (pill); l'idle non lo supera
  const atBottomRef = useRef(false);
  const holdUntilRef = useRef(0);

  const setAutoState = (v: boolean) => {
    autoRef.current = v;
    setAuto(v);
  };

  useEffect(() => {
    // Reduced-motion: nessun auto-scroll (scroll nativo). Lettura SINCRONA così il
    // ticker non parte mai (l'hook `reduced` può ritardare di un render in
    // hydration); `reduced` è in deps per ri-eseguire se la preferenza cambia a runtime.
    if (prefersReducedMotion()) return;

    const getLenis = () => (window as unknown as { __lenis?: LenisLike }).__lenis;

    // Avanzamento dentro il ticker GSAP: gira DOPO lenis.raf (registrato prima da
    // LenisProvider), quindi legge una posizione coerente nello stesso frame.
    const tick = (_time: number, deltaMs: number) => {
      const lenis = getLenis();
      if (
        !autoRef.current ||
        !lenis ||
        document.visibilityState !== "visible" ||
        performance.now() < holdUntilRef.current
      ) {
        return;
      }
      // limit SEMPRE riletto (ResizeObserver di Lenis lo aggiorna in modo async):
      // così un valore transitoriamente piccolo NON produce un lock permanente.
      const limit = lenis.limit || document.documentElement.scrollHeight - window.innerHeight;
      // Velocità "che respira": lieve oscillazione → ritmo non lineare, non metronomico.
      const breath = 0.78 + 0.44 * (0.5 + 0.5 * Math.sin(performance.now() * 0.0004));
      const step = SPEED * breath * (Math.min(deltaMs, 50) / 1000); // clamp anti-salto
      const next = lenis.scroll + step;
      if (next >= limit - 1) {
        atBottomRef.current = true;
        if (autoRef.current) setAutoState(false); // fine demo: stop NEUTRO (niente lock)
      } else {
        atBottomRef.current = false;
        lenis.scrollTo(next, { immediate: true });
      }
    };
    gsap.ticker.add(tick);

    let idle: ReturnType<typeof setTimeout> | undefined;
    /** Input utente → cede il controllo; idle → riprende (se non bloccato/non al fondo). */
    const yield_ = () => {
      if (lockedRef.current) return;
      if (autoRef.current) setAutoState(false);
      if (idle) clearTimeout(idle);
      idle = setTimeout(() => {
        if (!lockedRef.current && !atBottomRef.current) setAutoState(true);
      }, IDLE_MS);
    };

    // Pill: riappare al movimento reale, poi si auto-nasconde.
    let pillTimer: ReturnType<typeof setTimeout> | undefined;
    const flashPill = () => {
      setPillShown(true);
      if (pillTimer) clearTimeout(pillTimer);
      pillTimer = setTimeout(() => setPillShown(false), PILL_HIDE_MS);
    };
    flashPill();

    // Solo movimenti REALI del mouse (lo scroll genera mousemove sintetici con
    // movementX/Y === 0: vanno ignorati, sennò l'auto si fermerebbe da solo).
    const onMouseMove = (e: MouseEvent) => {
      if (e.movementX !== 0 || e.movementY !== 0) {
        yield_();
        flashPill();
      }
    };

    let holdEndTimer: ReturnType<typeof setTimeout> | undefined;
    const onHold = (e: Event) => {
      const ms = (e as CustomEvent<{ ms?: number }>).detail?.ms ?? 0;
      if (ms <= 0) return;
      holdUntilRef.current = performance.now() + ms;
      setHolding(true);
      if (holdEndTimer) clearTimeout(holdEndTimer);
      holdEndTimer = setTimeout(() => setHolding(false), ms);
    };

    const opts: AddEventListenerOptions = { passive: true };
    window.addEventListener("mousemove", onMouseMove, opts);
    window.addEventListener("wheel", yield_, opts);
    window.addEventListener("touchstart", yield_, opts);
    window.addEventListener("touchmove", yield_, opts);
    window.addEventListener("pointerdown", yield_, opts);
    window.addEventListener("keydown", yield_);
    window.addEventListener("autoscroll:hold", onHold);

    return () => {
      gsap.ticker.remove(tick);
      if (idle) clearTimeout(idle);
      if (pillTimer) clearTimeout(pillTimer);
      if (holdEndTimer) clearTimeout(holdEndTimer);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("wheel", yield_);
      window.removeEventListener("touchstart", yield_);
      window.removeEventListener("touchmove", yield_);
      window.removeEventListener("pointerdown", yield_);
      window.removeEventListener("keydown", yield_);
      window.removeEventListener("autoscroll:hold", onHold);
    };
  }, [reduced]);

  if (reduced) return null;

  const toggle = () => {
    if (autoRef.current) {
      lockedRef.current = true;
      setAutoState(false);
    } else {
      lockedRef.current = false;
      atBottomRef.current = false;
      setAutoState(true);
    }
  };

  const label = holding
    ? "In riproduzione…"
    : auto
      ? "Auto · muovi il mouse per controllare"
      : "Manuale · riprendi";

  return (
    <div
      className={`pointer-events-none fixed inset-x-0 bottom-5 z-40 flex justify-center transition-opacity duration-500 ${
        pillShown ? "opacity-100" : "opacity-0"
      }`}
    >
      <button
        type="button"
        onClick={toggle}
        aria-pressed={auto}
        className="border-border/70 bg-background/80 text-muted hover:text-foreground pointer-events-auto flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium shadow-lg backdrop-blur-sm transition-colors"
      >
        <span
          aria-hidden
          className={
            auto || holding
              ? "bg-accent h-2 w-2 animate-pulse rounded-full"
              : "bg-muted h-2 w-2 rounded-full"
          }
        />
        {label}
      </button>
    </div>
  );
}
