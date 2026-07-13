/**
 * SCENA 07 · Integrazioni (porting di ImmersiveIntegrazioni.tsx).
 * Carrellata di 18 loghi brand su 3 righe che scorrono in direzioni alternate,
 * con le tile che compaiono a ondata radiale. Culmina in un esempio concreto:
 * il cursore clicca WhatsApp e si apre una chat mock (notifica ricarica → risposta).
 * Camera: contro-pan → punch sulla tile → rack focus → push-in lento → pull-back.
 */
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, SHADOW } from "../kit/tokens";
import { cameraAt, DUR, EASE_IN_SCENE, EASE_SNAP, enter, prog, s2f, seq, shotOn } from "../kit/motion";
import { Caption, captionBeats, ChapterCard, chapterIntroBeats, Cursor } from "../kit/ui";
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
const DIM = t.add(DUR.beat, "<"); // gli altri loghi si spengono
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
  { at: PAN.end, from: PAN.start, x: -16, y: 0, scale: 1 }, // contro-pan lieve
  { at: PUNCH.end, from: PUNCH.start, ...shotOn(WA_POS.x, WA_POS.y, 1.45) }, // punch WhatsApp
  { at: PUSH.end, from: PUSH.start, ...shotOn(960, 540, 1.5) }, // push-in sulla chat (centrata)
  { at: RESET.end, from: RESET.start, x: 0, y: 0, scale: 1 }, // pull-back
];

const CHAT = {
  name: "GM Solar",
  msg1: "⚡ Ricarica completata — 12,6 kWh · Colonnina Torino Nord",
  msg2: "Ricevuta n. 0421 disponibile nell'app.",
  reply: "Grazie! 👍",
  t1: "14:32",
  t2: "14:33",
};
const WA_HEX = `#${Whatsapp.hex}`;

const Logo: React.FC<{ icon: BrandIcon; size: number; fill?: string }> = ({ icon, size, fill }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} aria-label={icon.title}>
    <path d={icon.path} fill={fill ?? `#${icon.hex}`} />
  </svg>
);

export const Integrazioni: React.FC = () => {
  const frame = useCurrentFrame();
  const panP = interpolate(frame, [PAN.start, PAN.end], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const dimP = prog(frame, DIM, EASE_IN_SCENE);
  const rackP = prog(frame, CHAT_IN, EASE_IN_SCENE); // il wall dietro perde fuoco all'apertura chat
  const chatP = prog(frame, CHAT_IN, EASE_SNAP) * (1 - prog(frame, CHAT_OUT, EASE_IN_SCENE));
  const typingP = prog(frame, TYPING_IN, EASE_IN_SCENE) * (1 - prog(frame, TYPING_OUT, EASE_IN_SCENE));

  return (
    <AbsoluteFill style={{ backgroundColor: C.background, fontFamily }}>
      <AbsoluteFill style={cameraAt(frame, SHOTS, [PRESS_WA])}>
        {/* WALL loghi (rack-focus dietro la chat) */}
        <AbsoluteFill style={{ opacity: 1 - 0.45 * rackP, transform: `scale(${1 - 0.015 * rackP})`, transformOrigin: "50% 50%" }}>
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
                  return (
                    <div key={icon.title} style={{ width: TILE, height: TILE, flexShrink: 0, borderRadius: 22, border: `1px solid ${C.border}`, backgroundColor: C.surface, boxShadow: "0 1px 3px rgba(2,6,23,0.06)", display: "flex", alignItems: "center", justifyContent: "center", opacity: Math.min(1, op), transform: `translateY(${bob}px) scale(${0.6 + 0.4 * p})` }}>
                      <Logo icon={icon} size={52} />
                    </div>
                  );
                })}
              </div>
            );
          })}
        </AbsoluteFill>

        {/* CHAT WhatsApp (dentro la camera: scala col push-in) */}
        {chatP > 0.01 ? (
          <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", zIndex: 30, pointerEvents: "none" }}>
            <div style={{ width: 440, borderRadius: 20, overflow: "hidden", border: `1px solid ${C.border}`, backgroundColor: C.background, boxShadow: SHADOW.lift, opacity: Math.min(1, chatP), transform: `translateY(${14 * (1 - Math.min(1, chatP))}px)` }}>
              {/* header verde brand */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", backgroundColor: WA_HEX }}>
                <span style={{ width: 38, height: 38, borderRadius: 999, backgroundColor: "#fff", color: WA_HEX, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 15 }}>GM</span>
                <div style={{ lineHeight: 1.2 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "#fff" }}>{CHAT.name}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)" }}>online</div>
                </div>
                <div style={{ marginLeft: "auto" }}><Logo icon={Whatsapp} size={22} fill="#fff" /></div>
              </div>
              {/* corpo */}
              <div style={{ backgroundColor: C.surface2, display: "flex", flexDirection: "column", gap: 8, padding: "16px 14px" }}>
                {/* ① notifica in entrata */}
                <div style={{ maxWidth: "85%", alignSelf: "flex-start", borderRadius: "14px 14px 14px 4px", border: `1px solid ${C.border}`, backgroundColor: C.surface, padding: "9px 12px", boxShadow: "0 1px 2px rgba(2,6,23,0.05)", ...enter(frame, MSG1, { y: 10 }) }}>
                  <div style={{ fontSize: 14, color: C.foreground }}>{CHAT.msg1}</div>
                  <div style={{ fontSize: 11.5, color: C.muted, textAlign: "right", marginTop: 4 }}>{CHAT.t1}</div>
                </div>
                {/* ② typing → seconda bolla (stessa cella) */}
                <div style={{ position: "relative", maxWidth: "85%", alignSelf: "flex-start", minHeight: 40 }}>
                  {typingP > 0.01 ? (
                    <div style={{ position: "absolute", top: 0, left: 0, display: "flex", alignItems: "center", gap: 5, borderRadius: "14px 14px 14px 4px", border: `1px solid ${C.border}`, backgroundColor: C.surface, padding: "12px 14px", opacity: typingP }}>
                      {[0, 1, 2].map((i) => (
                        <span key={i} style={{ width: 6, height: 6, borderRadius: 999, backgroundColor: C.muted, opacity: 0.4 + 0.6 * Math.abs(Math.sin((frame / 9) + i * 0.7)) }} />
                      ))}
                    </div>
                  ) : null}
                  <div style={{ borderRadius: "14px 14px 14px 4px", border: `1px solid ${C.border}`, backgroundColor: C.surface, padding: "9px 12px", boxShadow: "0 1px 2px rgba(2,6,23,0.05)", ...enter(frame, MSG2, { y: 10 }) }}>
                    <div style={{ fontSize: 14, color: C.foreground }}>{CHAT.msg2}</div>
                    <div style={{ fontSize: 11.5, color: C.muted, textAlign: "right", marginTop: 4 }}>{CHAT.t1}</div>
                  </div>
                </div>
                {/* ③ risposta cliente */}
                <div style={{ maxWidth: "85%", alignSelf: "flex-end", borderRadius: "14px 14px 4px 14px", padding: "9px 12px", boxShadow: "0 1px 2px rgba(2,6,23,0.05)", backgroundColor: `${WA_HEX}26`, ...enter(frame, MSG3, { y: 10 }) }}>
                  <div style={{ fontSize: 14, color: C.foreground }}>{CHAT.reply}</div>
                  <div style={{ fontSize: 11.5, color: C.muted, marginTop: 4, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4 }}>
                    {CHAT.t2}
                    <span style={{ color: WA_HEX }}>✓✓</span>
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
        moves={[{ beat: CUR_WA, ...WA_POS, mode: "hand" }]}
        hideAfter={{ start: CHAT_IN.start, dur: s2f(0.3), end: CHAT_IN.start + s2f(0.3) }}
      />

      <Caption beats={SAY1}>Per esempio: le notifiche ti arrivano su WhatsApp.</Caption>
      <ChapterCard title="Integrazioni" subtitle="Ci integriamo con i sistemi di tutti i giorni." beats={CARD} />
    </AbsoluteFill>
  );
};
