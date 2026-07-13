/**
 * LINGUAGGIO DI MOTION DEL BRAND — porting Remotion del kit GSAP
 * (apps/web/components/home/immersive/shared.tsx).
 *
 * Stesse regole della demo web: POCHE curve nominate (4) e una scala di durate
 * (beat, non secondi sparsi). Nel sito la timeline era scrubbata dallo scroll;
 * qui le durate diventano TEMPO REALE (secondi → frame a FPS fisso).
 *
 * Il modello: ogni scena costruisce una sequenza di BEAT con `seq()` — un
 * cursore che avanza come le position GSAP (">" = coda, "<" = allineato al
 * precedente, "+=x" = gap). I componenti leggono `useCurrentFrame()` e chiedono
 * il progresso di un beat con `prog()`.
 */
import { Easing, interpolate } from "remotion";

export const FPS = 30;

/** Ingressi/reveal: decelerazione lunga (GSAP expo.out ≈ ease-out-expo dei token). */
export const EASE_IN_SCENE = Easing.bezier(0.16, 1, 0.3, 1);
/** Uscite: accelerazione secca (GSAP power2.in). */
export const EASE_OUT_SCENE = Easing.in(Easing.quad);
/** Micro-interazioni: overshoot & settle (GSAP back.out(1.6)). */
export const EASE_SNAP = Easing.out(Easing.back(1.6));
/** Camera e traversate continue: morbida, simmetrica, MAI back (GSAP power1.inOut). */
export const EASE_CAMERA = Easing.inOut(Easing.quad);

/** Scala di durate IN SECONDI (identica a DUR del kit web). */
export const DUR = {
  micro: 0.3,
  beat: 0.6,
  scene: 1.0,
  hold: 0.8,
} as const;

export const s2f = (seconds: number) => Math.round(seconds * FPS);

/** Un beat della timeline: intervallo [start, start+dur) in frame. */
export type Beat = { start: number; dur: number; end: number };

/**
 * Sequencer con la semantica delle position GSAP.
 *   const t = seq();
 *   const a = t.add(DUR.beat);          // ">" — in coda
 *   const b = t.add(DUR.scene, "<");    // allineato all'inizio del precedente
 *   const c = t.add(DUR.beat, 0.8);     // "+=0.8" — gap in secondi
 * `t.total` = durata totale in frame (per durationInFrames della Sequence).
 */
export function seq() {
  let cursor = 0; // frame
  let lastStart = 0;
  let total = 0;

  const api = {
    /** Aggiunge un beat. pos: undefined = coda; "<" = con il precedente; numero = gap in secondi (può essere negativo per overlap). */
    add(durSeconds: number, pos?: "<" | number): Beat {
      const dur = s2f(durSeconds);
      let start: number;
      if (pos === "<") start = lastStart;
      else if (typeof pos === "number") start = cursor + s2f(pos);
      else start = cursor;
      const beat: Beat = { start, dur, end: start + dur };
      lastStart = start;
      cursor = Math.max(cursor, beat.end);
      total = Math.max(total, beat.end);
      return beat;
    },
    /** Respiro tra due beat forti (hold del kit web). */
    hold(mult = 1): void {
      cursor += s2f(DUR.hold * mult);
      total = Math.max(total, cursor);
    },
    get total() {
      return total;
    },
    get cursor() {
      return cursor;
    },
  };
  return api;
}

type Ease = (t: number) => number;

/** Progresso 0→1 di un beat al frame corrente, clampato, con ease. */
export function prog(frame: number, beat: Beat, ease: Ease = EASE_IN_SCENE): number {
  return interpolate(frame, [beat.start, Math.max(beat.start + 1, beat.end)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });
}

/** Interpolazione dentro un beat: val(frame, beat, 24, 0) → 24→0. */
export function val(
  frame: number,
  beat: Beat,
  from: number,
  to: number,
  ease: Ease = EASE_IN_SCENE,
): number {
  const p = prog(frame, beat, ease);
  return from + (to - from) * p;
}

/**
 * Ingresso standard del brand (enter del kit web): fade + rise.
 * Con `anticipate` parte da offset maggiorato e arriva con overshoot & settle.
 * Ritorna uno style da spargere sull'elemento.
 */
export function enter(
  frame: number,
  beat: Beat,
  opts: { y?: number; anticipate?: boolean } = {},
): React.CSSProperties {
  const { y = 24, anticipate } = opts;
  const ease = anticipate ? EASE_SNAP : EASE_IN_SCENE;
  const p = prog(frame, beat, ease);
  // opacity con ease dolce separata: l'overshoot di EASE_SNAP non deve portare opacity >1
  const alpha = prog(frame, beat, EASE_IN_SCENE);
  return {
    opacity: alpha,
    transform: `translateY(${(1 - p) * (anticipate ? y * 1.25 : y)}px)`,
  };
}

/** Uscita standard: fade + salita secca (EASE_OUT_SCENE). */
export function exit(
  frame: number,
  beat: Beat,
  opts: { y?: number; scale?: number } = {},
): React.CSSProperties {
  const { y = -24, scale } = opts;
  const p = prog(frame, beat, EASE_OUT_SCENE);
  return {
    opacity: 1 - p,
    transform: `translateY(${p * y}px)${scale != null ? ` scale(${1 + (scale - 1) * p})` : ""}`,
  };
}

/**
 * Reveal a MASCHERA (maskReveal del kit): wipe direzionale via clip-path inset.
 * dir: "l" da sinistra (default), "r" da destra, "t" dall'alto, "b" dal basso.
 */
export function maskReveal(
  frame: number,
  beat: Beat,
  opts: { dir?: "l" | "r" | "t" | "b"; ease?: Ease } = {},
): React.CSSProperties {
  const p = prog(frame, beat, opts.ease ?? EASE_IN_SCENE);
  const v = `${(1 - p) * 100}%`;
  const dir = opts.dir ?? "l";
  const inset =
    dir === "l"
      ? `inset(0 ${v} 0 0)`
      : dir === "r"
        ? `inset(0 0 0 ${v})`
        : dir === "t"
          ? `inset(0 0 ${v} 0)`
          : `inset(${v} 0 0 0)`;
  return { clipPath: inset };
}

/**
 * "Punch" zoom-in→out locale (clickZoom del kit): scale 1→peak→1 dentro il beat.
 */
export function clickZoom(frame: number, beat: Beat, peak = 1.08): React.CSSProperties {
  const half = Math.max(1, Math.floor(beat.dur / 2));
  const up = prog(frame, { start: beat.start, dur: half, end: beat.start + half }, EASE_IN_SCENE);
  const down = prog(
    frame,
    { start: beat.start + half, dur: half, end: beat.end },
    EASE_CAMERA,
  );
  return { transform: `scale(${1 + (peak - 1) * up * (1 - down)})`, transformOrigin: "50% 50%" };
}

/**
 * "Pressione" di un bottone (pressButton del kit): giù di scatto, rimbalzo back.out.
 * down = metà micro, up = 1.5× micro (stesse proporzioni del kit web).
 */
export function pressButton(frame: number, beat: Beat, downScale = 0.94): React.CSSProperties {
  const downDur = s2f(DUR.micro / 2);
  const down = prog(
    frame,
    { start: beat.start, dur: downDur, end: beat.start + downDur },
    EASE_OUT_SCENE,
  );
  const up = prog(
    frame,
    { start: beat.start + downDur, dur: beat.dur - downDur, end: beat.end },
    EASE_SNAP,
  );
  const scale = 1 + (downScale - 1) * down * (1 - up);
  return { transform: `scale(${scale})` };
}

/**
 * Digitazione "macchina da scrivere" (typeInField del kit): quanti caratteri di
 * `text` mostrare al frame corrente, a scatti (steps).
 */
export function typeText(frame: number, beat: Beat, text: string): string {
  const p = prog(frame, beat, (t) => t); // lineare, gli scatti li fa il floor
  return text.slice(0, Math.floor(p * text.length));
}

/**
 * Digitazione via clip-path a scatti (typeInField del kit web, fedele):
 * il testo si scopre con un wipe L→R quantizzato a `steps`.
 * Rendere il target inline e whitespace-nowrap.
 */
export function typeInset(frame: number, beat: Beat, steps: number): React.CSSProperties {
  const p = Math.floor(prog(frame, beat, (x) => x) * steps) / steps;
  return { clipPath: `inset(0 ${(1 - p) * 100}% 0 0)` };
}

/** Conteggio animato (countUp del kit). */
export function countUp(
  frame: number,
  beat: Beat,
  to: number,
  format: (n: number) => string = (n) => String(Math.round(n)),
): string {
  return format(val(frame, beat, 0, to, EASE_IN_SCENE));
}

/** Disegno progressivo di un path SVG (drawPath del kit). Usare con
 *  `pathLength={1}` sull'elemento <path> (lunghezza normalizzata). */
export function drawPath(frame: number, beat: Beat) {
  const p = prog(frame, beat, EASE_CAMERA);
  return { strokeDasharray: 1, strokeDashoffset: 1 - p };
}

/**
 * WHIP-PAN sui cambi pannello (cameraWhip del kit): burst xPercent ±3 +
 * skewX ±1.2 che finisce neutro. dir "r" = pannello successivo.
 */
export function whip(frame: number, beat: Beat, dir: "l" | "r"): React.CSSProperties {
  const sign = dir === "r" ? -1 : 1;
  const half = Math.max(1, Math.floor(beat.dur / 2));
  const inP = prog(frame, { start: beat.start, dur: half, end: beat.start + half }, Easing.in(Easing.exp));
  const outP = prog(frame, { start: beat.start + half, dur: half, end: beat.end }, Easing.out(Easing.exp));
  const k = inP * (1 - outP);
  return { transform: `translateX(${3 * sign * k}%) skewX(${1.2 * sign * k}deg)` };
}

// ── CAMERA (porting del layer .imm-camera) ───────────────────────────────────

export type CameraShot = {
  /** frame (relativo alla scena) in cui la posa è raggiunta */
  at: number;
  /** frame in cui il movimento inizia (default: posa precedente.at) */
  from?: number;
  x: number;
  y: number;
  scale: number;
  ease?: Ease;
};

export type CamValues = { x: number; y: number; scale: number };

/**
 * Valori NUMERICI della camera al frame: interpola tra pose successive con
 * EASE_CAMERA. Prima posa sempre neutra {0,0,1}. Esposto perché il cursore
 * (che vive FUORI dal layer camera) possa trasformare il suo punto-target con
 * la STESSA matrice → atterra sempre esatto sul bottone anche a camera zoomata.
 */
export function cameraValues(frame: number, shots: CameraShot[]): CamValues {
  const all: CameraShot[] = [{ at: 0, x: 0, y: 0, scale: 1 }, ...shots];
  let prev = all[0];
  let next: CameraShot | null = null;
  for (let i = 1; i < all.length; i++) {
    if (all[i].at <= frame) prev = all[i];
    else {
      next = all[i];
      break;
    }
  }
  let x = prev.x;
  let y = prev.y;
  let scale = prev.scale;
  if (next) {
    // Il movimento non può iniziare PRIMA che la posa precedente sia raggiunta
    // (cameraAt fonde solo due pose per volta): clamp a prev.at evita lo scatto
    // di un frame quando due shot si sovrappongono (from < prev.at).
    const from = Math.max(next.from ?? prev.at, prev.at);
    const p = interpolate(frame, [from, Math.max(from + 1, next.at)], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: next.ease ?? EASE_CAMERA,
    });
    x = prev.x + (next.x - prev.x) * p;
    y = prev.y + (next.y - prev.y) * p;
    scale = prev.scale + (next.scale - prev.scale) * p;
  }
  return { x, y, scale: Math.min(1.7, Math.max(1, scale)) };
}

/**
 * Proietta un punto in coordinate LAYOUT (1920×1080, non trasformato) allo
 * spazio SCHERMO applicando la trasformazione camera (transform-origin al centro).
 * È la stessa matrice di `cameraAt` → un punto framato dalla camera e questo
 * proiettato coincidono. Usato dal cursore/click-FX per stare sui bottoni.
 */
export function screenPoint(
  x: number,
  y: number,
  cam: CamValues,
  W = 1920,
  H = 1080,
): { x: number; y: number } {
  return {
    x: W / 2 + (x - W / 2) * cam.scale + cam.x,
    y: H / 2 + (y - H / 2) * cam.scale + cam.y,
  };
}

/**
 * Stato camera al frame come stile CSS (transform). Wrappa `cameraValues`.
 */
export function cameraAt(frame: number, shots: CameraShot[]): React.CSSProperties {
  const { x, y, scale } = cameraValues(frame, shots);
  return {
    transform: `translate(${x}px, ${y}px) scale(${scale})`,
    transformOrigin: "50% 50%",
  };
}

/**
 * Helper per COSTRUIRE la posa che centra un punto del layout (px del frame
 * 1920×1080) al centro dello schermo alla scala S — l'equivalente di cameraShot
 * del kit web, ma con coordinate note a design-time (il video è deterministico).
 */
export function shotOn(
  cx: number,
  cy: number,
  scale: number,
  W = 1920,
  H = 1080,
): { x: number; y: number; scale: number } {
  const S = Math.min(1.7, Math.max(1, scale));
  let x = (W / 2 - cx) * S;
  let y = (H / 2 - cy) * S;
  const maxX = (W / 2) * (S - 1);
  const maxY = (H / 2) * (S - 1);
  x = Math.min(maxX, Math.max(-maxX, x));
  y = Math.min(maxY, Math.max(-maxY, y));
  return { x, y, scale: S };
}
