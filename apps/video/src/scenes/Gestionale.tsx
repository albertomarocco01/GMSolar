/**
 * SCENA 05 · Gestionali su misura (porting di ImmersiveGestionale.tsx).
 * Gestionale colonnine EV, sidebar SCURA: Panoramica (KPI + grafici) →
 * Colonnine (query in italiano che filtra la tabella) → drawer Assistente AI
 * («riavvia le colonnine offline», step + flip Offline→Online) → Manutenzione.
 */
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C, SHADOW } from "../kit/tokens";
import {
  cameraAt,
  countUp,
  DUR,
  EASE_CAMERA,
  EASE_IN_SCENE,
  EASE_OUT_SCENE,
  EASE_SNAP,
  enter,
  maskReveal,
  pressButton,
  prog,
  s2f,
  seq,
  shotOn,
  typeInset,
  whip,
} from "../kit/motion";
import { Caption, captionBeats, ChapterCard, chapterIntroBeats, Cursor, DeviceFrame, FRAME } from "../kit/ui";
import { fontFamily } from "../kit/fonts";

const t = seq();
const CARD = chapterIntroBeats(t);
const KPI_IN = t.add(DUR.beat, 0.2); // + stagger 0.18
const PANO_BARS = t.add(1.0, -0.15); // + stagger 0.12
const NET_BARS = t.add(1.0, -0.4); // + stagger 0.2
t.hold(1);
const SAY1 = captionBeats(t);
const CUR_NAV1 = t.add(1.0);
const TRACK1 = t.add(1.5, -0.7);
const TYPE_QUERY = t.add(2.5, 0.3);
const ROWS_DIM = t.add(DUR.beat, 0.15);
const MATCH = t.add(DUR.beat, "<"); // + stagger 0.18
const BADGE = t.add(DUR.beat, "<");
const CAM_RESET1 = t.add(0.8, "<");
t.hold(0.5);
const SAY2 = captionBeats(t);
const CUR_AI = t.add(1.0);
const PRESS_AI = t.add(0.45, -0.05);
const DRAWER_IN = t.add(1.0, -0.1);
const TYPE_REQ = t.add(2.0, 0.2);
const STEPS = t.add(DUR.beat, 0.15); // + stagger 0.5 ×4
const CAM_LIST = t.add(DUR.beat, 1.7);
const OLD_FLIP = t.add(DUR.micro, -0.45); // + stagger 0.12
const NEW_FLIP = t.add(DUR.beat, -0.25); // + stagger 0.12
const CAM_RESET2 = t.add(0.8, 0.35);
const COUNT_OFF = t.add(DUR.beat, -0.6);
t.hold(1);
const SAY3 = captionBeats(t);
const DRAWER_OUT = t.add(DUR.beat);
const CUR_NAV3 = t.add(1.0);
const TRACK2 = t.add(1.5, -0.7);
const MANT_ROWS = t.add(DUR.beat, 0.15); // + stagger 0.22
const MANT_CHIPS = t.add(DUR.beat, "<"); // + stagger 0.22
const CAM_MANT = t.add(DUR.beat, 0.5);
const CAM_RESET3 = t.add(0.8, 0.5);
t.hold(1);
export const GESTIONALE_DURATION = t.total;

const SIDE_W = 230;
const NAV_H = 42; // altezza esplicita di ogni voce nav (layout deterministico)
const NAV_TOP = 76; // 22 padding-top + 30 logo row + 24 margine sotto logo
const navY = (i: number) => FRAME.y + NAV_TOP + i * NAV_H;
const NAV = ["Panoramica", "Colonnine", "Sessioni", "Manutenzione"];
const P = {
  nav: (i: number) => ({ x: FRAME.x + 115, y: navY(i) + NAV_H / 2 }),
  query: { x: FRAME.x + SIDE_W + 340, y: FRAME.y + 130 },
  ai: { x: FRAME.x + FRAME.w - 120, y: FRAME.y + 30 },
  req: { x: FRAME.x + FRAME.w - 250, y: FRAME.y + 170 },
};
const SHOTS = [
  { at: TYPE_QUERY.start + s2f(0.3), from: TYPE_QUERY.start, ...shotOn(P.query.x, P.query.y, 1.2) },
  { at: CAM_RESET1.end, from: CAM_RESET1.start, x: 0, y: 0, scale: 1 },
  { at: CAM_LIST.end, from: CAM_LIST.start, ...shotOn(FRAME.x + FRAME.w - 260, FRAME.y + 480, 1.4) },
  { at: CAM_RESET2.end, from: CAM_RESET2.start, x: 0, y: 0, scale: 1 },
  { at: CAM_MANT.end, from: CAM_MANT.start, ...shotOn(FRAME.x + SIDE_W + 460, FRAME.y + 400, 1.2) },
  { at: CAM_RESET3.end, from: CAM_RESET3.start, x: 0, y: 0, scale: 1 },
];

const KPI = [
  ["46", "Colonnine in rete", "+2 questo mese", "#d1fae5", "#047857"],
  ["128", "Sessioni oggi", "+12% vs ieri", "#d1fae5", "#047857"],
  ["97%", "Disponibilità", "target 95%", C.surface2, C.muted],
] as const;
const PANO = [45, 62, 50, 80, 68, 92, 74];
const RETE = [
  ["Online", 38, 83, "#10b981"],
  ["In manutenzione", 6, 13, "#f59e0b"],
  ["Offline", 2, 4, "#f43f5e"],
] as const;
const COLONNINE = [
  ["COL-012 · Torino Nord", "150 kW", "Offline", true],
  ["COL-007 · Milano Est", "22 kW", "Online", false],
  ["COL-019 · Asti Centro", "22 kW", "Offline", true],
  ["COL-003 · Cuneo Sud", "50 kW", "Online", false],
  ["COL-015 · Alba", "22 kW", "In manutenzione", false],
] as const;
const CHIP: Record<string, { bg: string; fg: string }> = {
  Online: { bg: "#d1fae5", fg: "#047857" },
  Offline: { bg: "#ffe4e6", fg: "#be123c" },
  "In manutenzione": { bg: "#fef3c7", fg: "#b45309" },
  "In corso": { bg: "#fef3c7", fg: "#b45309" },
  Programmata: { bg: "#e0f2fe", fg: "#0369a1" },
  Completata: { bg: "#d1fae5", fg: "#047857" },
};
const STEPS_TXT = ["Leggo le 2 colonnine offline…", "Invio il comando di riavvio…", "Verifico lo stato…", "Fatto"];
const INTERVENTI = [
  ["COL-015 · Alba", "Sostituzione connettore CCS", "Oggi · 14:30", "In corso"],
  ["COL-021 · Bra", "Aggiornamento firmware", "Gio 12 · 09:00", "Programmata"],
  ["COL-008 · Alessandria", "Revisione semestrale", "Lun 16 · 10:30", "Programmata"],
  ["COL-003 · Cuneo Sud", "Taratura contatore", "Ieri · 11:00", "Completata"],
] as const;

const label = (fs = 11): React.CSSProperties => ({ fontSize: fs, textTransform: "uppercase", letterSpacing: "0.12em", color: C.muted, fontWeight: 600 });
const chip = (s: string): React.CSSProperties => ({ backgroundColor: CHIP[s].bg, color: CHIP[s].fg, borderRadius: 999, padding: "3px 10px", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" });
const cardBox: React.CSSProperties = { border: `1px solid ${C.border}`, backgroundColor: C.surface, borderRadius: 12 };

export const Gestionale: React.FC = () => {
  const frame = useCurrentFrame();
  const trackX = -33.333 * prog(frame, TRACK1, EASE_CAMERA) - 33.334 * prog(frame, TRACK2, EASE_CAMERA);
  const whipBeat = frame < TRACK2.start ? TRACK1 : TRACK2;
  const whipStyle = whip(frame, { start: whipBeat.start + s2f(0.7), dur: s2f(0.35), end: whipBeat.start + s2f(1.05) }, "r");
  const navIndex = frame >= TRACK2.start ? 3 : frame >= TRACK1.start ? 1 : 0;
  const navBeat = frame >= TRACK2.start ? TRACK2 : TRACK1;
  const navPrev = frame >= TRACK2.start ? 1 : 0;
  const indY = navIndex === 0 ? navY(0) : navY(navPrev) + (navY(navIndex) - navY(navPrev)) * prog(frame, navBeat, EASE_CAMERA);
  const drawerP = prog(frame, DRAWER_IN, EASE_IN_SCENE) * (1 - prog(frame, DRAWER_OUT, EASE_OUT_SCENE));
  const bgDim = 1 - 0.45 * drawerP;
  const dimP = prog(frame, ROWS_DIM, EASE_IN_SCENE);

  return (
    <AbsoluteFill style={{ backgroundColor: C.background }}>
      <AbsoluteFill style={cameraAt(frame, SHOTS, [PRESS_AI])}>
        <AbsoluteFill style={whipStyle}>
          <DeviceFrame bg={C.surface}>
            {/* SIDEBAR SCURA */}
            <div style={{ width: SIDE_W, flexShrink: 0, backgroundColor: C.foreground, padding: "22px 14px", position: "relative", display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, height: 30, marginBottom: 24, paddingLeft: 8 }}>
                <div style={{ width: 18, height: 18, borderRadius: 5, backgroundColor: C.accent }} />
                <span style={{ fontWeight: 600, fontSize: 16, color: "#fff" }}>Gestionale</span>
              </div>
              <div style={{ position: "absolute", left: 14, right: 14, top: indY - FRAME.y, height: NAV_H, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.1)", display: "flex" }}>
                <div style={{ width: 4, borderRadius: 999, backgroundColor: C.accent, margin: "6px 0 6px 4px" }} />
              </div>
              {NAV.map((v, i) => (
                <div key={v} style={{ position: "relative", height: NAV_H, display: "flex", alignItems: "center", padding: "0 16px", fontSize: 15, color: i === navIndex ? "#fff" : "rgba(255,255,255,0.75)", fontWeight: i === navIndex ? 600 : 400 }}>
                  {v}
                </div>
              ))}
              <div style={{ marginTop: "auto", paddingLeft: 8 }}>
                <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>Rete</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, color: "rgba(255,255,255,0.85)", fontSize: 13 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 999, backgroundColor: "#34d399" }} />
                  46 colonnine connesse
                </div>
              </div>
            </div>
            {/* MAIN */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, opacity: bgDim }}>
              <div style={{ height: 56, display: "flex", alignItems: "center", gap: 12, padding: "0 24px", borderBottom: `1px solid ${C.border}`, backgroundColor: "rgba(247,249,252,0.6)" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 7, backgroundColor: "#d1fae5", color: "#047857", borderRadius: 999, padding: "4px 12px", fontSize: 12, fontWeight: 600 }}>
                  <span style={{ width: 7, height: 7, borderRadius: 999, backgroundColor: "#10b981" }} />
                  Rete online
                </span>
                <span style={{ flex: 1, maxWidth: 380, backgroundColor: C.surface2, color: C.muted, borderRadius: 999, padding: "7px 16px", fontSize: 13 }}>Cerca o chiedi all'AI…</span>
                <div style={{ marginLeft: "auto", ...pressButton(frame, PRESS_AI, 0.9) }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 7, backgroundColor: C.accentSoft, color: C.accentInk, borderRadius: 999, padding: "6px 16px", fontSize: 14, fontWeight: 700 }}>
                    <span style={{ width: 7, height: 7, borderRadius: 999, backgroundColor: C.accent }} />
                    Assistente AI
                  </span>
                </div>
              </div>
              {/* TRACK 300% */}
              <div style={{ flex: 1, overflow: "hidden" }}>
                <div style={{ display: "flex", width: "300%", height: "100%", transform: `translateX(${trackX}%)` }}>
                  {/* ① PANORAMICA */}
                  <div style={{ width: "33.333%", padding: 22, display: "flex", flexDirection: "column", gap: 14 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
                      {KPI.map(([val2, lab, trend, tbg, tfg], i) => {
                        const b = { start: KPI_IN.start + s2f(0.18) * i, dur: KPI_IN.dur, end: KPI_IN.end + s2f(0.18) * i };
                        return (
                          <div key={lab} style={{ ...cardBox, backgroundColor: C.background, padding: 16, ...enter(frame, b, { y: 18, anticipate: true }) }}>
                            <div style={{ fontFamily, fontWeight: 700, fontSize: 32 }}>{val2}</div>
                            <div style={{ color: C.muted, fontSize: 13, marginTop: 2 }}>{lab}</div>
                            <span style={{ display: "inline-block", marginTop: 8, backgroundColor: tbg, color: tfg, borderRadius: 999, padding: "3px 10px", fontSize: 11, fontWeight: 600 }}>{trend}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 290px", gap: 12, flex: 1 }}>
                      <div style={{ ...cardBox, backgroundColor: C.background, padding: 16 }}>
                        <div style={label()}>Sessioni per giorno</div>
                        <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 260, marginTop: 14 }}>
                          {PANO.map((h, i) => {
                            const b = { start: PANO_BARS.start + s2f(0.12) * i, dur: PANO_BARS.dur, end: PANO_BARS.end + s2f(0.12) * i };
                            return <div key={i} style={{ flex: 1, height: `${h}%`, borderRadius: "6px 6px 0 0", backgroundColor: i === 5 ? C.accent : "#d9f99d", transform: `scaleY(${prog(frame, b, EASE_SNAP)})`, transformOrigin: "bottom" }} />;
                          })}
                        </div>
                        <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                          {["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"].map((d) => (
                            <span key={d} style={{ flex: 1, textAlign: "center", fontSize: 12, color: C.muted }}>{d}</span>
                          ))}
                        </div>
                      </div>
                      <div style={{ ...cardBox, backgroundColor: C.background, padding: 16 }}>
                        <div style={label()}>Stato rete</div>
                        {RETE.map(([lab, n, w, col], i) => {
                          const b = { start: NET_BARS.start + s2f(0.2) * i, dur: NET_BARS.dur, end: NET_BARS.end + s2f(0.2) * i };
                          return (
                            <div key={lab} style={{ marginTop: 16 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                                <span style={{ width: 8, height: 8, borderRadius: 999, backgroundColor: col }} />
                                <span style={{ flex: 1 }}>{lab}</span>
                                <span style={{ fontFamily: "monospace" }}>{n}</span>
                              </div>
                              <div style={{ height: 7, borderRadius: 999, backgroundColor: C.surface2, marginTop: 6, overflow: "hidden" }}>
                                <div style={{ height: "100%", width: `${w}%`, borderRadius: 999, backgroundColor: col, transform: `scaleX(${prog(frame, b, EASE_IN_SCENE)})`, transformOrigin: "left" }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  {/* ② COLONNINE */}
                  <div style={{ width: "33.333%", padding: 22, display: "flex", flexDirection: "column", gap: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, maxWidth: 680 }}>
                      <div style={{ flex: 1, backgroundColor: C.surface2, borderRadius: 999, padding: "10px 18px", overflow: "hidden", height: 42 }}>
                        <span style={{ fontSize: 15, whiteSpace: "nowrap", display: "inline-block", ...typeInset(frame, TYPE_QUERY, 17) }}>colonnine offline</span>
                      </div>
                      <span style={{ backgroundColor: C.accent, color: C.accentContrast, borderRadius: 999, padding: "6px 16px", fontSize: 13, fontWeight: 600, opacity: prog(frame, BADGE, EASE_SNAP), transform: `scale(${0.8 + 0.2 * prog(frame, BADGE, EASE_SNAP)})` }}>2 risultati</span>
                    </div>
                    <div style={{ ...cardBox, backgroundColor: C.background, overflow: "hidden", maxWidth: 680 }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 120px 170px", padding: "10px 16px", backgroundColor: C.surface2, ...label() }}>
                        <span>Colonnina</span><span>Potenza</span><span>Stato</span>
                      </div>
                      {COLONNINE.map(([id, kw, stato, match], i) => (
                        <div key={id} style={{ position: "relative", display: "grid", gridTemplateColumns: "1fr 120px 170px", padding: "12px 16px", fontSize: 14, alignItems: "center", borderTop: `1px solid ${C.border}`, opacity: match ? 1 : 1 - 0.65 * dimP }}>
                          {match ? (
                            <div style={{ position: "absolute", inset: 0, backgroundColor: C.accentSoft, borderLeft: `3px solid ${C.accent}`, ...maskReveal(frame, { start: MATCH.start + s2f(0.18) * (i === 0 ? 0 : 1), dur: MATCH.dur, end: MATCH.end + s2f(0.18) * (i === 0 ? 0 : 1) }, { dir: "l" }) }} />
                          ) : null}
                          <span style={{ position: "relative", fontWeight: 500 }}>{id}</span>
                          <span style={{ position: "relative", fontFamily: "monospace" }}>{kw}</span>
                          <span style={{ position: "relative" }}><span style={chip(stato)}>{stato}</span></span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* ③ MANUTENZIONE */}
                  <div style={{ width: "33.333%", padding: 22, display: "flex", flexDirection: "column", gap: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 17 }}>Manutenzione programmata</div>
                        <div style={{ color: C.muted, fontSize: 13 }}>Interventi sulla rete · prossimi 7 giorni</div>
                      </div>
                      <span style={{ backgroundColor: "#fef3c7", color: "#b45309", borderRadius: 999, padding: "4px 12px", fontSize: 12, fontWeight: 600 }}>3 interventi aperti</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 270px", gap: 12 }}>
                      <div style={{ ...cardBox, backgroundColor: C.background, overflow: "hidden" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 16px", backgroundColor: C.surface2, ...label() }}>
                          <span>Intervento</span><span>Stato</span>
                        </div>
                        {INTERVENTI.map(([id, task, when, stato], i) => {
                          const b = { start: MANT_ROWS.start + s2f(0.22) * i, dur: MANT_ROWS.dur, end: MANT_ROWS.end + s2f(0.22) * i };
                          const bc = { start: MANT_CHIPS.start + s2f(0.22) * i, dur: MANT_CHIPS.dur, end: MANT_CHIPS.end + s2f(0.22) * i };
                          return (
                            <div key={id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderTop: `1px solid ${C.border}`, ...enter(frame, b, { y: 14 }) }}>
                              <span style={{ width: 34, height: 34, borderRadius: 999, backgroundColor: C.surface2, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>🔧</span>
                              <span style={{ flex: 1 }}>
                                <span style={{ fontWeight: 500, fontSize: 14, display: "block" }}>{id}</span>
                                <span style={{ color: C.muted, fontSize: 12 }}>{task}</span>
                              </span>
                              <span style={{ fontFamily: "monospace", fontSize: 12.5, color: C.muted }}>{when}</span>
                              <span style={{ transform: `scale(${prog(frame, bc, EASE_SNAP)})` }}><span style={chip(stato)}>{stato}</span></span>
                            </div>
                          );
                        })}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        <div style={{ ...cardBox, backgroundColor: C.background, padding: 16, ...enter(frame, { start: MANT_ROWS.start + s2f(0.4), dur: MANT_ROWS.dur, end: MANT_ROWS.end + s2f(0.4) }, { y: 14 }) }}>
                          <div style={label()}>Uptime rete · 30 gg</div>
                          <div style={{ fontFamily, fontWeight: 700, fontSize: 32, color: "#059669", marginTop: 6 }}>99,2%</div>
                          <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>obiettivo 98% superato</div>
                        </div>
                        <div style={{ ...cardBox, backgroundColor: C.background, padding: 16, ...enter(frame, { start: MANT_ROWS.start + s2f(0.6), dur: MANT_ROWS.dur, end: MANT_ROWS.end + s2f(0.6) }, { y: 14 }) }}>
                          <div style={label()}>Prossimo intervento</div>
                          <div style={{ fontWeight: 600, fontSize: 15, marginTop: 6 }}>Oggi · 14:30</div>
                          <div style={{ fontSize: 12.5, color: C.muted, marginTop: 2 }}>COL-015 · Alba — connettore CCS</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* DRAWER AI */}
            {drawerP > 0.01 ? (
              <div style={{ position: "absolute", top: 0, bottom: 0, right: 0, width: 470, backgroundColor: C.surface, borderLeft: `1px solid ${C.border}`, boxShadow: SHADOW.lift, zIndex: 20, transform: `translateX(${(1 - drawerP) * 100}%)`, display: "flex", flexDirection: "column", padding: 24, gap: 18 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ width: 34, height: 34, borderRadius: 999, backgroundColor: C.accentSoft, color: C.accentInk, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13 }}>AI</span>
                  <span style={{ fontWeight: 600, fontSize: 17 }}>Assistente AI</span>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <span style={{ width: 30, height: 30, borderRadius: 999, backgroundColor: C.surface2, color: C.muted, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>TU</span>
                  <div style={{ backgroundColor: C.surface2, borderRadius: 14, borderTopLeftRadius: 4, padding: "10px 14px", overflow: "hidden" }}>
                    <span style={{ fontSize: 14.5, whiteSpace: "nowrap", display: "inline-block", ...typeInset(frame, TYPE_REQ, 26) }}>«riavvia le colonnine offline»</span>
                  </div>
                </div>
                <div style={{ display: "grid", gap: 12 }}>
                  {STEPS_TXT.map((s, i) => {
                    const b = { start: STEPS.start + s2f(0.5) * i, dur: STEPS.dur, end: STEPS.end + s2f(0.5) * i };
                    const bc = { start: b.start + s2f(0.15), dur: b.dur, end: b.end + s2f(0.15) };
                    return (
                      <div key={s} style={{ display: "flex", alignItems: "center", gap: 10, ...enter(frame, b, { y: 8 }) }}>
                        <span style={{ width: 22, height: 22, borderRadius: 999, backgroundColor: C.accent, color: C.accentContrast, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, transform: `scale(${prog(frame, bc, EASE_SNAP)})` }}>✓</span>
                        <span style={{ fontSize: 14.5 }}>{s}</span>
                      </div>
                    );
                  })}
                </div>
                <div style={{ border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden", backgroundColor: C.background }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 90px 110px", padding: "8px 14px", backgroundColor: C.surface2, ...label(10) }}>
                    <span>Colonnina</span><span>Potenza</span><span style={{ textAlign: "right" }}>Stato</span>
                  </div>
                  {(["COL-012 · Torino Nord|150 kW", "COL-019 · Asti Centro|22 kW"] as const).map((r, i) => {
                    const [id, kw] = r.split("|");
                    const of = { start: OLD_FLIP.start + s2f(0.12) * i, dur: OLD_FLIP.dur, end: OLD_FLIP.end + s2f(0.12) * i };
                    const nf = { start: NEW_FLIP.start + s2f(0.12) * i, dur: NEW_FLIP.dur, end: NEW_FLIP.end + s2f(0.12) * i };
                    const outP = prog(frame, of, EASE_OUT_SCENE);
                    const inP = prog(frame, nf, EASE_SNAP);
                    return (
                      <div key={id} style={{ display: "grid", gridTemplateColumns: "1fr 90px 110px", padding: "10px 14px", fontSize: 13.5, alignItems: "center", borderTop: `1px solid ${C.border}` }}>
                        <span style={{ fontWeight: 500 }}>{id}</span>
                        <span style={{ fontFamily: "monospace" }}>{kw}</span>
                        <span style={{ position: "relative", display: "flex", justifyContent: "flex-end", perspective: 400 }}>
                          <span style={{ ...chip("Offline"), opacity: 1 - outP, transform: `rotateY(${90 * outP}deg)` }}>Offline</span>
                          <span style={{ ...chip("Online"), position: "absolute", opacity: inP, transform: `rotateY(${-90 * (1 - inP)}deg)` }}>Online ✓</span>
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div style={{ marginTop: "auto", backgroundColor: C.surface2, borderRadius: 12, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={label()}>Colonnine offline</span>
                  <span style={{ color: C.accentInk, fontFamily, fontWeight: 700, fontSize: 24, fontVariantNumeric: "tabular-nums" }}>
                    {countUp(frame, COUNT_OFF, -2, (n) => String(Math.round(2 + n)))}
                  </span>
                </div>
              </div>
            ) : null}
          </DeviceFrame>
        </AbsoluteFill>
      </AbsoluteFill>

      <Cursor
        shots={SHOTS}
        clicks={[PRESS_AI]}
        moves={[
          { beat: CUR_NAV1, ...P.nav(1), mode: "hand" },
          { beat: { ...TYPE_QUERY, end: TYPE_QUERY.start + s2f(0.3), dur: s2f(0.3) }, ...P.query, mode: "text" },
          { beat: CUR_AI, ...P.ai, mode: "hand" },
          { beat: { ...TYPE_REQ, end: TYPE_REQ.start + s2f(0.3), dur: s2f(0.3) }, ...P.req, mode: "text" },
          { beat: CUR_NAV3, ...P.nav(3), mode: "hand" },
        ]}
        hideAfter={{ start: CAM_MANT.start - s2f(0.3), dur: s2f(0.3), end: CAM_MANT.start }}
      />

      <Caption beats={SAY1}>Scrivi in italiano: i dati si filtrano da soli.</Caption>
      <Caption beats={SAY2}>E l'assistente AI risolve per te.</Caption>
      <Caption beats={SAY3}>Anche la manutenzione è già pianificata.</Caption>
      <ChapterCard title="Gestionali su misura" subtitle="Un gestionale su misura per la tua attività. Per esempio: le tue colonnine di ricarica." beats={CARD} />
    </AbsoluteFill>
  );
};
