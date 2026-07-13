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
/** Ladder di overshoot (D0.1): SOFT per lo staggering di routine (rimbalzo appena
 *  percepibile), HERO riservato ai due flip-firma. Regola: back(1.6) ai beat-firma,
 *  back(1.8) ai flip hero, back(1.1) al resto — mai doppio-rimbalzo. */
export const EASE_SNAP_SOFT = Easing.out(Easing.back(1.1));
export const EASE_SNAP_HERO = Easing.out(Easing.back(1.8));
/** Camera e traversate continue: morbida, simmetrica, MAI back (GSAP power1.inOut). */
export const EASE_CAMERA = Easing.inOut(Easing.quad);
/** Camera ASIMMETRICA (D0.2): IN = attacco lento-deciso + lungo settle (peso);
 *  OUT = rilascio deciso + decelerazione morbida (ease-out vero). Tag per posa via
 *  CameraShot.ease; il cursore eredita (screenPoint legge lo stesso next.ease). */
export const EASE_CAMERA_IN = Easing.bezier(0.45, 0, 0.15, 1);
export const EASE_CAMERA_OUT = Easing.bezier(0.33, 0, 0, 1);

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
  opts: { y?: number; anticipate?: boolean; snap?: number; blur?: number; scaleFrom?: number } = {},
): React.CSSProperties {
  const { y = 24, anticipate, snap, blur = 0, scaleFrom = 1 } = opts;
  // L'overshoot vive SOLO sulla posizione (transform). opacity, scala e blur girano
  // su un track MONOTONO (EASE_IN_SCENE) → scala risolve a 1.0 e opacity a 1 senza
  // rimbalzo (niente flash >1, niente "resolve-into-focus" che sfarfalla). D0.1.
  const posEase = snap != null ? Easing.out(Easing.back(snap)) : anticipate ? EASE_SNAP : EASE_IN_SCENE;
  const p = prog(frame, beat, posEase);
  const alpha = prog(frame, beat, EASE_IN_SCENE);
  const yOff = (1 - p) * (anticipate ? y * 1.25 : y);
  const scale = scaleFrom + (1 - scaleFrom) * alpha;
  return {
    opacity: alpha,
    transform: scale === 1 ? `translateY(${yOff}px)` : `translateY(${yOff}px) scale(${scale})`,
    ...(blur > 0 ? { filter: `blur(${(1 - alpha) * blur}px)` } : {}),
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

/** Accent lime del brand (de-brandizzato) #84CC16 in canale RGB — per gli FX luce. */
const ACCENT_RGB = "132, 204, 22";

/**
 * HOVER-BLOOM / telegrafo pre-click (D5.6): apre un piccolo "gap di hover" nei
 * ~6 frame PRIMA che parta un press beat, così l'occhio anticipa il click. È un
 * segnale QUIETO — più sommesso del ripple post-click:
 *   • un anello accent SOFT a raggio FISSO ~5px (NESSUNA espansione: solo l'alpha
 *     sale, al contrario del ripple che si allarga dopo il click);
 *   • un micro-lift di -2px (translateY) + una leggera ombra di elevazione.
 *
 * Ritorna React.CSSProperties. Per COMPORLO con `pressButton` (che ritorna un
 * `transform: scale`) senza conflitti: applica `hoverBloom` su un WRAPPER e
 * `pressButton` sul bottone interno — i due transform si compongono via DOM. In
 * alternativa, su un elemento condiviso, usa solo il `boxShadow` di hoverBloom
 * (anello + ombra, che NON toccano il transform) e lascia il transform a
 * pressButton. Finestra e rilascio sono deterministici (pura funzione del frame);
 * fuori dalla finestra ritorna uno stile vuoto.
 */
export function hoverBloom(frame: number, pressBeat: Beat): React.CSSProperties {
  const LEAD = 6; // frame di telegrafo prima del click
  const TAIL = 3; // breve handoff dopo lo start (subentra il ripple di pressButton)
  const start = pressBeat.start;
  let e: number;
  if (frame <= start - LEAD || frame >= start + TAIL) {
    e = 0;
  } else if (frame < start) {
    e = EASE_IN_SCENE((frame - (start - LEAD)) / LEAD); // rampa in 0→1 pre-click
  } else {
    e = 1 - (frame - start) / TAIL; // rilascio 1→0 subito dopo lo start
  }
  e = Math.max(0, Math.min(1, e));
  if (e <= 0) return {};
  const ringAlpha = 0.35 * e; // quieto: molto sotto il ripple post-click
  const elevAlpha = 0.14 * e;
  return {
    // anello a raggio FISSO 5px (no espansione) + ombra di elevazione soft
    boxShadow: `0 0 0 5px rgba(${ACCENT_RGB}, ${ringAlpha}), 0 ${4 * e}px ${10 * e}px rgba(15, 23, 42, ${elevAlpha})`,
    transform: `translateY(${-2 * e}px)`, // micro-lift; su elemento condiviso vedi JSDoc
  };
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
 * Velocità NORMALIZZATA (0..1) dello slide orizzontale del track su un beat.
 * Differenza finita centrata del progresso `prog(frame, beat, ease)` (velocità
 * per-frame), normalizzata campionando il PICCO sul beat → ease-agnostica: vale 1
 * al massimo slide (~metà per una ease simmetrica) e ~0 al settle e fuori dal
 * beat (lì `prog` è clampato, quindi la differenza finita è nulla). Deterministica.
 */
function slideVelocity(frame: number, beat: Beat, ease: Ease): number {
  const speedAt = (f: number) => Math.abs(prog(f + 0.5, beat, ease) - prog(f - 0.5, beat, ease));
  let peak = 1e-6;
  for (let f = beat.start; f <= beat.end; f++) peak = Math.max(peak, speedAt(f));
  return Math.min(1, speedAt(frame) / peak);
}

/**
 * WHIP-PAN velocity-matched (D4.2) sui cambi pannello (cameraWhip del kit).
 *
 * Burst (translateX + skewX) e smear (blur) NON seguono più una curva fissa: sono
 * guidati dalla VELOCITÀ NORMALIZZATA dello slide orizzontale del track — il
 * modulo della derivata a differenze finite di `prog(frame, beat, EASE_CAMERA)`
 * normalizzato a picco=1. Così lo smear culmina a METÀ slide (velocità massima) e
 * si annulla al settle, a prescindere dall'ease. Il blur è ∝ velocità, cappato a
 * 4px, ed è X-ONLY per costruzione: l'unico moto è orizzontale (translateX +
 * skewX), mai su Y.
 *
 * IMPORTANTE: applicare il risultato SOLO all'elemento TRACK che scorre — MAI al
 * wrapper che contiene una sidebar fissa, altrimenti sfocheresti anche la sidebar
 * ferma (il blur è un `filter` isotropo di CSS: tienilo sul solo track in moto).
 * Backward-compatible: si spreada in uno style come prima — `{...whip(f, b, "r")}`
 * o `style={whip(f, b, "r")}`. dir "r" = pannello successivo.
 */
export function whip(frame: number, beat: Beat, dir: "l" | "r"): React.CSSProperties {
  const sign = dir === "r" ? -1 : 1;
  const v = slideVelocity(frame, beat, EASE_CAMERA); // 0..1, picco a metà slide
  const style: React.CSSProperties = {
    transform: `translateX(${3 * sign * v}%) skewX(${1.2 * sign * v}deg)`,
  };
  const blur = Math.min(4, 4 * v); // px, cap ≤4; X-only (il moto è solo orizzontale)
  if (blur > 0.05) style.filter = `blur(${blur}px)`;
  return style;
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
/**
 * Camera-respiro permanente: micro-drift + pulsazione di scala, così la camera
 * non è MAI perfettamente ferma (toglie la staticità da screenshot). Applicato
 * dentro cameraValues → sia la resa (cameraAt) sia la proiezione del cursore
 * (screenPoint) lo condividono, quindi il cursore resta allineato ai bottoni.
 * L'overscan costante (0.012) dà spazio al drift senza mai scoprire i bordi.
 */
function cameraBreath(frame: number): { dx: number; dy: number; dsSine: number } {
  return {
    dx: 5 * Math.sin((frame / 95) * Math.PI * 2),
    dy: 4 * Math.sin((frame / 115) * Math.PI * 2 + 1),
    // SOLO la parte sinusoidale (l'overscan costante vive in cameraValues, non smorzabile).
    dsSine: 0.006 * (0.5 + 0.5 * Math.sin((frame / 75) * Math.PI * 2)),
  };
}

/**
 * Envelope di IMMOBILITÀ (D0.3): dentro (e a ridosso di) una finestra reveal la
 * camera si acquieta — smorza SOLO il respiro sinusoidale (dx/dy/dsSine), MAI il
 * kick, MAI l'overscan costante. Raised-cosine, rampa 0.35s, pavimento 0.25 (il
 * frame si ferma *davvero* sul pagamento senza scatti al rientro del respiro).
 */
const CALM_FLOOR = 0.25;
function cameraCalm(frame: number, calms: Beat[]): number {
  const RAMP = s2f(0.35);
  let damp = 1;
  for (const cb of calms) {
    if (frame < cb.start - RAMP || frame > cb.end + RAMP) continue;
    const e = frame < cb.start ? (frame - (cb.start - RAMP)) / RAMP : frame > cb.end ? (cb.end + RAMP - frame) / RAMP : 1;
    const env = 0.5 - 0.5 * Math.cos(Math.PI * Math.max(0, Math.min(1, e)));
    damp = Math.min(damp, 1 - (1 - CALM_FLOOR) * env);
  }
  return damp;
}

/**
 * SCREEN-KICK: micro scossa che decade all'istante del click (impatto tattile,
 * stile AE). Guidata dagli STESSI beat di click passati al cursore → contenuto e
 * cursore si scuotono insieme, quindi la mira resta esatta sul bottone.
 */
function cameraKick(frame: number, kicks: Beat[]): { kx: number; ky: number } {
  for (const cb of kicks) {
    const t0 = cb.end; // impatto al rilascio del bottone
    const dur = s2f(0.28);
    if (frame >= t0 && frame <= t0 + dur) {
      const q = (frame - t0) / dur; // 0..1
      const decay = (1 - q) * (1 - q);
      return { kx: 5 * decay * Math.sin(q * Math.PI * 6), ky: 4 * decay * Math.cos(q * Math.PI * 5) };
    }
  }
  return { kx: 0, ky: 0 };
}

/**
 * POSA della camera al frame (D2.4): SOLO l'interpolazione tra pose successive
 * (EASE_CAMERA, o `CameraShot.ease` per posa), SENZA respiro/kick/overscan. È la
 * base "pulita" del movimento — `cameraValues` la usa e ci somma respiro + kick +
 * overscan, quindi il suo output resta IDENTICO (il cursore continua a proiettare
 * con la STESSA matrice → invariante intatta). Estratta per i layer di PARALLASSE,
 * che devono muoversi con la sola posa (mai col respiro) per non driftare da
 * fermi. Funzione pura del frame.
 */
export function cameraPose(frame: number, shots: CameraShot[]): CamValues {
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
    // (si fondono solo due pose per volta): clamp a prev.at evita lo scatto di un
    // frame quando due shot si sovrappongono (from < prev.at).
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
  return { x, y, scale };
}

export function cameraValues(frame: number, shots: CameraShot[], kicks: Beat[] = [], calms: Beat[] = []): CamValues {
  const pose = cameraPose(frame, shots);
  const b = cameraBreath(frame);
  const damp = cameraCalm(frame, calms);
  const k = cameraKick(frame, kicks);
  const OVERSCAN = 0.016; // costante, non smorzabile: spazio per drift (±5) + kick (±5)
  return {
    x: pose.x + b.dx * damp + k.kx,
    y: pose.y + b.dy * damp + k.ky,
    scale: Math.min(1.7, Math.max(1, pose.scale + OVERSCAN + b.dsSine * damp)),
  };
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
export function cameraAt(frame: number, shots: CameraShot[], kicks: Beat[] = [], calms: Beat[] = []): React.CSSProperties {
  const { x, y, scale } = cameraValues(frame, shots, kicks, calms);
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

/**
 * PARALLASSE (D2.4): trasforma un LAYER (fondale/primo piano) a una data
 * profondità `depth` (0..1), così che si muova come FRAZIONE della sola posa
 * camera (translate) + un delta di scala ridotto. depth basso = si muove DI PIÙ
 * (frazione ~1, quasi incollato al contenuto principale); depth alto = si muove DI
 * MENO fino a restare fermo su schermo (frazione ~0, fondale "lontano") → è lo
 * scarto rispetto al layer principale a dare la parallasse.
 *
 * Derivato STRETTAMENTE da `cameraPose` (NON da `cameraValues`): così i layer di
 * parallasse NON driftano da fermi — il respiro muove solo l'intero frame (via
 * cameraAt), non i singoli piani. Funzione pura del frame.
 *
 * Nota (solo-firma): pensato per PLATE materiche — es. una griglia di stazioni o
 * un doppio-logo con texture — invisibile su fondi piatti e uniformi. Da applicare
 * a un layer FUORI dal transform camera (sibling del `.imm-camera`), non annidato,
 * per evitare il doppio conteggio della posa.
 */
export function parallax(frame: number, shots: CameraShot[], depth: number): React.CSSProperties {
  const d = Math.max(0, Math.min(1, depth));
  const factor = 1 - d; // depth basso → si muove di più
  const pose = cameraPose(frame, shots);
  const px = pose.x * factor;
  const py = pose.y * factor;
  const scale = 1 + (pose.scale - 1) * factor; // delta di scala ridotto
  return {
    transform: `translate(${px}px, ${py}px) scale(${scale})`,
    transformOrigin: "50% 50%",
  };
}
