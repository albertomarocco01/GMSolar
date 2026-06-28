"use client";

/**
 * @descrizione  Motore di SCORRIMENTO AUTOMATICO per la home scrollytelling.
 *   Pilota l'istanza Lenis (esposta da LenisProvider su window.__lenis) avanzando
 *   lo scroll di pochi px a frame. Appena l'utente MUOVE IL MOUSE (movimento
 *   reale) o usa rotella/touch/tastiera prende il controllo; dopo ~2.5s di
 *   inattività l'auto riparte. Una pill in basso mostra lo stato e permette di
 *   bloccare/sbloccare manualmente (controllo accessibile da tastiera).
 *   Rispetta SEMPRE prefers-reduced-motion: con reduced-motion non fa nulla.
 * @indice
 * - AutoScroll → componente client da montare una volta sulla pagina home
 */
import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@gmgroup/lib/motion";

/** Sottoinsieme dell'API Lenis che ci serve (no `any`). */
type LenisLike = {
  scroll: number;
  limit: number;
  scrollTo: (target: number, opts?: { immediate?: boolean }) => void;
};

/** px di avanzamento per frame (~60fps → ~84 px/s): cinematico, non glaciale. */
const SPEED = 1.4;
/** ms di inattività del mouse dopo cui l'auto riparte. */
const IDLE_MS = 2500;

export default function AutoScroll() {
  const [auto, setAuto] = useState(true);
  const [reduced, setReduced] = useState(false);
  const autoRef = useRef(true);
  // L'utente ha bloccato manualmente dalla pill? Allora l'idle NON fa ripartire.
  const lockedRef = useRef(false);
  // Pausa temporanea richiesta da un modulo (per far "recitare" la sua animazione).
  const holdUntilRef = useRef(0);

  const setAutoState = (v: boolean) => {
    autoRef.current = v;
    setAuto(v);
  };

  useEffect(() => {
    if (prefersReducedMotion()) {
      setReduced(true);
      return;
    }

    const getLenis = () => (window as unknown as { __lenis?: LenisLike }).__lenis;

    let raf = 0;
    const tick = () => {
      const lenis = getLenis();
      if (
        autoRef.current &&
        lenis &&
        document.visibilityState === "visible" &&
        performance.now() >= holdUntilRef.current
      ) {
        const max = lenis.limit || document.documentElement.scrollHeight - window.innerHeight;
        const next = lenis.scroll + SPEED;
        if (next >= max - 1) {
          // Arrivati in fondo: ferma l'auto (niente loop infinito).
          setAutoState(false);
          lockedRef.current = true;
        } else {
          lenis.scrollTo(next, { immediate: true });
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    let idle: ReturnType<typeof setTimeout> | undefined;
    /** Input dell'utente → cede il controllo; idle → riprende (se non bloccato). */
    const yield_ = () => {
      if (lockedRef.current) return;
      if (autoRef.current) setAutoState(false);
      if (idle) clearTimeout(idle);
      idle = setTimeout(() => {
        if (!lockedRef.current) setAutoState(true);
      }, IDLE_MS);
    };

    // Solo movimenti REALI del mouse (lo scroll che fa muovere il contenuto sotto
    // il cursore genera mousemove "sintetici" con movementX/Y === 0: vanno ignorati,
    // altrimenti l'auto-scroll si fermerebbe da solo).
    const onMouseMove = (e: MouseEvent) => {
      if (e.movementX !== 0 || e.movementY !== 0) yield_();
    };

    // Un modulo chiede una pausa per "recitare" la sua animazione (auto-scroll
    // sospeso per `ms`, poi riprende da solo se l'utente non ha preso il controllo).
    const onHold = (e: Event) => {
      const ms = (e as CustomEvent<{ ms?: number }>).detail?.ms ?? 0;
      if (ms > 0) holdUntilRef.current = performance.now() + ms;
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
      cancelAnimationFrame(raf);
      if (idle) clearTimeout(idle);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("wheel", yield_);
      window.removeEventListener("touchstart", yield_);
      window.removeEventListener("touchmove", yield_);
      window.removeEventListener("pointerdown", yield_);
      window.removeEventListener("keydown", yield_);
      window.removeEventListener("autoscroll:hold", onHold);
    };
  }, []);

  if (reduced) return null;

  const toggle = () => {
    if (autoRef.current) {
      lockedRef.current = true;
      setAutoState(false);
    } else {
      lockedRef.current = false;
      setAutoState(true);
    }
  };

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-5 z-40 flex justify-center">
      <button
        type="button"
        onClick={toggle}
        aria-pressed={auto}
        className="border-border/70 bg-background/80 text-muted hover:text-foreground pointer-events-auto flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium shadow-lg backdrop-blur-md transition-colors"
      >
        <span
          aria-hidden
          className={
            auto ? "bg-accent h-2 w-2 animate-pulse rounded-full" : "bg-muted h-2 w-2 rounded-full"
          }
        />
        {auto
          ? "Scorrimento automatico — muovi il mouse per controllare"
          : "Controllo manuale — tocca per riavviare"}
      </button>
    </div>
  );
}
