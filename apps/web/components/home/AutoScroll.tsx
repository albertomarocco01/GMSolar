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
 *   posizione corrente, mai dal punto morto). La pill si nasconde da sola.
 *   La pausa VOLONTARIA (click) è GLOBALE: oltre a fermare l'auto-scroll,
 *   (a) mette `data-presentation-paused` su <html> → uno <style> scoped qui
 *   sotto congela TUTTI i keyframe CSS della home (#top); (b) emette l'evento
 *   `presentation:pausechange` → i tween GSAP infiniti delle scene (repeat:-1)
 *   e gli eventuali <video> in riproduzione libera si fermano/riprendono.
 *   I video SCRUBBATI e le timeline scrubbate seguono solo lo scroll → in
 *   pausa si fermano da soli, non vanno toccati.
 *   Reduced-motion: non fa nulla (scroll nativo, attributo mai impostato).
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
/** Picco di velocità (px/SECONDO, indip. dal refresh rate) al CENTRO di ogni
 *  tratto anchor→anchor. Il profilo è una campana: lento in partenza, veloce a
 *  metà, lento in arrivo → "lento-veloce-lento" ad ogni scena (richiesta utente).
 *  Era 900: i beat centrali (typing, switch pannelli) sembravano "a 2x" e non si
 *  leggevano → dimezzato, ritmo da presentazione. */
const PEAK_SPEED = 450;
/** Pavimento di velocità: ai bordi del tratto la campana → 0, questo evita lo stallo. */
const MIN_SPEED = 120;
/** Soglia (px) di "arrivo" all'anchor → clamp + sosta. */
const ARRIVE_EPS = 2;
/** Sosta breve (ms) su ogni anchor allineato prima di ripartire (era 550: troppo). */
const DWELL_MS = 300;
/** Inattività mouse prima che l'auto riparta (~2s: prima era 9s, troppo). */
const IDLE_MS = 2000;
/** Inattività su TOUCH prima che l'auto riparta (più respiro: si legge col dito fermo). */
const TOUCH_IDLE_MS = 4500;
/** Dopo quanto la pill si auto-nasconde. */
const PILL_HIDE_MS = 3500;

// ── Hand-off "fast" (opt-in: sezioni con data-fast-handoff) ─────────────────
/** Le sezioni marcate ricevono un anchor EXTRA a fine scrub (bottom − viewport):
 *  il tratto da lì all'inizio della scena dopo è il puro hand-off (velo/cross-fade
 *  su fondo uniforme, nessun contenuto leggibile) → si attraversa VELOCE invece
 *  che a passo bell (era ~4-5s di bianco tra video solare e Interfacce). */
const HANDOFF_PEAK = 4200;
const HANDOFF_MIN = 650;
/** Sosta ridotta (ms) sugli anchor adiacenti a un tratto fast: lì la schermata è
 *  vuota, sostare i 300ms pieni allungherebbe solo il bianco. */
const HANDOFF_DWELL_MS = 100;

/** Anchor di riposo: posizione scroll-Y assoluta + flag `fast` (il TRATTO che
 *  PARTE da questo anchor è un hand-off vuoto → profilo veloce, sosta ridotta). */
type Anchor = { p: number; fast: boolean };

export default function AutoScroll() {
  const reduced = useReducedMotion();
  const [auto, setAuto] = useState(true);
  const [pillShown, setPillShown] = useState(true);
  const [paused, setPaused] = useState(false); // pausa VOLONTARIA (click) → overlay

  const autoRef = useRef(true);
  const lockedRef = useRef(false); // pausa VOLONTARIA (click o pill); l'idle non la supera
  const togglePauseRef = useRef<() => void>(() => {}); // esposto alla pill (definito nell'effect)
  const atBottomRef = useRef(false);
  const holdUntilRef = useRef(0);
  /** Resto sub-pixel accumulato tra i frame. Lenis riallinea `scroll` all'intero
   *  scrollTop nativo ad ogni frame, quindi un passo < 1px verrebbe arrotondato via
   *  e mai applicato: alla velocità di atterraggio (MIN_SPEED/60fps ≈ 0.4-0.7 px)
   *  l'auto si bloccava a ~65px dall'anchor. Accumuliamo la frazione e avanziamo di
   *  interi → moto garantito a ogni cadenza di refresh, velocità media preservata. */
  const carryRef = useRef(0);
  /** Anchor di riposo (posizioni scroll-Y assolute + flag fast), ordinati crescenti. */
  const anchorsRef = useRef<Anchor[]>([]);

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

    // INTRO GATE: l'auto-scroll resta fermo finché la title card d'apertura
    // (SolarTwinScene) non è uscita → la card si LEGGE prima che parta lo scroll.
    // Rilasciato dall'evento `presentation:introdone`; un failsafe generoso libera
    // comunque se l'evento non arriva (es. scena solare non montata) → mai bloccato.
    let introHold = true;

    // Anchor = inizio di ogni scena (le scene sono i <section> figli diretti di
    // #top). A quel punto l'hand-off di ENTRATA è già completo (la scena è a
    // scale 1): fermarsi qui = fermarsi su un beat di riposo, mai in transizione.
    // Aggiungo il fondo pagina come anchor finale (fine demo → fade to black).
    // Ricalcolato su resize e su ScrollTrigger.refresh (le scene lo emettono al
    // mount), non ad ogni frame: le posizioni cambiano solo per reflow.
    const computeAnchors = () => {
      const scenes = Array.from(document.querySelectorAll<HTMLElement>("#top > section"));
      const sy = window.scrollY;
      const limit = getLenis()?.limit || document.documentElement.scrollHeight - window.innerHeight;
      const raw: Anchor[] = [];
      for (const el of scenes) {
        const r = el.getBoundingClientRect();
        const top = Math.round(r.top + sy);
        raw.push({ p: top, fast: false });
        // Opt-in (data-fast-handoff): anchor extra a FINE SCRUB della scena →
        // il tratto da lì al top della scena dopo è hand-off vuoto = fast.
        if (el.dataset.fastHandoff) {
          const end = Math.round(top + r.height - window.innerHeight);
          if (end > top) raw.push({ p: end, fast: true });
        }
      }
      raw.push({ p: Math.round(limit), fast: false });
      raw.sort((a, b) => a.p - b.p);
      // Dedupe per posizione (a pari posizione il flag fast vince).
      const out: Anchor[] = [];
      for (const a of raw) {
        if (a.p < 0) continue;
        const last = out[out.length - 1];
        if (last && last.p === a.p) last.fast = last.fast || a.fast;
        else out.push({ ...a });
      }
      anchorsRef.current = out;
    };

    // computeAnchors legge il layout (getBoundingClientRect su ogni scena +
    // scrollHeight): un layout sincrono forzato. `resize` ne spara decine al
    // secondo e ogni `ScrollTrigger.refresh()` ne aggiunge uno → coalesciamo su
    // un solo frame. Il tick, se trova la lista vuota, la ricalcola comunque.
    let anchorsRaf = 0;
    const scheduleAnchors = () => {
      if (anchorsRaf) return;
      anchorsRaf = requestAnimationFrame(() => {
        anchorsRaf = 0;
        computeAnchors();
      });
    };

    // Avanzamento dentro il ticker GSAP (lo stesso che pilota lenis.raf e
    // ScrollTrigger: un solo orologio). NB: `LenisProvider` è un ANTENATO nel
    // layout, quindi il suo effect gira DOPO questo e il suo callback finisce in
    // coda al ticker: qui leggiamo la posizione già integrata dal frame
    // precedente e scriviamo con `immediate: true` (che ferma l'animazione
    // interna di Lenis) → il raf successivo non la contraddice. Nessuna
    // dipendenza dall'ordine, ma non invertirlo assumendo il contrario.
    const tick = (_time: number, deltaMs: number) => {
      const lenis = getLenis();
      if (
        introHold ||
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
        if (anchors[i].p > scroll + ARRIVE_EPS) {
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

      const target = Math.min(anchors[idx].p, limit);
      const from = idx > 0 ? anchors[idx - 1].p : 0; // anchor di partenza (per l'ease-in)
      // Tratto fast = quello che PARTE da un anchor fast (fine scrub → scena dopo).
      const fast = idx > 0 && anchors[idx - 1].fast;
      const dist = target - scroll;

      if (dist <= ARRIVE_EPS) {
        // Atterrato: allinea di precisione e SOSTA (max: non accorcia un hold
        // esterno). Sosta RIDOTTA sugli anchor adiacenti a un tratto fast: lì lo
        // schermo è vuoto (velo/hand-off), i 300ms pieni allungherebbero il bianco.
        lenis.scrollTo(target, { immediate: true });
        const dwell = fast || anchors[idx].fast ? HANDOFF_DWELL_MS : DWELL_MS;
        holdUntilRef.current = Math.max(holdUntilRef.current, performance.now() + dwell);
        carryRef.current = 0;
        return;
      }

      // Profilo di velocità a CAMPANA sull'intero tratto from → target: lento in
      // partenza, picco al centro, lento in arrivo (la "gaussiana" richiesta). Dopo
      // la sosta su un anchor il tratto seguente riparte da p=0 → lento-veloce-lento
      // ripetuto ad ogni scena, non a velocità costante.
      const seg = target - from;
      const p = seg > 0 ? (scroll - from) / seg : 1; // 0 = appena partiti, 1 = all'anchor
      const pc = Math.min(1, Math.max(0, p));
      // sin(π·p): campana morbida coi bordi esattamente a 0 (frenata piena) → il
      // MIN_SPEED sotto evita lo stallo. Variante gaussiana (plateau più largo, code
      // più lunghe, ~0.34 ai bordi anziché 0), se preferisci il look di Gauss:
      //   const bell = Math.exp(-((pc - 0.5) ** 2) / (2 * 0.34 * 0.34));
      const bell = Math.sin(Math.PI * pc);
      // Tratto fast: stessa campana, picco e pavimento alti → il vuoto si
      // attraversa in ~0.4-0.5s (contenuto invisibile: nessun jank percepibile).
      const v = fast
        ? Math.max(HANDOFF_MIN, HANDOFF_PEAK * bell)
        : Math.max(MIN_SPEED, PEAK_SPEED * bell);
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
    scheduleAnchors();
    // Rilascio dell'intro gate: alla title card d'apertura uscita (evento) o al
    // failsafe. Al rilascio, una sosta breve (DWELL_MS) prima del primo movimento.
    const releaseIntro = () => {
      introHold = false;
      holdUntilRef.current = Math.max(holdUntilRef.current, performance.now() + DWELL_MS);
    };
    window.addEventListener("presentation:introdone", releaseIntro, { once: true });
    // Failsafe > durata reale della card tenuta ferma (~4.9s con delay+reveal+hold+exit):
    // se l'evento non arriva, l'auto-scroll riparte comunque e non resta bloccato.
    const introFailsafe = setTimeout(releaseIntro, 8000);
    ScrollTrigger.addEventListener("refresh", scheduleAnchors);
    window.addEventListener("resize", scheduleAnchors, { passive: true });
    gsap.ticker.add(tick);

    let idle: ReturnType<typeof setTimeout> | undefined;
    /** Intento "INDIETRO" (wheel/tasti verso l'alto): l'auto è SOLO-AVANTI, quindi
     *  se riprendesse dopo l'idle trascinerebbe di nuovo l'utente verso il prossimo
     *  anchor in basso — impossibile risalire una scena da 320svh a colpi di rotella
     *  senza mai pause >2s. Finché l'intento è indietro l'auto NON riparte da sola:
     *  si riarma al primo input verso il BASSO o alla ripresa esplicita (pill/click). */
    let backward = false;
    /** Input utente → cede il controllo; idle → riprende (target ricalcolato nel tick). */
    const yield_ = (idleMs: number = IDLE_MS) => {
      if (lockedRef.current) return;
      if (autoRef.current) setAutoState(false);
      if (idle) clearTimeout(idle);
      if (backward) return; // sta tornando indietro: nessun auto-resume
      idle = setTimeout(() => {
        if (!lockedRef.current && !atBottomRef.current) setAutoState(true);
      }, idleMs);
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

    // PAUSA GLOBALE: attributo su <html> (congela i keyframe CSS della home via
    // lo <style> scoped in fondo) + evento per chi anima FUORI dallo scroll
    // (tween repeat:-1 delle scene, video liberi). Le timeline/video scrubbati
    // seguono solo lo scroll → si fermano da soli, nessun segnale necessario.
    const setGlobalPause = (isPaused: boolean) => {
      document.documentElement.toggleAttribute("data-presentation-paused", isPaused);
      window.dispatchEvent(
        new CustomEvent("presentation:pausechange", { detail: { paused: isPaused } }),
      );
    };

    // Video in riproduzione LIBERA (non scrubbata) dentro la home: pause() alla
    // pausa e play() alla ripresa, SOLO su quelli che stavano davvero suonando.
    // I video di ScrubVideo non vanno mai in play() stabile (solo un "prime"
    // play→pause di pochi ms al primo avvicinamento) → risultano `paused` e il
    // filtro li esclude da solo: restano pilotati dallo scroll, come da regia.
    const pausedVideos: HTMLVideoElement[] = [];
    const onPauseChange = (e: Event) => {
      const isPaused = Boolean((e as CustomEvent<{ paused: boolean }>).detail?.paused);
      if (isPaused) {
        document.querySelectorAll<HTMLVideoElement>("#top video").forEach((v) => {
          if (!v.paused && !v.ended) {
            v.pause();
            pausedVideos.push(v);
          }
        });
      } else {
        // splice(0): svuota la lista e riprende solo ciò che avevamo fermato noi.
        pausedVideos.splice(0).forEach((v) => {
          if (v.isConnected) void v.play().catch(() => {});
        });
      }
    };
    window.addEventListener("presentation:pausechange", onPauseChange);

    // Pausa VOLONTARIA: un click ferma tutto (l'idle non la supera); un altro riparte.
    const togglePause = () => {
      if (lockedRef.current) {
        lockedRef.current = false;
        setPaused(false);
        atBottomRef.current = false;
        backward = false; // ripresa esplicita: si torna in modalità presentazione
        setAutoState(true);
        setGlobalPause(false);
      } else {
        lockedRef.current = true;
        setPaused(true);
        setAutoState(false);
        setGlobalPause(true);
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

    // "Rivedi la presentazione": un rewind smooth di ~30k px scrubberebbe ogni
    // ScrollTrigger all'indietro → un lungo jank. Un reload dalla cima è più
    // pulito ed è comunque una "replay" fedele: la pagina riapre già con
    // IntroOverlay + autoplay armati.
    const onReplay = () => {
      window.history.scrollRestoration = "manual";
      window.location.reload();
    };

    const opts: AddEventListenerOptions = { passive: true };
    // yield_ ora accetta un parametro: va sempre avvolto in arrow (altrimenti l'Event
    // finirebbe nel parametro idleMs). onTouch dà più respiro (si legge col dito fermo).
    const onYield = () => yield_();
    const onTouch = () => yield_(TOUCH_IDLE_MS);
    // Direzione dell'input: verso l'alto ⇒ intento "indietro" (vedi `backward`);
    // verso il basso ⇒ intento normale, l'idle-resume si riarma.
    const onWheel = (e: WheelEvent) => {
      backward = e.deltaY < 0;
      yield_();
    };
    // Scroll manuale LIBERO in entrambe le direzioni: la rotella (su e giù) passa a
    // Lenis, che la scorre smooth. L'auto-scroll cede al primo input (yield_) e
    // riprende dopo l'idle verso il basso; Spazio/click lo fermano del tutto.
    const onKey = (e: KeyboardEvent) => {
      // Barra spaziatrice = pausa/ripresa GLOBALE, identica al click. Stesso guard
      // del click (esclude a/button focalizzati: lì agisce il loro onClick nativo,
      // sennò doppio toggle che si annulla). preventDefault: di default lo spazio
      // scrollerebbe di un viewport.
      if (e.key === " " || e.code === "Space") {
        const t = e.target as Element | null;
        if (t && t.closest("a, button, [data-no-pause]")) return;
        e.preventDefault();
        togglePause();
        return;
      }
      if (["ArrowUp", "PageUp", "Home"].includes(e.key)) backward = true;
      else if (["ArrowDown", "PageDown", "End"].includes(e.key)) backward = false;
      yield_();
    };
    window.addEventListener("mousemove", onMouseMove, opts);
    window.addEventListener("wheel", onWheel, opts);
    window.addEventListener("touchstart", onTouch, opts);
    window.addEventListener("touchmove", onTouch, opts);
    window.addEventListener("pointerdown", onYield, opts);
    window.addEventListener("keydown", onKey);
    window.addEventListener("click", onClick);
    window.addEventListener("presentation:replay", onReplay);

    return () => {
      // Pausa globale: se smontati mentre in pausa, prima si RIATTIVA tutto
      // (l'evento parte con onPauseChange ancora agganciato → i video liberi
      // ripartono; le scene riprendono i loro tween), poi si toglie comunque
      // l'attributo così nessun keyframe CSS resta congelato "orfano".
      if (lockedRef.current) setGlobalPause(false);
      document.documentElement.removeAttribute("data-presentation-paused");
      window.removeEventListener("presentation:pausechange", onPauseChange);
      if (anchorsRaf) cancelAnimationFrame(anchorsRaf);
      clearTimeout(introFailsafe);
      window.removeEventListener("presentation:introdone", releaseIntro);
      gsap.ticker.remove(tick);
      ScrollTrigger.removeEventListener("refresh", scheduleAnchors);
      window.removeEventListener("resize", scheduleAnchors);
      if (idle) clearTimeout(idle);
      if (pillTimer) clearTimeout(pillTimer);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouch);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("pointerdown", onYield);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("click", onClick);
      window.removeEventListener("presentation:replay", onReplay);
    };
  }, [reduced]);

  if (reduced) return null;

  const label = auto ? "Scorri per il controllo manuale" : "Manuale · scorri per navigare";

  return (
    <>
      {/* PAUSA GLOBALE — stile SCOPED (niente globals condivisi): con l'attributo
          su <html> congela tutti i keyframe CSS della home (#top), inclusi
          ::before/::after (animate-pulse, animate-bounce, sc-arrow,
          auto-float…). Le transition NON sono toccate (l'overlay di pausa usa
          transition-opacity e deve poter apparire). Sotto reduced-motion il
          componente ritorna null → né <style> né attributo esistono mai. */}
      <style>{`
        html[data-presentation-paused] #top *,
        html[data-presentation-paused] #top *::before,
        html[data-presentation-paused] #top *::after {
          animation-play-state: paused !important;
        }
      `}</style>

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
              auto
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
