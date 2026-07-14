/**
 * SCENA 07 · Integrazioni (porting di ImmersiveIntegrazioni.tsx).
 * Carrellata di 18 loghi brand su 3 righe che scorrono in direzioni alternate,
 * con le tile che compaiono a ondata radiale. Culmina in un esempio concreto:
 * il cursore clicca WhatsApp e si apre una chat mock (notifica ricarica → risposta).
 * Camera: contro-pan → punch sulla tile → rack focus → push-in lento → pull-back.
 */
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C } from "../kit/tokens";
import { cameraAt, DUR, EASE_CAMERA_IN, EASE_CAMERA_OUT, EASE_IN_SCENE, EASE_SNAP, enter, hoverBloom, prog, s2f, seq, shotOn } from "../kit/motion";
import { Caption, captionBeats, ChapterCard, chapterIntroBeats, Cursor, StageBackdrop } from "../kit/ui";
import { fontFamily } from "../kit/fonts";
import {
  Airtable,
  Discord,
  Gmail,
  Googlecalendar,
  Googlesheets,
  Hubspot,
  Instagram,
  Mailchimp,
  Meta,
  Notion,
  Paypal,
  Shopify,
  Stripe,
  Telegram,
  Trello,
  Whatsapp,
  Woocommerce,
  Zapier,
  type BrandIcon,
} from "../kit/brandIcons";

// ── Timeline ─────────────────────────────────────────────────────────────────
const t = seq();
const CARD = chapterIntroBeats(t);
const PAN = t.add(2.5); // carrellata: righe scorrono + contro-pan camera
const TILES = { start: PAN.start + s2f(0.1), dur: s2f(0.6), end: PAN.start + s2f(0.7) }; // pop-in base
t.hold(0.5);
const PUNCH = t.add(DUR.beat); // camera punch sulla tile WhatsApp
const CUR_WA = t.add(1.0);
const PRESS_WA = t.add(0.45, 0.1);
// (E) cause→effect: lo spegnimento degli altri loghi NON deve partire insieme al
// press. Questo resta uno SPACER di timeline (avanza il cursore così CHAT_IN cade
// esatto a t≈237, INTEGRAZIONI_DURATION invariata), ma il dim visivo è agganciato a
// CHAT_IN — vedi `dimP` — così "gli altri si spengono" fa parte della REAZIONE al
// click (telefono che sale + wall in rack-focus), DOPO il press-dip.
t.add(DUR.beat, "<");
const CHAT_IN = t.add(DUR.beat, -0.1);
const SAY1 = captionBeats(t);
const MSG1 = t.add(DUR.beat, 0.5);
const TYPING_IN = t.add(DUR.micro, 0.35);
const TYPING_OUT = t.add(DUR.micro, 0.2);
const MSG2 = t.add(DUR.beat, -0.15);
const MSG3 = t.add(DUR.beat, 0.4);
const PUSH = t.add(2.0, "<"); // push-in lento durante la lettura
t.hold(1.0);
const CHAT_OUT = t.add(DUR.micro, 0.3);
const RESET = t.add(1.0, "<"); // pull-back sulla griglia piena
t.hold(0.6);
export const INTEGRAZIONI_DURATION = t.total;

// ── Layout carrellata ────────────────────────────────────────────────────────
const TILE = 120;
const GAP = 24;
const ROW_W = 6 * TILE + 5 * GAP; // 840
const ROW_X0 = (1920 - ROW_W) / 2; // 540
const WALL_H = 3 * TILE + 2 * GAP; // 408
const WALL_Y0 = (1080 - WALL_H) / 2; // 336
const rowDir = (i: number) => (i === 1 ? -1 : 1);
const tileLeft = (c: number) => ROW_X0 + c * (TILE + GAP);
const rowTop = (r: number) => WALL_Y0 + r * (TILE + GAP);
// WhatsApp: riga 1, colonna 2. A pan concluso la riga 1 è a xPercent +8 (=+8% di ROW_W).
const WA_POS = { x: tileLeft(2) + TILE / 2 + 0.08 * ROW_W, y: rowTop(1) + TILE / 2 };

const ROWS: BrandIcon[][] = [
  [Gmail, Stripe, Shopify, Googlesheets, Hubspot, Telegram],
  [Instagram, Meta, Whatsapp, Discord, Googlecalendar, Notion],
  [Trello, Airtable, Paypal, Woocommerce, Mailchimp, Zapier],
];

const SHOTS = [
  { at: PAN.end, from: PAN.start, x: -16, y: 0, scale: 1 }, // contro-pan lieve (traversata continua → EASE_CAMERA)
  { at: PUNCH.end, from: PUNCH.start, ...shotOn(WA_POS.x, WA_POS.y, 1.45), ease: EASE_CAMERA_IN }, // punch WhatsApp (D2.2: peso in ingresso)
  { at: PUSH.end, from: PUSH.start, ...shotOn(960, 540, 1.5), ease: EASE_CAMERA_IN }, // push-in lento sulla chat (D2.2)
  { at: RESET.end, from: RESET.start, x: 0, y: 0, scale: 1, ease: EASE_CAMERA_OUT }, // pull-back/reset (D2.2: rilascio deciso)
];

const CHAT = {
  name: "GM Solar",
  msg1: "⚡ Ricarica completata — 12,6 kWh · Colonnina Torino Nord",
  msg2: "Ricevuta n. 0421 disponibile nell'app.",
  reply: "Grazie! 👍",
  t1: "14:32",
  t2: "14:33",
};
// Palette REALE di WhatsApp: qui i colori dell'app sono corretti (è il punto — la
// schermata dev'essere riconoscibile a colpo d'occhio). L'accent lime resta solo nel
// bloom DIETRO la tile/telefono, mai dentro la UI di WhatsApp.
const WA = {
  header: "#075E54", // verde header dell'app (NON il verde dell'icona)
  bg: "#ECE5DD", // beige della chat
  inBubble: "#FFFFFF", // bolla in entrata (bianca)
  outBubble: "#DCF8C6", // bolla in uscita (verde chiaro)
  tick: "#4FC3F7", // doppia spunta blu (letto)
  send: "#128C7E", // bottone tondo invio/mic
  text: "#111B21", // testo scuro
  meta: "#667781", // timestamp grigio
  hint: "#8696A0", // placeholder + icone input
  bezel: "#0B1020", // cornice/notch del telefono (nera)
} as const;
// Telefono in ritratto, centrato a 960×540 (bersaglio del push-in). Altezza scelta
// perché resti INTERO nel frame anche al picco del push-in (scale 1.5 → H·scale/2 ≤ 540,
// cioè H ≤ 720): notch, header e input bar non vengono mai tagliati durante la lettura.
const PHONE_W = 356;
const PHONE_H = 712;

const Logo: React.FC<{ icon: BrandIcon; size: number; fill?: string }> = ({ icon, size, fill }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} aria-label={icon.title}>
    <path d={icon.path} fill={fill ?? `#${icon.hex}`} />
  </svg>
);

// ── Glifi della UI WhatsApp (SVG deterministici, nessun asset esterno) ────────
const IcBack: React.FC = () => (
  <svg width="11" height="19" viewBox="0 0 11 19" fill="none" aria-hidden>
    <path d="M9.5 1.5 2 9.5l7.5 8" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IcVideo: React.FC = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff" aria-hidden>
    <path d="M4 6.5A1.5 1.5 0 0 1 5.5 5h8A1.5 1.5 0 0 1 15 6.5v2.2l3.6-2.35c.4-.26.9.03.9.5v10.3c0 .47-.5.76-.9.5L15 15.3v2.2A1.5 1.5 0 0 1 13.5 19h-8A1.5 1.5 0 0 1 4 17.5v-11z" />
  </svg>
);
const IcCall: React.FC = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="#fff" aria-hidden>
    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
  </svg>
);
const IcMenu: React.FC = () => (
  <svg width="5" height="19" viewBox="0 0 5 19" fill="#fff" aria-hidden>
    <circle cx="2.5" cy="2.5" r="1.8" />
    <circle cx="2.5" cy="9.5" r="1.8" />
    <circle cx="2.5" cy="16.5" r="1.8" />
  </svg>
);
const IcMic: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff" aria-hidden>
    <path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3z" />
    <path d="M18 11a1 1 0 1 1 2 0 8 8 0 0 1-7 7.94V22a1 1 0 1 1-2 0v-3.06A8 8 0 0 1 4 11a1 1 0 1 1 2 0 6 6 0 0 0 12 0z" />
  </svg>
);
const IcSmile: React.FC = () => (
  <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke={WA.hint} strokeWidth="1.8" aria-hidden>
    <circle cx="12" cy="12" r="9.2" />
    <path d="M8.2 14.2c.9 1.2 2.2 1.9 3.8 1.9s2.9-.7 3.8-1.9" strokeLinecap="round" />
    <circle cx="9" cy="10" r="1.1" fill={WA.hint} stroke="none" />
    <circle cx="15" cy="10" r="1.1" fill={WA.hint} stroke="none" />
  </svg>
);
const IcClip: React.FC = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={WA.hint} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M20.5 11.5 12 20a5 5 0 0 1-7-7l8.6-8.6a3.2 3.2 0 0 1 4.6 4.6l-8.6 8.6a1.5 1.5 0 0 1-2.1-2.1l7.7-7.7" />
  </svg>
);
const IcCamera: React.FC = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={WA.hint} strokeWidth="1.8" aria-hidden>
    <path d="M4 8.5h2.6L8 6.5h8l1.4 2H20a1 1 0 0 1 1 1V18a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5a1 1 0 0 1 1-1z" strokeLinejoin="round" />
    <circle cx="12" cy="13" r="3.1" />
  </svg>
);
// Doppia spunta blu (letto) — l'elemento più riconoscibile della "risposta cliente".
const IcTicks: React.FC = () => (
  <svg width="17" height="11" viewBox="0 0 17 11" fill="none" aria-hidden>
    <path d="M1 6.2 3.6 8.8 8.5 2.5" stroke={WA.tick} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M5.6 6.2 8.2 8.8 15.6 1.4" stroke={WA.tick} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
// Barra di stato del telefono (rende reale il device): segnale, wifi, batteria.
const IcStatus: React.FC = () => (
  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
    <svg width="17" height="11" viewBox="0 0 17 11" fill="#fff" aria-hidden>
      <rect x="0" y="7" width="3" height="4" rx="0.5" />
      <rect x="4.5" y="5" width="3" height="6" rx="0.5" />
      <rect x="9" y="2.5" width="3" height="8.5" rx="0.5" />
      <rect x="13.5" y="0" width="3" height="11" rx="0.5" />
    </svg>
    <svg width="15" height="11" viewBox="0 0 15 11" fill="#fff" aria-hidden>
      <path d="M7.5 2C4.6 2 2 3.1 0 4.9l1.3 1.4C2.9 4.9 5.1 4 7.5 4s4.6.9 6.2 2.3L15 4.9C13 3.1 10.4 2 7.5 2z" opacity="0.85" />
      <path d="M7.5 5.6c-1.6 0-3.1.6-4.2 1.6l1.4 1.4c.8-.7 1.8-1.1 2.8-1.1s2 .4 2.8 1.1l1.4-1.4C10.6 6.2 9.1 5.6 7.5 5.6z" />
      <circle cx="7.5" cy="9.6" r="1.2" />
    </svg>
    <svg width="25" height="12" viewBox="0 0 25 12" fill="none" aria-hidden>
      <rect x="0.5" y="1" width="20" height="10" rx="2.6" stroke="#fff" strokeOpacity="0.7" />
      <rect x="2" y="2.5" width="15.5" height="7" rx="1.4" fill="#fff" />
      <rect x="22" y="4" width="2" height="4" rx="1" fill="#fff" />
    </svg>
  </span>
);
// Codini (tail) delle bolle: SVG pieni, deterministici, senza filtri.
const TailIn: React.FC = () => (
  <svg width="9" height="12" viewBox="0 0 9 12" style={{ position: "absolute", top: 0, left: -8 }} aria-hidden>
    <path d="M9 0 L9 12 L0 0 Z" fill={WA.inBubble} />
  </svg>
);
const TailOut: React.FC = () => (
  <svg width="9" height="12" viewBox="0 0 9 12" style={{ position: "absolute", top: 0, right: -8 }} aria-hidden>
    <path d="M0 0 L0 12 L9 0 Z" fill={WA.outBubble} />
  </svg>
);

export const Integrazioni: React.FC = () => {
  const frame = useCurrentFrame();
  const panP = interpolate(frame, [PAN.start, PAN.end], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // (E) — lo spegnimento/desaturazione degli altri loghi è la CONSEGUENZA del click:
  // parte con CHAT_IN (stesso beat del telefono che sale e del wall che va in
  // rack-focus), quindi DOPO il press-dip. Prima partiva al frame di PRESS_WA
  // (simultaneo alla pressione): rendeva l'effetto contemporaneo alla causa.
  const dimP = prog(frame, CHAT_IN, EASE_IN_SCENE);
  // D2.1 — rack-focus SIMMETRICO: sale all'apertura chat (CHAT_IN) e RITORNA a 0 alla
  // chiusura (CHAT_OUT). Fix del bug latente per cui il wall restava dimmato/soft dopo
  // la chiusura della chat (prima rackP non decadeva mai).
  const rackP = prog(frame, CHAT_IN, EASE_IN_SCENE) * (1 - prog(frame, CHAT_OUT, EASE_IN_SCENE));
  // D5.8 — bloom lime dietro la tile WhatsApp al punch camera; DECADE all'apertura chat.
  const bloomP = prog(frame, PUNCH, EASE_IN_SCENE) * (1 - prog(frame, CHAT_IN, EASE_IN_SCENE));
  // Progresso di APERTURA del telefono (riuso lo stesso beat CHAT_IN→CHAT_OUT che
  // pilotava la vecchia card): il device sale + scala all'apertura e riscende in
  // chiusura. chatP porta l'overshoot di EASE_SNAP (pop), openP lo clampa a 1 per
  // opacity/rise così non lampeggia oltre 1.
  const chatP = prog(frame, CHAT_IN, EASE_SNAP) * (1 - prog(frame, CHAT_OUT, EASE_IN_SCENE));
  const openP = Math.min(1, chatP);
  const typingP = prog(frame, TYPING_IN, EASE_IN_SCENE) * (1 - prog(frame, TYPING_OUT, EASE_IN_SCENE));

  // D2.1 — stile del WALL con DOF REALE: opacity soft + blur ≤10px HARD-GATED sotto
  // rackP<0.01 (niente layer blur(0): il blur è rasterizzato nei 10 sample del motion-blur).
  const wallStyle: React.CSSProperties = {
    opacity: 1 - 0.22 * rackP,
    transform: `scale(${1 - 0.015 * rackP})`,
    transformOrigin: "50% 50%",
  };
  if (rackP > 0.01) wallStyle.filter = `blur(${Math.min(10, 10 * rackP).toFixed(2)}px)`;

  return (
    <AbsoluteFill style={{ backgroundColor: C.background, fontFamily }}>
      {/* Set illuminato (D1.1): PRIMO figlio NON trasformato, FUORI dalla camera. */}
      <StageBackdrop />
      <AbsoluteFill style={cameraAt(frame, SHOTS, [PRESS_WA], [CHAT_IN])}>
        {/* D5.8 — bloom lime dietro la tile WhatsApp: LUCE (non pannello frosted) dietro un
            oggetto quasi bianco. Sibling DIETRO il wall, dentro la camera → scala col punch. */}
        {bloomP > 0.01 ? (
          <div
            aria-hidden
            style={{
              position: "absolute",
              left: WA_POS.x,
              top: WA_POS.y,
              width: 420,
              height: 420,
              marginLeft: -210,
              marginTop: -210,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(132,204,22,0.42) 0%, rgba(132,204,22,0) 68%)",
              opacity: bloomP,
              pointerEvents: "none",
            }}
          />
        ) : null}
        {/* WALL loghi (rack-focus DOF reale dietro la chat) */}
        <AbsoluteFill style={wallStyle}>
          {ROWS.map((row, r) => {
            const rowX = (8 * rowDir(r) - 16 * rowDir(r) * panP) / 100; // frazione della larghezza riga
            return (
              <div key={r} style={{ position: "absolute", left: ROW_X0, top: rowTop(r), width: ROW_W, display: "flex", gap: GAP, transform: `translateX(${rowX * ROW_W}px)` }}>
                {row.map((icon, c) => {
                  const isWA = icon === Whatsapp;
                  const delay = s2f(Math.hypot(r - 1, c - 2.5) * 0.06);
                  const b = { start: TILES.start + delay, dur: TILES.dur, end: TILES.end + delay };
                  const p = prog(frame, b, EASE_SNAP);
                  // float continuo (solo tile non-protagoniste), così il cursore resta esatto su WhatsApp
                  const bob = isWA ? 0 : 6 * Math.sin((frame / 96) * Math.PI * 2 + c * 0.5 + r * 0.3);
                  const op = (0.35 + 0.65 * p) * (isWA ? 1 : 1 - 0.55 * dimP);
                  // D5.6 — hoverBloom SOLO come boxShadow (anello lime telegrafo) sulla tile WA al
                  // press: NON tocca il transform → il cursore resta ESATTO sulla tile al click.
                  const hb = isWA ? hoverBloom(frame, PRESS_WA) : null;
                  const hbShadow = hb?.boxShadow;
                  const baseShadow = "0 1px 3px rgba(2,6,23,0.06)";
                  return (
                    <div
                      key={icon.title}
                      style={{
                        width: TILE,
                        height: TILE,
                        flexShrink: 0,
                        borderRadius: 22,
                        border: `1px solid ${C.border}`,
                        backgroundColor: C.surface,
                        boxShadow: hbShadow ? `${baseShadow}, ${hbShadow}` : baseShadow,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        opacity: Math.min(1, op),
                        transform: `translateY(${bob}px) scale(${0.6 + 0.4 * p})`,
                        // D5.8 — desatura il campo non-WA sulla stessa dim progress (WA resta a colori).
                        ...(!isWA && dimP > 0.01 ? { filter: `grayscale(${dimP.toFixed(3)})` } : {}),
                      }}
                    >
                      <Logo icon={icon} size={52} />
                    </div>
                  );
                })}
              </div>
            );
          })}
        </AbsoluteFill>

        {/* TELEFONO con schermata WhatsApp REALE (dentro la camera: scala col push-in).
            Si apre al click sulla tile riusando lo stesso beat CHAT_IN→CHAT_OUT. */}
        {chatP > 0.01 ? (
          <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", zIndex: 30, pointerEvents: "none" }}>
            <div
              style={{
                position: "relative",
                width: PHONE_W,
                height: PHONE_H,
                borderRadius: 46,
                border: `5px solid ${WA.bezel}`,
                backgroundColor: WA.bezel,
                boxShadow: "0 34px 80px -24px rgba(2,6,23,0.5), 0 14px 30px -14px rgba(2,6,23,0.32)",
                opacity: openP,
                transform: `translateY(${46 * (1 - openP)}px) scale(${0.84 + 0.16 * chatP})`,
                transformOrigin: "50% 50%",
              }}
            >
              {/* notch */}
              <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 122, height: 26, backgroundColor: WA.bezel, borderBottomLeftRadius: 16, borderBottomRightRadius: 16, zIndex: 30 }} />
              {/* schermo */}
              <div style={{ position: "absolute", inset: 0, borderRadius: 40, overflow: "hidden", backgroundColor: WA.bg, display: "flex", flexDirection: "column" }}>
                {/* HEADER verde WhatsApp */}
                <div style={{ position: "relative", backgroundColor: WA.header, boxShadow: "0 1px 4px rgba(0,0,0,0.28)", zIndex: 3 }}>
                  {/* barra di stato del telefono */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 18px 0" }}>
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: "#fff", letterSpacing: "0.02em" }}>9:41</span>
                    <IcStatus />
                  </div>
                  {/* riga contatto */}
                  <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "9px 13px 12px" }}>
                    <IcBack />
                    <span style={{ width: 40, height: 40, borderRadius: 999, backgroundColor: "#fff", color: WA.header, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 15 }}>GM</span>
                    <div style={{ flex: 1, lineHeight: 1.2, minWidth: 0 }}>
                      <div style={{ fontSize: 15.5, fontWeight: 600, color: "#fff" }}>{CHAT.name}</div>
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.75)" }}>online</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 16, paddingRight: 4 }}>
                      <IcVideo />
                      <IcCall />
                      <IcMenu />
                    </div>
                  </div>
                </div>

                {/* CORPO chat beige + faint doodle (pattern a puntini a bassissima alpha, niente filtri).
                    La conversazione è ancorata IN BASSO (justify-end), come nella vera WhatsApp:
                    lo spazio vuoto sta in alto, i messaggi poggiano sopra la input bar. */}
                <div style={{ flex: 1, position: "relative", backgroundColor: WA.bg, backgroundImage: "radial-gradient(rgba(11,20,26,0.028) 1px, transparent 1.6px)", backgroundSize: "22px 22px", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "12px 12px 10px" }}>
                    {/* pill data */}
                    <div style={{ alignSelf: "center", backgroundColor: "rgba(255,255,255,0.92)", color: WA.meta, fontSize: 11.5, fontWeight: 600, letterSpacing: "0.04em", padding: "4px 12px", borderRadius: 8, boxShadow: "0 1px 0.5px rgba(11,20,26,0.13)", marginBottom: 2 }}>OGGI</div>

                    {/* ① notifica in entrata (bolla bianca, tail top-left) */}
                    <div style={{ alignSelf: "flex-start", maxWidth: "82%", marginLeft: 8, ...enter(frame, MSG1, { y: 10 }) }}>
                      <div style={{ position: "relative", backgroundColor: WA.inBubble, borderRadius: 8, borderTopLeftRadius: 0, padding: "6px 9px 7px", boxShadow: "0 1px 0.5px rgba(11,20,26,0.13)" }}>
                        <TailIn />
                        <div style={{ fontSize: 14.5, lineHeight: 1.35, color: WA.text }}>{CHAT.msg1}</div>
                        <div style={{ fontSize: 11, color: WA.meta, textAlign: "right", marginTop: 2 }}>{CHAT.t1}</div>
                      </div>
                    </div>

                    {/* ② typing → seconda bolla (stessa cella) */}
                    <div style={{ position: "relative", alignSelf: "flex-start", maxWidth: "82%", marginLeft: 8, minHeight: 44 }}>
                      {typingP > 0.01 ? (
                        <div style={{ position: "absolute", top: 0, left: 0, backgroundColor: WA.inBubble, borderRadius: 8, borderTopLeftRadius: 0, padding: "12px 14px", boxShadow: "0 1px 0.5px rgba(11,20,26,0.13)", opacity: typingP }}>
                          <TailIn />
                          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                            {[0, 1, 2].map((i) => (
                              <span key={i} style={{ width: 7, height: 7, borderRadius: 999, backgroundColor: WA.hint, opacity: 0.35 + 0.55 * Math.abs(Math.sin(frame / 9 + i * 0.7)) }} />
                            ))}
                          </div>
                        </div>
                      ) : null}
                      <div style={{ position: "relative", backgroundColor: WA.inBubble, borderRadius: 8, borderTopLeftRadius: 0, padding: "6px 9px 7px", boxShadow: "0 1px 0.5px rgba(11,20,26,0.13)", ...enter(frame, MSG2, { y: 10 }) }}>
                        <TailIn />
                        <div style={{ fontSize: 14.5, lineHeight: 1.35, color: WA.text }}>{CHAT.msg2}</div>
                        <div style={{ fontSize: 11, color: WA.meta, textAlign: "right", marginTop: 2 }}>{CHAT.t1}</div>
                      </div>
                    </div>

                    {/* ③ risposta cliente (bolla verde chiaro, tail top-right, doppia spunta blu) */}
                    <div style={{ alignSelf: "flex-end", maxWidth: "82%", marginRight: 8, ...enter(frame, MSG3, { y: 10 }) }}>
                      <div style={{ position: "relative", backgroundColor: WA.outBubble, borderRadius: 8, borderTopRightRadius: 0, padding: "6px 9px 7px", boxShadow: "0 1px 0.5px rgba(11,20,26,0.13)" }}>
                        <TailOut />
                        <div style={{ display: "flex", alignItems: "flex-end", gap: 10 }}>
                          <div style={{ fontSize: 14.5, lineHeight: 1.35, color: WA.text }}>{CHAT.reply}</div>
                          <div style={{ display: "flex", alignItems: "center", gap: 3, marginLeft: "auto", paddingBottom: 1 }}>
                            <span style={{ fontSize: 11, color: WA.meta, whiteSpace: "nowrap" }}>{CHAT.t2}</span>
                            <IcTicks />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* INPUT bar (decorativa) */}
                <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 9px 10px", backgroundColor: "#F0F2F5" }}>
                  <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, backgroundColor: "#fff", borderRadius: 22, padding: "8px 12px", boxShadow: "0 1px 0.5px rgba(11,20,26,0.08)" }}>
                    <IcSmile />
                    <span style={{ flex: 1, fontSize: 14, color: WA.hint }}>Messaggio</span>
                    <IcClip />
                    <IcCamera />
                  </div>
                  <div style={{ width: 44, height: 44, borderRadius: 999, backgroundColor: WA.send, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 2px 6px rgba(18,140,126,0.42)" }}>
                    <IcMic />
                  </div>
                </div>
              </div>
            </div>
          </AbsoluteFill>
        ) : null}
      </AbsoluteFill>

      <Cursor
        shots={SHOTS}
        clicks={[PRESS_WA]}
        calms={[CHAT_IN]}
        moves={[{ beat: CUR_WA, ...WA_POS, mode: "hand" }]}
        hideAfter={{ start: CHAT_IN.start, dur: s2f(0.3), end: CHAT_IN.start + s2f(0.3) }}
      />

      <Caption beats={SAY1}>Per esempio: le notifiche ti arrivano su WhatsApp.</Caption>
      <ChapterCard title="Integrazioni" subtitle="Ci integriamo con i sistemi di tutti i giorni." beats={CARD} index={7} />
    </AbsoluteFill>
  );
};
