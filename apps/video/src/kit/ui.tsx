/**
 * Componenti UI del kit immersivo — porting Remotion di shared.tsx (web).
 * ChapterCard + chapterIntro, Caption (Say variant "caption"), Cursor finto
 * contestuale, SceneShell (hand-off scena→scena), trama a puntini accent.
 */
import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { C } from "./tokens";
import {
  Beat,
  DUR,
  EASE_CAMERA,
  EASE_IN_SCENE,
  EASE_OUT_SCENE,
  EASE_SNAP,
  maskReveal,
  prog,
  s2f,
  seq,
} from "./motion";
import { fontFamily } from "./fonts";

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
}> = ({ title, subtitle, beats, lift = 0 }) => {
  const frame = useCurrentFrame();
  const outP = prog(frame, beats.out, EASE_OUT_SCENE);
  if (outP >= 1) return null;
  const subP = prog(frame, beats.sub, EASE_IN_SCENE);
  // anticipazione del titolo: micro offset x contro il verso del wipe (EASE_SNAP)
  const antX = -8 * (1 - prog(frame, beats.title, EASE_SNAP));
  return (
    <AbsoluteFill
      style={{
        backgroundColor: C.background,
        opacity: 1 - outP,
        transform: `translateY(${-48 * outP}px)`,
        zIndex: 50,
      }}
    >
      <DotsTexture />
      <AbsoluteFill
        style={{ alignItems: "center", justifyContent: "center", transform: `translateY(${lift}px)` }}
      >
        <div style={{ maxWidth: 1100, padding: "0 24px", textAlign: "center" }}>
          <div
            style={{
              ...maskReveal(frame, beats.title, { dir: "l", ease: EASE_CAMERA }),
              transform: `translateX(${antX}px)`,
              fontFamily,
              fontWeight: 700,
              fontSize: 84,
              letterSpacing: "-0.03em",
              color: C.foreground,
            }}
          >
            {title}
          </div>
          {subtitle ? (
            <div
              style={{
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
  /** posizione custom della pill (default: centrata in basso) */
  style?: React.CSSProperties;
}> = ({ beats, children, style }) => {
  const frame = useCurrentFrame();
  const inP = prog(frame, beats.enter, EASE_IN_SCENE);
  const outP = prog(frame, beats.leave, EASE_OUT_SCENE);
  if (inP <= 0 || outP >= 1) return null;
  return (
    <div
      style={{
        position: "absolute",
        bottom: 96,
        left: "50%",
        transform: `translateX(-50%) translateY(${16 * (1 - inP) - 10 * outP}px)`,
        opacity: inP * (1 - outP),
        zIndex: 40,
        maxWidth: "70%",
        borderRadius: 9999,
        border: `1px solid ${C.border}`,
        backgroundColor: "rgba(255,255,255,0.92)",
        boxShadow: "0 8px 24px rgba(2,6,23,0.10)",
        padding: "14px 28px",
        ...style,
      }}
    >
      <div
        style={{
          fontFamily,
          fontWeight: 600,
          fontSize: 22,
          letterSpacing: "-0.01em",
          color: C.foreground,
          textAlign: "center",
        }}
      >
        {children}
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
 * deterministico: niente getBoundingClientRect). Parte nascosto al bordo
 * destro; fa fade-in sul primo movimento. `hideAfter` lo sfuma via.
 */
export const Cursor: React.FC<{
  moves: CursorMove[];
  hideAfter?: Beat;
  /** parcheggio iniziale (default 92%, 60%) */
  parkX?: number;
  parkY?: number;
}> = ({ moves, hideAfter, parkX = 1920 * 0.92, parkY = 1080 * 0.6 }) => {
  const frame = useCurrentFrame();
  if (moves.length === 0) return null;

  let x = parkX;
  let y = parkY;
  let mode: CursorMode = "arrow";
  for (const m of moves) {
    if (frame >= m.beat.end) {
      x = m.x;
      y = m.y;
      mode = m.mode ?? "arrow";
    } else if (frame >= m.beat.start) {
      const p = prog(frame, m.beat, EASE_CAMERA);
      x = x + (m.x - x) * p;
      y = y + (m.y - y) * p;
      mode = "arrow"; // in viaggio: freccia
      break;
    } else break;
  }

  const first = moves[0].beat;
  let opacity = interpolate(frame, [first.start, Math.min(first.end, first.start + s2f(0.3))], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  if (hideAfter) opacity *= 1 - prog(frame, hideAfter, EASE_OUT_SCENE);
  if (opacity <= 0) return null;

  const icon = { width: 34, height: 34, position: "absolute" as const, top: -17, left: -17 };
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        opacity,
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

export const DeviceFrame: React.FC<{ children: React.ReactNode; bg?: string }> = ({
  children,
  bg = C.background,
}) => (
  <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
    <div
      style={{
        width: FRAME.w,
        height: FRAME.h,
        borderRadius: 16,
        border: `1px solid ${C.border}`,
        backgroundColor: bg,
        boxShadow: "0 2px 4px rgba(2,6,23,0.08), 0 18px 40px rgba(2,6,23,0.16)",
        overflow: "hidden",
        display: "flex",
        position: "relative",
        fontFamily,
        color: C.foreground,
      }}
    >
      {children}
    </div>
  </AbsoluteFill>
);

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
  return (
    <AbsoluteFill style={{ zIndex: 90, pointerEvents: "none", opacity, mixBlendMode: "overlay" }}>
      <svg width="100%" height="100%">
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
        </filter>
        <rect
          width="110%"
          height="110%"
          x={-jitterX}
          y={-jitterY}
          filter="url(#grain)"
        />
      </svg>
    </AbsoluteFill>
  );
};
