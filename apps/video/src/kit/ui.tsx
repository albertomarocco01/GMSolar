/**
 * Componenti UI del kit immersivo — porting Remotion di shared.tsx (web).
 * ChapterCard + chapterIntro, Caption (Say variant "caption"), Cursor finto
 * contestuale, SceneShell (hand-off scena→scena), trama a puntini accent.
 */
import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, getRemotionEnvironment, Easing } from "remotion";
import { C, SHADOW } from "./tokens";
import {
  Beat,
  CameraShot,
  cameraValues,
  DUR,
  EASE_CAMERA,
  EASE_IN_SCENE,
  EASE_OUT_SCENE,
  EASE_SNAP,
  maskReveal,
  prog,
  s2f,
  screenPoint,
  seq,
} from "./motion";
import { fontFamily, monoFamily } from "./fonts";

/** Atterraggio gentile per-carattere della ChapterCard (D3.1): back(1.15), MAI
 *  EASE_SNAP 1.6 — l'overshoot vive solo sulla posizione (grammatica D0.1). */
const EASE_CHAR = Easing.out(Easing.back(1.15));

/** Trama a puntini accent tenue (pattern di ChapterCard/ClosingScene web). */
export const DotsTexture: React.FC<{ opacity?: number }> = ({ opacity = 0.2 }) => (
  <AbsoluteFill
    style={{
      opacity,
      backgroundImage: `radial-gradient(rgba(132,204,22,0.2) 1.6px, transparent 2.2px)`,
      backgroundSize: "22px 22px",
    }}
  />
);

// ── StageBackdrop (D1.1) ──────────────────────────────────────────────────────

/**
 * Fondale del "set illuminato": va montato come PRIMO figlio NON trasformato della
 * scena (FUORI dal layer camera) così eredita gratis il parallasse dal respiro
 * dell'intero frame. È il piano su cui poggia il device.
 *
 * Composizione (deterministica, nessun frame):
 *   • radiale neutro-FREDDO #fff → #eef2f7 → #e6ecf4 (la luce d'ambiente del set);
 *   • un rimbalzo lime LARGO e BASSO ad alpha bassissima (≤0.06) sotto il centro —
 *     luce di rimbalzo, non tinta: neutro, niente cast verde, il #fff resta #fff.
 */
export const StageBackdrop: React.FC = () => (
  <AbsoluteFill
    style={{
      background: [
        // rimbalzo lime: largo, basso, alpha ≤0.06 → percepito come luce, non colore
        "radial-gradient(120% 62% at 50% 118%, rgba(132,204,22,0.055) 0%, rgba(132,204,22,0.02) 34%, rgba(132,204,22,0) 62%)",
        // ambiente neutro-freddo
        "radial-gradient(150% 120% at 50% 38%, #ffffff 0%, #eef2f7 60%, #e6ecf4 100%)",
      ].join(", "),
    }}
  />
);

// ── ChapterCard ───────────────────────────────────────────────────────────────

/**
 * Beat standard dell'intro di capitolo (chapterIntro del kit web):
 * titolo in wipe L→R (1.0s, con anticipazione) → sottotitolo (0.6s, overlap
 * -0.2) → hold → uscita compatta (0.6s, velo+contenuto salgono e sfumano).
 * Ritorna i beat da passare a <ChapterCard>. `holdSeconds` default = DUR.hold.
 */
export function chapterIntroBeats(t: ReturnType<typeof seq>, holdSeconds: number = DUR.hold) {
  const title = t.add(DUR.scene);
  const sub = t.add(DUR.beat, -0.2);
  const out = t.add(DUR.beat, holdSeconds);
  return { title, sub, out };
}

export const ChapterCard: React.FC<{
  title: string;
  subtitle?: string;
  beats: { title: Beat; sub: Beat; out: Beat };
  /** offset verticale del blocco interno (px), es. -48 nella scena video */
  lift?: number;
  /** indice capitolo 1..7 (D3.1): accende eyebrow `0N — 07`, hairline + dot lime e
   *  il bloom lime sulla plate. Se assente → card classica (nessuna plate). */
  index?: number;
}> = ({ title, subtitle, beats, lift = 0 }) => {
  const frame = useCurrentFrame();
  const outP = prog(frame, beats.out, EASE_OUT_SCENE);
  if (outP >= 1) return null;
  const subP = prog(frame, beats.sub, EASE_IN_SCENE);
  const subMask = maskReveal(frame, beats.sub, { dir: "b" }); // masked-rise: wipe verso l'alto
  const titleP = prog(frame, beats.title, EASE_IN_SCENE);
  // Tracking-settle: letter-spacing 0.06em → -0.03em mentre il titolo si risolve.
  const tracking = (0.06 - 0.09 * titleP).toFixed(4);

  // Kinetic typography: ogni lettera entra sfalsata (overshoot back 1.15 SOLO sulla
  // posizione; opacity e blur su track monotono).
  const STAG = s2f(0.035);
  let ci = 0;
  const words = title.split(" ").map((word, wi) => {
    const spans = word.split("").map((ch) => {
      const b = { start: beats.title.start + ci * STAG, dur: beats.title.dur, end: beats.title.end + ci * STAG };
      const alphaP = prog(frame, b, EASE_IN_SCENE);
      const posP = prog(frame, b, EASE_CHAR);
      ci += 1;
      return (
        <span
          key={ci}
          style={{ display: "inline-block", opacity: alphaP, transform: `translateY(${24 * (1 - posP)}px)`, filter: `blur(${9 * (1 - alphaP)}px)`, willChange: "transform, filter, opacity" }}
        >
          {ch}
        </span>
      );
    });
    return (
      <span key={wi} style={{ display: "inline-block", whiteSpace: "nowrap" }}>
        {spans}
      </span>
    );
  });

  // Title card su fondo BIANCO, pulita: niente numeri/eyebrow, niente bloom/verde,
  // niente trama a puntini — solo il titolo cinetico su bianco.
  return (
    <AbsoluteFill
      style={{
        backgroundColor: C.background,
        opacity: 1 - outP,
        transform: `translateY(${-48 * outP}px)`,
        zIndex: 50,
      }}
    >
      <AbsoluteFill
        style={{ alignItems: "center", justifyContent: "center", transform: `translateY(${lift}px)` }}
      >
        <div style={{ position: "relative", maxWidth: 1100, padding: "0 24px", textAlign: "center" }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              columnGap: "0.28em",
              rowGap: "0.08em",
              fontFamily,
              fontWeight: 700,
              fontSize: 84,
              letterSpacing: `${tracking}em`,
              color: C.foreground,
            }}
          >
            {words}
          </div>
          {subtitle ? (
            <div
              style={{
                ...subMask,
                opacity: subP,
                transform: `translateY(${14 * (1 - subP)}px)`,
                marginTop: 20,
                fontFamily,
                fontSize: 24,
                color: C.muted,
                maxWidth: 800,
                marginLeft: "auto",
                marginRight: "auto",
              }}
            >
              {subtitle}
            </div>
          ) : null}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── Caption (Say variant "caption") ───────────────────────────────────────────

/**
 * Beat standard di una caption (say del kit web, variante caption):
 * entra (0.6s), resta DUR.hold, esce (0.3s).
 */
export function captionBeats(t: ReturnType<typeof seq>, holdSeconds = DUR.hold) {
  const enter = t.add(DUR.beat);
  const leave = t.add(DUR.micro, holdSeconds);
  return { enter, leave };
}

export const Caption: React.FC<{
  beats: { enter: Beat; leave: Beat };
  children: React.ReactNode;
  /** posizione/override custom (default: centrata in basso) */
  style?: React.CSSProperties;
}> = ({ beats, children, style }) => {
  const frame = useCurrentFrame();
  const inP = prog(frame, beats.enter, EASE_IN_SCENE);
  const outP = prog(frame, beats.leave, EASE_OUT_SCENE);
  if (inP <= 0 || outP >= 1) return null;

  // Reveal WORD-BY-WORD (D3.2): stessa grammatica rise+blur della ChapterCard,
  // stagger s2f(0.06). Funziona su stringa; con children non-stringa → fade di gruppo.
  const WSTAG = s2f(0.06);
  const textNode =
    typeof children === "string" ? (
      <>
        {children.split(" ").map((w, i) => {
          const b = { start: beats.enter.start + i * WSTAG, dur: beats.enter.dur, end: beats.enter.end + i * WSTAG };
          const alphaP = prog(frame, b, EASE_IN_SCENE);
          const posP = prog(frame, b, EASE_CHAR);
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                marginRight: "0.3em",
                opacity: alphaP,
                transform: `translateY(${12 * (1 - posP)}px)`,
                filter: `blur(${5 * (1 - alphaP)}px)`,
                willChange: "transform, filter, opacity",
              }}
            >
              {w}
            </span>
          );
        })}
      </>
    ) : (
      <span style={{ opacity: inP }}>{children}</span>
    );

  return (
    <div
      style={{
        position: "absolute",
        bottom: 96,
        left: "50%",
        transform: `translateX(-50%) translateY(${16 * (1 - inP) - 10 * outP}px)`,
        opacity: 1 - outP,
        zIndex: 40,
        maxWidth: "74%",
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "12px 30px",
        ...style,
      }}
    >
      {/* Scrim background-safe: radiale bianco → trasparente + blur leggero (≤3px),
          mascherato ai bordi così NON resta un rettangolo sfocato (de-pill). */}
      <div
        style={{
          position: "absolute",
          inset: "-10px -26px",
          background:
            "radial-gradient(120% 190% at 50% 50%, rgba(255,255,255,0.78) 0%, rgba(255,255,255,0.5) 46%, rgba(255,255,255,0) 78%)",
          backdropFilter: "blur(3px)",
          WebkitBackdropFilter: "blur(3px)",
          maskImage: "radial-gradient(120% 190% at 50% 50%, #000 0%, #000 44%, transparent 78%)",
          WebkitMaskImage: "radial-gradient(120% 190% at 50% 50%, #000 0%, #000 44%, transparent 78%)",
          opacity: inP,
          pointerEvents: "none",
        }}
      />
      {/* Tick lime (3px) come fratello di sinistra. */}
      <div
        style={{
          position: "relative",
          flexShrink: 0,
          width: 3,
          alignSelf: "stretch",
          minHeight: 22,
          borderRadius: 2,
          backgroundColor: C.accent,
          boxShadow: SHADOW.glow,
          opacity: inP,
        }}
      />
      <div
        style={{
          position: "relative",
          fontFamily,
          fontWeight: 600,
          fontSize: 22,
          letterSpacing: "-0.01em",
          color: C.foreground,
          textAlign: "left",
        }}
      >
        {textNode}
      </div>
    </div>
  );
};

// ── Cursore finto contestuale ────────────────────────────────────────────────

export type CursorMode = "arrow" | "hand" | "text";
export type CursorMove = { beat: Beat; x: number; y: number; mode?: CursorMode };

/**
 * Cursore finto (Cursor del kit web): freccia in viaggio, icona contestuale
 * all'arrivo. Coordinate design-time in px del frame 1920×1080 (il video è
 * deterministico). Parte nascosto al bordo destro; fade-in sul primo movimento.
 *
 * CORREZIONE POSIZIONE (fondamentale): il cursore vive FUORI dal layer camera,
 * ma i bottoni sono DENTRO. Passando `shots` (lo stesso array della scena) il
 * cursore PROIETTA il suo punto-target con la stessa matrice camera → resta
 * SEMPRE esatto sul bottone anche a camera zoomata/panata (l'anchor del cursore
 * e quello del cameraTo coincidono). L'icona NON si scala: resta dimensione
 * schermo.
 *
 * CLICK: passando `clicks` (i beat dei pressButton) il cursore fa il "press-dip"
 * (si abbassa di scatto e risale) e sgancia un anello accent che si espande —
 * feedback di click stile presentazione.
 */

/** SETTLE meccanico del drum (D3.5): l'input `p` è lineare. LEAD 0.28 (anticipo
 *  lento, ease-in) → EASE_SNAP (back 1.6) per il resto, con overshoot che si posa
 *  ESATTO a 1 al termine. Il picco supera 1 di ~9% (≈ meno di 2 righe): per questo
 *  il drum monta +2 righe reali, così l'overshoot atterra su cifre vere, mai oltre
 *  il tetto della colonna. */
const DRUM_LEAD_P = 0.28;
const DRUM_LEAD_FRAC = 0.12;
const DRUM_OVERSHOOT_ROWS = 2;
function drumSettle(p: number): number {
  const c = Math.min(1, Math.max(0, p));
  if (c <= DRUM_LEAD_P) {
    const u = c / DRUM_LEAD_P;
    return DRUM_LEAD_FRAC * (u * u); // anticipo ease-in
  }
  const u = (c - DRUM_LEAD_P) / (1 - DRUM_LEAD_P);
  return DRUM_LEAD_FRAC + (1 - DRUM_LEAD_FRAC) * EASE_SNAP(u); // snap → 1 esatto a u=1
}

/**
 * Odometer: numero con cifre che "rotolano" (contatore meccanico). `p` = 0→1
 * pilota il roll; i caratteri non-numerici (., :, €, %, spazio) restano fissi e
 * appaiono. La colonna di ogni cifra rotola di 1 giro + fino alla cifra finale.
 */
export const Odometer: React.FC<{ text: string; p: number; size: number; color?: string; weight?: number }> = ({
  text,
  p,
  size,
  color,
  weight = 700,
}) => {
  const H = Math.round(size * 1.16);
  const SPINS = 1;
  const q = drumSettle(p); // può superare 1 nell'overshoot, si posa a 1
  // Motion-blur ROLL-CONDITIONAL: al MASSIMO 18% durante il rotolamento, → 0 (cifra
  // nitida) man mano che la colonna si ferma. `moving = 1 - progressoGrezzo`, cap 0.18.
  const moving = Math.min(0.18, 1 - Math.min(1, Math.max(0, p)));
  const blurPx = moving * size * 0.5; // 0 a riposo, ≤ ~4px in corsa
  const blurStyle = blurPx > 0.05 ? { filter: `blur(${blurPx.toFixed(2)}px)` } : undefined;
  return (
    <span style={{ display: "inline-flex", height: H, overflow: "hidden", fontFamily, fontWeight: weight, fontSize: size, lineHeight: `${H}px`, fontVariantNumeric: "tabular-nums", color }}>
      {text.split("").map((ch, i) => {
        if (!/[0-9]/.test(ch)) {
          return (
            <span key={i} style={{ display: "inline-block", height: H, opacity: Math.min(1, p) }}>
              {ch === " " ? " " : ch}
            </span>
          );
        }
        const target = Number(ch) + SPINS * 10;
        const cur = q * target; // overshoot ammesso: atterra sulle +2 righe reali
        return (
          <span key={i} style={{ display: "inline-block", height: H, overflow: "hidden" }}>
            <span style={{ display: "block", transform: `translateY(${-cur * H}px)`, ...blurStyle }}>
              {Array.from({ length: target + DRUM_OVERSHOOT_ROWS + 1 }, (_, r) => (
                <span key={r} style={{ display: "block", height: H }}>
                  {r % 10}
                </span>
              ))}
            </span>
          </span>
        );
      })}
    </span>
  );
};

// ── TypeOn (D3.3) ─────────────────────────────────────────────────────────────

/**
 * Type-on per campi input (D3.3): scopre `text` a scatti (steps, come typeInset) ma
 * con un CARET lime (#84cc16) SOLIDO mentre digita, che poi LAMPEGGIA solo nella coda
 * idle (~1.25Hz → 0.4s/stato) e sfuma. Deterministico. Eredita la tipografia dal
 * contenitore (size/color/weight opzionali per override). Le scene sostituiranno i
 * loro `typeInset` degli input con questo.
 */
export const TypeOn: React.FC<{
  text: string;
  /** finestra di digitazione */
  beat: Beat;
  /** coda idle in secondi dopo la digitazione: il caret lampeggia, poi sfuma. Default 1.0 */
  idle?: number;
  color?: string;
  size?: number;
  weight?: number;
  caretColor?: string;
  /** true = testo lungo che VA A CAPO (pre-wrap) e cresce; default single-line (pre). */
  multiline?: boolean;
  lineHeight?: number;
}> = ({ text, beat, idle = 1.0, color, size, weight, caretColor = C.accent, multiline, lineHeight }) => {
  const frame = useCurrentFrame();
  // Reveal a SCATTI per carattere (come typeInset) → il caret segue il bordo del testo.
  const raw = prog(frame, beat, (t) => t); // lineare, gli scatti li fa il floor
  const n = Math.max(0, Math.min(text.length, Math.floor(raw * text.length)));
  const visible = text.slice(0, n);

  // Caret: SOLIDO mentre (e prima di) digita; nella coda idle LAMPEGGIA e sfuma.
  let caretOpacity = 1;
  if (frame > beat.end) {
    const idleF = s2f(idle);
    const t = frame - beat.end;
    if (t >= idleF) {
      caretOpacity = 0;
    } else {
      const half = s2f(0.4); // 0.4s/stato → ~1.25Hz (ciclo 0.8s)
      const on = Math.floor(t / half) % 2 === 0 ? 1 : 0;
      caretOpacity = on * (1 - t / idleF); // blink × dissolvenza sulla coda
    }
  }

  return (
    <span style={{ whiteSpace: multiline ? "pre-wrap" : "pre", overflowWrap: multiline ? "break-word" : undefined, fontFamily, fontSize: size, fontWeight: weight, color, lineHeight }}>
      {visible}
      <span
        aria-hidden
        style={{
          display: "inline-block",
          width: 2,
          height: "1.05em",
          marginLeft: 1,
          verticalAlign: "-0.15em",
          backgroundColor: caretColor,
          opacity: caretOpacity,
        }}
      />
    </span>
  );
};

export const Cursor: React.FC<{
  moves: CursorMove[];
  shots?: CameraShot[];
  clicks?: Beat[];
  /** finestre di quiete camera (le STESSE passate a cameraAt): la proiezione del
   *  cursore deve smorzare il respiro come il layer visivo, o si de-sincronizza. */
  calms?: Beat[];
  hideAfter?: Beat;
  /** parcheggio iniziale (default 92%, 60%) */
  parkX?: number;
  parkY?: number;
}> = ({ moves, shots, clicks, calms, hideAfter, parkX = 1920 * 0.92, parkY = 1080 * 0.6 }) => {
  const frame = useCurrentFrame();
  if (moves.length === 0) return null;

  // Posizione in coordinate LAYOUT (non trasformate), interpolata tra i move.
  let x = parkX;
  let y = parkY;
  let mode: CursorMode = "arrow";
  for (let i = 0; i < moves.length; i++) {
    const m = moves[i];
    if (frame >= m.beat.end) {
      // SETTLED — mira SACRA: esatto sul target a beat.end. NON TOCCARE.
      x = m.x;
      y = m.y;
      mode = m.mode ?? "arrow";
    } else if (frame >= m.beat.start) {
      // TRAVEL (solo visivo): arco + arrivo magnetico. Endpoint SEMPRE esatti perché
      // arco e magnete si annullano a p=1 (e comunque a beat.end subentra il ramo settled).
      const p = prog(frame, m.beat, EASE_CAMERA);
      const x0 = x, y0 = y; // start = target/park precedente
      const lx = x0 + (m.x - x0) * p; // lerp dritto
      const ly = y0 + (m.y - y0) * p;
      const dx = m.x - x0, dy = m.y - y0;
      const dist = Math.hypot(dx, dy) || 1;
      const ux = dx / dist, uy = dy / dist; // direzione di viaggio (unitaria)
      // Arco: offset PERPENDICOLARE, ~8% della distanza (cap 42..80px), segno
      // ALTERNATO per indice-move (non curva sempre dallo stesso lato).
      const amp = Math.min(80, Math.max(42, dist * 0.08));
      const bell = Math.sin(p * Math.PI); // 0 agli estremi → endpoint intatti
      const sign = i % 2 === 0 ? 1 : -1;
      let tx = lx + -uy * amp * bell * sign;
      let ty = ly + ux * amp * bell * sign;
      // Arrivo MAGNETICO: ~6px di overshoot lungo la direzione, che decade, nell'ultimo 18%.
      if (p > 0.82) {
        const u = (p - 0.82) / 0.18; // 0..1
        const mag = 6 * Math.sin(u * Math.PI); // 0 a u=0 e u=1 → si azzera all'arrivo
        tx += ux * mag;
        ty += uy * mag;
      }
      x = tx;
      y = ty;
      mode = "arrow"; // in viaggio: freccia
      break;
    } else break;
  }

  // Proiezione allo schermo con la matrice camera → esatto sul bottone. I click
  // passano anche come kick: contenuto e cursore si scuotono insieme, mira intatta.
  const cam = shots ? cameraValues(frame, shots, clicks ?? [], calms ?? []) : { x: 0, y: 0, scale: 1 };
  const sp = screenPoint(x, y, cam);

  const first = moves[0].beat;
  let opacity = interpolate(frame, [first.start, Math.min(first.end, first.start + s2f(0.3))], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  if (hideAfter) opacity *= 1 - prog(frame, hideAfter, EASE_OUT_SCENE);
  if (opacity <= 0) return null;

  // Press-dip + anello di click dal beat di press attivo.
  let dip = 0; // 0 = a riposo, 1 = premuto a fondo
  let ripple = -1; // progresso 0..1 dell'anello, -1 = nessuno
  if (clicks) {
    for (const cb of clicks) {
      const rippleEnd = cb.end + s2f(0.45);
      if (frame >= cb.start && frame <= rippleEnd) {
        const half = (cb.start + cb.end) / 2;
        dip =
          frame <= half
            ? interpolate(frame, [cb.start, half], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
            : interpolate(frame, [half, cb.end], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        ripple = interpolate(frame, [cb.start, rippleEnd], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: EASE_OUT_SCENE,
        });
        break;
      }
    }
  }

  const icon = { width: 34, height: 34, position: "absolute" as const, top: -17, left: -17 };
  return (
    <>
      {/* Click FX: focus-glow (bloom morbido) + anello accent che si espande */}
      {ripple >= 0 && ripple < 1 ? (
        <>
          <div
            style={{
              position: "absolute",
              left: sp.x,
              top: sp.y,
              width: 30 + ripple * 150,
              height: 30 + ripple * 150,
              marginLeft: -(30 + ripple * 150) / 2,
              marginTop: -(30 + ripple * 150) / 2,
              borderRadius: 9999,
              background: "radial-gradient(circle, rgba(132,204,22,0.45) 0%, rgba(132,204,22,0) 68%)",
              opacity: (1 - ripple) * opacity,
              zIndex: 58,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: sp.x,
              top: sp.y,
              width: 16 + ripple * 64,
              height: 16 + ripple * 64,
              marginLeft: -(16 + ripple * 64) / 2,
              marginTop: -(16 + ripple * 64) / 2,
              borderRadius: 9999,
              border: `2px solid ${C.accent}`,
              opacity: 0.6 * (1 - ripple) * opacity,
              zIndex: 59,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: sp.x,
              top: sp.y,
              width: 10 + ripple * 18,
              height: 10 + ripple * 18,
              marginLeft: -(10 + ripple * 18) / 2,
              marginTop: -(10 + ripple * 18) / 2,
              borderRadius: 9999,
              backgroundColor: C.accent,
              opacity: 0.35 * (1 - ripple) * opacity,
              zIndex: 59,
            }}
          />
        </>
      ) : null}
      <div
        style={{
          position: "absolute",
          left: sp.x,
          top: sp.y,
          opacity,
          transform: `scale(${1 - 0.22 * dip})`,
          transformOrigin: "0 0",
          zIndex: 60,
          filter: "drop-shadow(0 1px 2px rgba(255,255,255,0.95)) drop-shadow(0 2px 6px rgba(2,6,23,0.25))",
        }}
      >
      {mode === "arrow" ? (
        // MousePointer2 (freccia riempita)
        <svg viewBox="0 0 24 24" style={icon} fill={C.foreground} stroke={C.foreground} strokeWidth={1.25}>
          <path d="M4.037 4.688a.495.495 0 0 1 .651-.651l16 6.5a.5.5 0 0 1-.063.947l-6.124 1.58a2 2 0 0 0-1.438 1.435l-1.579 6.126a.5.5 0 0 1-.947.063z" />
        </svg>
      ) : mode === "hand" ? (
        // Pointer (mano)
        <svg viewBox="0 0 24 24" style={icon} fill="#ffffff" stroke={C.foreground} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 14a8 8 0 0 1-8 8" />
          <path d="M18 11v-1a2 2 0 0 0-2-2a2 2 0 0 0-2 2" />
          <path d="M14 10V9a2 2 0 0 0-2-2a2 2 0 0 0-2 2v1" />
          <path d="M10 9.5V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v10" />
          <path d="M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
        </svg>
      ) : (
        // TextCursor (I-beam)
        <svg viewBox="0 0 24 24" style={icon} fill="none" stroke={C.foreground} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 22h-1a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4h1" />
          <path d="M7 22h1a4 4 0 0 0 4-4v-1" />
          <path d="M7 2h1a4 4 0 0 1 4 4v1" />
        </svg>
      )}
      </div>
    </>
  );
};

// ── Hand-off scena→scena (SceneShell) ────────────────────────────────────────

/** Durata standard dell'hand-off in secondi (finestra di overlap tra scene). */
export const HANDOFF_S = 0.9;
export const HANDOFF_F = s2f(HANDOFF_S);

/**
 * Cornice di scena con l'hand-off del kit web: l'ENTRANTE sale dentro e si
 * mette a fuoco (scale 0.92→1, rise, fade-in); l'USCENTE sfuma e sale via
 * (scale→0.94, rise, fade-out). Le scene si montano in <Sequence> sovrapposte
 * di HANDOFF_F frame. `first`/`last` disattivano la rispettiva finestra.
 */
export const SceneShell: React.FC<{
  durationInFrames: number;
  first?: boolean;
  last?: boolean;
  children: React.ReactNode;
}> = ({ durationInFrames, first, last, children }) => {
  const frame = useCurrentFrame();
  let style: React.CSSProperties = {};
  if (!first && frame < HANDOFF_F) {
    const p = frame / HANDOFF_F;
    style = {
      opacity: p,
      transform: `translateY(${8 * (1 - p)}%) scale(${0.92 + 0.08 * p})`,
    };
  } else if (!last && frame > durationInFrames - HANDOFF_F) {
    const p = (frame - (durationInFrames - HANDOFF_F)) / HANDOFF_F;
    style = {
      opacity: 1 - p,
      transform: `translateY(${-8 * p}%) scale(${1 - 0.06 * p})`,
    };
  }
  return (
    <AbsoluteFill style={{ backgroundColor: C.background, overflow: "hidden" }}>
      <AbsoluteFill style={{ ...style, transformOrigin: "center center" }}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── Device frame 16:10 condiviso dalle scene-prodotto ────────────────────────

/** Cornice laptop 16:10 centrata (aspect-[16/10] max-w-6xl delle scene web),
 *  1400×875 nel frame 1920×1080. */
export const FRAME = { w: 1400, h: 875, x: (1920 - 1400) / 2, y: (1080 - 875) / 2 } as const;

export const DeviceFrame: React.FC<{
  children: React.ReactNode;
  bg?: string;
  /** elevazione reattiva 0..1 (D2.3): approfondisce/allunga SOLO l'ombra di pavimento
   *  e l'ellisse di contatto. Default 0 → output byte-identico (il match-cut lo esige). */
  lift?: number;
}> = ({ children, bg = C.background, lift = 0 }) => {
  const L = Math.max(0, Math.min(1, lift));
  // Con lift>0 si ricompone SOLO lo strato di pavimento (gli altri 3 restano fissi).
  const boxShadow =
    L === 0
      ? SHADOW.device
      : [
          "inset 0 1px 0 rgba(255,255,255,0.9)",
          "0 1px 2px rgba(2,6,23,0.10)",
          "0 12px 28px -10px rgba(2,6,23,0.22)",
          `0 ${(44 + 30 * L).toFixed(1)}px ${(80 + 44 * L).toFixed(1)}px -36px rgba(2,6,23,${(0.3 + 0.12 * L).toFixed(3)})`,
        ].join(", ");
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "relative", width: FRAME.w, height: FRAME.h }}>
        {/* Ellisse di CONTATTO: scura e corta, appena sotto il bordo → àncora l'oggetto
            al piano (nessun filtro: la morbidezza è nel gradiente, deterministica). */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            left: "50%",
            bottom: -14 - 12 * L,
            width: FRAME.w * 0.9,
            height: 40 + 20 * L,
            transform: "translateX(-50%)",
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse at center, rgba(2,6,23,0.22) 0%, rgba(2,6,23,0.10) 40%, rgba(2,6,23,0) 72%)",
            zIndex: 0,
          }}
        />
        <div
          style={{
            position: "relative",
            zIndex: 1,
            width: FRAME.w,
            height: FRAME.h,
            borderRadius: 16,
            border: `1px solid ${C.border}`,
            backgroundColor: bg,
            boxShadow,
            overflow: "hidden",
            display: "flex",
            fontFamily,
            color: C.foreground,
          }}
        >
          {children}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** Tre puntini "sta scrivendo…" che rimbalzano (animate-bounce web). */
export const TypingDots: React.FC<{ color?: string }> = ({ color = C.muted }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ display: "flex", gap: 5, alignItems: "center", height: 14 }}>
      {[0, 1, 2].map((i) => {
        const t = (frame / 30 - i * 0.16) * 2 * Math.PI * 1.2;
        const y = -Math.max(0, Math.sin(t)) * 5;
        return (
          <div
            key={i}
            style={{ width: 7, height: 7, borderRadius: 999, backgroundColor: color, transform: `translateY(${y}px)` }}
          />
        );
      })}
    </div>
  );
};

// ── Grain cinematografico ────────────────────────────────────────────────────

/** Velo di grana leggero su tutto il film (CinematicGrain web). SVG turbulence
 *  statica che "trema" spostandosi di qualche px per frame. */
export const CinematicGrain: React.FC<{ opacity?: number }> = ({ opacity = 0.05 }) => {
  const frame = useCurrentFrame();
  const jitterX = (frame % 4) * 7;
  const jitterY = ((frame + 2) % 4) * 5;
  // PERF: il filtro SVG feTurbulence viene rasterizzato ogni frame ed è costoso →
  // la grana vive SOLO al render. La vignetta (gradiente radiale, gratis) resta
  // sempre, così l'anteprima conserva il "peso" cinematografico senza lag.
  const { isRendering } = getRemotionEnvironment();
  // Vignetta leggermente FUORI-CENTRO (47%/41%) + micro-respiro (≤0.05) su frame/95:
  // il "peso" dell'ottica non è mai perfettamente statico né perfettamente simmetrico.
  const vig = (0.16 + 0.04 * Math.sin((frame / 95) * Math.PI * 2)).toFixed(3);
  return (
    <>
      {/* Vignetta cinematografica: bordi appena scuriti per dare peso e profondità. */}
      <AbsoluteFill
        style={{
          zIndex: 89,
          pointerEvents: "none",
          background: `radial-gradient(ellipse at 47% 41%, transparent 52%, rgba(8,16,32,${vig}) 100%)`,
        }}
      />
      {/* Grana (solo al render). */}
      {isRendering ? (
        <AbsoluteFill style={{ zIndex: 90, pointerEvents: "none", opacity, mixBlendMode: "overlay" }}>
          <svg width="100%" height="100%">
            <filter id="grain">
              <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
            </filter>
            <rect width="110%" height="110%" x={-jitterX} y={-jitterY} filter="url(#grain)" />
          </svg>
        </AbsoluteFill>
      ) : null}
    </>
  );
};
