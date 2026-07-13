/**
 * SCENA 06 · App con assistente AI integrato (porting di ImmersiveRicarica.tsx).
 * Smartphone con chat di ricarica EV: richiesta parola-per-parola → card
 * stazione generata (mini-mappa con percorso disegnato + pin sonar + stat) →
 * prenotazione stallo → vista di ricarica live (batteria 20→80%, costi/tempi).
 */
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C, SHADOW } from "../kit/tokens";
import {
  Beat,
  cameraAt,
  drawPath,
  DUR,
  EASE_CAMERA,
  EASE_CAMERA_IN,
  EASE_CAMERA_OUT,
  EASE_IN_SCENE,
  EASE_OUT_SCENE,
  EASE_SNAP,
  enter,
  hoverBloom,
  maskReveal,
  parallax,
  pressButton,
  prog,
  s2f,
  seq,
  shotOn,
} from "../kit/motion";
import { Caption, captionBeats, ChapterCard, chapterIntroBeats, Cursor, StageBackdrop, TypeOn, TypingDots } from "../kit/ui";
import { fontFamily, monoFamily } from "../kit/fonts";

const USER1 = "Devo ricaricare lungo la A1 verso Milano";
const WORDS = USER1.split(" ");

const t = seq();
const CARD = chapterIntroBeats(t);
const PH_OUT = t.add(0.15);
const WORDS_IN = t.add(DUR.micro); // + stagger 0.19 × 7
const WORDS_END = WORDS_IN.start + s2f(0.19 * (WORDS.length - 1) + 0.3);
const CAM_INPUT = { start: WORDS_IN.start, dur: s2f(1.5), end: WORDS_IN.start + s2f(1.5) };
t.hold((WORDS_END - t.cursor) / s2f(0.8) > 0 ? (WORDS_END - t.cursor) / s2f(0.8) : 0.1); // attende fine parole
const CAM_SEND = t.add(DUR.beat);
const CUR_SEND = t.add(1.0);
const PRESS_SEND = t.add(0.32, -0.05);
const WORDS_OUT = t.add(DUR.micro, "<");
const MSG_USER1 = t.add(DUR.beat, -0.05);
const CAM_RESET1 = t.add(DUR.beat, "<");
const TYPING_IN = t.add(DUR.micro, 0.1);
const SAY1 = captionBeats(t);
const TYPING_OUT = t.add(0.15);
const AGENT1 = t.add(DUR.beat);
const STATION = t.add(DUR.beat, 0.1);
const ROUTE = t.add(1.0, -0.4);
const PIN = t.add(DUR.beat, -0.4);
const RINGS = t.add(1.0, -0.5); // + stagger 0.18 ×2
const STATS = t.add(DUR.beat, -0.85); // maskReveal top, stagger 0.07 ×4
t.hold(0.5);
const CAM_BOOK = t.add(DUR.beat);
const CUR_BOOK = t.add(1.0);
const PRESS_BOOK = t.add(0.32, -0.05);
const MSG_USER2 = t.add(DUR.beat, -0.05);
t.hold(1);
const SAY2 = captionBeats(t);
const CHARGE = t.add(DUR.beat);
const SCROLL2 = t.add(DUR.beat, "<");
const CAM_CHARGE = t.add(1.5);
const BATT = t.add(1.5, -1.4);
const MSG_FINAL = t.add(DUR.beat, 0.1);
const SCROLL3 = t.add(DUR.beat, "<");
const CAM_RESET2 = t.add(0.8, "<");
t.hold(0.6);
export const RICARICA_DURATION = t.total;

// Finestra di digitazione del campo input (D3.3): dall'avvio delle parole alla loro fine.
const TYPE_INPUT: Beat = { start: WORDS_IN.start, dur: WORDS_END - WORDS_IN.start, end: WORDS_END };
// Finestre di QUIETE camera (D2.7): il frame si ferma sui due payoff — la card stazione
// (reveal generativo) e la card ricarica. Passate a cameraAt E al Cursor (o si desincronizza).
const CALMS: Beat[] = [
  { start: STATION.start, dur: STATS.end - STATION.start, end: STATS.end },
  { start: CHARGE.start, dur: BATT.end - CHARGE.start, end: BATT.end },
];

// ── Geometria del telefono ───────────────────────────────────────────────────
const PHONE = { w: 380, h: 823, x: (1920 - 380) / 2, y: (1080 - 823) / 2 + 10 };
const P = {
  send: { x: PHONE.x + PHONE.w - 34, y: PHONE.y + PHONE.h - 36 },
  book: { x: 960, y: PHONE.y + 640 },
};
const SHOTS = [
  // Push-in / reframe verso un soggetto → EASE_CAMERA_IN (attacco+settle, D2.2).
  { at: CAM_INPUT.end, from: CAM_INPUT.start, ...shotOn(960, PHONE.y + PHONE.h - 40, 1.3), ease: EASE_CAMERA_IN },
  { at: CAM_SEND.end, from: CAM_SEND.start, ...shotOn(P.send.x, P.send.y, 1.24), ease: EASE_CAMERA_IN },
  // Reset a neutro → EASE_CAMERA_OUT (rilascio + decelerazione morbida).
  { at: CAM_RESET1.end, from: CAM_RESET1.start, x: 0, y: 0, scale: 1, ease: EASE_CAMERA_OUT },
  { at: CAM_BOOK.end, from: CAM_BOOK.start, ...shotOn(P.book.x, P.book.y, 1.08), ease: EASE_CAMERA_IN },
  { at: CAM_CHARGE.end, from: CAM_CHARGE.start, ...shotOn(960, PHONE.y + 500, 1.14), ease: EASE_CAMERA_IN },
  { at: CAM_RESET2.end, from: CAM_RESET2.start, x: 0, y: 0, scale: 1, ease: EASE_CAMERA_OUT },
];

const STATION_STATS = [
  ["Distanza", "4,2 km"],
  ["Potenza", "175 kW"],
  ["Presa", "CCS2"],
  ["Stallo", "Libero"],
] as const;

const fmtEur = new Intl.NumberFormat("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const Ricarica: React.FC = () => {
  const frame = useCurrentFrame();
  const bgDim = 1 - 0.55 * prog(frame, STATION, EASE_IN_SCENE) + 0.55 * prog(frame, CAM_RESET2, EASE_CAMERA); // rackFocus griglia
  const gridDim = Math.max(0.45, Math.min(1, bgDim)); // rack-focus applicato ai due piani-griglia
  const threadY = -262 * prog(frame, SCROLL2, EASE_CAMERA) - 62 * prog(frame, SCROLL3, EASE_CAMERA);
  const wordsVisible = frame >= WORDS_IN.start && frame < WORDS_OUT.end;
  const wordsOutP = prog(frame, WORDS_OUT, EASE_OUT_SCENE);
  const battP = prog(frame, BATT, EASE_CAMERA);
  const battScale = 0.2 + 0.6 * battP;
  const pctPulse = 1 + 0.12 * Math.sin(Math.PI * prog(frame, BATT, (x) => x));

  const bubbleStyle = (side: "l" | "r", accent?: boolean): React.CSSProperties => ({
    alignSelf: side === "r" ? "flex-end" : "flex-start",
    maxWidth: "85%",
    borderRadius: 16,
    padding: "9px 13px",
    fontSize: 14.5,
    lineHeight: 1.4,
    ...(side === "r"
      ? { backgroundColor: C.accent, color: C.accentContrast, borderTopRightRadius: 4, fontWeight: 500 }
      : accent
        ? { backgroundColor: C.accentSoft, color: C.accentInk, borderTopLeftRadius: 4, fontWeight: 600 }
        : { backgroundColor: C.surface2, color: C.foreground, borderTopLeftRadius: 4 }),
  });

  return (
    <AbsoluteFill style={{ backgroundColor: C.background, fontFamily }}>
      {/* Set illuminato: fondale ambientale (D1.1), primo figlio NON trasformato. */}
      <StageBackdrop />
      {/* Griglia-mappa come PLATE materica sdoppiata in profondità (D2.4): il piano
          LONTANO si muove meno (parallax 0.62, cella fine, alpha ~.05), il VICINO di più
          (0.28, cella larga, alpha ~.08). Montati FUORI dalla camera → parallax legge la
          sola posa: nessun drift da fermi. Il rack-focus (gridDim) li smorza quando la card
          stazione prende il fuoco. */}
      <div
        style={{
          position: "absolute",
          inset: "-14%",
          ...parallax(frame, SHOTS, 0.62),
          opacity: gridDim,
          backgroundImage:
            "linear-gradient(rgba(132,204,22,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(132,204,22,0.05) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: "-14%",
          ...parallax(frame, SHOTS, 0.28),
          opacity: gridDim,
          backgroundImage:
            "linear-gradient(rgba(132,204,22,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(132,204,22,0.08) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />
      <AbsoluteFill style={cameraAt(frame, SHOTS, [PRESS_SEND, PRESS_BOOK], CALMS)}>
        {/* PHONE */}
        <div style={{ position: "absolute", left: PHONE.x, top: PHONE.y, width: PHONE.w, height: PHONE.h, borderRadius: 42, border: `5px solid ${C.border}`, backgroundColor: C.surface2, boxShadow: "0 24px 60px rgba(2,6,23,0.18)" }}>
          <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 80, height: 20, borderBottomLeftRadius: 16, borderBottomRightRadius: 16, backgroundColor: C.surface2, zIndex: 20 }} />
          <div style={{ position: "absolute", inset: 3, borderRadius: 35, backgroundColor: C.background, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {/* header */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "26px 14px 10px", borderBottom: `1px solid ${C.border}`, backgroundColor: "rgba(255,255,255,0.9)" }}>
              <span style={{ width: 30, height: 30, borderRadius: 999, backgroundColor: C.accent, color: C.accentContrast, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>AI</span>
              <span>
                <span style={{ display: "block", fontSize: 13.5, fontWeight: 600 }}>Assistente di ricarica</span>
                <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: C.accentInk, fontWeight: 500 }}>
                  <span style={{ width: 6, height: 6, borderRadius: 999, backgroundColor: C.accent }} />
                  Auto connessa
                </span>
              </span>
            </div>
            {/* thread */}
            <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "12px 12px", transform: `translateY(${threadY}px)` }}>
                <div style={bubbleStyle("l")}>Ciao! Posso trovarti una colonnina lungo il tuo percorso.</div>
                <div style={{ ...bubbleStyle("r"), ...enter(frame, MSG_USER1, { y: 14, anticipate: true }) }}>{USER1}</div>
                {frame >= TYPING_IN.start && frame < AGENT1.start ? (
                  <div style={{ ...bubbleStyle("l"), opacity: prog(frame, TYPING_IN, EASE_IN_SCENE) * (1 - prog(frame, TYPING_OUT, EASE_OUT_SCENE)) }}>
                    <TypingDots />
                  </div>
                ) : (
                  frame >= AGENT1.start && <div style={{ ...bubbleStyle("l"), opacity: prog(frame, AGENT1, EASE_SNAP), transform: `translateX(${-18 * (1 - prog(frame, AGENT1, EASE_SNAP))}px)` }}>Trovata una colonnina ultra-rapida sul percorso:</div>
                )}
                {/* CARD STAZIONE generativa */}
                {frame >= STATION.start ? (
                  <div style={{ ...enter(frame, STATION, { y: 18, anticipate: true, blur: 3, scaleFrom: 0.97 }), border: `1px solid ${C.border}`, backgroundColor: C.surface, borderRadius: 16, overflow: "hidden" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px" }}>
                      <span>
                        <span style={{ display: "block", fontSize: 13, fontWeight: 600 }}>Hub Ultra-Rapido · A1</span>
                        <span style={{ fontSize: 11, color: C.muted }}>Rete partner</span>
                      </span>
                      <span style={{ backgroundColor: C.accentSoft, color: C.accentInk, borderRadius: 999, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>175 kW</span>
                    </div>
                    {/* mini-mappa */}
                    <div style={{ position: "relative", aspectRatio: "16/9", backgroundColor: C.accentSoft, overflow: "hidden" }}>
                      <svg viewBox="0 0 220 120" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
                        <rect x="0" y="62" width="220" height="6" rx="3" fill={C.background} fillOpacity={0.7} />
                        <rect x="116" y="0" width="6" height="120" rx="3" fill={C.background} fillOpacity={0.6} />
                        <rect x="0" y="26" width="220" height="4" rx="2" fill={C.background} fillOpacity={0.4} />
                        <rect x="58" y="0" width="4" height="120" rx="2" fill={C.background} fillOpacity={0.35} />
                        <path d="M 24 104 L 24 66 L 120 66 L 120 29 L 185 29" fill="none" stroke={C.accent} strokeWidth={7} strokeOpacity={0.18} />
                        <path d="M 24 104 L 24 66 L 120 66 L 120 29 L 185 29" fill="none" stroke={C.accent} strokeWidth={3} pathLength={1} style={drawPath(frame, ROUTE)} />
                        <circle cx="24" cy="104" r="5" fill={C.accent} />
                        <circle cx="24" cy="104" r="2.5" fill={C.background} />
                      </svg>
                      {/* pin + sonar */}
                      <div style={{ position: "absolute", left: "84%", top: "24%" }}>
                        <div style={{ position: "relative", transform: `translate(-50%, -100%) scale(${0.5 + 0.5 * prog(frame, PIN, EASE_SNAP)})`, opacity: prog(frame, PIN, EASE_SNAP), transformOrigin: "50% 100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
                          {[0, 1].map((i) => {
                            const b = { start: RINGS.start + s2f(0.18) * i, dur: RINGS.dur, end: RINGS.end + s2f(0.18) * i };
                            const p = prog(frame, b, EASE_IN_SCENE);
                            return <div key={i} style={{ position: "absolute", inset: -8, borderRadius: 999, border: `2px solid ${C.accent}`, opacity: 0.7 * (1 - p), transform: `scale(${1 + 1.8 * p})` }} />;
                          })}
                          <div style={{ width: 30, height: 30, borderRadius: 999, backgroundColor: C.accent, outline: "2px solid #fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill={C.accentContrast}><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
                          </div>
                          <div style={{ width: 2.5, height: 8, backgroundColor: C.accent }} />
                        </div>
                      </div>
                    </div>
                    {/* stats */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 1, backgroundColor: C.border }}>
                      {STATION_STATS.map(([lab, valx], i) => {
                        const b = { start: STATS.start + s2f(0.07) * i, dur: STATS.dur, end: STATS.end + s2f(0.07) * i };
                        return (
                          <div key={lab} style={{ backgroundColor: C.surface, padding: "8px 4px", textAlign: "center", ...maskReveal(frame, b, { dir: "t" }) }}>
                            <div style={{ fontSize: 10, textTransform: "uppercase", color: C.muted }}>{lab}</div>
                            <div style={{ fontSize: 13, fontWeight: 700 }}>{valx}</div>
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ padding: 10 }}>
                      {/* hoverBloom sul WRAPPER (anello+lift), pressButton sul bottone interno:
                          i transform si compongono senza conflitto (D5.6). */}
                      <div style={{ borderRadius: 12, ...hoverBloom(frame, PRESS_BOOK) }}>
                        <div style={{ ...pressButton(frame, PRESS_BOOK, 0.94), backgroundColor: C.accent, color: C.accentContrast, borderRadius: 12, padding: "9px 0", textAlign: "center", fontSize: 13, fontWeight: 700 }}>
                          Prenota lo stallo
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
                {frame >= MSG_USER2.start ? <div style={{ ...bubbleStyle("r"), ...enter(frame, MSG_USER2, { y: 14, anticipate: true }) }}>Prenoto lo stallo</div> : null}
                {/* CARD RICARICA */}
                {frame >= CHARGE.start ? (
                  <div style={{ ...enter(frame, CHARGE, { y: 18, anticipate: true }), border: `1px solid ${C.border}`, backgroundColor: C.surface, borderRadius: 16, padding: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.1em", color: C.muted, fontWeight: 600 }}>In ricarica</span>
                      <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: C.accentInk, fontWeight: 700 }}>
                        <span style={{ width: 6, height: 6, borderRadius: 999, backgroundColor: C.accent }} />
                        150 kW
                      </span>
                    </div>
                    <div style={{ color: C.accentInk, fontFamily: monoFamily, fontSize: 26, fontWeight: 700, marginTop: 6, transform: `scale(${pctPulse})`, transformOrigin: "left center", display: "inline-block" }}>
                      {Math.round(20 + 60 * battP)}%
                    </div>
                    <div style={{ height: 16, borderRadius: 999, backgroundColor: C.surface2, marginTop: 6, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: "100%", borderRadius: 999, background: `linear-gradient(to right, ${C.accent}, ${C.accentStrong})`, transform: `scaleX(${battScale})`, transformOrigin: "left center" }} />
                    </div>
                    <div style={{ fontSize: 12, color: C.muted, marginTop: 6 }}>
                      Obiettivo 80% · <span style={{ color: C.accentInk, fontWeight: 600 }}>~18 min</span>
                    </div>
                    <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                      {[
                        [`${fmtEur.format(6.4 * prog(frame, BATT, EASE_CAMERA))} €`, "Costo"],
                        [`${Math.round(18 * prog(frame, BATT, EASE_CAMERA))} min`, "Durata"],
                      ].map(([valx, lab]) => (
                        <div key={lab} style={{ flex: 1, backgroundColor: C.surface2, borderRadius: 12, padding: "8px 0", textAlign: "center" }}>
                          <div style={{ fontFamily: monoFamily, fontSize: 15, fontWeight: 700 }}>{valx}</div>
                          <div style={{ fontSize: 10.5, color: C.muted }}>{lab}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
                {frame >= MSG_FINAL.start ? <div style={{ ...bubbleStyle("l", true), ...enter(frame, MSG_FINAL, { y: 12 }) }}>Stallo prenotato · navigazione avviata.</div> : null}
              </div>
            </div>
            {/* input bar */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 10px", borderTop: `1px solid ${C.border}`, backgroundColor: C.background }}>
              <div style={{ flex: 1, minHeight: 34, backgroundColor: C.surface2, borderRadius: 16, padding: "7px 12px", position: "relative", overflow: "hidden" }}>
                <span style={{ position: "absolute", color: C.muted, fontSize: 13, opacity: wordsVisible ? 0 : 1 }}>Scrivi all'assistente…</span>
                {wordsVisible ? (
                  <span style={{ display: "inline-block", opacity: 1 - wordsOutP }}>
                    {/* Type-on con CARET lime (D3.3): scatti per carattere, poi caret idle. */}
                    <TypeOn text={USER1} beat={TYPE_INPUT} size={12} color={C.foreground} idle={0.9} />
                  </span>
                ) : null}
              </div>
              {/* hoverBloom sul WRAPPER (anello lime + lift), pressButton sul bottone interno. */}
              <div style={{ display: "flex", borderRadius: 999, ...hoverBloom(frame, PRESS_SEND) }}>
                <div style={{ width: 34, height: 34, borderRadius: 999, backgroundColor: C.accent, color: C.accentContrast, display: "flex", alignItems: "center", justifyContent: "center", ...pressButton(frame, PRESS_SEND, 0.86) }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M3 11l18-8-8 18-2.5-7.5L3 11z" /></svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AbsoluteFill>

      <Cursor
        shots={SHOTS}
        clicks={[PRESS_SEND, PRESS_BOOK]}
        calms={CALMS}
        moves={[
          { beat: CUR_SEND, ...P.send, mode: "hand" },
          { beat: CUR_BOOK, ...P.book, mode: "hand" },
        ]}
        hideAfter={{ start: MSG_USER2.end, dur: s2f(0.3), end: MSG_USER2.end + s2f(0.3) }}
      />

      <Caption beats={SAY1}>Trova la colonnina giusta sul tuo percorso.</Caption>
      <Caption beats={SAY2}>Prenota lo stallo e segue tempi e costi in tempo reale.</Caption>
      <ChapterCard title="App con assistente AI integrato" subtitle="Un'app con assistente AI integrato." beats={CARD} index={6} />
    </AbsoluteFill>
  );
};
