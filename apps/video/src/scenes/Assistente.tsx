/**
 * SCENA 02 · Assistente AI (porting di ImmersiveAssistente.tsx).
 * Home di un sito vetrina → megamenu sovraccarico (nessun click) → la
 * richiesta si digita nella barra → chat → domanda di chiarimento → risposta
 * → l'assistente COSTRUISCE l'interfaccia della risposta (setup, grafico
 * notturno, costi, CTA).
 */
import React from "react";
import { AbsoluteFill, Easing, Img, staticFile, useCurrentFrame } from "remotion";
import { C, SHADOW } from "../kit/tokens";
import {
  cameraAt,
  countUp,
  drawPath,
  DUR,
  EASE_CAMERA,
  EASE_CAMERA_IN,
  EASE_CAMERA_OUT,
  EASE_IN_SCENE,
  EASE_OUT_SCENE,
  EASE_SNAP,
  enter,
  FPS,
  hoverBloom,
  maskReveal,
  pressButton,
  prog,
  s2f,
  seq,
  shotOn,
  typeTrackShots,
  val,
} from "../kit/motion";
import {
  Caption,
  captionBeats,
  ChapterCard,
  chapterIntroBeats,
  Cursor,
  DeviceFrame,
  FRAME,
  StageBackdrop,
  TypeOn,
  TypingDots,
} from "../kit/ui";
import { fontFamily } from "../kit/fonts";

/** Atterraggio gentile per-parola della risposta AI (D3.4): back(1.15), MAI EASE_SNAP
 *  1.6 — l'overshoot vive SOLO sulla posizione (grammatica D0.1). */
const EASE_CHAR = Easing.out(Easing.back(1.15));
/** Stagger per-parola della composizione AI (~0.03s → un modello che scrive). */
const AI_WSTAG = 0.03 * FPS;

// ── Dati (da _assistente-data.ts, verbatim) ──────────────────────────────────
const NAV = ["Fotovoltaico", "Ricarica EV", "Catalogo", "Contatti"];
const MEGA: [string, string[]][] = [
  [
    "Cavi di ricarica",
    [
      "per Wallbox",
      "per Colonnina",
      "Modo 2 · Schuko",
      "Modo 3 · Tipo 2",
      "Monofase",
      "Trifase",
      "Spiralato",
      "Dritto · 5 m",
      "Dritto · 7 m",
    ],
  ],
  [
    "Wallbox",
    [
      "Monofase 3,7 kW",
      "Monofase 7,4 kW",
      "Trifase 11 kW",
      "Trifase 22 kW",
      "Con display",
      "Con lettore RFID",
      "Con contatore MID",
      "Da esterno · IP55",
    ],
  ],
  [
    "Accessori",
    [
      "Supporti a muro",
      "Adattatori",
      "Contattori",
      "Protezioni DC",
      "Gestione carichi",
      "Kit fotovoltaico",
      "Colonnine da terra",
      "Cavi di prolunga",
    ],
  ],
];
const REQUEST =
  "Ho appena preso un'auto elettrica e a casa ho il fotovoltaico da 6 kW: che setup mi consigliate per ricaricare di notte senza far scattare il contatore?";
const CLARIFY =
  "Il contatore è da 3 kW o l'avete già potenziato? E quanti km fate in media al giorno?";
const ANSWER = "3 kW, circa 40 km al giorno.";
const REASONING =
  "Con un contatore da 3 kW la chiave è la gestione dinamica del carico: la wallbox modula la potenza di notte e non fa scattare nulla. Per 40 km al giorno bastano circa 3 ore. Ecco il setup che ti propongo:";
const NIGHT = [
  { h: "22", level: 20, active: false },
  { h: "23", level: 34, active: false },
  { h: "00", level: 86, active: true },
  { h: "01", level: 94, active: true },
  { h: "02", level: 88, active: true },
  { h: "03", level: 42, active: false },
  { h: "04", level: 18, active: false },
  { h: "05", level: 15, active: false },
  { h: "06", level: 13, active: false },
  { h: "07", level: 11, active: false },
];

// ── Timeline ─────────────────────────────────────────────────────────────────
const t = seq();
const CARD = chapterIntroBeats(t);
const CAM_NAV = t.add(DUR.beat);
const CUR_CAT = t.add(1.0);
// E · CAUSA→EFFETTO: il megamenu si apre DOPO che il cursore è arrivato su "Catalogo"
// (prima apriva 1 frame prima dell'atterraggio). +0.1s → ~3 frame dopo l'arrivo.
const MEGA_IN = t.add(DUR.beat, 0.1);
const CUR_HI0 = t.add(1.0);
// E · l'highlight FIORISCE dopo l'arrivo del cursore sulla voce (prima fioriva ~22 frame
// PRIMA che il cursore atterrasse). +0.1s → ~3 frame dopo l'arrivo.
const HI0 = t.add(DUR.micro, 0.1);
t.hold(0.6);
const CUR_HI1 = t.add(1.0);
// E · idem: highlight dopo l'arrivo del cursore sulla seconda voce.
const HI1 = t.add(DUR.micro, 0.1);
t.hold(0.6);
const MEGA_OUT = t.add(DUR.beat);
const CAM_RESET1 = t.add(1.0, "<");
const SAY1 = captionBeats(t);
const CAM_BAR = t.add(DUR.beat);
const CUR_BAR = t.add(1.0);
// (E) il focus-ring si accende nell'ULTIMO tratto d'avvicinamento e satura ESATTO
// all'arrivo del cursore (-0.3 = durata del ring): prima (-0.7) era pieno 0.4s
// prima che il mouse toccasse la barra. Durata totale invariata.
const RING1 = t.add(DUR.micro, -0.3);
const TYPE1 = t.add(2.0);
const CAM_SEND = t.add(DUR.beat);
const CUR_SEND1 = t.add(DUR.beat);
const PRESS1 = t.add(0.45, -0.05);
// E · la chat compare DOPO che il tasto Invia si è alzato (piccolo gap +0.08s ≈ 2 frame):
// prima → click, poi → reazione. CHAT_IN è allineato "<" all'inizio di CAM_RESET2.
const CAM_RESET2 = t.add(1.0, 0.08);
const CHAT_IN = t.add(1.0, "<");
const MSG_Q = t.add(DUR.beat, -0.2);
t.hold(0.4);
const SAY2 = captionBeats(t);
const MSG_CLARIFY = t.add(DUR.beat);
t.hold(0.5);
const CLARIFY_TEXT = t.add(DUR.micro);
t.hold(0.4);
const CUR_BAR2 = t.add(1.0);
const RING2 = t.add(DUR.micro, -0.3); // (E) come RING1: pieno all'arrivo, non prima
const TYPE2 = t.add(1.1);
const CUR_SEND2 = t.add(1.0);
const PRESS2 = t.add(0.45, -0.05);
// E · la bolla-risposta (eco dell'utente) compare DOPO il click Invia (prima partiva 3
// frame PRIMA che il press finisse): +0.1s ≈ 3 frame dopo PRESS2.end.
const MSG_A = t.add(DUR.beat, 0.1);
t.hold(0.4);
const MSG_REASON = t.add(DUR.beat);
t.hold(0.5);
const REASON_TEXT = t.add(DUR.micro);
const SAY3 = captionBeats(t);
const CAM_GEN = t.add(1.0);
const GEN_IN = t.add(DUR.beat, "<");
const SETUP = t.add(DUR.beat, -0.05);
t.hold(0.3);
const CHART_IN = t.add(DUR.beat);
const BARS = t.add(DUR.beat, -0.15); // + stagger 0.05 per barra
const BAND = t.add(DUR.beat, -0.35);
t.hold(0.3);
const COST_IN = t.add(DUR.beat);
const COUNT = t.add(1.0, -0.2);
t.hold(0.3);
const FOOT_IN = t.add(DUR.beat);
const CAM_RESET3 = t.add(DUR.beat, -0.1);
t.hold(0.3);
const CAM_CTA = t.add(DUR.beat);
const CUR_CTA = t.add(DUR.beat);
const PRESS3 = t.add(0.45, -0.05);
// D5.7: il confirm è un PAYOFF, non un crossfade — la finestra si allarga (0.3→1.1s)
// così flourish (label-lift → check → flash → ring bloom → testo) sta TUTTO qui e la
// camera si sposa a resettare solo DOPO (frame fermo sulla conferma, vedi CALM_CONFIRM).
// E · il confirm parte DOPO che il tasto CTA si è alzato (+0.08s ≈ 2 frame): press→conferma.
const CTA_SWAP = t.add(1.1, 0.08);
const CAM_RESET4 = t.add(1.0);
t.hold(1.0);
export const ASSISTENTE_DURATION = t.total;

// ── D5.7 · Sub-beat del confirm flourish (dentro CTA_SWAP: NON estendono il totale) ─
// Battute che si SOVRAPPONGONO: l'etichetta si stacca → la spunta si disegna → un
// flash accentStrong (≤4f) → l'anello lime BLOOMA (scale-expand) → il testo si posa.
const S0 = CTA_SWAP.start;
const CTA_LABEL_OUT = { start: S0, dur: s2f(0.26), end: S0 + s2f(0.26) };
const CTA_CHECK = { start: S0 + s2f(0.17), dur: s2f(0.46), end: S0 + s2f(0.17) + s2f(0.46) };
const CTA_FLASH = { start: S0 + s2f(0.55), dur: 4, end: S0 + s2f(0.55) + 4 };
const CTA_RING = { start: S0 + s2f(0.58), dur: s2f(0.52), end: S0 + s2f(0.58) + s2f(0.52) };
const CTA_TEXT = { start: S0 + s2f(0.62), dur: s2f(0.44), end: S0 + s2f(0.62) + s2f(0.44) };

// ── D2.7 · Finestre di QUIETE camera (il frame si ferma mentre l'AI compone / conferma) ─
// La risposta REASONING compone parola-per-parola: la calma copre l'intera finestra di
// reveal (stagger × parole + durata). Il confirm payoff = tutta la finestra CTA_SWAP.
const REASON_REVEAL = (REASONING.split(" ").length - 1) * AI_WSTAG + REASON_TEXT.dur;
const CALM_REASON = {
  start: REASON_TEXT.start,
  dur: REASON_REVEAL,
  end: REASON_TEXT.start + REASON_REVEAL,
};
const CALM_CONFIRM = CTA_SWAP;
const CALMS = [CALM_REASON, CALM_CONFIRM];

// ── Coordinate design-time (px 1920×1080) per cursore e camera ───────────────
// Geometria DETERMINISTICA del megamenu (righe ad altezza esplicita, come la nav
// della Dashboard): nav 68 + padding 24 + titolo (22+8) → prime righe a 122.
const MEGA_TITLE_H = 22 + 8; // titolo colonna + respiro sotto
const MEGA_ROW_H = 30; // ogni voce
const MEGA_COL_W = (1000 - 48) / 3; // inner 1000, grid 3 col, gap 24
const megaX = (col: number) => FRAME.x + (1400 - 1000) / 2 + col * (MEGA_COL_W + 24) + 10;
const megaY = (row: number) => FRAME.y + 68 + 24 + MEGA_TITLE_H + row * MEGA_ROW_H + MEGA_ROW_H / 2;
const P = {
  catalogo: { x: FRAME.x + 800, y: FRAME.y + 34 },
  hi0: { x: megaX(1) + 55, y: megaY(1) }, // col Wallbox, riga "Monofase 7,4 kW" (sul testo)
  hi1: { x: megaX(0) + 52, y: megaY(3) }, // col Cavi, riga "Modo 3 · Tipo 2" (sul testo)
  // bar: I-beam vicino all'INIZIO del testo (il campo parte a x=612=TYPE_X0), non a
  // metà campo — a 900 restava sospeso nel vuoto lontano dal caret che scrive.
  bar: { x: 640, y: FRAME.y + FRAME.h - 52 },
  send: { x: 960 + 410 - 34, y: FRAME.y + FRAME.h - 52 },
  gen: { x: 960, y: FRAME.y + FRAME.h - 330 },
  cta: { x: 1180, y: FRAME.y + FRAME.h - 150 },
};

// F · CAMERA CHE INSEGUE IL TESTO DIGITATO. Il campo del composer inizia a schermo-x=612
// (bordo device 260 + centratura barra 290 + padding 14 + icona 36 + gap 12) e ha il centro
// verticale in P.bar.y. La camera si tuffa CLOSE sul campo e pania seguendo il caret di
// scrittura da xStart (inizio testo) a xEnd (fine testo ≈ nChar × fontSize × 0.55).
const TYPE_X0 = 612; // schermo-x dove inizia il testo digitato nella barra
const TYPE_Y = P.bar.y; // centro verticale del campo
const ANS_XEND = TYPE_X0 + ANSWER.length * 16 * 0.55; // fine della risposta breve (font 16)

// D2.2: push-in con EASE_CAMERA_IN (attacco deciso + settle pesante), reset con
// EASE_CAMERA_OUT (rilascio deciso + decelerazione morbida).
const SHOTS = [
  {
    at: CAM_NAV.end,
    from: CAM_NAV.start,
    ...shotOn(960, FRAME.y + 34, 1.16),
    ease: EASE_CAMERA_IN,
  },
  { at: CAM_RESET1.end, from: CAM_RESET1.start, x: 0, y: 0, scale: 1, ease: EASE_CAMERA_OUT },
  // F · pre-inquadra l'inizio del campo, poi si assesta INQUADRANDO il composer intero.
  { at: CAM_BAR.end, from: CAM_BAR.start, ...shotOn(TYPE_X0, TYPE_Y, 1.3), ease: EASE_CAMERA_IN },
  // La richiesta è LUNGA e VA A CAPO (2 righe): niente pan orizzontale sul caret — si tiene
  // il composer inquadrato e fermo (zoom moderato) così entrambe le righe restano leggibili.
  {
    at: TYPE1.start + s2f(0.35),
    from: CAM_BAR.end,
    ...shotOn(920, TYPE_Y - 8, 1.34),
    ease: EASE_CAMERA,
  },
  {
    at: CAM_SEND.end,
    from: CAM_SEND.start,
    ...shotOn(P.send.x, P.send.y, 1.24),
    ease: EASE_CAMERA_IN,
  },
  { at: CAM_RESET2.end, from: CAM_RESET2.start, x: 0, y: 0, scale: 1, ease: EASE_CAMERA_OUT },
  // F · stesso close+pan per la risposta breve, poi PULL-BACK a pieno campo così le bolle
  // di risposta (MSG_A / MSG_REASON) si leggono larghe prima del dive sul pannello generato.
  ...typeTrackShots(TYPE2, TYPE_X0, TYPE_Y, ANS_XEND, 1.85),
  { at: CUR_SEND2.end, from: TYPE2.end, x: 0, y: 0, scale: 1, ease: EASE_CAMERA_OUT },
  { at: CAM_GEN.end, from: CAM_GEN.start, ...shotOn(P.gen.x, P.gen.y, 1.14), ease: EASE_CAMERA_IN },
  { at: CAM_RESET3.end, from: CAM_RESET3.start, x: 0, y: 0, scale: 1, ease: EASE_CAMERA_OUT },
  { at: CAM_CTA.end, from: CAM_CTA.start, ...shotOn(P.cta.x, P.cta.y, 1.24), ease: EASE_CAMERA_IN },
  { at: CAM_RESET4.end, from: CAM_RESET4.start, x: 0, y: 0, scale: 1, ease: EASE_CAMERA_OUT },
];

const label = (fs = 12): React.CSSProperties => ({
  fontSize: fs,
  textTransform: "uppercase",
  letterSpacing: "0.14em",
  color: C.muted,
  fontWeight: 600,
});

// ── Scena ────────────────────────────────────────────────────────────────────
export const Assistente: React.FC = () => {
  const frame = useCurrentFrame();

  const megaAlpha =
    prog(frame, MEGA_IN, EASE_IN_SCENE) * (1 - prog(frame, MEGA_OUT, EASE_OUT_SCENE));
  const hi0Alpha = prog(frame, HI0, EASE_IN_SCENE) * (1 - prog(frame, CUR_HI1, EASE_OUT_SCENE));
  const hi1Alpha = prog(frame, HI1, EASE_IN_SCENE) * (1 - prog(frame, MEGA_OUT, EASE_OUT_SCENE));
  const chatP = prog(frame, CHAT_IN, EASE_IN_SCENE);
  const homeDim = 1 - 0.45 * prog(frame, CHAT_IN, EASE_IN_SCENE); // rackFocus
  const ring1 = prog(frame, RING1, EASE_IN_SCENE) * (1 - prog(frame, PRESS1, EASE_OUT_SCENE));
  const ring2 = prog(frame, RING2, EASE_IN_SCENE) * (1 - prog(frame, PRESS2, EASE_OUT_SCENE));
  const typed1Active = frame >= TYPE1.start && frame < PRESS1.end;
  const typed2Active = frame >= TYPE2.start && frame < PRESS2.end;

  // D5.7 · progressioni del confirm flourish (battute sovrapposte, deterministiche).
  const ctaLabelOut = prog(frame, CTA_LABEL_OUT, EASE_OUT_SCENE); // l'etichetta si stacca
  const ctaCheck = drawPath(frame, CTA_CHECK); // la spunta si disegna
  const ctaFlash =
    frame >= CTA_FLASH.start && frame <= CTA_FLASH.end
      ? Math.sin(((frame - CTA_FLASH.start) / CTA_FLASH.dur) * Math.PI) * 0.5 // ≤4f, picco 0.5
      : 0;
  const ctaRing = prog(frame, CTA_RING, EASE_OUT_SCENE); // anello lime che blooma
  const ctaText = prog(frame, CTA_TEXT, EASE_IN_SCENE); // "Sopralluogo richiesto" si posa

  // D3.4 · La risposta AI COMPONE parola-per-parola: ogni parola su inline-block
  // (rise back(1.15) + blur ≤3px su track monotono), spazi come text-node espliciti,
  // niente caret (multi-riga). Come un modello linguistico che scrive.
  const composeWords = (text: string, beat: { start: number; dur: number; end: number }) => (
    <>
      {text.split(" ").map((w, i) => {
        const b = { start: beat.start + i * AI_WSTAG, dur: beat.dur, end: beat.end + i * AI_WSTAG };
        const a = prog(frame, b, EASE_IN_SCENE);
        const posP = prog(frame, b, EASE_CHAR);
        return (
          <React.Fragment key={i}>
            <span
              style={{
                display: "inline-block",
                opacity: a,
                transform: `translateY(${6 * (1 - posP)}px)`,
                filter: a < 0.999 ? `blur(${(3 * (1 - a)).toFixed(2)}px)` : undefined,
                willChange: "transform, filter, opacity",
              }}
            >
              {w}
            </span>
            {i < text.split(" ").length - 1 ? " " : null}
          </React.Fragment>
        );
      })}
    </>
  );

  const bubble = (
    align: "l" | "r",
    visible: React.CSSProperties,
    children: React.ReactNode,
    extra?: React.CSSProperties,
  ) => (
    <div
      style={{
        alignSelf: align === "r" ? "flex-end" : "flex-start",
        maxWidth: "78%",
        borderRadius: 18,
        padding: "10px 16px",
        fontSize: 16,
        lineHeight: 1.45,
        // G · testi display lunghi (REQUEST / CLARIFY / REASONING) devono andare a capo su
        // più righe: nessun nowrap, wrap naturale parola-per-parola dentro maxWidth.
        whiteSpace: "normal",
        overflowWrap: "break-word",
        ...(align === "r"
          ? { backgroundColor: C.accent, color: C.accentContrast, borderBottomRightRadius: 4 }
          : { backgroundColor: C.surface2, color: C.foreground, borderBottomLeftRadius: 4 }),
        ...visible,
        ...extra,
      }}
    >
      {children}
    </div>
  );

  return (
    <AbsoluteFill style={{ backgroundColor: C.background }}>
      {/* D1.1 · fondale del set illuminato: PRIMO figlio, FUORI dalla camera. */}
      <StageBackdrop />
      <AbsoluteFill style={cameraAt(frame, SHOTS, [PRESS1, PRESS2, PRESS3], CALMS)}>
        <DeviceFrame lift={0.5}>
          {/* HOME */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              opacity: homeDim,
              transform: `scale(${1 - 0.015 * chatP})`,
            }}
          >
            {/* nav */}
            <div
              style={{
                height: 68,
                display: "flex",
                alignItems: "center",
                gap: 24,
                padding: "0 28px",
                backgroundColor: "rgba(247,249,252,0.9)",
                borderBottom: `1px solid ${C.border}`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 7,
                    backgroundColor: C.accent,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: C.accentContrast,
                    fontSize: 14,
                  }}
                >
                  ☀
                </div>
                <span style={{ fontWeight: 700, fontSize: 18 }}>Sole &amp; Ricarica</span>
              </div>
              <div
                style={{ margin: "0 auto", display: "flex", gap: 30, fontSize: 16, color: C.muted }}
              >
                {NAV.map((v) => (
                  <span
                    key={v}
                    style={v === "Catalogo" ? { color: C.foreground, fontWeight: 600 } : undefined}
                  >
                    {v}
                    {v === "Catalogo" ? " ▾" : ""}
                  </span>
                ))}
              </div>
              <div
                style={{
                  backgroundColor: C.accentSoft,
                  color: C.accentInk,
                  borderRadius: 999,
                  padding: "7px 18px",
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                Preventivo
              </div>
            </div>
            {/* hero */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 48,
                padding: "72px 64px",
                alignItems: "center",
              }}
            >
              <div>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    backgroundColor: C.accentSoft,
                    color: C.accentInk,
                    borderRadius: 999,
                    padding: "6px 14px",
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  ⚡ Fotovoltaico + ricarica, chiavi in mano
                </div>
                <div
                  style={{
                    fontFamily,
                    fontWeight: 700,
                    fontSize: 46,
                    letterSpacing: "-0.02em",
                    marginTop: 18,
                    lineHeight: 1.1,
                  }}
                >
                  L'energia del sole, fino alla tua auto.
                </div>
                <div style={{ color: C.muted, fontSize: 18, marginTop: 16, maxWidth: 480 }}>
                  Progettiamo l'impianto, la wallbox e la gestione dei carichi come un sistema
                  unico. Su misura per casa tua.
                </div>
                <div style={{ display: "flex", gap: 20, marginTop: 24, alignItems: "center" }}>
                  <div
                    style={{
                      backgroundColor: C.accent,
                      color: C.accentContrast,
                      borderRadius: 999,
                      padding: "12px 26px",
                      fontSize: 16,
                      fontWeight: 600,
                    }}
                  >
                    Scopri le soluzioni
                  </div>
                  <span style={{ fontSize: 16, color: C.foreground }}>Come funziona →</span>
                </div>
              </div>
              <Img
                src={staticFile("assets/products/pannello-01.jpg")}
                style={{
                  width: "100%",
                  aspectRatio: "4 / 3",
                  objectFit: "cover",
                  borderRadius: 16,
                  border: `1px solid ${C.border}`,
                  translate: "-6px -7.6px",
                }}
              />
            </div>
            {/* SCRIM del megamenu: vela la pagina sotto il pannello (come nei megamenu
                reali) — senza, l'hero image resta visibile sotto il menu aperto. */}
            {megaAlpha > 0.01 ? (
              <div
                style={{
                  position: "absolute",
                  top: 68,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: "rgba(255,255,255,0.78)",
                  backdropFilter: "blur(4px)",
                  WebkitBackdropFilter: "blur(4px)",
                  opacity: megaAlpha,
                  zIndex: 15,
                }}
              />
            ) : null}
            {/* megamenu */}
            {megaAlpha > 0.01 ? (
              <div
                style={{
                  position: "absolute",
                  top: 68,
                  left: 0,
                  right: 0,
                  backgroundColor: C.background,
                  borderBottom: `1px solid ${C.border}`,
                  boxShadow: SHADOW.lift,
                  opacity: megaAlpha,
                  transform: `translateY(${-8 * (1 - megaAlpha)}px)`,
                  padding: "24px 0 28px",
                  zIndex: 20,
                }}
              >
                <div
                  style={{
                    width: 1000,
                    margin: "0 auto",
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: 24,
                  }}
                >
                  {MEGA.map(([title, items], col) => (
                    <div key={title}>
                      <div
                        style={{
                          color: C.accentInk,
                          fontWeight: 700,
                          fontSize: 13,
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                          height: MEGA_TITLE_H,
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        {title}
                      </div>
                      {items.map((it, row) => {
                        const hi =
                          (col === 1 && row === 1 && hi0Alpha > 0.01) ||
                          (col === 0 && row === 3 && hi1Alpha > 0.01);
                        const a = col === 1 && row === 1 ? hi0Alpha : hi1Alpha;
                        return (
                          <div
                            key={it}
                            style={{
                              position: "relative",
                              fontSize: 14,
                              color: C.muted,
                              height: MEGA_ROW_H,
                              display: "flex",
                              alignItems: "center",
                              padding: "0 10px",
                              borderRadius: 6,
                            }}
                          >
                            {hi ? (
                              <div
                                style={{
                                  position: "absolute",
                                  inset: 0,
                                  borderRadius: 6,
                                  backgroundColor: C.accentSoft,
                                  boxShadow: `inset 0 0 0 1px rgba(132,204,22,0.55)`,
                                  opacity: a,
                                }}
                              />
                            ) : null}
                            <span style={{ position: "relative" }}>{it}</span>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {/* CHAT */}
          {chatP > 0.01 ? (
            <div
              style={{
                position: "absolute",
                left: 40,
                right: 40,
                top: 80,
                bottom: 86,
                display: "flex",
                justifyContent: "center",
                opacity: chatP,
                transform: `translateY(${24 * (1 - chatP)}px)`,
                zIndex: 30,
              }}
            >
              <div
                style={{
                  width: 900,
                  borderRadius: 16,
                  border: `1px solid ${C.border}`,
                  backgroundColor: C.background,
                  boxShadow: SHADOW.lift,
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: 52,
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "0 20px",
                    backgroundColor: "rgba(247,249,252,0.8)",
                    borderBottom: `1px solid ${C.border}`,
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 999,
                      backgroundColor: C.accent,
                      color: C.accentContrast,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 14,
                    }}
                  >
                    ✦
                  </div>
                  <span style={{ fontSize: 15, fontWeight: 600 }}>
                    Assistente · Sole &amp; Ricarica
                  </span>
                  <span
                    style={{
                      marginLeft: "auto",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 13,
                      color: C.muted,
                    }}
                  >
                    <span
                      style={{ width: 8, height: 8, borderRadius: 999, backgroundColor: "#10b981" }}
                    />
                    online
                  </span>
                </div>
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-end",
                    gap: 12,
                    padding: "16px 22px",
                  }}
                >
                  {bubble("r", enter(frame, MSG_Q), REQUEST)}
                  {frame >= MSG_CLARIFY.start
                    ? bubble(
                        "l",
                        enter(frame, MSG_CLARIFY),
                        frame < CLARIFY_TEXT.start ? (
                          <TypingDots />
                        ) : (
                          composeWords(CLARIFY, CLARIFY_TEXT)
                        ),
                      )
                    : null}
                  {frame >= MSG_A.start ? bubble("r", enter(frame, MSG_A), ANSWER) : null}
                  {frame >= MSG_REASON.start
                    ? bubble(
                        "l",
                        enter(frame, MSG_REASON),
                        frame < REASON_TEXT.start ? (
                          <TypingDots />
                        ) : (
                          composeWords(REASONING, REASON_TEXT)
                        ),
                        { maxWidth: "86%" },
                      )
                    : null}
                  {/* Pannello GENERATO — D2.8 resolve-into-focus (blur+scale, anticipate). */}
                  {frame >= GEN_IN.start ? (
                    <div
                      style={{
                        ...enter(frame, GEN_IN, {
                          y: 16,
                          blur: 3,
                          scaleFrom: 0.97,
                          anticipate: true,
                        }),
                        borderRadius: 12,
                        border: `1px solid ${C.border}`,
                        backgroundColor: C.background,
                        boxShadow: SHADOW.card,
                        padding: 16,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          color: C.accentInk,
                          fontSize: 12,
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.12em",
                        }}
                      >
                        ✦ Costruito sulla tua richiesta
                      </div>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: 14,
                          marginTop: 12,
                        }}
                      >
                        {/* setup */}
                        <div style={maskReveal(frame, SETUP, { dir: "l" })}>
                          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 8 }}>
                            Il setup che ti propongo
                          </div>
                          {[
                            [
                              "Wallbox",
                              "Wallbox monofase 7,4 kW",
                              "790 €",
                              "assets/products/wallbox-detail.jpg",
                            ],
                            [
                              "Cavo di ricarica",
                              "Cavo Modo 3 · Tipo 2 · 5 m",
                              "189 €",
                              "assets/products/cavo-03.jpg",
                            ],
                          ].map(([kind, name, price, img]) => (
                            <div
                              key={name}
                              style={{
                                display: "flex",
                                gap: 10,
                                alignItems: "center",
                                border: `1px solid ${C.border}`,
                                backgroundColor: C.surface,
                                borderRadius: 10,
                                padding: 8,
                                marginBottom: 8,
                              }}
                            >
                              <Img
                                src={staticFile(img)}
                                style={{
                                  width: 56,
                                  height: 56,
                                  borderRadius: 8,
                                  objectFit: "cover",
                                  border: `1px solid ${C.border}`,
                                }}
                              />
                              <div style={{ flex: 1 }}>
                                <div
                                  style={{
                                    color: C.accentInk,
                                    fontSize: 10,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.1em",
                                  }}
                                >
                                  {kind}
                                </div>
                                <div style={{ fontSize: 14, fontWeight: 600 }}>{name}</div>
                              </div>
                              <div style={{ fontWeight: 700, fontSize: 15 }}>{price}</div>
                            </div>
                          ))}
                        </div>
                        {/* colonna destra: chart + costi */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          <div
                            style={{
                              ...enter(frame, CHART_IN, { y: 12 }),
                              border: `1px solid ${C.border}`,
                              backgroundColor: C.surface,
                              borderRadius: 10,
                              padding: 12,
                            }}
                          >
                            <div style={label(11)}>Finestra di ricarica notturna</div>
                            <div
                              style={{
                                position: "relative",
                                display: "flex",
                                alignItems: "flex-end",
                                gap: 4,
                                height: 56,
                                marginTop: 8,
                              }}
                            >
                              <div
                                style={{
                                  position: "absolute",
                                  top: 0,
                                  bottom: 0,
                                  left: "20%",
                                  width: "30%",
                                  backgroundColor: C.accentSoft,
                                  borderLeft: `1px solid ${C.accent}`,
                                  borderRight: `1px solid ${C.accent}`,
                                  opacity: prog(frame, BAND, EASE_IN_SCENE),
                                }}
                              />
                              {NIGHT.map((b, i) => {
                                const bb = {
                                  start: BARS.start + s2f(0.05) * i,
                                  dur: BARS.dur,
                                  end: BARS.end + s2f(0.05) * i,
                                };
                                return (
                                  <div
                                    key={b.h}
                                    style={{
                                      flex: 1,
                                      height: `${b.level}%`,
                                      borderRadius: "3px 3px 0 0",
                                      backgroundColor: b.active ? C.accent : "#d9f99d",
                                      transform: `scaleY(${prog(frame, bb, EASE_SNAP)})`,
                                      transformOrigin: "bottom",
                                    }}
                                  />
                                );
                              })}
                            </div>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                fontSize: 11,
                                color: C.muted,
                                marginTop: 4,
                              }}
                            >
                              <span>22</span>
                              <span style={{ color: C.accentInk, fontWeight: 600 }}>
                                00–03 · carica
                              </span>
                              <span>07</span>
                            </div>
                          </div>
                          <div
                            style={{
                              ...enter(frame, COST_IN, { y: 12 }),
                              border: `1px solid ${C.border}`,
                              backgroundColor: C.surface,
                              borderRadius: 10,
                              padding: "10px 12px",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <span style={label(11)}>Stima ricarica notturna</span>
                            <span style={{ fontSize: 15, fontVariantNumeric: "tabular-nums" }}>
                              ≈ {countUp(frame, COUNT, 3)} h · ≈{" "}
                              <span style={{ color: C.accentInk, fontWeight: 700 }}>
                                {countUp(frame, COUNT, 34)} €/mese
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>
                      {/* footer */}
                      <div
                        style={{
                          ...enter(frame, FOOT_IN, { y: 12 }),
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginTop: 12,
                        }}
                      >
                        <span style={{ color: C.muted, fontSize: 14 }}>
                          ☀ Di giorno il tuo fotovoltaico ricarica gratis
                        </span>
                        {/* Booking CTA — D5.7 confirm flourish. hoverBloom telegrafa il click
                            (solo boxShadow: il transform resta a pressButton). */}
                        <div style={{ position: "relative", ...pressButton(frame, PRESS3, 0.9) }}>
                          {/* Anello lime che BLOOMA: radiale morbido + anello netto, scale-expand. */}
                          {ctaRing > 0 && ctaRing < 1 ? (
                            <>
                              <div
                                aria-hidden
                                style={{
                                  position: "absolute",
                                  left: "50%",
                                  top: "50%",
                                  width: 240,
                                  height: 78,
                                  marginLeft: -120,
                                  marginTop: -39,
                                  borderRadius: 999,
                                  background:
                                    "radial-gradient(ellipse at center, rgba(132,204,22,0.5) 0%, rgba(132,204,22,0) 70%)",
                                  transform: `scale(${(0.85 + 1.25 * ctaRing).toFixed(3)})`,
                                  opacity: (1 - ctaRing) * 0.6,
                                  zIndex: 0,
                                  pointerEvents: "none",
                                }}
                              />
                              <div
                                aria-hidden
                                style={{
                                  position: "absolute",
                                  left: "50%",
                                  top: "50%",
                                  width: 190,
                                  height: 54,
                                  marginLeft: -95,
                                  marginTop: -27,
                                  borderRadius: 999,
                                  border: `2px solid ${C.accent}`,
                                  transform: `scale(${(0.92 + 0.9 * ctaRing).toFixed(3)})`,
                                  opacity: (1 - ctaRing) * 0.7,
                                  zIndex: 0,
                                  pointerEvents: "none",
                                }}
                              />
                            </>
                          ) : null}
                          {/* PILL (lime persistente). overflow:hidden → l'etichetta si stacca
                              MASCHERATA dal bordo; il flash resta dentro l'arrotondamento. */}
                          <div
                            style={{
                              position: "relative",
                              overflow: "hidden",
                              backgroundColor: C.accent,
                              color: C.accentContrast,
                              borderRadius: 999,
                              padding: "10px 20px",
                              fontSize: 15,
                              fontWeight: 600,
                              boxShadow: hoverBloom(frame, PRESS3).boxShadow,
                              zIndex: 1,
                            }}
                          >
                            {/* Flash accentStrong (≤4 frame) — la scintilla della conferma. */}
                            {ctaFlash > 0.001 ? (
                              <div
                                aria-hidden
                                style={{
                                  position: "absolute",
                                  inset: 0,
                                  borderRadius: 999,
                                  backgroundColor: C.accentStrong,
                                  opacity: ctaFlash,
                                  pointerEvents: "none",
                                }}
                              />
                            ) : null}
                            {/* Etichetta: in-flow (definisce la larghezza) → si stacca (rise + fade). */}
                            <span
                              style={{
                                display: "inline-block",
                                opacity: 1 - ctaLabelOut,
                                transform: `translateY(${-12 * ctaLabelOut}px)`,
                              }}
                            >
                              Prenota un sopralluogo →
                            </span>
                            {/* Conferma: la spunta si DISEGNA (drawPath), poi il testo si posa dietro. */}
                            {frame >= CTA_CHECK.start ? (
                              <div
                                style={{
                                  position: "absolute",
                                  inset: 0,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  gap: 8,
                                  pointerEvents: "none",
                                }}
                              >
                                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
                                  <path
                                    d="M5 13l4 5L19 7"
                                    fill="none"
                                    stroke={C.accentContrast}
                                    strokeWidth={3}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    pathLength={1}
                                    style={ctaCheck}
                                  />
                                </svg>
                                <span
                                  style={{
                                    opacity: ctaText,
                                    transform: `translateY(${8 * (1 - ctaText)}px)`,
                                  }}
                                >
                                  Sopralluogo richiesto
                                </span>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}

          {/* COMPOSER BAR — pillola che CRESCE: la richiesta lunga va a capo su più righe
              (niente più testo che sfora il campo e sparisce). minHeight anziché height. */}
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 22,
              display: "flex",
              justifyContent: "center",
              zIndex: 40,
            }}
          >
            <div
              style={{
                position: "relative",
                width: 820,
                minHeight: 60,
                borderRadius: 26,
                border: `1px solid ${C.border}`,
                backgroundColor: "rgba(255,255,255,0.95)",
                boxShadow: SHADOW.card,
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "8px 10px 8px 14px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 1,
                  borderRadius: 25,
                  border: `2px solid ${C.accent}`,
                  opacity: Math.max(ring1, ring2),
                }}
              />
              <div
                style={{
                  flexShrink: 0,
                  width: 36,
                  height: 36,
                  borderRadius: 999,
                  backgroundColor: C.accent,
                  color: C.accentContrast,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 17,
                }}
              >
                ✦
              </div>
              {/* Campo IN-FLOW (non più absolute): il testo che va a capo dà altezza al campo,
                  la pillola cresce di conseguenza. La richiesta lunga usa TypeOn multiline. */}
              <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
                {!typed1Active && !typed2Active ? (
                  <div style={{ color: C.muted, fontSize: 16, whiteSpace: "nowrap" }}>
                    Chiedi all'assistente, in parole tue…
                  </div>
                ) : null}
                {/* D3.3 · type-on con caret lime (input UTENTE). Richiesta lunga → multiline (va a capo). */}
                {typed1Active ? (
                  <div style={{ whiteSpace: "pre-wrap" }}>
                    <TypeOn
                      text={REQUEST}
                      beat={TYPE1}
                      size={15}
                      color={C.foreground}
                      idle={1.4}
                      multiline
                      lineHeight={1.35}
                    />
                  </div>
                ) : null}
                {typed2Active ? (
                  <div style={{ whiteSpace: "nowrap" }}>
                    <TypeOn text={ANSWER} beat={TYPE2} size={16} color={C.foreground} idle={1.4} />
                  </div>
                ) : null}
              </div>
              {/* Send — hoverBloom telegrafa il click (solo boxShadow: transform a pressButton). */}
              <div
                style={{
                  flexShrink: 0,
                  width: 44,
                  height: 44,
                  borderRadius: 999,
                  backgroundColor: C.accent,
                  color: C.accentContrast,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: hoverBloom(frame, frame < CAM_RESET2.start ? PRESS1 : PRESS2)
                    .boxShadow,
                  ...pressButton(frame, frame < CAM_RESET2.start ? PRESS1 : PRESS2, 0.88),
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 11l18-8-8 18-2.5-7.5L3 11z" />
                </svg>
              </div>
            </div>
          </div>
        </DeviceFrame>
      </AbsoluteFill>
      {/* Cursore finto: proiettato con la camera (esatto sui bottoni) + click FX */}
      <Cursor
        shots={SHOTS}
        clicks={[PRESS1, PRESS2, PRESS3]}
        calms={CALMS}
        moves={[
          { beat: CUR_CAT, ...P.catalogo, mode: "hand" },
          { beat: CUR_HI0, ...P.hi0, mode: "hand" },
          { beat: CUR_HI1, ...P.hi1, mode: "hand" },
          { beat: CUR_BAR, ...P.bar, mode: "text" },
          { beat: CUR_SEND1, ...P.send, mode: "hand" },
          { beat: CUR_BAR2, ...P.bar, mode: "text" },
          { beat: CUR_SEND2, ...P.send, mode: "hand" },
          { beat: CUR_CTA, ...P.cta, mode: "hand" },
        ]}
        hideAfter={PRESS3}
      />
      {/* Caption + title card */}
      <Caption beats={SAY1}>Una richiesta con tre sfumature: nessun filtro le coglie.</Caption>
      <Caption beats={SAY2}>L'assistente chiede solo quello che serve…</Caption>
      <Caption beats={SAY3}>…e costruisce l'interfaccia della risposta, su misura.</Caption>
      <ChapterCard
        title="Assistente AI"
        subtitle="Un assistente AI dentro il sito vetrina."
        beats={CARD}
        index={2}
      />
    </AbsoluteFill>
  );
};
