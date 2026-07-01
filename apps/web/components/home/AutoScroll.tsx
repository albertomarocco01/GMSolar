"use client";

/**
 * @descrizione  Motore di SCORRIMENTO AUTOMATICO per la home scrollytelling.
 *   UN SOLO orologio: avanza dentro `gsap.ticker` (lo stesso che pilota Lenis e
 *   ScrollTrigger). Non fa creep costante: viaggia da un ANCHOR di riposo al
 *   successivo (l'inizio di ogni scena), con ease-in in partenza + ease-out in
 *   atterraggio, poi una SOSTA breve sul beat allineato e riparte. Così non si
 *   ferma MAI a metà scena o dentro un hand-off: gli anchor cadono esattamente
 *   dove l'entrata scena→scena è già completa. Il mouse REALE cede il controllo;
 *   dopo l'inattività riparte verso l'anchor successivo (ricalcolato dalla
 *   posizione corrente, mai dal punto morto). I moduli chiedono pause
 *   "recitazione" via `autoscroll:hold`. La pill si nasconde da sola.
 *   Reduced-motion: non fa nulla (scroll nativo).
 * @indice
 * - AutoScroll → componente client da montare una volta sulla pagina home
 */
import { useEffect, useRef, useState } from "react";
import { Play } from "lucide-react";
import { gsap, ScrollTrigger } from "@gmgroup/lib/gsap";
import { prefersReducedMotion, useReducedMotion } from "@gmgroup/lib/motion";

/** Sottoinsieme dell'API Lenis che ci serve (no `any`). */
type LenisLike = {
  scroll: number;
  limit: number;
  scrollTo: (
    target: number,
    opts?: { immediate?: boolean; duration?: number; onComplete?: () => void },
  ) => void;
};

// ── Knob (cadenza cinematografica) ───────────────────────────────────────────
/** Velocità di crociera in px/SECONDO (indip. dal refresh rate). Ritarata su +170%
 *  di altezza pagina introdotta in Fase 5 (~32k px): a 110 l'autoplay durava ~5 min. */
const SPEED = 190;
/** Pavimento di velocità nella zona di atterraggio: evita il crawl infinito. */
const MIN_SPEED = 40;
/** Ampiezza (px) dell'inviluppo ease-in/ease-out attorno a ogni anchor. */
const LAND_ZONE = 280;
/** Soglia (px) di "arrivo" all'anchor → clamp + sosta. */
const ARRIVE_EPS = 2;
/** Sosta breve (ms) su ogni anchor allineato prima di ripartire. */
const DWELL_MS = 850;
/** Inattività mouse prima che l'auto riparta (~2s: prima era 9s, troppo). */
const IDLE_MS = 2000;
/** Dopo quanto la pill si auto-nasconde. */
const PILL_HIDE_MS = 3500;

export default function AutoScroll() {
  const reduced = useReducedMotion();
  const [auto, setAuto] = useState(true);
  const [pillShown, setPillShown] = useState(true);
  const [holding, setHolding] = useState(false);
  const [paused, setPaused] = useState(false); // pausa VOLONTARIA (click) → overlay

  const autoRef = useRef(true);
  const lockedRef = useRef(false); // pausa VOLONTARIA (click o pill); l'idle non la supera
  const replayingRef = useRef(false); // rewind "Rivedi" in corso: ignora input/idle
  const togglePauseRef = useRef<() => void>(() => {}); // esposto alla pill (definito nell'effect)
  const atBottomRef = useRef(false);
  const holdUntilRef = useRef(0);
  /** Resto sub-pixel accumulato tra i frame. Lenis riallinea `scroll` all'intero
   *  scrollTop nativo ad ogni frame, quindi un passo < 1px verrebbe arrotondato via
   *  e mai applicato: alla velocità di atterraggio (MIN_SPEED/60fps ≈ 0.4-0.7 px)
   *  l'auto si bloccava a ~65px dall'anchor. Accumuliamo la frazione e avanziamo di
   *  interi → moto garantito a ogni cadenza di refresh, velocità media preservata. */
  const carryRef = useRef(0);
  /** Anchor di riposo (posizioni scroll-Y assolute), ordinati crescenti. */
  const anchorsRef = useRef<number[]>([]);

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

    // Anchor = inizio di ogni scena (le scene sono i <section> figli diretti di
    // #top). A quel punto l'hand-off di ENTRATA è già completo (la scena è a
    // scale 1): fermarsi qui = fermarsi su un beat di riposo, mai in transizione.
    // Aggiungo il fondo pagina come anchor finale (fine demo → fade to black).
    // Ricalcolato su resize e su ScrollTrigger.refresh (le scene lo emettono al
    // mount), non ad ogni frame: le posizioni cambiano solo per reflow.
    const computeAnchors = () => {
      const scenes = Array.from(document.querySelectorAll<HTMLElement>("#top > section"));
      const sy = window.scrollY;
      const limit =
        getLenis()?.limit || document.documentElement.scrollHeight - window.innerHeight;
      const raw = scenes.map((el) => Math.round(el.getBoundingClientRect().top + sy));
      raw.push(Math.round(limit));
      anchorsRef.current = Array.from(new Set(raw.filter((v) => v >= 0))).sort((a, b) => a - b);
    };

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
        carryRef.current = 0; // fermi/in sosta: niente resto da trascinare alla ripresa
        return;
      }
      const anchors = anchorsRef.current;
      if (anchors.length === 0) {
        computeAnchors();
        return;
      }
      const scroll = lenis.scroll;
      // limit SEMPRE riletto (ResizeObserver di Lenis lo aggiorna in modo async).
      const limit = lenis.limit || document.documentElement.scrollHeight - window.innerHeight;

      // Primo anchor DAVANTI alla posizione corrente (l'auto va solo in avanti).
      let idx = -1;
      for (let i = 0; i < anchors.length; i++) {
        if (anchors[i] > scroll + ARRIVE_EPS) {
          idx = i;
          break;
        }
      }
      if (idx === -1) {
        // Niente più anchor davanti: fine demo, stop NEUTRO (niente lock).
        atBottomRef.current = true;
        if (autoRef.current) setAutoState(false);
        return;
      }
      atBottomRef.current = false;

      const target = Math.min(anchors[idx], limit);
      const from = idx > 0 ? anchors[idx - 1] : 0; // anchor di partenza (per l'ease-in)
      const dist = target - scroll;

      if (dist <= ARRIVE_EPS) {
        // Atterrato: allinea di precisione e SOSTA (max: non accorcia un hold esterno).
        lenis.scrollTo(target, { immediate: true });
        holdUntilRef.current = Math.max(holdUntilRef.current, performance.now() + DWELL_MS);
        carryRef.current = 0;
        return;
      }

      // Inviluppo ease-in (dalla partenza) ∩ ease-out (verso l'arrivo) + respiro
      // lieve → cadenza cinematografica, non metronomica.
      const rampIn = LAND_ZONE > 0 ? Math.min(1, Math.max(0, scroll - from) / LAND_ZONE) : 1;
      const rampOut = LAND_ZONE > 0 ? Math.min(1, dist / LAND_ZONE) : 1;
      const shape = Math.min(rampIn, rampOut);
      const breath = 0.9 + 0.1 * (0.5 + 0.5 * Math.sin(performance.now() * 0.0004));
      const v = Math.max(MIN_SPEED, SPEED * shape * breath);
      // Passo desiderato (px) + resto sub-pixel accumulato. Avanziamo di INTERI: sotto
      // la soglia di 1px Lenis riarrotonderebbe a zero → il resto matura in frame futuri.
      const desired = v * (Math.min(deltaMs, 50) / 1000) + carryRef.current; // clamp anti-salto
      let step = Math.floor(desired);
      carryRef.current = desired - step; // frazione riportata al frame successivo
      if (step > dist) {
        step = dist; // niente overshoot dell'anchor
        carryRef.current = 0;
      }
      if (step > 0) lenis.scrollTo(scroll + step, { immediate: true });
    };

    // Setup: primo calcolo (deferito così il layout delle scene è pronto) +
    // ricalcolo su refresh/resize.
    const raf0 = requestAnimationFrame(computeAnchors);
    ScrollTrigger.addEventListener("refresh", computeAnchors);
    window.addEventListener("resize", computeAnchors, { passive: true });
    gsap.ticker.add(tick);

    let idle: ReturnType<typeof setTimeout> | undefined;
    /** Input utente → cede il controllo; idle → riprende (target ricalcolato nel tick). */
    const yield_ = () => {
      if (lockedRef.current || replayingRef.current) return;
      if (autoRef.current) setAutoState(false);
      if (idle) clearTimeout(idle);
      idle = setTimeout(() => {
        if (!lockedRef.current && !replayingRef.current && !atBottomRef.current) setAutoState(true);
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
      holdUntilRef.current = Math.max(holdUntilRef.current, performance.now() + ms);
      setHolding(true);
      if (holdEndTimer) clearTimeout(holdEndTimer);
      holdEndTimer = setTimeout(() => setHolding(false), ms);
    };

    // Pausa VOLONTARIA: un click ferma tutto (l'idle non la supera); un altro riparte.
    const togglePause = () => {
      if (replayingRef.current) return;
      if (lockedRef.current) {
        lockedRef.current = false;
        setPaused(false);
        atBottomRef.current = false;
        setAutoState(true);
      } else {
        lockedRef.current = true;
        setPaused(true);
        setAutoState(false);
      }
    };
    togglePauseRef.current = togglePause;

    // Click in QUALSIASI punto → pausa/ripresa. Esclude elementi interattivi
    // (pill, CTA di chiusura): lì scatta il loro onClick, non la pausa globale.
    const onClick = (e: MouseEvent) => {
      const t = e.target as Element | null;
      if (t && t.closest("a, button, [data-no-pause]")) return;
      togglePause();
    };

    // "Rivedi la presentazione": rewind SMOOTH fino in cima, poi riparte l'auto.
    // Durante il rewind l'auto è spento (sennò il tick lo contrasterebbe) e
    // replayingRef blinda idle/input.
    const onReplay = () => {
      const lenis = getLenis();
      replayingRef.current = true;
      lockedRef.current = false;
      setPaused(false);
      atBottomRef.current = false;
      setAutoState(false);
      const finish = () => {
        replayingRef.current = false;
        atBottomRef.current = false;
        setAutoState(true);
        flashPill();
      };
      if (lenis) lenis.scrollTo(0, { duration: 2.2, onComplete: finish });
      else {
        window.scrollTo({ top: 0, behavior: "smooth" });
        finish();
      }
    };

    const opts: AddEventListenerOptions = { passive: true };
    window.addEventListener("mousemove", onMouseMove, opts);
    window.addEventListener("wheel", yield_, opts);
    window.addEventListener("touchstart", yield_, opts);
    window.addEventListener("touchmove", yield_, opts);
    window.addEventListener("pointerdown", yield_, opts);
    window.addEventListener("keydown", yield_);
    window.addEventListener("autoscroll:hold", onHold);
    window.addEventListener("click", onClick);
    window.addEventListener("presentation:replay", onReplay);

    return () => {
      cancelAnimationFrame(raf0);
      gsap.ticker.remove(tick);
      ScrollTrigger.removeEventListener("refresh", computeAnchors);
      window.removeEventListener("resize", computeAnchors);
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
      window.removeEventListener("click", onClick);
      window.removeEventListener("presentation:replay", onReplay);
    };
  }, [reduced]);

  if (reduced) return null;

  const label = holding
    ? "In riproduzione…"
    : auto
      ? "Scorri per il controllo manuale"
      : "Manuale · scorri per navigare";

  return (
    <>
      {/* Pill-hint in basso: come prendere il controllo. Sparisce in pausa (parla l'overlay). */}
      <div
        className={`pointer-events-none fixed inset-x-0 bottom-5 z-40 flex justify-center transition-opacity duration-500 ${
          pillShown && !paused ? "opacity-100" : "opacity-0"
        }`}
      >
        <button
          type="button"
          onClick={() => togglePauseRef.current()}
          aria-pressed={paused}
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

      {/* Overlay di PAUSA: la presentazione è ferma, un click la fa ripartire. */}
      <div
        aria-hidden
        className={`pointer-events-none fixed inset-0 z-40 flex items-center justify-center transition-opacity duration-300 ${
          paused ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="bg-background/75 flex items-center gap-2.5 rounded-full px-6 py-3 shadow-lg backdrop-blur-sm">
          <Play className="text-accent-ink h-4 w-4" aria-hidden />
          <span className="text-foreground text-sm font-medium">Premi di nuovo per riprendere</span>
        </div>
      </div>
    </>
  );
}
