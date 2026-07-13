/**
 * SCENA 07 · Chiusura (porting di ClosingScene.tsx).
 * Minimale: title card di chiusura su trama a puntini accent, poi il CTA
 * «Rivedi la presentazione» che entra. Chiude il film.
 */
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C } from "../kit/tokens";
import { DUR, EASE_IN_SCENE, EASE_SNAP, enter, maskReveal, prog, seq } from "../kit/motion";
import { DotsTexture } from "../kit/ui";
import { fontFamily } from "../kit/fonts";

const t = seq();
const TITLE = t.add(DUR.scene);
const SUB = t.add(DUR.beat, -0.2);
const CTA = t.add(DUR.beat, 0.3);
t.hold(2.5);
export const CLOSING_DURATION = t.total;

export const Closing: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: C.background, alignItems: "center", justifyContent: "center" }}>
      <DotsTexture />
      <div style={{ position: "relative", textAlign: "center", padding: "0 24px" }}>
        <div style={{ ...maskReveal(frame, TITLE, { dir: "l" }), fontFamily, fontWeight: 700, fontSize: 76, letterSpacing: "-0.03em", color: C.foreground }}>
          Sette servizi, un solo partner.
        </div>
        <div style={{ opacity: prog(frame, SUB, EASE_IN_SCENE), transform: `translateY(${14 * (1 - prog(frame, SUB, EASE_IN_SCENE))}px)`, marginTop: 20, fontFamily, fontSize: 24, color: C.muted }}>
          Dal sito alla ricarica, costruiti su misura.
        </div>
        <div style={{ ...enter(frame, CTA, { y: 18, anticipate: true }), marginTop: 40 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 10, backgroundColor: C.accent, color: C.accentContrast, borderRadius: 999, padding: "14px 30px", fontSize: 18, fontWeight: 600 }}>
            ↻ Rivedi la presentazione
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
