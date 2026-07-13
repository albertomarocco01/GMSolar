/**
 * SCENA 04 · Segnalazioni (porting di ImmersiveSegnalazioni.tsx).
 * Dalla dashboard col difetto (hero senza immagine) → drawer «Segnala un
 * problema» (pagina auto-rilevata, descrizione digitata) → toast con timeline
 * di stato (Ricevuta → In lavorazione → Risolta, flip 3D) → fix pubblicato.
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
  val,
} from "../kit/motion";
import { Caption, captionBeats, ChapterCard, chapterIntroBeats, Cursor, DeviceFrame, FRAME } from "../kit/ui";
import { fontFamily } from "../kit/fonts";

const t = seq();
const CARD = chapterIntroBeats(t);
const CAM_BTN = t.add(DUR.beat);
const CUR_BTN = t.add(1.0);
const PRESS_BTN = t.add(0.45, 0.15);
const DRAWER_IN = t.add(1.0, -0.05);
const CAM_RESET1 = t.add(0.8, "<");
const PAGE_ZOOM = t.add(DUR.beat, 0.1);
const SAY1 = captionBeats(t);
const TYPE_DESC = t.add(2.0);
const CAM_TYPE = { start: TYPE_DESC.start - s2f(0.3), dur: TYPE_DESC.dur, end: TYPE_DESC.end };
const CUR_SEND = t.add(1.0);
const PRESS_SEND = t.add(0.6, 0.2);
const CAM_RESET2 = t.add(DUR.beat);
const TOAST_IN = t.add(DUR.beat, "<");
const LINE1 = t.add(DUR.beat, 0.2);
const STEP2_UP = t.add(DUR.micro, "<");
const STEP2_DOWN = t.add(DUR.micro);
t.hold(1);
const SAY2 = captionBeats(t);
const DRAWER_OUT = t.add(1.0, 0.25);
const LINE2 = t.add(DUR.beat);
const OLD_FLIP = t.add(DUR.micro, 0.1);
const NEW_FLIP = t.add(DUR.beat, -0.25);
t.hold(0.5);
const CAM_CARD = t.add(1.0, 0.1);
const IMG_FIX = t.add(1.0, -0.75);
const CAM_RESET3 = t.add(1.0, 0.2);
const FIX_TOAST = t.add(DUR.beat, -0.35);
t.hold(1);
export const SEGNALAZIONI_DURATION = t.total;

const P = {
  btn: { x: FRAME.x + FRAME.w - 150, y: FRAME.y + 30 },
  desc: { x: FRAME.x + FRAME.w - 250, y: FRAME.y + 330 },
  send: { x: FRAME.x + FRAME.w - 350, y: FRAME.y + 690 },
};
const SHOTS = [
  { at: CAM_BTN.end, from: CAM_BTN.start, ...shotOn(P.btn.x, P.btn.y, 1.4) },
  { at: CAM_RESET1.end, from: CAM_RESET1.start, x: 0, y: 0, scale: 1 },
  { at: CAM_TYPE.start + s2f(0.3), from: CAM_TYPE.start, ...shotOn(P.desc.x, P.desc.y, 1.22) },
  { at: CAM_RESET2.end, from: CAM_RESET2.start, x: 0, y: 0, scale: 1 },
  { at: CAM_CARD.end, from: CAM_CARD.start, ...shotOn(FRAME.x + 800, FRAME.y + 400, 1.3) },
  { at: CAM_RESET3.end, from: CAM_RESET3.start, x: 0, y: 0, scale: 1 },
];

const label = (fs = 12): React.CSSProperties => ({
  fontSize: fs,
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  color: C.muted,
  fontWeight: 600,
});

/** Tacca della timeline di stato nel toast. */
const StepDot: React.FC<{ kind: "done" | "active" | "flip"; frame: number }> = ({ kind, frame }) => {
  if (kind === "done")
    return (
      <div style={{ width: 24, height: 24, borderRadius: 999, backgroundColor: "#10b981", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>✓</div>
    );
  if (kind === "active") {
    const pulse = 1 + 0.2 * prog(frame, STEP2_UP, EASE_SNAP) * (1 - prog(frame, STEP2_DOWN, EASE_IN_SCENE));
    const on = prog(frame, LINE1, EASE_IN_SCENE);
    return (
      <div style={{ width: 24, height: 24, borderRadius: 999, backgroundColor: on > 0.6 ? C.accent : C.surface2, border: `1px solid ${on > 0.6 ? C.accent : C.border}`, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${pulse})` }}>
        <div style={{ width: 7, height: 7, borderRadius: 999, backgroundColor: on > 0.6 ? C.accentContrast : C.muted }} />
      </div>
    );
  }
  // flip amber → emerald ✓
  const outP = prog(frame, OLD_FLIP, EASE_OUT_SCENE);
  const inP = prog(frame, NEW_FLIP, EASE_SNAP);
  return (
    <div style={{ position: "relative", width: 24, height: 24, perspective: 400 }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: 999, backgroundColor: "#fef3c7", border: "1px solid #fcd34d", opacity: 1 - outP, transform: `rotateY(${90 * outP}deg)` }} />
      <div style={{ position: "absolute", inset: 0, borderRadius: 999, backgroundColor: "#10b981", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, opacity: inP, transform: `rotateY(${-90 * (1 - inP)}deg)` }}>✓</div>
    </div>
  );
};

export const Segnalazioni: React.FC = () => {
  const frame = useCurrentFrame();
  const drawerP = prog(frame, DRAWER_IN, EASE_IN_SCENE) * (1 - prog(frame, DRAWER_OUT, EASE_CAMERA));
  const bgDim = 1 - 0.45 * drawerP; // rackFocus dietro il drawer
  const toastP = prog(frame, TOAST_IN, EASE_SNAP);
  const fixToastP = prog(frame, FIX_TOAST, EASE_SNAP);
  const pageZoom = 1 + 0.06 * prog(frame, { start: PAGE_ZOOM.start, dur: Math.floor(PAGE_ZOOM.dur / 2), end: PAGE_ZOOM.start + Math.floor(PAGE_ZOOM.dur / 2) }, EASE_IN_SCENE) * (1 - prog(frame, { start: PAGE_ZOOM.start + Math.floor(PAGE_ZOOM.dur / 2), dur: Math.ceil(PAGE_ZOOM.dur / 2), end: PAGE_ZOOM.end }, EASE_CAMERA));

  return (
    <AbsoluteFill style={{ backgroundColor: C.background }}>
      <AbsoluteFill style={cameraAt(frame, SHOTS)}>
        <DeviceFrame>
          {/* SIDEBAR + MAIN, dimmerati dietro il drawer */}
          <div style={{ display: "flex", flex: 1, opacity: bgDim, transform: `scale(${1 - 0.015 * drawerP})` }}>
            <div style={{ width: 210, flexShrink: 0, borderRight: `1px solid ${C.border}`, backgroundColor: C.surface, padding: "22px 14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22, paddingLeft: 8 }}>
                <div style={{ width: 18, height: 18, borderRadius: 5, backgroundColor: C.accent }} />
                <span style={{ fontWeight: 600, fontSize: 16 }}>Dashboard</span>
              </div>
              {["Contenuti", "Prodotti", "Visite", "Ordini"].map((v, i) => (
                <div key={v} style={{ padding: "10px 14px", borderRadius: 10, fontSize: 15, color: i === 0 ? C.foreground : C.muted, backgroundColor: i === 0 ? C.accentSoft : undefined, fontWeight: i === 0 ? 600 : 400 }}>
                  {v}
                </div>
              ))}
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
              <div style={{ height: 56, display: "flex", alignItems: "center", gap: 10, padding: "0 24px", borderBottom: `1px solid ${C.border}`, backgroundColor: "rgba(255,255,255,0.8)" }}>
                <span style={{ width: 9, height: 9, borderRadius: 999, backgroundColor: "#34d399" }} />
                <span style={{ fontSize: 14, fontWeight: 600, color: C.muted }}>3 siti connessi</span>
                <div style={{ marginLeft: "auto", ...pressButton(frame, PRESS_BTN, 0.93) }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 7, backgroundColor: C.accentSoft, color: C.accentInk, borderRadius: 999, padding: "6px 16px", fontSize: 14, fontWeight: 600 }}>
                    ⚠ Segnala un problema
                  </span>
                </div>
              </div>
              <div style={{ flex: 1, padding: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", maxWidth: 1000 }}>
                  <span style={{ fontWeight: 600, fontSize: 18 }}>Contenuti del sito</span>
                  <span style={{ fontSize: 13, color: C.muted, fontFamily: "monospace" }}>gmsolar.it/dashboard/contenuti</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 16, maxWidth: 1000, marginTop: 16 }}>
                  <div style={{ border: `1px solid ${C.border}`, backgroundColor: C.surface, borderRadius: 12, padding: 14 }}>
                    <div style={label(11)}>Pagine del sito</div>
                    {["Hero homepage", "Chi siamo", "Impianti realizzati"].map((name, i) => (
                      <div key={name} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 8, marginTop: 8, backgroundColor: i === 0 ? C.accentSoft : undefined }}>
                        <span style={{ width: 52, height: 32, borderRadius: 6, backgroundColor: C.surface2, border: `1px solid ${C.border}` }} />
                        <span style={{ fontSize: 13, fontWeight: 600, flex: 1 }}>{name}</span>
                        <span style={{ backgroundColor: "#d1fae5", color: "#047857", borderRadius: 999, padding: "3px 10px", fontSize: 11, fontWeight: 600 }}>Pubblicata</span>
                      </div>
                    ))}
                  </div>
                  {/* editor con difetto */}
                  <div style={{ border: `1px solid ${C.border}`, backgroundColor: C.surface, borderRadius: 12, padding: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontWeight: 600, fontSize: 15 }}>Hero homepage</span>
                      <span style={{ fontSize: 12, color: C.muted }}>Ultima modifica: oggi</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 16, marginTop: 12 }}>
                      <div style={{ position: "relative", aspectRatio: "16/9", borderRadius: 10, overflow: "hidden", backgroundColor: C.surface2, border: `1px solid ${C.border}` }}>
                        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, color: C.muted }}>
                          <span style={{ fontSize: 22 }}>🖼̷</span>
                          <span style={{ fontSize: 12, fontWeight: 600 }}>Immagine non disponibile</span>
                        </div>
                        <div style={{ position: "absolute", inset: 0, ...maskReveal(frame, IMG_FIX, { dir: "l" }) }}>
                          <Img src={staticFile("assets/products/pannello-01.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <span style={{ backgroundColor: "rgba(255,255,255,0.85)", borderRadius: 8, padding: "4px 12px", fontSize: 12, fontWeight: 600 }}>impianto-2026.jpg</span>
                          </div>
                        </div>
                      </div>
                      <div style={{ display: "grid", gap: 10, alignContent: "start" }}>
                        <div>
                          <div style={label(11)}>Titolo</div>
                          <div style={{ border: `1px solid ${C.border}`, backgroundColor: C.surface2, borderRadius: 8, padding: "8px 12px", fontSize: 14, marginTop: 4 }}>Energia solare per la tua azienda</div>
                        </div>
                        <div>
                          <div style={label(11)}>Descrizione</div>
                          <div style={{ border: `1px solid ${C.border}`, backgroundColor: C.surface2, borderRadius: 8, padding: "8px 12px", fontSize: 13, color: C.muted, marginTop: 4, minHeight: 52 }}>
                            Impianti fotovoltaici e ricarica EV chiavi in mano, dal sopralluogo all'allaccio.
                          </div>
                        </div>
                        <div style={{ fontSize: 12, color: C.muted }}>Stato: <b>Pubblicata</b></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* DRAWER segnalazione */}
          {drawerP > 0.01 ? (
            <div style={{ position: "absolute", top: 0, bottom: 0, right: 0, width: 460, backgroundColor: C.surface, borderLeft: `1px solid ${C.border}`, boxShadow: SHADOW.lift, zIndex: 20, transform: `translateX(${(1 - drawerP) * 100}%)`, display: "flex", flexDirection: "column" }}>
              <div style={{ borderBottom: `1px solid ${C.border}`, padding: "20px 26px" }}>
                <div style={{ fontWeight: 600, fontSize: 19, letterSpacing: "-0.01em" }}>Segnala un problema</div>
                <div style={{ color: C.muted, fontSize: 14, marginTop: 4 }}>La pagina è già allegata: descrivi cosa non va</div>
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 22, padding: 26 }}>
                <div>
                  <div style={label()}>Pagina</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, border: `1px solid ${C.border}`, backgroundColor: C.surface2, borderRadius: 10, padding: "10px 12px", marginTop: 6, transform: `scale(${pageZoom})` }}>
                    <span style={{ fontFamily: "monospace", fontSize: 13, flex: 1 }}>gmsolar.it/dashboard/contenuti</span>
                    <span style={{ backgroundColor: C.accentSoft, color: C.accentInk, borderRadius: 999, padding: "3px 10px", fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" }}>Rilevata in automatico ✓</span>
                  </div>
                </div>
                <div>
                  <div style={label()}>Descrizione</div>
                  <div style={{ border: `1px solid ${C.border}`, backgroundColor: C.background, borderRadius: 10, padding: "12px 14px", marginTop: 6, minHeight: 84, overflow: "hidden" }}>
                    <span style={{ fontSize: 15, fontWeight: 500, whiteSpace: "nowrap", display: "inline-block", ...typeInset(frame, TYPE_DESC, 35) }}>
                      L'immagine della hero non si carica
                    </span>
                  </div>
                </div>
                <div style={{ marginTop: "auto", alignSelf: "flex-start", ...pressButton(frame, PRESS_SEND, 0.94) }}>
                  <span style={{ backgroundColor: C.accent, color: C.accentContrast, borderRadius: 10, padding: "11px 22px", fontSize: 15, fontWeight: 600 }}>Invia segnalazione</span>
                </div>
              </div>
            </div>
          ) : null}
        </DeviceFrame>
      </AbsoluteFill>

      {/* TOAST con timeline di stato (fuori camera, livello schermo) */}
      {toastP > 0.01 ? (
        <div style={{ position: "absolute", bottom: 46, left: "50%", width: 470, transform: `translateX(-50%) translateY(${60 * (1 - Math.min(1, toastP))}px)`, opacity: Math.min(1, toastP), backgroundColor: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, boxShadow: SHADOW.lift, padding: 18, zIndex: 50, fontFamily }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 999, backgroundColor: "#d1fae5", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>✓</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: C.foreground }}>Segnalazione ricevuta ✓</div>
              <div style={{ fontSize: 12.5, color: C.muted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>La richiesta sarà presa in carico · gmsolar.it/dashboard/contenuti</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14, justifyContent: "space-between", padding: "0 22px" }}>
            <StepDot kind="done" frame={frame} />
            <div style={{ flex: 1, height: 3, borderRadius: 999, backgroundColor: C.border, overflow: "hidden" }}>
              <div style={{ height: "100%", backgroundColor: C.accent, ...maskReveal(frame, LINE1, { dir: "l" }) }} />
            </div>
            <StepDot kind="active" frame={frame} />
            <div style={{ flex: 1, height: 3, borderRadius: 999, backgroundColor: C.border, overflow: "hidden" }}>
              <div style={{ height: "100%", backgroundColor: C.accent, ...maskReveal(frame, LINE2, { dir: "l" }) }} />
            </div>
            <StepDot kind="flip" frame={frame} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, ...label(11) }}>
            <span>Ricevuta</span>
            <span>In lavorazione</span>
            <span>Risolta</span>
          </div>
        </div>
      ) : null}

      {/* Toast fix pubblicato */}
      {fixToastP > 0.01 ? (
        <div style={{ position: "absolute", top: 40, left: "50%", transform: `translateX(-50%) translateY(${-28 * (1 - Math.min(1, fixToastP))}px)`, opacity: Math.min(1, fixToastP), display: "flex", alignItems: "center", gap: 10, backgroundColor: C.surface, border: `1px solid ${C.border}`, borderRadius: 999, boxShadow: SHADOW.lift, padding: "12px 24px", zIndex: 50, fontFamily }}>
          <span style={{ color: "#059669", fontSize: 16 }}>✓</span>
          <span style={{ fontSize: 15, fontWeight: 600, color: C.foreground }}>Fix pubblicato ✓</span>
        </div>
      ) : null}

      <Cursor
        moves={[
          { beat: CUR_BTN, ...P.btn, mode: "hand" },
          { beat: { ...TYPE_DESC, end: TYPE_DESC.start + s2f(0.3), dur: s2f(0.3) }, ...P.desc, mode: "text" },
          { beat: CUR_SEND, ...P.send, mode: "hand" },
        ]}
        hideAfter={PRESS_SEND}
      />

      <Caption beats={SAY1}>Il link della pagina si compila da solo.</Caption>
      <Caption beats={SAY2}>La segnalazione viene presa in carico e sistemata: tu vedi solo il risultato.</Caption>
      <ChapterCard title="Segnalazioni" subtitle="Qualcosa non va? Lo segnali da dove sei." beats={CARD} />
    </AbsoluteFill>
  );
};
