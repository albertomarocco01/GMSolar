/**
 * SCENA 03 · Dashboard (porting di ImmersiveDashboard.tsx).
 * Admin panel multi-sito: sidebar + binario orizzontale di 4 pannelli
 * (Contenuti → Prodotti → Visite → Ordini) con whip-pan sui cambi.
 * Interazioni: sostituzione foto hero + titolo digitato + publish toast;
 * nuovo prodotto via modale; KPI countup + grafici; tabella ordini + dettaglio.
 */
import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { C, SHADOW } from "../kit/tokens";
import {
  Beat,
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
  hoverBloom,
  maskReveal,
  pressButton,
  prog,
  s2f,
  seq,
  shotOn,
  typeInset,
  typeTrackShots,
  whip,
} from "../kit/motion";
import { Caption, captionBeats, ChapterCard, chapterIntroBeats, Cursor, DeviceFrame, FRAME, Odometer, StageBackdrop } from "../kit/ui";
import { fontFamily } from "../kit/fonts";

const fmtInt = new Intl.NumberFormat("it-IT", { maximumFractionDigits: 0 });
const fmtTempo = (n: number) => `${Math.floor(n / 60)}:${String(Math.round(n) % 60).padStart(2, "0")}`;

// ── Timeline ─────────────────────────────────────────────────────────────────
const t = seq();
const CARD = chapterIntroBeats(t);
// ① Contenuti
const CUR_HERO = t.add(1.0);
const PRESS_HERO = t.add(0.34, 0.3);
const CAM_EDIT = t.add(1.0);
const CUR_REPL = t.add(1.0);
const PRESS_REPL = t.add(0.28, 0.15);
const UPLOAD_IN = t.add(DUR.micro);
const UPLOAD_BAR = t.add(1.0);
const UPLOAD_DONE = t.add(DUR.micro);
t.hold(0.3);
const IMG_NEW = t.add(1.0);
const UPLOAD_OUT = t.add(DUR.micro, "<");
const TITLE_SWAP = t.add(0.15, 0.15);
const TYPE_TITLE = t.add(1.5);
t.hold(0.4);
const CAM_PUB = t.add(DUR.beat);
const CUR_PUB = t.add(DUR.beat);
const PRESS_PUB = t.add(0.3, 0.15);
const TOAST = t.add(DUR.beat, -0.1);
t.hold(0.5);
const CAM_RESET1 = t.add(1.0);
const SAY1 = captionBeats(t);
// ② Prodotti
// E — causa→effetto: il cursore VIAGGIA alla voce nav (CUR_NAV1), ATTERRA a
// CUR_NAV1.end, poi la PREME (PRESS_NAV1, ~4f dopo l'atterraggio) e SOLO ALLORA
// (≈3f dopo l'inizio del press) il TRACK scorre. Prima TRACK partiva 18f PRIMA
// dell'atterraggio del cursore (gap -0.6 su add) → "la UI si muove e poi il mouse
// clicca". Ora press → track (indicatore + slide seguono TRACK).
const CUR_NAV1 = t.add(1.0);
const PRESS_NAV1 = t.add(0.28, 0.13);
const TRACK1 = t.add(1.0, -0.17);
const SAY2 = captionBeats(t);
t.hold(0.4);
const CUR_ADD = t.add(1.0);
const PRESS_ADD = t.add(0.28, 0.2); // gap ~6f: telegrafo hoverBloom pulito (cursore già sul bottone)
const MODAL_IN = t.add(DUR.beat, -0.05);
const CAM_MODAL = t.add(DUR.beat);
t.hold(0.7);
const TYPE_NOME = t.add(2.0);
const TYPE_PREZZO = t.add(1.0, 0.3);
const FOTO_IN = t.add(DUR.beat, 0.2);
t.hold(0.7);
const CUR_SAVE = t.add(DUR.beat);
const PRESS_SAVE = t.add(0.28, 0.2); // gap ~6f: telegrafo hoverBloom pulito (cursore già sul bottone)
const MODAL_OUT = t.add(DUR.micro);
const CAM_RESET2 = t.add(DUR.beat, "<");
const NEWCARD = t.add(DUR.beat, -0.1);
t.hold(1.2);
// ③ Visite
const CUR_NAV2 = t.add(1.0);
const PRESS_NAV2 = t.add(0.28, 0.13); // E — press dopo l'atterraggio, prima dello slide
const TRACK2 = t.add(1.0, -0.17);
const SAY3 = captionBeats(t);
const KPI_IN = t.add(DUR.beat, -0.8);
const COUNT_KPI = t.add(2.0, -0.3);
const CAM_KPI = t.add(2.0, "<");
const SPARK = t.add(1.0, -1.6);
const BARS = t.add(DUR.beat, -0.9);
t.hold(0.7);
const CAM_RESET3 = t.add(DUR.beat);
const DETAIL_IN = t.add(DUR.beat, 0.3);
const DETAIL_PATH = t.add(1.0, -0.2);
const DETAIL_AREA = t.add(DUR.beat, -0.3);
t.hold(1.2);
// ④ Ordini
const CUR_NAV3 = t.add(1.0);
const PRESS_NAV3 = t.add(0.28, 0.13); // E — press dopo l'atterraggio, prima dello slide
const TRACK3 = t.add(1.0, -0.17);
const SAY4 = captionBeats(t);
const ORD_STATS = t.add(DUR.beat, -0.8);
const ORD_COUNT = t.add(1.5, -0.4);
const ORD_ROWS = t.add(DUR.beat, -1.2); // + stagger 0.14
t.hold(0.7);
const CUR_ORD = t.add(DUR.beat);
const PRESS_ORD = t.add(0.3, 0.1);
// E — la riga #1042 si accende ~4f DOPO l'inizio del press (era "<" = insieme al
// press): causa (click sulla riga) prima dell'effetto (riga attiva). Lo stato-fine
// (riga accesa) resta identico → match-cut intatto.
const ORD_ACTIVE = t.add(DUR.micro, -0.17);
t.hold(0.5);
const ORD_DETAIL = t.add(DUR.beat);
t.hold(1.6);
export const DASHBOARD_DURATION = t.total;

// ── Coordinate e camera ──────────────────────────────────────────────────────
const SIDE_W = 250;
const NAV_H = 44; // altezza esplicita di ogni voce nav (layout deterministico)
const NAV_TOP = 78; // 22 padding-top + 32 logo row + 24 margine sotto logo
const NAV_ITEMS = ["Contenuti", "Prodotti", "Visite", "Ordini"];
const navY = (i: number) => FRAME.y + NAV_TOP + i * NAV_H;
// E — press-dip sulla voce nav cliccata (idx 0 = Contenuti, mai cliccata → null).
const NAV_PRESS: (Beat | null)[] = [null, PRESS_NAV1, PRESS_NAV2, PRESS_NAV3];
const P = {
  heroRow: { x: FRAME.x + SIDE_W + 190, y: FRAME.y + 220 },
  replace: { x: FRAME.x + SIDE_W + 424, y: FRAME.y + 543 },
  publish: { x: FRAME.x + SIDE_W + 1056, y: FRAME.y + 820 },
  nav: (i: number) => ({ x: FRAME.x + 125, y: navY(i) + NAV_H / 2 }),
  add: { x: FRAME.x + SIDE_W + 1000, y: FRAME.y + 120 },
  formNome: { x: 960, y: 440 },
  formPrezzo: { x: 960, y: 530 },
  formSave: { x: 960, y: 700 },
  kpi0: { x: FRAME.x + SIDE_W + 190, y: FRAME.y + 200 },
  ord0: { x: FRAME.x + SIDE_W + 560, y: FRAME.y + 288 },
};
// F — la camera SEGUE il caret mentre il titolo "Energia solare per la tua azienda"
// viene digitato: push-in vicino sull'inizio del testo (x≈882, y≈704 in coord layout)
// e pan fino alla fine (x≈1110), così la lettera in scrittura resta ~al centro.
// Sostituisce il vecchio shot STATICO sul campo. (shotOn cappa la scala a 1.7.)
const TITLE_X0 = 882; // X schermo (camera neutra) dove inizia il testo del Titolo
const TITLE_Y = 704; // centro verticale del campo Titolo
const TITLE_X1 = 1110; // fine del testo digitato (~33 caratteri a 15px)
const SHOTS = [
  { at: CAM_EDIT.end, from: CAM_EDIT.start, ...shotOn(FRAME.x + SIDE_W + 800, FRAME.y + 480, 1.15) },
  ...typeTrackShots(TYPE_TITLE, TITLE_X0, TITLE_Y, TITLE_X1, 1.9),
  { at: CAM_PUB.end, from: CAM_PUB.start, ...shotOn(P.publish.x, P.publish.y, 1.4) },
  { at: CAM_RESET1.end, from: CAM_RESET1.start, x: 0, y: 0, scale: 1 },
  { at: CAM_MODAL.end, from: CAM_MODAL.start, ...shotOn(960, 540, 1.18) },
  // D2.6 — CAM_RESET2 ritargettato: inquadra brevemente la griglia catalogo Prodotti,
  // poi un micro-push (attacco EASE_CAMERA_IN) sulla NEWCARD che spunta, infine rilascio a
  // neutro (EASE_CAMERA_OUT) prima che il track scorra verso Visite.
  { at: NEWCARD.start - s2f(0.1), from: CAM_RESET2.start, ...shotOn(FRAME.x + SIDE_W + 520, FRAME.y + 300, 1.14) },
  { at: NEWCARD.end + s2f(0.1), from: NEWCARD.start, ease: EASE_CAMERA_IN, ...shotOn(FRAME.x + SIDE_W + 400, FRAME.y + 380, 1.22) },
  { at: NEWCARD.end + s2f(1.0), from: NEWCARD.end + s2f(0.3), ease: EASE_CAMERA_OUT, x: 0, y: 0, scale: 1 },
  // D2.6 — CAM_KPI: push ANTICIPATO (arriva a ~0.8s) e HOLD fermo a 1.4 mentre gli odometri
  // rotolano — è il payoff, il frame deve sentirsi bloccato. Attacco EASE_CAMERA_IN.
  { at: CAM_KPI.start + s2f(0.8), from: CAM_KPI.start, ease: EASE_CAMERA_IN, ...shotOn(FRAME.x + SIDE_W + 560, FRAME.y + 220, 1.4) },
  { at: CAM_RESET3.end, from: CAM_RESET3.start, x: 0, y: 0, scale: 1 },
];

// ── Dati ─────────────────────────────────────────────────────────────────────
const PRODOTTI = [
  ["Cavo Modo 3 · Tipo 2 · 5 m", "189 €", "assets/products/cavo-03.jpg"],
  ["Wallbox 22 kW", "899 €", "assets/products/wallbox-detail.jpg"],
  ["Pannello 400 W", "210 €", "assets/products/pannello-01.jpg"],
  ["Cavo Modo 2 · Schuko", "389 €", "assets/products/cavo-schuko.png"],
] as const;
const ORDINI = [
  ["#1042", "Rossi S.r.l.", "28/06", "Online", "2.340 €", "Completato"],
  ["#1041", "Bianchi S.p.A.", "27/06", "Preventivo", "899 €", "Spedito"],
  ["#1040", "Ferrari Group", "26/06", "Preventivo", "12.600 €", "In attesa"],
  ["#1039", "Conti S.r.l.", "24/06", "Online", "630 €", "Completato"],
  ["#1038", "Masi & Figli", "23/06", "Telefono", "420 €", "Spedito"],
] as const;
const CHIP: Record<string, { bg: string; fg: string }> = {
  Completato: { bg: "#d1fae5", fg: "#047857" },
  Spedito: { bg: "#e0f2fe", fg: "#0369a1" },
  "In attesa": { bg: "#fef3c7", fg: "#b45309" },
  Pubblicata: { bg: "#d1fae5", fg: "#047857" },
};
const BAR_H = [32, 48, 41, 67, 58, 80, 72];
const KPI = [
  ["Visite", 18340, "▲ 12%"],
  ["Utenti unici", 11290, "▲ 8%"],
  ["Conversioni", 342, "▼ 3%"],
  ["Tempo medio", 161, "▲ 5%"],
] as const;

const label = (fs = 12): React.CSSProperties => ({
  fontSize: fs,
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  color: C.muted,
  fontWeight: 600,
});
const cardBox: React.CSSProperties = {
  border: `1px solid ${C.border}`,
  backgroundColor: C.surface,
  borderRadius: 12,
  boxShadow: "0 1px 2px rgba(2,6,23,0.05)",
};
const chip = (s: string): React.CSSProperties => ({
  backgroundColor: CHIP[s]?.bg ?? C.surface2,
  color: CHIP[s]?.fg ?? C.muted,
  borderRadius: 999,
  padding: "3px 10px",
  fontSize: 12,
  fontWeight: 600,
});

/**
 * D1.3 — underglow ONE-SHOT: la card BIANCA "si accende" mentre il numero rotola e
 * raggiunge il picco quando atterra, poi si spegne. glow = rise*(1-fall) keyato al beat
 * di conteggio (COUNT_KPI / ORD_COUNT); picco alpha ≤0.30; luce lime SOLO via boxShadow
 * (SHADOW.glow-style su accentStrong) → NON tocca il backgroundColor (nessun override del bg).
 */
const cardGlow = (frame: number, countBeat: Beat): React.CSSProperties => {
  const rise = prog(frame, countBeat, EASE_IN_SCENE);
  const fall = prog(frame, { start: countBeat.end, dur: s2f(0.8), end: countBeat.end + s2f(0.8) }, EASE_OUT_SCENE);
  const glow = rise * (1 - fall);
  if (glow <= 0.01) return {};
  const a = (0.3 * glow).toFixed(3);
  // base card-shadow + glow lime sotto (accentStrong #65a30d, come SHADOW.glow)
  return { boxShadow: `0 1px 2px rgba(2,6,23,0.05), 0 10px 24px -6px rgba(101,163,13,${a})` };
};

export const Dashboard: React.FC = () => {
  const frame = useCurrentFrame();

  const trackX =
    -25 * prog(frame, TRACK1, EASE_CAMERA) - 25 * prog(frame, TRACK2, EASE_CAMERA) - 25 * prog(frame, TRACK3, EASE_CAMERA);
  const whipBeat = frame < TRACK2.start ? TRACK1 : frame < TRACK3.start ? TRACK2 : TRACK3;
  const whipStyle = whip(frame, { start: whipBeat.start + s2f(0.35), dur: s2f(0.35), end: whipBeat.start + s2f(0.7) }, "r");
  const navIndex = frame >= TRACK3.start ? 3 : frame >= TRACK2.start ? 2 : frame >= TRACK1.start ? 1 : 0;
  const navFrom = Math.max(0, navIndex - 1);
  const navBeat = [TRACK1, TRACK2, TRACK3][navIndex - 1];
  const indY = navIndex === 0 ? navY(0) : navY(navFrom) + (navY(navIndex) - navY(navFrom)) * (navBeat ? prog(frame, navBeat, EASE_CAMERA) : 1);

  const uploadAlpha = prog(frame, UPLOAD_IN, EASE_IN_SCENE) * (1 - prog(frame, UPLOAD_OUT, EASE_OUT_SCENE));
  const modalAlpha = prog(frame, MODAL_IN, EASE_SNAP) * (1 - prog(frame, MODAL_OUT, EASE_OUT_SCENE));
  const toastP = prog(frame, TOAST, EASE_SNAP);

  return (
    <AbsoluteFill style={{ backgroundColor: C.surface }}>
      {/* D1.1 — fondale del set illuminato: PRIMO figlio, FUORI dal layer camera (match-cut standard). */}
      <StageBackdrop />
      <AbsoluteFill style={cameraAt(frame, SHOTS, [PRESS_HERO, PRESS_REPL, PRESS_PUB, PRESS_NAV1, PRESS_ADD, PRESS_SAVE, PRESS_NAV2, PRESS_NAV3, PRESS_ORD], [COUNT_KPI])}>
        <AbsoluteFill style={whipStyle}>
          <DeviceFrame>
            {/* SIDEBAR */}
            <div style={{ width: SIDE_W, flexShrink: 0, borderRight: `1px solid ${C.border}`, backgroundColor: C.surface, padding: "22px 16px", position: "relative" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, height: 32, marginBottom: 24, paddingLeft: 8 }}>
                <div style={{ width: 18, height: 18, borderRadius: 5, backgroundColor: C.accent }} />
                <span style={{ fontWeight: 600, fontSize: 17 }}>Dashboard</span>
              </div>
              <div style={{ position: "absolute", left: 16, right: 16, top: indY - FRAME.y, height: NAV_H, borderRadius: 10, backgroundColor: C.accentSoft, transition: "none" }} />
              {NAV_ITEMS.map((v, i) => (
                <div key={v} style={{ position: "relative", height: NAV_H, display: "flex", alignItems: "center", padding: "0 14px", fontSize: 16, color: i === navIndex ? C.foreground : C.muted, fontWeight: i === navIndex ? 600 : 400, ...(NAV_PRESS[i] ? pressButton(frame, NAV_PRESS[i]!, 0.96) : {}) }}>
                  {v}
                </div>
              ))}
              <div style={{ ...label(11), marginTop: 28, paddingLeft: 8 }}>Siti</div>
              {["Solar", "Mobility", "Shop"].map((s) => (
                <div key={s} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", fontSize: 15, color: C.muted }}>
                  <span style={{ width: 8, height: 8, borderRadius: 999, backgroundColor: "rgba(132,204,22,0.6)" }} />
                  {s}
                </div>
              ))}
            </div>
            {/* MAIN */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
              <div style={{ height: 56, display: "flex", alignItems: "center", gap: 10, padding: "0 24px", borderBottom: `1px solid ${C.border}`, backgroundColor: "rgba(255,255,255,0.8)" }}>
                <span style={{ width: 9, height: 9, borderRadius: 999, backgroundColor: "#34d399" }} />
                <span style={{ fontSize: 14, fontWeight: 600, color: C.muted }}>3 siti connessi</span>
                <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                  {["Solar", "Mobility"].map((s) => (
                    <span key={s} style={{ backgroundColor: C.surface2, color: C.muted, borderRadius: 999, padding: "4px 14px", fontSize: 13 }}>{s}</span>
                  ))}
                  <span style={{ backgroundColor: C.accent, color: C.accentContrast, borderRadius: 999, padding: "4px 14px", fontSize: 13, fontWeight: 600 }}>Shop ✓</span>
                </div>
              </div>
              {/* TRACK 400% */}
              <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
                <div style={{ display: "flex", width: "400%", height: "100%", transform: `translateX(${trackX}%)` }}>
                  {/* ① CONTENUTI */}
                  <div style={{ width: "25%", padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 18 }}>Contenuti del sito</div>
                      <div style={{ color: C.muted, fontSize: 13 }}>gmsolar.it · 3 pagine pubblicate</div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 16, flex: 1, minHeight: 0 }}>
                      <div style={{ ...cardBox, padding: 14 }}>
                        <div style={label(11)}>Pagine del sito</div>
                        {[["Hero homepage", "assets/products/wallbox-detail.jpg", true], ["Chi siamo", "assets/products/pannello-01.jpg", false], ["Impianti realizzati", "assets/products/pannello-01.jpg", false]].map(([name, img, hero]) => (
                          <div key={name as string} style={{ position: "relative", display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 8, marginTop: 8, backgroundColor: hero && frame >= PRESS_HERO.start ? C.accentSoft : undefined, ...(hero ? pressButton(frame, PRESS_HERO, 0.96) : {}) }}>
                            <Img src={staticFile(img as string)} style={{ width: 52, height: 32, objectFit: "cover", borderRadius: 6, border: `1px solid ${C.border}` }} />
                            <span style={{ fontSize: 13, fontWeight: 600, flex: 1 }}>{name}</span>
                            <span style={chip("Pubblicata")}>Pubblicata</span>
                          </div>
                        ))}
                      </div>
                      {/* editor */}
                      <div style={{ ...cardBox, backgroundColor: C.background, padding: 18, position: "relative", display: "flex", flexDirection: "column", gap: 12 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                          <span style={{ fontWeight: 600, fontSize: 16 }}>Hero homepage</span>
                          <span style={{ color: C.muted, fontSize: 12 }}>Ultima modifica: 12/06/2026</span>
                        </div>
                        <div style={{ position: "relative", aspectRatio: "16 / 7", borderRadius: 10, overflow: "hidden", border: `1px solid ${C.border}` }}>
                          <Img src={staticFile("assets/products/wallbox-detail.jpg")} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <span style={{ backgroundColor: "rgba(255,255,255,0.85)", borderRadius: 8, padding: "4px 12px", fontSize: 12, fontWeight: 600, opacity: 1 - prog(frame, IMG_NEW, EASE_IN_SCENE) }}>foto-attuale.jpg</span>
                          </div>
                          <div style={{ position: "absolute", inset: 0, ...maskReveal(frame, IMG_NEW, { dir: "l" }) }}>
                            <Img src={staticFile("assets/products/pannello-01.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <span style={{ backgroundColor: "rgba(255,255,255,0.85)", borderRadius: 8, padding: "4px 12px", fontSize: 12, fontWeight: 600 }}>impianto-2026.jpg</span>
                            </div>
                          </div>
                          {uploadAlpha > 0.01 ? (
                            <div style={{ position: "absolute", left: 12, right: 12, bottom: 10, backgroundColor: "rgba(255,255,255,0.94)", borderRadius: 8, padding: "8px 12px", opacity: uploadAlpha, fontSize: 12 }}>
                              <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <span>impianto-2026.jpg · 1,8 MB</span>
                                <span style={{ color: C.accentInk, fontWeight: 600, opacity: prog(frame, UPLOAD_DONE, EASE_IN_SCENE) }}>✓ Caricata</span>
                              </div>
                              <div style={{ height: 5, borderRadius: 999, backgroundColor: C.surface2, marginTop: 6, overflow: "hidden" }}>
                                <div style={{ height: "100%", backgroundColor: C.accent, transformOrigin: "left", transform: `scaleX(${prog(frame, UPLOAD_BAR, EASE_IN_SCENE)})` }} />
                              </div>
                            </div>
                          ) : null}
                        </div>
                        <div style={{ alignSelf: "flex-start", ...pressButton(frame, PRESS_REPL, 0.93) }}>
                          <span style={{ border: `1px solid ${C.border}`, backgroundColor: C.surface2, borderRadius: 8, padding: "7px 14px", fontSize: 13, fontWeight: 600 }}>Carica immagine</span>
                        </div>
                        <div>
                          <div style={label(11)}>Titolo</div>
                          <div style={{ position: "relative", border: `1px solid ${C.border}`, backgroundColor: C.surface2, borderRadius: 8, padding: "9px 12px", fontSize: 15, marginTop: 4, overflow: "hidden", height: 40 }}>
                            <span style={{ position: "absolute", opacity: 1 - prog(frame, TITLE_SWAP, EASE_OUT_SCENE), whiteSpace: "nowrap" }}>Energia solare per la tua casa</span>
                            {frame >= TYPE_TITLE.start - 2 ? (
                              <span style={{ position: "absolute", whiteSpace: "nowrap", ...typeInset(frame, TYPE_TITLE, 32) }}>Energia solare per la tua azienda</span>
                            ) : null}
                          </div>
                        </div>
                        <div>
                          <div style={label(11)}>Descrizione</div>
                          <div style={{ border: `1px solid ${C.border}`, backgroundColor: C.surface2, borderRadius: 8, padding: "9px 12px", fontSize: 13, color: C.muted, marginTop: 4 }}>
                            Impianti fotovoltaici e ricarica EV chiavi in mano, dal sopralluogo all'allaccio.
                          </div>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
                          <span style={{ fontSize: 12, color: C.muted }}>Stato: <b>Pubblicata</b></span>
                          {/* D5.6 — hoverBloom (anello+lift) sul WRAPPER, pressButton (scale) sull'INTERNO. */}
                          <div style={{ borderRadius: 8, ...hoverBloom(frame, PRESS_PUB) }}>
                            <div style={pressButton(frame, PRESS_PUB, 0.93)}>
                              <span style={{ backgroundColor: C.accent, color: C.accentContrast, borderRadius: 8, padding: "8px 18px", fontSize: 14, fontWeight: 600 }}>Pubblica</span>
                            </div>
                          </div>
                        </div>
                        {toastP > 0.01 && frame < TRACK1.start ? (
                          <div style={{ position: "absolute", top: 14, right: 14, backgroundColor: C.foreground, color: C.background, borderRadius: 10, padding: "8px 16px", fontSize: 13, fontWeight: 600, opacity: Math.min(1, toastP), transform: `translateY(${8 * (1 - toastP)}px)` }}>
                            Modifiche pubblicate ✓
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  {/* ② PRODOTTI */}
                  <div style={{ width: "25%", padding: 24, display: "flex", flexDirection: "column", gap: 18 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontWeight: 600, fontSize: 18 }}>Catalogo prodotti</span>
                      {/* D5.6 — hoverBloom sul wrapper, pressButton sull'interno. */}
                      <div style={{ borderRadius: 8, ...hoverBloom(frame, PRESS_ADD) }}>
                        <div style={pressButton(frame, PRESS_ADD, 0.93)}>
                          <span style={{ backgroundColor: C.accent, color: C.accentContrast, borderRadius: 8, padding: "8px 16px", fontSize: 14, fontWeight: 600 }}>+ Aggiungi prodotto</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14 }}>
                      {PRODOTTI.map(([name, price, img]) => (
                        <div key={name} style={{ ...cardBox, backgroundColor: C.background, overflow: "hidden" }}>
                          <Img src={staticFile(img)} style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover" }} />
                          <div style={{ padding: 10 }}>
                            <div style={{ fontSize: 12.5, fontWeight: 600, minHeight: 34 }}>{name}</div>
                            <div style={{ color: C.accentInk, fontWeight: 700, fontSize: 14, marginTop: 4 }}>{price}</div>
                          </div>
                        </div>
                      ))}
                      <div style={{ ...cardBox, backgroundColor: "rgba(132,204,22,0.05)", border: "2px solid rgba(132,204,22,0.4)", overflow: "hidden", opacity: prog(frame, NEWCARD, EASE_SNAP), transform: `scale(${0.85 + 0.15 * prog(frame, NEWCARD, EASE_SNAP)})` }}>
                        <Img src={staticFile("assets/products/cavo-spiralato.jpg")} style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover" }} />
                        <div style={{ padding: 10 }}>
                          <div style={{ fontSize: 12.5, fontWeight: 600, minHeight: 34 }}>Cavo Modo 3 · spiralato</div>
                          <div style={{ color: C.accentInk, fontWeight: 700, fontSize: 14, marginTop: 4 }}>219 €</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* ③ VISITE */}
                  <div style={{ width: "25%", padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
                    <span style={{ fontWeight: 600, fontSize: 18 }}>Visite · ultimi 30 giorni</span>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
                      {KPI.map(([lab, target, trend], i) => {
                        const b = { start: KPI_IN.start + s2f(0.1) * i, dur: KPI_IN.dur, end: KPI_IN.end + s2f(0.1) * i };
                        return (
                          <div key={lab} style={{ ...cardBox, backgroundColor: C.background, padding: 14, ...enter(frame, b, { y: 20, blur: 4, scaleFrom: 0.965, anticipate: true }), ...cardGlow(frame, COUNT_KPI) }}>
                            <div style={label(11)}>{lab}</div>
                            <div style={{ marginTop: 4 }}>
                              <Odometer
                                text={i === 3 ? fmtTempo(target as number) : fmtInt.format(target as number)}
                                p={prog(frame, COUNT_KPI, EASE_IN_SCENE)}
                                size={26}
                                color={C.accentInk}
                              />
                            </div>
                            <div style={{ fontSize: 12, color: String(trend).startsWith("▲") ? C.accentInk : C.muted, marginTop: 2 }}>{trend}</div>
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div style={{ ...cardBox, backgroundColor: C.background, padding: 14 }}>
                        <div style={label(11)}>Trend visite</div>
                        {/* preserveAspectRatio="none": stesso motivo del grafico dettaglio
                            — senza, la sparkline veniva compressa al centro della card. */}
                        <svg viewBox="0 0 200 60" preserveAspectRatio="none" style={{ width: "100%", height: 64, marginTop: 8 }}>
                          <defs>
                            <linearGradient id="sparkg" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0" stopColor={C.accent} stopOpacity={0.15} />
                              <stop offset="1" stopColor={C.accent} stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <path d="M0,54 L28,42 L56,46 L84,28 L112,32 L140,15 L168,19 L200,8 L200,60 L0,60 Z" fill="url(#sparkg)" opacity={prog(frame, SPARK, EASE_IN_SCENE)} />
                          <path d="M0,54 L28,42 L56,46 L84,28 L112,32 L140,15 L168,19 L200,8" fill="none" stroke={C.accent} strokeWidth={2} pathLength={1} style={drawPath(frame, SPARK)} />
                        </svg>
                      </div>
                      <div style={{ ...cardBox, backgroundColor: C.background, padding: 14 }}>
                        <div style={label(11)}>Visite per giorno</div>
                        <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 64, marginTop: 8 }}>
                          {BAR_H.map((h, i) => {
                            const b = { start: BARS.start + s2f(0.07) * i, dur: BARS.dur, end: BARS.end + s2f(0.07) * i };
                            return <div key={i} style={{ flex: 1, height: `${h}%`, borderRadius: "3px 3px 0 0", backgroundColor: i === 6 ? C.accent : "rgba(132,204,22,0.25)", transform: `scaleY(${prog(frame, b, EASE_SNAP)})`, transformOrigin: "bottom" }} />;
                          })}
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.muted, marginTop: 4 }}>
                          {["L", "M", "M", "G", "V", "S", "D"].map((d, i) => <span key={i}>{d}</span>)}
                        </div>
                      </div>
                    </div>
                    <div style={{ ...cardBox, backgroundColor: C.background, padding: 14, ...enter(frame, DETAIL_IN, { y: 16 }) }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={label(11)}>Dettaglio visite · per settimana</span>
                        <span style={{ fontSize: 12, color: C.accentInk, fontWeight: 600 }}>▲ 12% vs periodo precedente</span>
                      </div>
                      {/* preserveAspectRatio="none": la viewBox 400×80 è molto più
                          "larga" (5:1) del box reso (~12:1) → col default "xMidYMid meet"
                          il grafico veniva rimpicciolito e CENTRATO (dati compressi al
                          centro, zero a Sett.1 e Sett.4). Con "none" x=0→bordo sx e x=400→
                          bordo dx: la linea+area coprono TUTTA la larghezza, allineate alle
                          4 etichette. (NB: niente vectorEffect non-scaling-stroke — rompe
                          il draw progressivo pathLength+dash; il tratto resta ~2.5px perché
                          la linea è quasi orizzontale, scala-Y ≈1.1.) */}
                      <svg viewBox="0 0 400 80" preserveAspectRatio="none" style={{ width: "100%", height: 90, marginTop: 8 }}>
                        <defs>
                          <linearGradient id="detailg" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0" stopColor={C.accent} stopOpacity={0.2} />
                            <stop offset="1" stopColor={C.accent} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <path d="M0,64 L44,58 L88,62 L132,44 L176,50 L220,34 L264,40 L308,22 L352,28 L400,10 L400,80 L0,80 Z" fill="url(#detailg)" opacity={prog(frame, DETAIL_AREA, EASE_IN_SCENE)} />
                        <path d="M0,64 L44,58 L88,62 L132,44 L176,50 L220,34 L264,40 L308,22 L352,28 L400,10" fill="none" stroke={C.accent} strokeWidth={2.5} pathLength={1} style={drawPath(frame, DETAIL_PATH)} />
                      </svg>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.muted }}>
                        {["Sett. 1", "Sett. 2", "Sett. 3", "Sett. 4"].map((s) => <span key={s}>{s}</span>)}
                      </div>
                    </div>
                  </div>
                  {/* ④ ORDINI */}
                  <div style={{ width: "25%", padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
                    <span style={{ fontWeight: 600, fontSize: 18 }}>Ordini recenti</span>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
                      {([["Ordini del mese", 24, (n: number) => fmtInt.format(Math.round(n))], ["In lavorazione", 3, (n: number) => fmtInt.format(Math.round(n))], ["Incasso periodo", 16889, (n: number) => `${fmtInt.format(Math.round(n))} €`]] as const).map(([lab, target, fmt], i) => {
                        const b = { start: ORD_STATS.start + s2f(0.08) * i, dur: ORD_STATS.dur, end: ORD_STATS.end + s2f(0.08) * i };
                        return (
                          <div key={lab} style={{ ...cardBox, backgroundColor: C.background, padding: 14, ...enter(frame, b, { y: 14, blur: 4, scaleFrom: 0.965, anticipate: true }), ...cardGlow(frame, ORD_COUNT) }}>
                            <div style={label(11)}>{lab}</div>
                            <div style={{ color: C.accentInk, fontFamily, fontWeight: 700, fontSize: 24, fontVariantNumeric: "tabular-nums", marginTop: 4 }}>{countUp(frame, ORD_COUNT, target, fmt)}</div>
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ ...cardBox, backgroundColor: C.background, overflow: "hidden" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "70px 1fr 70px 110px 100px 130px", padding: "10px 16px", backgroundColor: C.surface2, ...label(11) }}>
                        <span>N°</span><span>Cliente</span><span>Data</span><span>Canale</span><span>Importo</span><span>Stato</span>
                      </div>
                      {ORDINI.map((row, i) => {
                        const b = { start: ORD_ROWS.start + s2f(0.14) * i, dur: ORD_ROWS.dur, end: ORD_ROWS.end + s2f(0.14) * i };
                        const p = prog(frame, b, EASE_IN_SCENE);
                        return (
                          <div key={row[0]} style={{ display: "grid", gridTemplateColumns: "70px 1fr 70px 110px 100px 130px", padding: "10px 16px", fontSize: 14, alignItems: "center", borderTop: `1px solid ${C.border}`, opacity: p, transform: `translateX(${-16 * (1 - p)}px)`, backgroundColor: i === 0 && frame >= ORD_ACTIVE.start ? C.accentSoft : undefined }}>
                          <span style={{ fontWeight: 600 }}>{row[0]}</span><span>{row[1]}</span><span>{row[2]}</span><span>{row[3]}</span><span>{row[4]}</span><span><span style={chip(row[5])}>{row[5]}</span></span>
                          </div>
                        );
                      })}
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 16px", borderTop: `1px solid ${C.border}`, fontSize: 14, fontWeight: 600 }}>
                        <span>Totale periodo</span><span>16.889 €</span>
                      </div>
                    </div>
                    <div style={{ ...cardBox, backgroundColor: C.background, border: "2px solid rgba(132,204,22,0.4)", padding: 14, ...enter(frame, ORD_DETAIL, { y: 17, anticipate: true }) }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontWeight: 600, fontSize: 15 }}>Ordine #1042 · Rossi S.r.l.</span>
                        <span style={chip("Completato")}>Completato</span>
                      </div>
                      <div style={{ fontSize: 13.5, color: C.muted, marginTop: 8, display: "grid", gap: 4 }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}><span>Wallbox 22 kW ×2</span><span>1.798 €</span></div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}><span>Cavo Type 2 · 5 m ×3</span><span>447 €</span></div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}><span>Spedizione espressa</span><span>95 €</span></div>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 14 }}>
                        <span style={{ color: C.muted }}>Consegna: 30/06 · Torino</span><span style={{ fontWeight: 700 }}>2.340 €</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* MODALE nuovo prodotto */}
            {modalAlpha > 0.01 ? (
              <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", zIndex: 40 }}>
                <div style={{ width: 400, backgroundColor: C.background, borderRadius: 14, boxShadow: SHADOW.lift, border: `1px solid ${C.border}`, padding: 22, opacity: modalAlpha, transform: `translateY(${14 * (1 - modalAlpha)}px) scale(${0.94 + 0.06 * modalAlpha})` }}>
                  <div style={{ fontWeight: 700, fontSize: 17 }}>Nuovo prodotto</div>
                  <div style={{ ...label(11), marginTop: 14 }}>Nome</div>
                  <div style={{ border: `1px solid ${C.border}`, backgroundColor: C.surface2, borderRadius: 8, padding: "9px 12px", fontSize: 14, marginTop: 4, overflow: "hidden", height: 38 }}>
                    <span style={{ whiteSpace: "nowrap", display: "inline-block", ...typeInset(frame, TYPE_NOME, 22) }}>Cavo Modo 3 · spiralato</span>
                  </div>
                  <div style={{ ...label(11), marginTop: 12 }}>Prezzo</div>
                  <div style={{ border: `1px solid ${C.border}`, backgroundColor: C.surface2, borderRadius: 8, padding: "9px 12px", fontSize: 14, marginTop: 4, overflow: "hidden", height: 38 }}>
                    <span style={{ whiteSpace: "nowrap", display: "inline-block", ...typeInset(frame, TYPE_PREZZO, 12) }}>219 €</span>
                  </div>
                  <div style={{ ...label(11), marginTop: 12 }}>Foto</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4, ...maskReveal(frame, FOTO_IN, { dir: "l" }) }}>
                    <Img src={staticFile("assets/products/cavo-spiralato.jpg")} style={{ width: 44, height: 44, borderRadius: 8, objectFit: "cover", border: `1px solid ${C.border}` }} />
                    <span style={{ fontSize: 13, color: C.muted }}>cavo-spiralato.jpg</span>
                  </div>
                  {/* D5.6 — hoverBloom sul wrapper, pressButton sull'interno. */}
                  <div style={{ marginTop: 18, borderRadius: 8, ...hoverBloom(frame, PRESS_SAVE) }}>
                    <div style={pressButton(frame, PRESS_SAVE, 0.93)}>
                      <div style={{ backgroundColor: C.accent, color: C.accentContrast, borderRadius: 8, padding: "10px 0", textAlign: "center", fontSize: 15, fontWeight: 600 }}>Salva prodotto</div>
                    </div>
                  </div>
                </div>
              </AbsoluteFill>
            ) : null}
          </DeviceFrame>
        </AbsoluteFill>
      </AbsoluteFill>

      <Cursor
        shots={SHOTS}
        clicks={[PRESS_HERO, PRESS_REPL, PRESS_PUB, PRESS_NAV1, PRESS_ADD, PRESS_SAVE, PRESS_NAV2, PRESS_NAV3, PRESS_ORD]}
        calms={[COUNT_KPI]}
        moves={[
          { beat: CUR_HERO, ...P.heroRow, mode: "hand" },
          { beat: CUR_REPL, ...P.replace, mode: "hand" },
          { beat: CUR_PUB, ...P.publish, mode: "hand" },
          { beat: CUR_NAV1, ...P.nav(1), mode: "hand" },
          { beat: CUR_ADD, ...P.add, mode: "hand" },
          { beat: { ...TYPE_NOME, end: TYPE_NOME.start + s2f(0.4), dur: s2f(0.4) }, ...P.formNome, mode: "text" },
          { beat: { ...TYPE_PREZZO, end: TYPE_PREZZO.start + s2f(0.3), dur: s2f(0.3) }, ...P.formPrezzo, mode: "text" },
          { beat: CUR_SAVE, ...P.formSave, mode: "hand" },
          { beat: CUR_NAV2, ...P.nav(2), mode: "hand" },
          { beat: CUR_NAV3, ...P.nav(3), mode: "hand" },
          { beat: CUR_ORD, ...P.ord0, mode: "hand" },
        ]}
        hideAfter={ORD_DETAIL}
      />

      <Caption beats={SAY1}>Modifichi i contenuti del sito: online subito.</Caption>
      <Caption beats={SAY2}>Il catalogo prodotti: aggiungi e aggiorni in un click.</Caption>
      <Caption beats={SAY3}>Visite, utenti e conversioni, sempre aggiornati.</Caption>
      <Caption beats={SAY4}>Gli ordini, con data e canale, in un'unica vista.</Caption>
      <ChapterCard title="Dashboard" subtitle="La dashboard: il tuo business, in tempo reale." beats={CARD} index={3} />
    </AbsoluteFill>
  );
};
