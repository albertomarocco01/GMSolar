"use client";

/**
 * @descrizione  KIT per le scene IMMERSIVE della home. Coerenza tra i prodotti:
 *   accent per tema, cornice full-screen sticky-scrub con HAND-OFF scena→scena
 *   (l'uscente sfuma e sale, l'entrante sale dentro — niente taglio netto),
 *   cursore finto CONTESTUALE (freccia / mano / caret) che punta a ELEMENTI
 *   REALI, "punch" zoom-locale per i click/type e frasi-intermezzo. Selettori
 *   auto-scoped alla sezione via gsap.context: più scene condividono le classi.
 *
 * ┌─ HOME-KIT-API · guida per Pass 2 (non serve rileggere l'implementazione) ───┐
 * │ useImmersiveScene(build)                                                     │
 * │   build = (tl, section) => void. `tl` è scrubbata sullo scroll; `section` è   │
 * │   l'elemento radice (per querySelector mirati). Sotto reduced-motion la tl    │
 * │   va a progress(1): OGNI step deve avere uno STATO FINALE leggibile.          │
 * │                                                                               │
 * │ cursorTo(tl, target, opts?) — muove il cursore finto                          │
 * │   target: selettore CSS (es. ".imm-send") o Element reale DENTRO la scena.    │
 * │   opts.mode: "arrow" | "hand" | "text" (icona contestuale; default "arrow",   │
 * │     "hand" sui bottoni, "text" sui campi di testo).                           │
 * │   opts.duration: secondi (default 0.9). La posizione è letta a RUNTIME via    │
 * │     getBoundingClientRect (function-based) → segue il layout vero, niente %    │
 * │     "magici". Retro-compat: cursorTo(tl, "30%","90%") (left,top in %) regge.  │
 * │                                                                               │
 * │ clickZoom(tl, target, opts?) — "punch" zoom-in→out su un CLUSTER locale       │
 * │   Convenzione: avvolgi il cluster da enfatizzare in className "imm-zoom-local"│
 * │     (oppure passa un qualsiasi selettore/Element). NON tocca .imm-stage (che   │
 * │     porta lo zoom di SCENA) → i due zoom non si sommano/litigano.             │
 * │   opts.scale (default 1.08), opts.position (posizione GSAP, es "<"),          │
 * │     opts.origin (transform-origin, default "50% 50%"). Torna a scale 1 →      │
 * │     no-op pulito sotto reduced-motion.                                        │
 * │                                                                               │
 * │ say(tl, i) → mostra/nasconde <Say i={i}>. <ImmersiveStage>, <Say>, <Cursor>,  │
 * │   accentVars(theme) → markup/util riusabili.                                  │
 * └───────────────────────────────────────────────────────────────────────────┘
 */
import { forwardRef, useRef } from "react";
import { MousePointer2, Pointer, TextCursor } from "lucide-react";
import { gsap, ScrollTrigger } from "@gmgroup/lib/gsap";
import { prefersReducedMotion, useIsoLayoutEffect } from "@gmgroup/lib/motion";

/**
 * Accent UNICO de-brandizzato: il LIME del gruppo su TUTTE le scene (erano temi
 * per-mondo solar/mobility/shop, collassati su richiesta del cliente). `c` =
 * colore del TESTO sopra l'accent pieno. Resta una mappa — con fallback in
 * accentVars() — per non rompere le firme `theme="…"` delle scene.
 */
const THEMES: Record<string, { a: string; s: string; c: string }> = {
  platform: { a: "#84cc16", s: "#65a30d", c: "#0b1020" },
};

/** Accent completo per tema: include i derivati (soft/ink/ring) perché a :root
 *  sono "cotti" sull'accent del gruppo e un override del solo --accent non basta. */
export function accentVars(theme: string): React.CSSProperties {
  const t = THEMES[theme] ?? THEMES.platform;
  const v: Record<string, string> = {
    "--accent": t.a,
    "--accent-strong": t.s,
    "--accent-contrast": t.c,
    "--accent-soft": `color-mix(in oklab, ${t.a} 14%, transparent)`,
    // ink = accent LEGGIBILE come testo (mix verso il fondo scuro). 38% → ~AAA su
    // chiaro anche con il lime (allineato ai token del gruppo).
    "--accent-ink": `color-mix(in oklab, ${t.a}, #0b1020 38%)`,
    "--accent-ring": `color-mix(in oklab, ${t.a} 55%, transparent)`,
  };
  return v as unknown as React.CSSProperties;
}

// ── Cursore finto: tipi + helper ─────────────────────────────────────────────

export type CursorMode = "arrow" | "hand" | "text";

/** Centro del target reale, in px, NELLO SPAZIO dell'offsetParent del cursore.
 *  Letto a runtime: durante le interazioni la scena è a scale 1 (l'entrata/uscita
 *  zoom avvengono FUORI dalla finestra di scrub principale), quindi i px del
 *  target e quelli del cursore coincidono. */
function cursorDest(
  section: HTMLElement,
  target: string | Element | null | undefined,
): { left: number; top: number } | null {
  const cursor = section.querySelector<HTMLElement>(".imm-cursor");
  const el = typeof target === "string" ? section.querySelector<HTMLElement>(target) : (target ?? null);
  if (!cursor || !el) return null;
  const r = el.getBoundingClientRect();
  // Target nascosto (es. sidebar in display:none su mobile) → niente salto in un
  // angolo: il chiamante fa fallback alla posizione corrente del cursore.
  if (r.width === 0 && r.height === 0) return null;
  const parent = (cursor.offsetParent as HTMLElement | null) ?? section;
  const pr = parent.getBoundingClientRect();
  return { left: r.left + r.width / 2 - pr.left, top: r.top + r.height / 2 - pr.top };
}

/** Posizione corrente del cursore (px) — fallback se il target non si trova. */
function cursorCurrent(section: HTMLElement | undefined): { left: number; top: number } {
  const c = section?.querySelector<HTMLElement>(".imm-cursor");
  if (!c) return { left: 0, top: 0 };
  const cs = getComputedStyle(c);
  return { left: parseFloat(cs.left) || 0, top: parseFloat(cs.top) || 0 };
}

function setCursorMode(section: HTMLElement | undefined, mode: CursorMode) {
  const c = section?.querySelector<HTMLElement>(".imm-cursor");
  if (c) c.dataset.cursorMode = mode;
}

/**
 * Muove il cursore finto verso un TARGET reale (o, retro-compat, a left/top in %).
 * La posizione è letta a runtime (getBoundingClientRect, valori function-based di
 * GSAP) → segue il layout reale: niente percentuali "magiche" che mancano il bersaglio.
 * In viaggio l'icona è la freccia; all'ARRIVO diventa l'icona contestuale (mode);
 * scrubbando indietro torna freccia.
 */
export function cursorTo(
  tl: gsap.core.Timeline,
  target: string | Element | null | undefined,
  optsOrTop?: { mode?: CursorMode; duration?: number } | string,
): gsap.core.Timeline {
  // Retro-compat: cursorTo(tl, "30%", "90%") — il 2° argomento è una stringa.
  if (typeof optsOrTop === "string") {
    return tl.to(".imm-cursor", {
      left: target as string,
      top: optsOrTop,
      duration: 0.9,
      ease: "power2.inOut",
    });
  }
  const section = tl.data as HTMLElement | undefined;
  const mode = optsOrTop?.mode ?? "arrow";
  const duration = optsOrTop?.duration ?? 0.9;
  return tl.to(".imm-cursor", {
    duration,
    ease: "power2.inOut",
    left: () => (section ? (cursorDest(section, target)?.left ?? cursorCurrent(section).left) : 0),
    top: () => (section ? (cursorDest(section, target)?.top ?? cursorCurrent(section).top) : 0),
    onStart() {
      setCursorMode(section, "arrow");
    },
    onComplete() {
      setCursorMode(section, mode);
    },
    onReverseComplete() {
      setCursorMode(section, "arrow");
    },
  });
}

/**
 * "Punch" zoom-in→out su un cluster LOCALE (campo, bottone, card) quando il
 * walkthrough simula un click o una digitazione. Tween di solo `scale` sul
 * target → NON usa .imm-stage (che porta lo zoom di scena), così i due non si
 * sommano. Finisce a scale 1 ⇒ no-op pulito sotto reduced-motion (progress(1)).
 */
export function clickZoom(
  tl: gsap.core.Timeline,
  target: string | Element,
  opts?: { scale?: number; position?: number | string; origin?: string },
): gsap.core.Timeline {
  const peak = opts?.scale ?? 1.08;
  // Sotto-timeline: la sequenza set→in→out resta integra a prescindere dalle
  // posizioni relative del timeline padre; la inserisco poi a `position`
  // (default ">", in coda).
  const z = gsap.timeline();
  z.set(target, { transformOrigin: opts?.origin ?? "50% 50%", willChange: "transform" })
    .to(target, { scale: peak, duration: 0.28, ease: "power2.out" })
    .to(target, { scale: 1, duration: 0.34, ease: "power2.inOut" });
  tl.add(z, opts?.position ?? ">");
  return tl;
}

/**
 * "Pressione" di un bottone/elemento cliccabile: scala giù di scatto (power2.in)
 * e rimbalza a 1 (back.out). Formalizza il pattern down→up ripetuto nelle scene.
 * Finisce a scale 1 ⇒ no-op pulito sotto reduced-motion (progress(1)).
 */
export function pressButton(
  tl: gsap.core.Timeline,
  target: string | Element,
  opts?: {
    down?: number;
    downDur?: number;
    upDur?: number;
    back?: number;
    position?: number | string;
  },
): gsap.core.Timeline {
  tl.to(
    target,
    { scale: opts?.down ?? 0.94, duration: opts?.downDur ?? 0.1, ease: "power2.in" },
    opts?.position ?? ">",
  );
  tl.to(
    target,
    { scale: 1, duration: opts?.upDur ?? 0.4, ease: `back.out(${opts?.back ?? 3})` },
    ">",
  );
  return tl;
}

/**
 * Digitazione "macchina da scrivere": il testo si rivela per clip-path a scatti
 * (steps). Nasconde SUBITO il target (inset destro 100%, applicato in build →
 * prima del paint) e poi lo scopre. Il target va reso inline con whitespace-nowrap.
 * Reduced-motion (progress(1)) → testo interamente visibile.
 */
export function typeInField(
  tl: gsap.core.Timeline,
  target: string | Element,
  opts?: { steps?: number; duration?: number; position?: number | string },
): gsap.core.Timeline {
  gsap.set(target, { clipPath: "inset(0 100% 0 0)" });
  tl.to(
    target,
    {
      clipPath: "inset(0 0% 0 0)",
      duration: opts?.duration ?? 0.9,
      ease: `steps(${opts?.steps ?? 24})`,
    },
    opts?.position ?? ">",
  );
  return tl;
}

/**
 * Disegno progressivo di un path SVG (strokeDashoffset → 0). Misura la lunghezza
 * reale del tratto, lo nasconde SUBITO (in build → prima del paint) e poi lo
 * "traccia". Reduced-motion → path interamente disegnato.
 */
export function drawPath(
  tl: gsap.core.Timeline,
  target: string | Element,
  opts?: { duration?: number; ease?: string; position?: number | string },
): gsap.core.Timeline {
  const section = tl.data as HTMLElement | undefined;
  const el =
    typeof target === "string"
      ? (section?.querySelector(target) as SVGPathElement | null)
      : (target as SVGPathElement);
  const len = el?.getTotalLength?.() ?? 1;
  gsap.set(target, { strokeDasharray: len, strokeDashoffset: len });
  tl.to(
    target,
    { strokeDashoffset: 0, duration: opts?.duration ?? 1.2, ease: opts?.ease ?? "power2.inOut" },
    opts?.position ?? ">",
  );
  return tl;
}

/**
 * Conteggio animato di uno o più numeri con UN solo tween proxy. Scrive ogni
 * valore nel rispettivo nodo con un formatter (default: intero arrotondato).
 * Reduced-motion → valori finali scritti subito (progress(1)).
 */
export function countUp(
  tl: gsap.core.Timeline,
  items: Array<{ el: string | HTMLElement; to: number; format?: (n: number) => string }>,
  opts?: { duration?: number; ease?: string; position?: number | string },
): gsap.core.Timeline {
  const section = tl.data as HTMLElement | undefined;
  const resolved = items.map((it, i) => ({
    node: typeof it.el === "string" ? (section?.querySelector<HTMLElement>(it.el) ?? null) : it.el,
    format: it.format ?? ((n: number) => String(Math.round(n))),
    key: `v${i}`,
    to: it.to,
  }));
  const proxy: Record<string, number> = {};
  const vars: gsap.TweenVars = {
    duration: opts?.duration ?? 1.4,
    ease: opts?.ease ?? "power2.out",
    onUpdate() {
      for (const r of resolved) if (r.node) r.node.textContent = r.format(proxy[r.key]);
    },
  };
  for (const r of resolved) {
    proxy[r.key] = 0;
    vars[r.key] = r.to;
  }
  tl.to(proxy, vars, opts?.position ?? ">");
  return tl;
}

/**
 * Reveal a MASCHERA: il target si scopre con un wipe direzionale via clip-path
 * `inset`. Usa `fromTo` così sotto reduced-motion (progress(1)) finisce SEMPRE
 * RIVELATO (`inset(0 0% 0 0)`). `immediateRender` (default true) applica lo stato
 * "coperto" prima del paint → niente flash. Con `stagger` scopre in cascata più
 * elementi (selettore/array). dir: "l"(default) da sinistra, "r" da destra,
 * "t" dall'alto, "b" dal basso.
 */
export function maskReveal(
  tl: gsap.core.Timeline,
  target: string | Element | Element[],
  opts?: {
    dir?: "l" | "r" | "t" | "b";
    duration?: number;
    ease?: string;
    stagger?: number | gsap.StaggerVars;
    position?: number | string;
  },
): gsap.core.Timeline {
  const FROM: Record<"l" | "r" | "t" | "b", string> = {
    l: "inset(0 100% 0 0)",
    r: "inset(0 0 0 100%)",
    t: "inset(0 0 100% 0)",
    b: "inset(100% 0 0 0)",
  };
  tl.fromTo(
    target,
    { clipPath: FROM[opts?.dir ?? "l"] },
    {
      clipPath: "inset(0 0% 0 0)",
      duration: opts?.duration ?? 0.7,
      ease: opts?.ease ?? "power2.out",
      stagger: opts?.stagger,
    },
    opts?.position ?? ">",
  );
  return tl;
}

/**
 * Sticky-scrub immersivo + HAND-OFF di scena. Il `build` popola la timeline
 * (selettori scoped a gsap.context). `tl.data = section` permette agli helper
 * (cursorTo) di misurare i target reali nella scena giusta.
 */
export function useImmersiveScene(build: (tl: gsap.core.Timeline, section: HTMLElement) => void) {
  const ref = useRef<HTMLElement>(null);
  useIsoLayoutEffect(() => {
    const section = ref.current;
    if (!section) return;
    const reduced = prefersReducedMotion();
    const ctx = gsap.context(() => {
      gsap.set(".imm-say", { autoAlpha: 0, scale: 1.08, y: 26 });
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.data = section; // gli helper (cursorTo) misurano i target in QUESTA scena
      build(tl, section);
      if (reduced) {
        tl.progress(1);
        // I pan orizzontali (`.imm-track`) lasciano il binario a xPercent negativo:
        // a progress(1) mostrerebbe SOLO l'ultimo pannello (gli altri fuori campo).
        // Azzeriamo il transform del binario → il layout reduced (binario scrollabile
        // in orizzontale, vedi scene multi-pannello) mostra tutti i pannelli.
        const tracks = section.querySelectorAll<HTMLElement>(".imm-track");
        if (tracks.length) gsap.set(tracks, { clearProps: "transform" });
        return;
      }
      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.8,
        invalidateOnRefresh: true, // su resize ri-misura i target del cursore
        animation: tl,
      });

      // HAND-OFF scena→scena (transform/opacity only, will-change attivo):
      // l'ENTRANTE sale dentro e si mette a fuoco (rise + scale + fade-in); l'
      // USCENTE sfuma e sale via (rise + scale-down + fade-out). Le due finestre
      // di scrub stanno PRIMA ("top…") e DOPO ("bottom…") la finestra principale,
      // quindi durante le interazioni la scena è ferma a scale 1.
      const stage = section.querySelector<HTMLElement>(".imm-stage");
      if (stage) {
        gsap.set(stage, { transformOrigin: "center center", willChange: "transform, opacity" });
        gsap.fromTo(
          stage,
          { scale: 0.92, autoAlpha: 0, yPercent: 8 },
          {
            scale: 1,
            autoAlpha: 1,
            yPercent: 0,
            ease: "none",
            scrollTrigger: { trigger: section, start: "top bottom", end: "top top", scrub: 0.8 },
          },
        );
        gsap.fromTo(
          stage,
          { scale: 1, autoAlpha: 1, yPercent: 0 },
          {
            scale: 0.94,
            autoAlpha: 0,
            yPercent: -8,
            ease: "none",
            immediateRender: false,
            scrollTrigger: { trigger: section, start: "bottom bottom", end: "bottom top", scrub: 0.8 },
          },
        );
      }
      ScrollTrigger.refresh();
    }, section);
    return () => ctx.revert();
  }, []);
  return ref;
}

/** Intermezzo: la frase entra (expo) e poi esce (back-in). Chiamare dentro build. */
export function say(tl: gsap.core.Timeline, i: number) {
  tl.to(`.imm-say-${i}`, { autoAlpha: 1, scale: 1, y: 0, duration: 0.7, ease: "expo.out" });
  tl.to(
    `.imm-say-${i}`,
    { autoAlpha: 0, scale: 0.96, y: -24, duration: 0.5, ease: "back.in(1.4)" },
    "+=0.7",
  );
}

/** Frase-intermezzo grande, centrata, su velo sfocato. Tono descrittivo. */
export function Say({ i, children }: { i: number; children: React.ReactNode }) {
  return (
    <div
      className={`imm-say imm-say-${i} pointer-events-none absolute inset-0 z-40 flex items-center justify-center`}
      style={{ opacity: 0 }}
      aria-hidden
    >
      <div className="bg-background/85 absolute inset-0 backdrop-blur-sm" />
      <p className="font-display text-foreground relative max-w-3xl px-6 text-center text-3xl font-bold tracking-tight text-balance sm:text-5xl">
        {children}
      </p>
    </div>
  );
}

/**
 * Cursore finto CONTESTUALE: tre icone sovrapposte (freccia / mano / caret); il
 * timeline ne sceglie una via `data-cursor-mode` (vedi cursorTo). Le icone sono
 * centrate sul punto (left,top) che la timeline anima; un alone bianco le rende
 * leggibili su qualunque superficie chiara.
 */
export function Cursor() {
  const base =
    "absolute top-0 left-0 h-5 w-5 -translate-x-1/2 -translate-y-1/2 text-foreground drop-shadow-[0_1px_2px_rgba(255,255,255,0.95)] transition-opacity duration-150";
  return (
    <div
      className="imm-cursor group/cur pointer-events-none absolute z-30"
      style={{ left: "50%", top: "55%" }}
      data-cursor-mode="arrow"
      aria-hidden
    >
      {/* Freccia (default) — riempita per leggersi come un cursore di sistema */}
      <MousePointer2
        className={`${base} fill-foreground opacity-100 group-data-[cursor-mode=hand]/cur:opacity-0 group-data-[cursor-mode=text]/cur:opacity-0`}
        strokeWidth={1.25}
      />
      {/* Mano/puntatore — sopra un elemento cliccabile */}
      <Pointer
        className={`${base} opacity-0 group-data-[cursor-mode=hand]/cur:opacity-100`}
        strokeWidth={2}
      />
      {/* Caret di testo (I-beam) — sopra un campo di testo */}
      <TextCursor
        className={`${base} opacity-0 group-data-[cursor-mode=text]/cur:opacity-100`}
        strokeWidth={2}
      />
    </div>
  );
}

/** Cornice full-screen sticky di una scena-prodotto: stage + cursore. */
export const ImmersiveStage = forwardRef<
  HTMLElement,
  {
    heightVh: number;
    theme: string;
    label: string;
    /** Mantenuto per compatibilità delle chiamate; non più reso (era poco immersivo
     *  e collideva con gli header dei prodotti full-screen — lo annuncia l'intermezzo). */
    eyebrow?: string;
    children: React.ReactNode;
  }
>(function ImmersiveStage({ heightVh, theme, label, children }, ref) {
  return (
    <section
      ref={ref}
      aria-label={label}
      className="relative"
      style={{ ...accentVars(theme), height: `${heightVh}vh` }}
    >
      <div className="bg-background sticky top-0 h-screen overflow-hidden">
        {/* .imm-stage = camera (scale/opacity/translate da scroll: zoom di scena +
            hand-off); .imm-skew = velocity skew. Il cursore è FUORI da .imm-skew
            (non va inclinato) ma dentro .imm-stage. */}
        <div className="imm-stage h-full w-full">
          <div className="imm-skew h-full w-full">{children}</div>
          <Cursor />
        </div>
      </div>
    </section>
  );
});
