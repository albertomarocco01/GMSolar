/**
 * SCENA 04 · Segnalazioni (porting di ImmersiveSegnalazioni.tsx, versione elenco).
 * MATCH-CUT dalla Dashboard: apre neutra sullo STESSO shell (sidebar + topbar
 * identici), con l'indicatore sidebar su "Ordini" = ultimo frame Dashboard; poi
 * l'indicatore scorre a "Contenuti", la 5ª voce «Segnalazioni» cresce nella
 * sidebar e il contenuto entra → la dissolvenza sparisce sulla chrome, sembra la
 * stessa dashboard che continua. Poi: drawer «Segnala un problema» → il track
 * scorre alla vista «Segnalazioni» (nuovo ticket in cima che fa flip In
 * elaborazione → Risolta + immagine riparata) → toast «Fix pubblicato».
 */
import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { C, SHADOW } from "../kit/tokens";
import {
  cameraAt,
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
import { Caption, captionBeats, Cursor, DeviceFrame, FRAME } from "../kit/ui";
import { fontFamily } from "../kit/fonts";

// ── Timeline ─────────────────────────────────────────────────────────────────
const t = seq();
// Beat di raccordo (match-cut): apre neutra sullo shell, indicatore Ordini→Contenuti,
// 5ª voce che cresce, contenuto che entra. Niente chapter card (romperebbe il raccordo).
const OPEN = t.add(0.7);
// ① punch camera + click «Segnala un problema»
const CAM_BTN = t.add(DUR.beat);
const CUR_BTN = t.add(1.0);
const PRESS_BTN = t.add(0.45, 0.15);
// ② drawer entra, pagina auto, descrizione digitata, invia
const DRAWER_IN = t.add(1.0, -0.05);
const CAM_RESET1 = t.add(0.8, "<");
const PAGE_ZOOM = t.add(DUR.beat, 0.1);
const SAY1 = captionBeats(t);
const TYPE_DESC = t.add(2.0);
const CAM_TYPE = { start: TYPE_DESC.start - s2f(0.3), dur: TYPE_DESC.dur, end: TYPE_DESC.end };
const CUR_SEND = t.add(1.0);
const PRESS_SEND = t.add(0.6, 0.2);
// ②½ drawer esce, track → «Segnalazioni», nuovo ticket entra, pulse
const DRAWER_OUT = t.add(0.9, 0.1);
const CAM_RESET2 = t.add(0.8, "<");
const TRACK = t.add(1.1, -0.3);
const NEWTICKET = t.add(DUR.beat, -0.1);
const PULSE_UP = t.add(DUR.micro);
const PULSE_DN = t.add(DUR.micro);
t.hold(0.8);
const SAY2 = captionBeats(t);
// ③ il fix: focus, flip badge, immagine riparata, toast
const CAM_FIX = t.add(DUR.beat, 0.3);
const OLD_FLIP = t.add(DUR.micro);
const NEW_FLIP = t.add(DUR.beat, -0.05);
const IMG_FIX = t.add(DUR.beat, "<");
const FIX_TOAST = t.add(DUR.beat, 0.1);
const CAM_RESET3 = t.add(0.8, 0.3);
t.hold(1.2);
export const SEGNALAZIONI_DURATION = t.total;

// ── Coordinate e camera (shell IDENTICO alla Dashboard: SIDE_W, nav geometry) ──
const SIDE_W = 250;
const NAV_H = 44;
const NAV_TOP = 78;
const navY = (k: number) => FRAME.y + NAV_TOP + k * NAV_H; // k può essere frazionario
const P = {
  btn: { x: FRAME.x + FRAME.w - 150, y: FRAME.y + 30 },
  desc: { x: FRAME.x + FRAME.w - 210, y: FRAME.y + 300 },
  send: { x: FRAME.x + FRAME.w - 280, y: FRAME.y + 340 },
  ticket: { x: FRAME.x + SIDE_W + 420, y: FRAME.y + 235 },
};
const SHOTS = [
  { at: CAM_BTN.end, from: CAM_BTN.start, ...shotOn(P.btn.x, P.btn.y, 1.4) },
  { at: CAM_RESET1.end, from: CAM_RESET1.start, x: 0, y: 0, scale: 1 },
  { at: CAM_TYPE.start + s2f(0.3), from: CAM_TYPE.start, ...shotOn(P.desc.x, P.desc.y, 1.22) },
  { at: CAM_RESET2.end, from: CAM_RESET2.start, x: 0, y: 0, scale: 1 },
  { at: CAM_FIX.end, from: CAM_FIX.start, ...shotOn(P.ticket.x, P.ticket.y, 1.3) },
  { at: CAM_RESET3.end, from: CAM_RESET3.start, x: 0, y: 0, scale: 1 },
];

// ── Dati ─────────────────────────────────────────────────────────────────────
const STATO: Record<string, { bg: string; fg: string; dot: string; icon: string }> = {
  Risolta: { bg: "#d1fae5", fg: "#047857", dot: "#10b981", icon: "✓" },
  "In lavorazione": { bg: "#e0f2fe", fg: "#0369a1", dot: "#0ea5e9", icon: "⚠" },
  "In elaborazione": { bg: "#fef3c7", fg: "#b45309", dot: "#f59e0b", icon: "⚠" },
};
const SEGNALAZIONI = [
  ["Modulo contatti non invia", "gmsolar.it/contatti", "10/07", "Risolta"],
  ["Link «Preventivo» rotto", "gmsolar.it/servizi", "08/07", "Risolta"],
  ["Lentezza nella gallery", "gmsolar.it/gallery", "05/07", "In lavorazione"],
  ["Errore 404 su una scheda", "gmsolar.it/impianti", "02/07", "Risolta"],
  ["Testo tagliato su mobile", "gmsolar.it/chi-siamo", "28/06", "Risolta"],
] as const;
const NAV = ["Contenuti", "Prodotti", "Visite", "Ordini", "Segnalazioni"];
const GRID = "36px minmax(0,1fr) 64px 116px";
const FOTO_FIX = "assets/products/pannello-01.jpg";

const label = (fs = 12): React.CSSProperties => ({ fontSize: fs, textTransform: "uppercase", letterSpacing: "0.12em", color: C.muted, fontWeight: 600 });
const chip = (s: string): React.CSSProperties => ({ backgroundColor: STATO[s].bg, color: STATO[s].fg, borderRadius: 999, padding: "3px 10px", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: 5 });
const cardBox: React.CSSProperties = { border: `1px solid ${C.border}`, backgroundColor: C.surface, borderRadius: 12 };

export const Segnalazioni: React.FC = () => {
  const frame = useCurrentFrame();
  const openP = prog(frame, OPEN, EASE_CAMERA); // raccordo: 0 = stato Dashboard, 1 = Contenuti
  const drawerP = prog(frame, DRAWER_IN, EASE_IN_SCENE) * (1 - prog(frame, DRAWER_OUT, EASE_CAMERA));
  const bgDim = 1 - 0.45 * drawerP;
  const trackX = -50 * prog(frame, TRACK, EASE_CAMERA);
  const trackP = prog(frame, TRACK, EASE_CAMERA);
  // Indicatore sidebar mobile (come la Dashboard): parte su Ordini (k=3, = ultimo
  // frame Dashboard), scorre a Contenuti (k=0) nel beat OPEN, poi a Segnalazioni (k=4).
  const navK = frame < TRACK.start ? 3 + (0 - 3) * openP : 0 + (4 - 0) * trackP;
  const indY = navY(navK);
  const whipStyle = whip(frame, { start: TRACK.start + s2f(0.35), dur: s2f(0.35), end: TRACK.start + s2f(0.7) }, "r");
  const pageZoom = 1 + 0.06 * prog(frame, { start: PAGE_ZOOM.start, dur: Math.floor(PAGE_ZOOM.dur / 2), end: PAGE_ZOOM.start + Math.floor(PAGE_ZOOM.dur / 2) }, EASE_IN_SCENE) * (1 - prog(frame, { start: PAGE_ZOOM.start + Math.floor(PAGE_ZOOM.dur / 2), dur: Math.ceil(PAGE_ZOOM.dur / 2), end: PAGE_ZOOM.end }, EASE_CAMERA));
  const fixToastP = prog(frame, FIX_TOAST, EASE_SNAP);
  const outP = prog(frame, OLD_FLIP, EASE_OUT_SCENE);
  const inP = prog(frame, NEW_FLIP, EASE_SNAP);
  const pulse = 1 + 0.12 * prog(frame, PULSE_UP, EASE_SNAP) * (1 - prog(frame, PULSE_DN, EASE_IN_SCENE));

  return (
    <AbsoluteFill style={{ backgroundColor: C.surface }}>
      <AbsoluteFill style={cameraAt(frame, SHOTS, [PRESS_BTN, PRESS_SEND])}>
        <AbsoluteFill style={whipStyle}>
          <DeviceFrame>
            {/* SIDEBAR — identica alla Dashboard, indicatore mobile + 5ª voce che cresce */}
            <div style={{ width: SIDE_W, flexShrink: 0, borderRight: `1px solid ${C.border}`, backgroundColor: C.surface, padding: "22px 16px", position: "relative", opacity: bgDim }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, height: 32, marginBottom: 24, paddingLeft: 8 }}>
                <div style={{ width: 18, height: 18, borderRadius: 5, backgroundColor: C.accent }} />
                <span style={{ fontWeight: 600, fontSize: 17 }}>Dashboard</span>
              </div>
              <div style={{ position: "absolute", left: 16, right: 16, top: indY - FRAME.y, height: NAV_H, borderRadius: 10, backgroundColor: C.accentSoft }} />
              {NAV.map((v, i) => {
                const active = Math.round(navK) === i;
                // La 5ª voce «Segnalazioni» non esiste al taglio (match Dashboard): cresce nel beat OPEN.
                const grow = i === 4 ? openP : 1;
                return (
                  <div key={v} style={{ position: "relative", height: NAV_H * grow, opacity: grow, overflow: "hidden", display: "flex", alignItems: "center", padding: "0 14px", fontSize: 16, color: active ? C.foreground : C.muted, fontWeight: active ? 600 : 400 }}>
                    {v}
                  </div>
                );
              })}
            </div>
            {/* MAIN */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
              <div style={{ height: 56, display: "flex", alignItems: "center", gap: 10, padding: "0 24px", borderBottom: `1px solid ${C.border}`, backgroundColor: "rgba(255,255,255,0.8)", opacity: bgDim }}>
                <span style={{ width: 9, height: 9, borderRadius: 999, backgroundColor: "#34d399" }} />
                <span style={{ fontSize: 14, fontWeight: 600, color: C.muted }}>3 siti connessi</span>
                {/* Il bottone entra nel beat OPEN (al taglio l'angolo topbar resta pulito). */}
                <div style={{ marginLeft: "auto", opacity: openP, ...pressButton(frame, PRESS_BTN, 0.93) }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 7, backgroundColor: C.accentSoft, color: C.accentInk, borderRadius: 999, padding: "6px 16px", fontSize: 14, fontWeight: 600 }}>⚠ Segnala un problema</span>
                </div>
              </div>
              {/* TRACK 200%: Contenuti → Segnalazioni */}
              <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
                <div style={{ display: "flex", width: "200%", height: "100%", transform: `translateX(${trackX}%)` }}>
                  {/* ① CONTENUTI (hero col difetto) — entra da destra nel beat OPEN */}
                  <div style={{ width: "50%", padding: 24, opacity: bgDim }}>
                    <div style={{ transform: `translateX(${(1 - openP) * 48}px)`, opacity: openP }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                        <span style={{ fontWeight: 600, fontSize: 18 }}>Contenuti del sito</span>
                        <span style={{ fontSize: 13, color: C.muted, fontFamily: "monospace" }}>gmsolar.it/dashboard/contenuti</span>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 16, marginTop: 16 }}>
                        <div style={{ ...cardBox, padding: 14 }}>
                          <div style={label(11)}>Pagine del sito</div>
                          {["Hero homepage", "Chi siamo", "Impianti realizzati"].map((name, i) => (
                            <div key={name} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 8, marginTop: 8, backgroundColor: i === 0 ? C.accentSoft : undefined }}>
                              <span style={{ width: 52, height: 32, borderRadius: 6, backgroundColor: C.surface2, border: `1px solid ${C.border}` }} />
                              <span style={{ fontSize: 13, fontWeight: 600, flex: 1 }}>{name}</span>
                              <span style={{ backgroundColor: "#d1fae5", color: "#047857", borderRadius: 999, padding: "3px 10px", fontSize: 11, fontWeight: 600 }}>Pubblicata</span>
                            </div>
                          ))}
                        </div>
                        <div style={{ ...cardBox, backgroundColor: C.background, padding: 16 }}>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ fontWeight: 600, fontSize: 15 }}>Hero homepage</span>
                            <span style={{ fontSize: 12, color: C.muted }}>Ultima modifica: oggi</span>
                          </div>
                          <div style={{ position: "relative", aspectRatio: "16/7", borderRadius: 10, overflow: "hidden", backgroundColor: C.surface2, border: `1px solid ${C.border}`, marginTop: 12 }}>
                            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, color: C.muted }}>
                              <span style={{ fontSize: 24 }}>🖼</span>
                              <span style={{ fontSize: 12, fontWeight: 600 }}>Immagine non disponibile</span>
                            </div>
                          </div>
                          <div style={{ marginTop: 12 }}>
                            <div style={label(11)}>Titolo</div>
                            <div style={{ ...cardBox, backgroundColor: C.surface2, padding: "8px 12px", fontSize: 14, marginTop: 4 }}>Energia solare per la tua azienda</div>
                          </div>
                          <div style={{ marginTop: 10, fontSize: 12, color: C.muted }}>Stato: <b>Pubblicata</b></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* ② SEGNALAZIONI (elenco) */}
                  <div style={{ width: "50%", padding: 24, display: "flex", flexDirection: "column", gap: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <span style={{ fontWeight: 600, fontSize: 18 }}>Segnalazioni</span>
                      <span style={{ fontSize: 13, color: C.muted }}>{SEGNALAZIONI.length + 1} totali · 1 in elaborazione</span>
                    </div>
                    <div style={{ ...cardBox, backgroundColor: C.background, overflow: "hidden" }}>
                      <div style={{ display: "grid", gridTemplateColumns: GRID, padding: "10px 16px", backgroundColor: C.surface2, ...label(11), gap: 12 }}>
                        <span />
                        <span>Oggetto</span>
                        <span>Data</span>
                        <span>Stato</span>
                      </div>
                      {/* NUOVO TICKET */}
                      <div style={{ display: "grid", gridTemplateColumns: GRID, gap: 12, padding: "12px 16px", alignItems: "center", borderTop: `1px solid ${C.border}`, backgroundColor: "rgba(132,204,22,0.06)", ...enter(frame, NEWTICKET, { y: 16, anticipate: true }) }}>
                        <div style={{ position: "relative", width: 34, height: 34, borderRadius: 8, overflow: "hidden", backgroundColor: C.surface2, border: `1px solid ${C.border}` }}>
                          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: C.muted }}>🖼</div>
                          <div style={{ position: "absolute", inset: 0, ...maskReveal(frame, IMG_FIX, { dir: "l" }) }}>
                            <Img src={staticFile(FOTO_FIX)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          </div>
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 14, fontWeight: 600 }}>Immagine hero non si carica</div>
                          <div style={{ fontSize: 12, color: C.muted, fontFamily: "monospace" }}>gmsolar.it/dashboard/contenuti</div>
                        </div>
                        <span style={{ fontSize: 13, color: C.muted }}>Oggi</span>
                        <span style={{ position: "relative", display: "inline-grid", perspective: 400 }}>
                          <span style={{ ...chip("In elaborazione"), gridArea: "1 / 1", justifySelf: "start", opacity: 1 - outP, transform: `scale(${pulse}) rotateY(${90 * outP}deg)`, transformOrigin: "left center" }}>In elaborazione</span>
                          <span style={{ ...chip("Risolta"), gridArea: "1 / 1", justifySelf: "start", opacity: inP, transform: `rotateY(${-90 * (1 - inP)}deg)`, transformOrigin: "left center" }}>✓ Risolta</span>
                        </span>
                      </div>
                      {/* TICKET ESISTENTI */}
                      {SEGNALAZIONI.map(([obj, page, date, stato]) => (
                        <div key={obj} style={{ display: "grid", gridTemplateColumns: GRID, gap: 12, padding: "12px 16px", alignItems: "center", borderTop: `1px solid ${C.border}` }}>
                          <div style={{ width: 34, height: 34, borderRadius: 8, backgroundColor: STATO[stato].bg, color: STATO[stato].fg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>{STATO[stato].icon}</div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: 14, fontWeight: 500 }}>{obj}</div>
                            <div style={{ fontSize: 12, color: C.muted, fontFamily: "monospace" }}>{page}</div>
                          </div>
                          <span style={{ fontSize: 13, color: C.muted }}>{date}</span>
                          <span><span style={chip(stato)}><span style={{ width: 6, height: 6, borderRadius: 999, backgroundColor: STATO[stato].dot }} />{stato}</span></span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* DRAWER «Segnala un problema» */}
            {drawerP > 0.01 ? (
              <div style={{ position: "absolute", top: 0, bottom: 0, right: 0, width: 400, backgroundColor: C.surface, borderLeft: `1px solid ${C.border}`, boxShadow: SHADOW.lift, zIndex: 20, transform: `translateX(${(1 - drawerP) * 100}%)`, display: "flex", flexDirection: "column" }}>
                <div style={{ borderBottom: `1px solid ${C.border}`, padding: "20px 26px" }}>
                  <div style={{ fontWeight: 600, fontSize: 19, letterSpacing: "-0.01em" }}>Segnala un problema</div>
                  <div style={{ color: C.muted, fontSize: 14, marginTop: 4 }}>La pagina è già allegata: descrivi cosa non va</div>
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 22, padding: 26 }}>
                  <div>
                    <div style={label()}>Pagina</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, ...cardBox, backgroundColor: C.surface2, padding: "10px 12px", marginTop: 6, transform: `scale(${pageZoom})` }}>
                      <span style={{ fontFamily: "monospace", fontSize: 13, flex: 1 }}>gmsolar.it/dashboard/contenuti</span>
                      <span style={{ backgroundColor: C.accentSoft, color: C.accentInk, borderRadius: 999, padding: "3px 10px", fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" }}>Rilevata in automatico ✓</span>
                    </div>
                  </div>
                  <div>
                    <div style={label()}>Descrizione</div>
                    <div style={{ ...cardBox, backgroundColor: C.background, padding: "12px 14px", marginTop: 6, minHeight: 84, overflow: "hidden" }}>
                      <span style={{ fontSize: 15, fontWeight: 500, whiteSpace: "nowrap", display: "inline-block", ...typeInset(frame, TYPE_DESC, 35) }}>L'immagine della hero non si carica</span>
                    </div>
                  </div>
                  <div style={{ alignSelf: "flex-start", ...pressButton(frame, PRESS_SEND, 0.94) }}>
                    <span style={{ backgroundColor: C.accent, color: C.accentContrast, borderRadius: 10, padding: "11px 22px", fontSize: 15, fontWeight: 600 }}>Invia segnalazione</span>
                  </div>
                </div>
              </div>
            ) : null}
          </DeviceFrame>
        </AbsoluteFill>
      </AbsoluteFill>

      {/* Toast fix pubblicato (livello schermo) */}
      {fixToastP > 0.01 ? (
        <div style={{ position: "absolute", top: 40, left: "50%", transform: `translateX(-50%) translateY(${-28 * (1 - Math.min(1, fixToastP))}px)`, opacity: Math.min(1, fixToastP), display: "flex", alignItems: "center", gap: 10, backgroundColor: C.surface, border: `1px solid ${C.border}`, borderRadius: 999, boxShadow: SHADOW.lift, padding: "12px 24px", zIndex: 50, fontFamily }}>
          <span style={{ color: "#059669", fontSize: 16 }}>✓</span>
          <span style={{ fontSize: 15, fontWeight: 600, color: C.foreground }}>Fix pubblicato ✓</span>
        </div>
      ) : null}

      <Cursor
        shots={SHOTS}
        clicks={[PRESS_BTN, PRESS_SEND]}
        moves={[
          { beat: CUR_BTN, ...P.btn, mode: "hand" },
          { beat: { ...TYPE_DESC, end: TYPE_DESC.start + s2f(0.3), dur: s2f(0.3) }, ...P.desc, mode: "text" },
          { beat: CUR_SEND, ...P.send, mode: "hand" },
        ]}
        hideAfter={PRESS_SEND}
      />

      <Caption beats={SAY1}>Il link della pagina si compila da solo.</Caption>
      <Caption beats={SAY2}>Entra nell'elenco con tutte le altre: la maggior parte già risolte.</Caption>
    </AbsoluteFill>
  );
};
