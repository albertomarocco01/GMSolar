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
 * │ CAMERA (.imm-camera · P11) — inquadrature cinematografiche di scena:          │
 * │   cameraTo(tl, target, opts?) — centra il target nel viewport alla scala      │
 * │     richiesta (default 1.4, clamp ≤1.7; duration 0.9, ease power3.inOut).     │
 * │   cameraReset(tl, opts?) — torna neutra (x0 y0 scale1 rot0): OBBLIGATORIA     │
 * │     prima della fine timeline → a progress(1) la camera DEVE essere neutra.   │
 * │   cameraFollow(tl, target, opts?) — pan che segue il cursore (zoom invariato  │
 * │     o lieve). cameraWhip(tl, dir, opts?) — colpo di frusta sui cambi          │
 * │     pannello, finisce neutro da solo. rackFocus(tl, bg, opts?) /              │
 * │     rackFocusOff(tl, bg, opts?) — profondità dietro drawer/modali.            │
 * │   cameraTrackType(tl, field, opts?) — trucca la camera a dx                   │
 * │     col caret durante il typing (vedi blocco sotto).                          │
 * │   Vincoli d'uso: vedi «CAMERA · REGOLE DI SEQUENZIAMENTO» più sotto.          │
 * │                                                                               │
 * │ say(tl, i) → mostra/nasconde <Say i={i}>. <Say variant="veil"|"caption">:     │
 * │   veil = frase grande su velo full-screen (PRIMA frase della scena);          │
 * │   caption = pill lower-third senza velo (frasi successive). say() rileva la   │
 * │   variante dal DOM. <ImmersiveStage>, <Cursor>, accentVars(theme) → util.     │
 * │                                                                               │
 * │ CAPITOLI (P12) — CHAPTERS (01→08) + <ChapterCard chapter={CHAPTERS[i]}        │
 * │   subtitle="…"/> + chapterIntro(tl): title card CHIARA che apre ogni scena.   │
 * │   chapterIntro va chiamata PRIMA di ogni altro beat e sostituisce il vecchio  │
 * │   say(tl, 0) col velo (la <Say i={0}> veil → <ChapterCard/>). Le caption      │
 * │   restano invariate. RITMO UNIFORME della demo: il velo è acceso già durante  │
 * │   l'hand-off d'entrata ⇒ prima il BIANCO, poi la SCRITTA, POI il contenuto.   │
 * │   A progress(1) la card finisce nascosta.                                     │
 * │   `chapterIndex` su <ImmersiveStage> marca la section per l'HUD (ChapterHUD). │
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
 *  Letto a runtime. Perché la matematica regge SEMPRE, anche a camera trasformata:
 *  il target si misura in coordinate SCHERMO (getBoundingClientRect, transform
 *  inclusi) e il cursore vive FUORI da `.imm-camera`, in uno spazio NON scalato
 *  (`.imm-stage`/sticky, neutro durante la finestra di scrub principale: l'hand-off
 *  avviene fuori) i cui px coincidono con lo schermo. Unico vincolo: misurare a
 *  camera FERMA (vedi CAMERA · REGOLE DI SEQUENZIAMENTO, regola 2). */
function cursorDest(
  section: HTMLElement,
  target: string | Element | null | undefined,
): { left: number; top: number } | null {
  const cursor = section.querySelector<HTMLElement>(".imm-cursor");
  const el =
    typeof target === "string" ? section.querySelector<HTMLElement>(target) : (target ?? null);
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
      autoAlpha: 1, // entra in campo al 1° movimento (vedi Cursor: parte nascosto)
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
    autoAlpha: 1, // entra in campo al 1° movimento (vedi Cursor: parte nascosto)
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
 * NASCONDE il cursore finto (autoAlpha → 0). Il cursore vive FUORI dal layer
 * `.imm-camera` (coordinate schermo): durante un movimento di sola camera
 * (cameraFollow/cameraTo/cameraReset con cursore fermo) resterebbe inchiodato
 * mentre il contenuto scala/trasla sotto → appare "staccato/galleggiante".
 * Chiamare `hideCursor` PRIMA di un movimento camera-only, e dopo l'ultima
 * interazione della scena (così il cursore non resta congelato a fine scena):
 * il `cursorTo` successivo lo riporta a autoAlpha 1. Scrub-safe: scrubbando
 * indietro il tween reversa e il cursore ricompare dov'era. Default: parte
 * insieme al beat di camera (position "<") e sfuma veloce (0.2s).
 */
export function hideCursor(
  tl: gsap.core.Timeline,
  opts?: { duration?: number; position?: number | string },
): gsap.core.Timeline {
  return tl.to(
    ".imm-cursor",
    { autoAlpha: 0, duration: opts?.duration ?? 0.2, ease: "power2.out" },
    opts?.position ?? "<",
  );
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

/* ══ CAMERA · REGOLE DI SEQUENZIAMENTO (P11 — vincolanti per le scene) ═════════
 *
 * `.imm-camera` è il layer delle INQUADRATURE (punch-in, push-in, follow, whip):
 * sta dentro `.imm-stage`, sopra `.imm-skew`. Con camera inutilizzata è un div
 * neutro → le scene che non la usano si comportano ESATTAMENTE come prima.
 *
 * 1. LAYER E RUOLI — non mescolare:
 *    · `.imm-stage`  = hand-off tra scene (entrata/uscita). RISERVATA: mai
 *      animarla dalla timeline principale né dalle API camera.
 *    · `.imm-camera` = inquadrature di scena, SOLO via cameraTo / cameraReset /
 *      cameraFollow / cameraWhip (mai tween "a mano" su altri transform).
 *    · `.imm-skew`   = velocity skew (VelocitySkew, globale). Non toccarla.
 *    · `.imm-cursor` = FUORI da `.imm-camera`, figlio diretto di `.imm-stage`:
 *      NON va mai spostato dentro la camera, o cursorDest misura coordinate
 *      sbagliate quando la camera scala (vedi commento su cursorDest).
 *
 * 2. CAMERA E CURSORE MAI IN PARTENZA SIMULTANEA verso lo stesso target: i
 *    valori function-based si misurano a TWEEN START, e una misura a metà
 *    movimento camera darebbe coordinate sbagliate. Prima parte la camera (o il
 *    cursore), l'altro segue con overlap MASSIMO `position: ">-0.2"`. Per un
 *    atterraggio preciso del cursore su un target inquadrato: camera prima,
 *    cursorTo per ultimo (misura il layout ormai assestato).
 *
 * 3. OGNI INQUADRATURA SI CHIUDE: `cameraReset` prima del beat finale della
 *    scena e comunque prima della fine timeline. A progress(1) la camera DEVE
 *    essere neutra (x:0, y:0, scale:1, rotation:0) → reduced-motion pulito e
 *    hand-off `.imm-stage` senza conflitti. cameraWhip finisce neutro da solo;
 *    rackFocus si chiude con rackFocusOff quando il primo piano si richiude.
 *
 * 4. clickZoom (punch LOCALE sul cluster) e cameraTo (punch DI CAMERA) NON si
 *    sommano sullo stesso beat: dove entra il punch di camera, va rimosso il
 *    clickZoom corrispondente.
 *
 * 5. ROTATION MICRO-DUTCH: max 0.6deg, solo su beat drammatici, sempre
 *    riportata a 0 (cameraReset la azzera comunque).
 *
 * 6. SCRUB-SAFE E DETERMINISTICO: niente repeat:-1 nella timeline scrubbata;
 *    solo transform/opacity. `filter: blur()` SOLO ≤2px e per beat ≤0.5s: in
 *    rackFocus è OPZIONALE (opts.blur, default disattivo) — va rimosso se non
 *    tiene i 60fps.
 * ═══════════════════════════════════════════════════════════════════════════ */

/** Scala camera ammessa: mai <1 (scoprirebbe il fondo oltre i bordi del
 *  contenuto), mai >1.7 (oltre, la UI raster si sgrana e il pan "pixella"). */
const CAM_MAX_SCALE = 1.7;
function clampCamScale(s: number): number {
  return Math.min(CAM_MAX_SCALE, Math.max(1, s));
}

/** Transform correnti della camera — fallback quando il target manca (la camera
 *  resta dov'è: niente salti in scrub). */
function cameraCurrent(section: HTMLElement | undefined): {
  x: number;
  y: number;
  scale: number;
} {
  const cam = section?.querySelector<HTMLElement>(".imm-camera");
  if (!cam) return { x: 0, y: 0, scale: 1 };
  return {
    x: Number(gsap.getProperty(cam, "x")) || 0,
    y: Number(gsap.getProperty(cam, "y")) || 0,
    scale: Number(gsap.getProperty(cam, "scaleX")) || 1,
  };
}

/**
 * Calcola x/y/scale della camera perché il CENTRO di `target` finisca al centro
 * del viewport alla scala S. Robusto a camera GIÀ trasformata: ricava le
 * coordinate LOCALI (non trasformate) del target dal rect trasformato diviso la
 * scala corrente, poi risolve la traslazione con transform-origin al centro
 * (derivazione: screenX(p) = stickyLeft + cx + x + (p − cx)·S, risolta per x con
 * screenX(target) = centro viewport; il riferimento fisso è il genitore STICKY,
 * mai trasformato). x/y sono CLAMPATI a ±(metà·(S−1)) così ai margini non si
 * scopre mai il fondo (lo stage riempie il viewport — demo PC full-screen).
 * Ritorna null se camera/target mancano o il target è display:none → il
 * chiamante fa fallback allo stato corrente.
 */
function cameraShot(
  section: HTMLElement,
  target: string | Element | null | undefined,
  scale: number,
): { x: number; y: number; scale: number } | null {
  const cam = section.querySelector<HTMLElement>(".imm-camera");
  const el =
    typeof target === "string" ? section.querySelector<HTMLElement>(target) : (target ?? null);
  if (!cam || !el) return null;
  const r = el.getBoundingClientRect();
  if (r.width === 0 && r.height === 0) return null; // target nascosto → fallback
  const S = clampCamScale(scale);
  const s0 = Number(gsap.getProperty(cam, "scaleX")) || 1;
  const camRect = cam.getBoundingClientRect(); // rect TRASFORMATO (transform correnti)
  // Centro del target nello spazio NON trasformato della camera:
  const localX = (r.left + r.width / 2 - camRect.left) / s0;
  const localY = (r.top + r.height / 2 - camRect.top) / s0;
  // Riferimento fisso: il genitore sticky (mai trasformato; .imm-stage è neutro
  // durante la finestra di scrub principale — l'hand-off avviene fuori).
  const sticky = cam.parentElement?.parentElement ?? section;
  const sr = sticky.getBoundingClientRect();
  const cx = cam.offsetWidth / 2;
  const cy = cam.offsetHeight / 2;
  let x = window.innerWidth / 2 - sr.left - cx + (cx - localX) * S;
  let y = window.innerHeight / 2 - sr.top - cy + (cy - localY) * S;
  // CLAMP ai bordi: il contenuto scalato deve sempre coprire il viewport.
  const maxX = Math.max(0, cx * (S - 1));
  const maxY = Math.max(0, cy * (S - 1));
  x = Math.min(maxX, Math.max(-maxX, x));
  y = Math.min(maxY, Math.max(-maxY, y));
  return { x, y, scale: S };
}

/**
 * INQUADRA un elemento: anima `.imm-camera` (x, y, scale) così che il centro del
 * target finisca al centro del viewport alla scala richiesta. Punch-in sui click
 * (scale 1.35–1.5, ease "expo.out" breve), push-in lento sul typing (scale ~1.2,
 * ease "power1.inOut", duration del typeInField). Valori FUNCTION-BASED:
 * ri-misurati a tween start e su invalidateOnRefresh → seguono il layout vero.
 * Scale clampata a [1, 1.7]; x/y clampati per non scoprire i bordi. Target
 * mancante → la camera resta dov'è (no-op). Chiudere SEMPRE con cameraReset
 * (regola 3). NON sommare a clickZoom sullo stesso beat (regola 4).
 */
export function cameraTo(
  tl: gsap.core.Timeline,
  target: string | Element,
  opts?: { scale?: number; duration?: number; ease?: string; position?: number | string },
): gsap.core.Timeline {
  const section = tl.data as HTMLElement | undefined;
  const S = clampCamScale(opts?.scale ?? 1.4);
  const shot = () => (section ? cameraShot(section, target, S) : null);
  return tl.to(
    ".imm-camera",
    {
      duration: opts?.duration ?? 0.9,
      ease: opts?.ease ?? "power3.inOut",
      x: () => shot()?.x ?? cameraCurrent(section).x,
      y: () => shot()?.y ?? cameraCurrent(section).y,
      scale: () => shot()?.scale ?? cameraCurrent(section).scale,
    },
    opts?.position ?? ">",
  );
}

/**
 * Riporta la camera NEUTRA (x:0, y:0, scale:1, rotation:0 — azzera anche
 * xPercent/skewX del whip per sicurezza). È il meccanismo con cui ogni scena
 * garantisce la regola 3: camera neutra a progress(1) → reduced-motion pulito e
 * hand-off `.imm-stage` senza conflitti. Va chiamata prima del beat finale.
 */
export function cameraReset(
  tl: gsap.core.Timeline,
  opts?: { duration?: number; ease?: string; position?: number | string },
): gsap.core.Timeline {
  return tl.to(
    ".imm-camera",
    {
      x: 0,
      y: 0,
      xPercent: 0,
      yPercent: 0,
      scale: 1,
      rotation: 0,
      skewX: 0,
      duration: opts?.duration ?? 0.8,
      ease: opts?.ease ?? "power2.inOut",
    },
    opts?.position ?? ">",
  );
}

/**
 * "Lock" sul cursore nelle traversate lunghe (es. sidebar → contenuto): pan
 * della camera verso lo stesso target del cursorTo concorrente, con gli stessi
 * default di duration/ease (0.9, "power2.inOut") così i due viaggi respirano
 * insieme. Zoom INVARIATO di default (passare opts.scale, es. 1.15, per un
 * lieve avvicinamento). Rispettare la regola 2: partenze sfalsate (overlap max
 * ">-0.2") — per l'atterraggio preciso il cursorTo parte per ultimo.
 */
export function cameraFollow(
  tl: gsap.core.Timeline,
  target: string | Element,
  opts?: { scale?: number; duration?: number; ease?: string; position?: number | string },
): gsap.core.Timeline {
  const section = tl.data as HTMLElement | undefined;
  // Scala risolta a TWEEN START: default = quella corrente (zoom invariato).
  const shot = () =>
    section ? cameraShot(section, target, opts?.scale ?? cameraCurrent(section).scale) : null;
  return tl.to(
    ".imm-camera",
    {
      duration: opts?.duration ?? 0.9,
      ease: opts?.ease ?? "power2.inOut",
      x: () => shot()?.x ?? cameraCurrent(section).x,
      y: () => shot()?.y ?? cameraCurrent(section).y,
      scale: () => shot()?.scale ?? cameraCurrent(section).scale,
    },
    opts?.position ?? ">",
  );
}

/**
 * CAMERA · TRACK DEL CARET (item 4): mentre un campo si DIGITA (typeInField), la
 * camera non fa un push-in FERMO ma TRASLA verso destra seguendo il PUNTO DI
 * SCRITTURA (il bordo destro del testo che si rivela), tenendolo in quadro. È
 * l'effetto «la camera si sposta insieme al cursore».
 *
 * COME — due mosse su `.imm-camera` (niente proxy: la camera resta GSAP-owned, così
 * il cameraReset successivo concatena pulito; il caret NON è un secondo driver
 * function-based → nessuna doppia misura, vedi regola 2):
 *   1) SETTLE (~0.3s): dalla posa corrente all'inquadratura dell'INIZIO del campo
 *      (startX = shot.x + panPx) alla scala S → nessun salto d'ingresso.
 *   2) PAN lineare startX→endX (endX = shot.x − panPx) per `duration`: da inizio a
 *      FINE campo. panPx = min((larghezza·S)/2, clamp-bordo di cameraShot). Con
 *      questo pan il punto di scrittura resta ESATTAMENTE al centro-schermo
 *      (deriv.: writingX(p) = centro + (camX − shot.x) + w·S·(p − 0.5) = centro ⟺
 *      camX = startX − 2·panPx·p, cioè la rampa lineare). Campo più largo del
 *      consentito → panPx si clampa e il caret può scostarsi un filo: pan lieve,
 *      accettato (per i campi della demo a 1920 il pan NON si clampa).
 *
 * CARET — strategia «caret FERMO al centro, il testo scorre sotto», la più robusta
 * vs. il vincolo del kit (il cursore vive FUORI da `.imm-camera`, in coordinate
 * schermo — vedi cursorDest): il caret finto va al centro-schermo durante il settle
 * e ci RESTA per tutto il pan. Siccome anche il punto di scrittura è inchiodato al
 * centro, il caret resta sul testo senza mai ri-misurare un bersaglio in movimento
 * (niente drift a scrub). Perciò NON serve un `cursorTo(campo)` prima: ci pensa il
 * track (mode "text").
 *
 * USO — sul beat di typing, al posto del push-in fermo (cameraTo/cameraFollow;
 * regola 4, i due non si sommano):
 *   cameraTrackType(tl, ".campo", { scale: 1.2, duration: D });
 *   typeInField(tl, ".campo", { duration: D, position: "<" }); // "<" = inizio del PAN
 * `position:"<"` sul typeInField lo allinea al PAN (ultima mossa aggiunta dal
 * track): pan e digitazione partono insieme e durano uguale → il caret resta sul
 * testo. Chiudere la scena con cameraReset (regola 3): a progress(1) la camera è
 * neutra. Target mancante → la camera resta dov'è (no-op, come cameraTo).
 */
export function cameraTrackType(
  tl: gsap.core.Timeline,
  field: string | Element,
  opts?: { scale?: number; duration?: number; ease?: string; position?: number | string },
): gsap.core.Timeline {
  const section = tl.data as HTMLElement | undefined;
  const S = clampCamScale(opts?.scale ?? 1.2);
  const duration = opts?.duration ?? 1.0;
  const approach = Math.min(0.3, duration * 0.3);

  // Estremi del pan attorno allo shot che centra il campo. Robusto a camera già
  // trasformata (cameraShot lo è); larghezza NON scalata dal rect corrente.
  const geom = (): { startX: number; endX: number; y: number } | null => {
    if (!section) return null;
    const shot = cameraShot(section, field, S);
    const cam = section.querySelector<HTMLElement>(".imm-camera");
    const el = typeof field === "string" ? section.querySelector<HTMLElement>(field) : field;
    if (!shot || !cam || !el) return null;
    const s0 = Number(gsap.getProperty(cam, "scaleX")) || 1;
    const w0 = el.getBoundingClientRect().width / s0; // larghezza reale (non scalata)
    const maxX = Math.max(0, (cam.offsetWidth / 2) * (S - 1)); // = clamp di cameraShot
    const panPx = Math.min((w0 * S) / 2, maxX);
    const clamp = (x: number) => Math.min(maxX, Math.max(-maxX, x));
    return { startX: clamp(shot.x + panPx), endX: clamp(shot.x - panPx), y: shot.y };
  };

  // Punto di scrittura = centro-schermo, nello spazio (non scalato) del cursore.
  const caretLeft = () => {
    const c = section?.querySelector<HTMLElement>(".imm-cursor");
    const p = (c?.offsetParent as HTMLElement | null) ?? section ?? null;
    return window.innerWidth / 2 - (p?.getBoundingClientRect().left ?? 0);
  };
  const caretTop = () => {
    const c = section?.querySelector<HTMLElement>(".imm-cursor");
    const p = (c?.offsetParent as HTMLElement | null) ?? section ?? null;
    return window.innerHeight / 2 - (p?.getBoundingClientRect().top ?? 0);
  };

  // 1) Settle morbido all'inquadratura dell'INIZIO campo (no salto d'ingresso).
  tl.to(
    ".imm-camera",
    {
      x: () => geom()?.startX ?? cameraCurrent(section).x,
      y: () => geom()?.y ?? cameraCurrent(section).y,
      scale: S,
      duration: approach,
      ease: "power2.inOut",
    },
    opts?.position ?? ">",
  );
  // 1b) Caret al centro-schermo (= punto di scrittura), mode text. Parallelo al
  //     settle; resta lì per tutto il pan (il testo gli scorre sotto).
  tl.to(
    ".imm-cursor",
    {
      left: caretLeft,
      top: caretTop,
      autoAlpha: 1,
      duration: approach,
      ease: "power2.inOut",
      onStart() {
        setCursorMode(section, "text");
      },
      onReverseComplete() {
        setCursorMode(section, "arrow");
      },
    },
    "<",
  );
  // 2) PAN lineare INIZIO→FINE: la camera trasla a destra seguendo il caret. x
  //    function-based (ri-misura a start / invalidateOnRefresh); y,scale restano.
  return tl.to(
    ".imm-camera",
    {
      x: () => geom()?.endX ?? cameraCurrent(section).x,
      duration,
      ease: opts?.ease ?? "none",
    },
    ">",
  );
}

/**
 * WHIP-PAN sui cambi pannello: burst rapido (default 0.35s totali, expo in→out)
 * con xPercent ±3 + skewX 0→±1.2→0 su `.imm-camera` — lo "squash" da colpo di
 * frusta — in sync con il pan del `.imm-track`. `dir` = verso dove VA la vista:
 * "r" = pannello successivo (il contenuto scatta a sinistra), "l" = precedente.
 * Sotto-timeline (come clickZoom) inserita a `position`; finisce SEMPRE a valori
 * neutri → scrub-safe e no-op pulito sotto reduced-motion.
 */
export function cameraWhip(
  tl: gsap.core.Timeline,
  dir: "l" | "r",
  opts?: { amount?: number; skew?: number; duration?: number; position?: number | string },
): gsap.core.Timeline {
  const sign = dir === "r" ? -1 : 1;
  const amount = (opts?.amount ?? 3) * sign;
  const skew = (opts?.skew ?? 1.2) * sign;
  const dur = opts?.duration ?? 0.35;
  const w = gsap.timeline();
  w.to(".imm-camera", { xPercent: amount, skewX: skew, duration: dur / 2, ease: "expo.in" }).to(
    ".imm-camera",
    { xPercent: 0, skewX: 0, duration: dur / 2, ease: "expo.out" },
  );
  tl.add(w, opts?.position ?? ">");
  return tl;
}

/**
 * RACK FOCUS: profondità quando si apre un drawer/modale/chat — il layer DIETRO
 * (bgTarget) perde fuoco: opacity ~0.55 + scale 0.985 (0.5s, "power2.out").
 * Blur OPZIONALE e disattivo di default (opts.blur in px, clamp ≤2 — regola 6:
 * beat ≤0.5s, rimuoverlo se non tiene i 60fps). Ripristinare con rackFocusOff
 * quando il primo piano si richiude (se resta aperto a fine scena, lo stato
 * "sfocato" è uno stato finale legittimo a progress(1) — la CAMERA invece deve
 * comunque finire neutra).
 */
export function rackFocus(
  tl: gsap.core.Timeline,
  bgTarget: string | Element,
  opts?: {
    opacity?: number;
    scale?: number;
    blur?: number;
    duration?: number;
    ease?: string;
    position?: number | string;
  },
): gsap.core.Timeline {
  const vars: gsap.TweenVars = {
    opacity: opts?.opacity ?? 0.55,
    scale: opts?.scale ?? 0.985,
    duration: opts?.duration ?? 0.5,
    ease: opts?.ease ?? "power2.out",
  };
  const blur = Math.min(2, Math.max(0, opts?.blur ?? 0));
  if (blur > 0) vars.filter = `blur(${blur}px)`;
  tl.to(bgTarget, vars, opts?.position ?? ">");
  return tl;
}

/**
 * Chiude il rack focus: il layer dietro torna a fuoco (opacity 1, scale 1).
 * Passare `blur: true` se rackFocus era stato chiamato con opts.blur > 0 (il
 * filter va riportato a blur(0px); non lo si tocca altrimenti, per non creare
 * layer di compositing inutili).
 */
export function rackFocusOff(
  tl: gsap.core.Timeline,
  bgTarget: string | Element,
  opts?: { blur?: boolean; duration?: number; ease?: string; position?: number | string },
): gsap.core.Timeline {
  const vars: gsap.TweenVars = {
    opacity: 1,
    scale: 1,
    duration: opts?.duration ?? 0.5,
    ease: opts?.ease ?? "power2.inOut",
  };
  if (opts?.blur) vars.filter = "blur(0px)";
  tl.to(bgTarget, vars, opts?.position ?? ">");
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
      // Due varianti di intermezzo (vedi <Say variant>): il VELO full-screen
      // entra teatrale (scale+rise), la CAPTION lower-third solo con un rise lieve.
      if (section.querySelector(".imm-say:not(.imm-say--caption)")) {
        gsap.set(".imm-say:not(.imm-say--caption)", { autoAlpha: 0, scale: 1.08, y: 26 });
      }
      if (section.querySelector(".imm-say--caption")) {
        gsap.set(".imm-say--caption", { autoAlpha: 0, y: 16 });
      }
      // Cursore nascosto finché non parte il 1° movimento; scrubbando indietro
      // oltre il 1° cursorTo torna qui (autoAlpha 0) → mai visibile sul velo.
      gsap.set(".imm-cursor", { autoAlpha: 0 });
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
        // Rete di sicurezza camera: se una scena dimenticasse il cameraReset
        // finale, a progress(1) la camera resterebbe zoomata/panata → azzeriamo
        // comunque il transform del layer camera (a progress(1) DEVE essere neutro).
        const cam = section.querySelector<HTMLElement>(".imm-camera");
        if (cam) gsap.set(cam, { clearProps: "transform" });
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
            scrollTrigger: {
              trigger: section,
              start: "bottom bottom",
              end: "bottom top",
              scrub: 0.8,
            },
          },
        );
      }
      ScrollTrigger.refresh();
    }, section);
    return () => ctx.revert();
  }, []);
  return ref;
}

/**
 * Intermezzo: la frase entra e poi esce. Chiamare dentro build. Rileva da solo
 * la variante dal DOM (`.imm-say--caption`): il velo entra teatrale (expo,
 * scale), la caption con un rise sobrio — la regia delle scene non cambia.
 */
export function say(tl: gsap.core.Timeline, i: number) {
  const section = tl.data as HTMLElement | undefined;
  const caption = !!section?.querySelector(`.imm-say-${i}.imm-say--caption`);
  if (caption) {
    tl.to(`.imm-say-${i}`, { autoAlpha: 1, y: 0, duration: 0.5, ease: "power3.out" });
    tl.to(`.imm-say-${i}`, { autoAlpha: 0, y: -10, duration: 0.4, ease: "power2.in" }, "+=0.7");
    return;
  }
  tl.to(`.imm-say-${i}`, { autoAlpha: 1, scale: 1, y: 0, duration: 0.7, ease: "expo.out" });
  tl.to(
    `.imm-say-${i}`,
    { autoAlpha: 0, scale: 0.96, y: -24, duration: 0.5, ease: "back.in(1.4)" },
    "+=0.7",
  );
}

/**
 * Frase-intermezzo, tono descrittivo. Due varianti:
 *   - "veil" (default): frase grande centrata su velo sfocato full-screen.
 *     STORICO (P12): come apertura di scena è sostituita dalla <ChapterCard>
 *     scura numerata — la variante resta per compat con le scene non migrate.
 *   - "caption": pill lower-third senza velo — commenta senza interrompere la
 *     vista del prodotto. Per le frasi successive (il velo ripetuto ~20 volte
 *     nella demo faceva effetto "slide di PowerPoint").
 * GSAP anima il contenitore esterno (`.imm-say-N`); la pill tiene il proprio
 * translate di centraggio su un nodo interno, così i transform non si pestano.
 */
export function Say({
  i,
  variant = "veil",
  pillClassName,
  children,
}: {
  i: number;
  variant?: "veil" | "caption";
  /** Solo variant "caption": override di POSIZIONE della pill (es. quando il
   *  lower-third centrato coprirebbe un elemento della scena — la pill si
   *  sposta, la regia di say() non cambia). Default: centrata in basso. */
  pillClassName?: string;
  children: React.ReactNode;
}) {
  if (variant === "caption") {
    return (
      <div
        className={`imm-say imm-say-${i} imm-say--caption pointer-events-none absolute inset-0 z-40`}
        style={{ opacity: 0 }}
        aria-hidden
      >
        <div
          className={`border-border bg-background/90 absolute max-w-[70vw] rounded-full border px-6 py-3 shadow-lg backdrop-blur-sm ${
            pillClassName ?? "bottom-24 left-1/2 -translate-x-1/2"
          }`}
        >
          <p className="font-display text-foreground text-center text-sm font-semibold tracking-tight text-balance sm:text-base">
            {children}
          </p>
        </div>
      </div>
    );
  }
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

// ── Capitoli (P12): dati + title card chiara numerata ────────────────────────

/**
 * CAPITOLI della presentazione, nell'ORDINE REALE delle scene in page.tsx.
 * Fonte unica per: title card (ChapterCard), HUD (ChapterHUD, che li importa da
 * qui) e attributo `data-chapter` (prop `chapterIndex` di ImmersiveStage).
 * SOLO titoli: la numerazione «0X / 08» è stata rimossa ovunque (richiesta cliente).
 */
export const CHAPTERS = [
  { title: "Siti vetrina" },
  { title: "Interfacce grafiche moderne" },
  { title: "Assistente AI" },
  { title: "Dashboard" },
  { title: "Segnalazioni" },
  { title: "Gestionali su misura" },
  { title: "App con assistente AI integrato" },
  { title: "Integrazioni" },
] as const;

export type Chapter = (typeof CHAPTERS)[number];

/**
 * TITLE CARD DI CAPITOLO: velo full-screen CHIARO con trama a puntini accent e
 * titolo NERO grande — si distingue dalle caption perché il titolo è
 * grande e centrato (le caption sono pill piccole in basso). Sostituisce la
 * vecchia `<Say i={0}>` veil come PRIMO elemento di ogni scena; va animata con
 * `chapterIntro(tl)` (stesso pattern di Say/say). Il titolo si rivela con un
 * UNICO wipe continuo sinistra→destra (maskReveal su `.imm-chapter-title`).
 * L'accent compare solo nella linea sotto il titolo.
 * `lift` = classe opzionale di offset verticale del blocco interno (es.
 * "-translate-y-12" nella scena video, dove il titolo va più in alto).
 */
export function ChapterCard({
  chapter,
  subtitle,
  lift,
}: {
  chapter: Chapter;
  subtitle?: string;
  lift?: string;
}) {
  return (
    <div
      // Velo OPACO (non bg-background/90 + blur): la regia è «prima il bianco,
      // poi la scritta, POI il contenuto» — a 90% la scena dietro traspare, e
      // dove è scura (il sipario ink di InterfacceScene) si vede un rettangolo
      // grigio salire insieme al velo. Opaco = bianco pulito, e via il
      // backdrop-filter full-screen durante l'hand-off.
      className="imm-chapter bg-background pointer-events-none absolute inset-0 z-50 flex items-center justify-center"
      // Nascosta finché chapterIntro non la fa entrare (e PRIMA che GSAP monti).
      style={{ opacity: 0 }}
      aria-hidden
    >
      {/* Trama a puntini accent tenue (pattern del vecchio ClosingScene) */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(color-mix(in oklab, var(--accent) 20%, transparent) 1px, transparent 1.4px)",
          backgroundSize: "22px 22px",
        }}
      />
      {/* TARATURA MANUALE (titolo più in alto): il centraggio verticale è il
          `flex items-center justify-center` del wrapper esterno; l'offset lo
          porta la prop `lift` su QUESTO blocco (es. lift="-translate-y-12"
          passato da SolarTwinScene) — cambia lì il valore per calibrare. */}
      <div
        className={`relative flex max-w-4xl flex-col items-center px-6 text-center ${lift ?? ""}`}
      >
        {/* Titolo: wipe continuo L→R sull'intero blocco (vedi chapterIntro). */}
        <p className="imm-chapter-title font-display text-foreground text-5xl font-bold tracking-tight md:text-6xl">
          {chapter.title}
        </p>
        {subtitle ? (
          <p className="imm-chapter-sub text-muted mt-4 max-w-2xl text-base text-balance">
            {subtitle}
          </p>
        ) : null}
      </div>
    </div>
  );
}

/**
 * Intro di capitolo: anima la <ChapterCard> DENTRO la timeline scrubbata. Va
 * chiamata PRIMA di ogni altro beat della scena (sostituisce il vecchio
 * `say(tl, 0)`).
 *
 * REGIA (uniforme su TUTTA la demo): PRIMA IL BIANCO CON LA SCRITTA, POI IL
 * CONTENUTO. Il velo è ACCESO GIÀ IN BUILD (`gsap.set` fuori dalla timeline) →
 * durante l'hand-off d'ENTRATA (`.imm-stage`, "top bottom"→"top top", cioè PRIMA
 * che la timeline scrubbata parta) la scena che sale in campo è già coperta dal
 * velo chiaro: non si intravede la sua chrome vuota. Quando il primo beat parte:
 * titolo che si COSTRUISCE con un unico wipe sinistra→destra (il velo è già lì)
 * → (sottotitolo) → hold breve → uscita compatta (velo+contenuto salgono e
 * sfumano) → SOLO ORA il contenuto della scena si anima.
 *
 * Tutto to/fromTo deterministico → scrub-safe: scrubbando indietro l'uscita
 * reversa e il velo torna acceso. A progress(1) la card finisce NASCOSTA
 * (autoAlpha 0) — per reduced-motion le scene aggiungono un heading statico.
 * No-op se la scena non contiene una ChapterCard.
 */
export function chapterIntro(tl: gsap.core.Timeline) {
  const section = tl.data as HTMLElement | undefined;
  if (!section?.querySelector(".imm-chapter")) return;
  // Velo ACCESO in build (prima del paint, prima dell'hand-off d'entrata): non è
  // un tween della timeline, quindi copre già la scena mentre entra in campo.
  // Il titolo resta clippato (maskReveal, immediateRender) → si vede il bianco
  // NUDO durante la traversata, la scritta arriva col primo beat scrubbato.
  gsap.set(".imm-chapter", { autoAlpha: 1, y: 0 });
  // Titolo: si genera progressivamente da sinistra a destra (wipe unico continuo).
  maskReveal(tl, ".imm-chapter-title", { dir: "l", duration: 0.9, ease: "power2.inOut" });
  // Sottotitolo opzionale (subito sotto il titolo, senza linea in mezzo)
  if (section.querySelector(".imm-chapter-sub")) {
    tl.fromTo(
      ".imm-chapter-sub",
      { autoAlpha: 0, y: 14 },
      { autoAlpha: 1, y: 0, duration: 0.45, ease: "power3.out" },
      "-=0.25",
    );
  }
  // Hold breve, poi USCITA COMPATTA: velo+contenuto salgono e sfumano insieme.
  tl.to(".imm-chapter", { autoAlpha: 0, y: -48, duration: 0.55, ease: "power2.in" }, "+=0.55");
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
      // Parcheggiato al bordo DESTRO e nascosto: entra in campo solo al primo
      // movimento (cursorTo fa il fade-in), come la mano di un presentatore. Così
      // non compare mai dentro la frase del velo full-screen (che precede il 1° cursorTo).
      style={{ left: "92%", top: "60%", opacity: 0 }}
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
    /** Indice del capitolo in CHAPTERS (0-based) → imposta `data-chapter` sul
     *  <section>: è ciò che ChapterHUD osserva per capire il capitolo corrente.
     *  Ometterlo = scena fuori dai capitoli (l'HUD la ignora). */
    chapterIndex?: number;
    children: React.ReactNode;
  }
>(function ImmersiveStage({ heightVh, theme, label, chapterIndex, children }, ref) {
  return (
    <section
      ref={ref}
      aria-label={label}
      data-chapter={chapterIndex}
      // AutoScroll: anchor extra a FINE SCRUB → il tratto seguente (l'hand-off
      // di 100svh verso la scena dopo: solo cross-fade di veli, nessun contenuto
      // leggibile) si attraversa VELOCE invece che al passo bell della scena.
      data-fast-handoff="true"
      className="relative"
      style={{ ...accentVars(theme), height: `${heightVh}vh` }}
    >
      <div className="bg-background sticky top-0 h-svh overflow-hidden">
        {/* Gerarchia layer (vedi CAMERA · REGOLE DI SEQUENZIAMENTO):
            .imm-stage  = hand-off tra scene (RISERVATA, animata solo dal kit);
            .imm-camera = inquadrature cinematografiche (cameraTo/Whip/…) —
                          neutra finché una scena non la usa → retro-compatibile;
            .imm-skew   = velocity skew (globale).
            Il CURSORE resta figlio diretto di .imm-stage, FUORI da .imm-camera
            (non va scalato: vive nello spazio non trasformato che coincide con
            lo schermo, vedi cursorDest) e FUORI da .imm-skew (non va inclinato). */}
        <div className="imm-stage h-full w-full">
          <div
            className="imm-camera h-full w-full"
            style={{ transformOrigin: "50% 50%", willChange: "transform" }}
          >
            <div className="imm-skew h-full w-full">{children}</div>
          </div>
          <Cursor />
        </div>
      </div>
    </section>
  );
});
