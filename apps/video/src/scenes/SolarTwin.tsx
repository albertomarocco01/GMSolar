/**
 * SCENA 01 · Siti vetrina (porting di SolarTwinScene.tsx).
 * Fake browser con hero video solare: title card → cue di scroll → il video
 * scorre → si APRE IN DUE sulle card 3D di servizio (bordo elettrico sulla
 * centrale) → slide orizzontale verso il "Chi siamo" (marquee + stats) →
 * velo bianco d'uscita.
 */
import React from "react";
import { AbsoluteFill, Freeze, Img, OffthreadVideo, staticFile, useCurrentFrame } from "remotion";
import { C, SHADOW } from "../kit/tokens";
import {
  DUR,
  EASE_CAMERA,
  EASE_IN_SCENE,
  EASE_OUT_SCENE,
  EASE_SNAP,
  maskReveal,
  prog,
  s2f,
  seq,
  val,
} from "../kit/motion";
import { ChapterCard, chapterIntroBeats, DotsTexture } from "../kit/ui";
import { fontFamily } from "../kit/fonts";

// ── Timeline della scena (secondi → frame, costruita una volta) ──────────────
const t = seq();
t.add(1.15); // delay iniziale della title card (come introTl web)
const CARD = chapterIntroBeats(t, 2.4); // hold lungo: è l'apertura del film
const DEMO = t.add(2.8); // micro-demo del cue (dot su e giù)
const CUE_FADE = t.add(0.3);
const VIDEO = t.add(10); // il video solare scorre per intero (10s)
const SPLIT = t.add(1.2, 0.35); // le due metà si aprono
const KICKER = t.add(0.4, -0.8);
const CARDS_TITLE = t.add(0.6, -0.3);
const CARD_L = t.add(0.8, -0.1);
const CARD_C = t.add(0.8, -0.45);
const CARD_R = t.add(0.8, -0.45);
const FLOAT = t.add(1.6);
const SLIDE = t.add(1.5); // pan orizzontale verso il Chi siamo
const AB_KICKER = t.add(0.5);
const AB_COPY = t.add(0.6, -0.1);
const AB_STATS = t.add(0.6, -0.1);
t.hold(2.5);
const EXIT_VEIL = t.add(0.8);
t.hold(0.1);
export const SOLAR_DURATION = t.total;
const MARQUEE = { start: SLIDE.start, end: EXIT_VEIL.end }; // drift continuo

// Frame VIDEO-LOCALE dell'ultimo fotogramma (clip 10s = 300f): usato dai Freeze
// che avvolgono un OffthreadVideo NUDO (senza Sequence → frame comp = frame media).
const VIDEO_LAST = VIDEO.dur - 1;

// ── Dati (identici alla scena web) ───────────────────────────────────────────
const SERVIZI = [
  {
    img: "assets/products/pannello-01.jpg",
    kind: "Fotovoltaico",
    title: "Impianti chiavi in mano",
    desc: "Progettazione, posa e collaudo.",
  },
  {
    img: "assets/products/wallbox-detail.jpg",
    kind: "Ricarica EV",
    title: "Wallbox & carico dinamico",
    desc: "L'energia del tetto, fino all'auto.",
  },
  {
    img: "assets/products/cavo-03.jpg",
    kind: "Accessori",
    title: "Cavi e ricarica smart",
    desc: "Modo 3, monofase e trifase.",
  },
];
const STATS = [
  ["15+", "anni di esperienza"],
  ["800+", "impianti realizzati"],
  ["6 MW", "di potenza installata"],
];

// ── ElectricBorder (porting canvas → SVG deterministico sul frame) ───────────
const frac = (n: number) => n - Math.floor(n);
const hash = (n: number) => frac(Math.sin(n) * 43758.5453123);
function vnoise(x: number) {
  const i = Math.floor(x);
  const f = x - i;
  const u = f * f * (3 - 2 * f);
  return hash(i) * (1 - u) + hash(i + 1) * u;
}
function fbm(x: number) {
  let v = 0;
  let amp = 0.5;
  let freq = 1;
  for (let o = 0; o < 3; o++) {
    v += amp * vnoise(x * freq);
    amp *= 0.5;
    freq *= 2;
  }
  return v;
}
/** Campiona il perimetro del rounded-rect (4 lati + 4 archi) con normali esterne. */
function perimeter(w: number, h: number, r: number, count: number) {
  const pts: { x: number; y: number; nx: number; ny: number }[] = [];
  const straight = [w - 2 * r, h - 2 * r, w - 2 * r, h - 2 * r];
  const arc = (Math.PI / 2) * r;
  const total = straight[0] + straight[1] + straight[2] + straight[3] + 4 * arc;
  for (let i = 0; i < count; i++) {
    let d = (i / count) * total;
    // top edge → arco tr → right → arco br → bottom → arco bl → left → arco tl
    if (d < straight[0]) {
      pts.push({ x: r + d, y: 0, nx: 0, ny: -1 });
      continue;
    }
    d -= straight[0];
    if (d < arc) {
      const a = -Math.PI / 2 + (d / arc) * (Math.PI / 2);
      pts.push({ x: w - r + Math.cos(a) * r, y: r + Math.sin(a) * r, nx: Math.cos(a), ny: Math.sin(a) });
      continue;
    }
    d -= arc;
    if (d < straight[1]) {
      pts.push({ x: w, y: r + d, nx: 1, ny: 0 });
      continue;
    }
    d -= straight[1];
    if (d < arc) {
      const a = (d / arc) * (Math.PI / 2);
      pts.push({ x: w - r + Math.cos(a) * r, y: h - r + Math.sin(a) * r, nx: Math.cos(a), ny: Math.sin(a) });
      continue;
    }
    d -= arc;
    if (d < straight[2]) {
      pts.push({ x: w - r - d, y: h, nx: 0, ny: 1 });
      continue;
    }
    d -= straight[2];
    if (d < arc) {
      const a = Math.PI / 2 + (d / arc) * (Math.PI / 2);
      pts.push({ x: r + Math.cos(a) * r, y: h - r + Math.sin(a) * r, nx: Math.cos(a), ny: Math.sin(a) });
      continue;
    }
    d -= arc;
    if (d < straight[3]) {
      pts.push({ x: 0, y: h - r - d, nx: -1, ny: 0 });
      continue;
    }
    d -= straight[3];
    const a = Math.PI + (d / arc) * (Math.PI / 2);
    pts.push({ x: r + Math.cos(a) * r, y: r + Math.sin(a) * r, nx: Math.cos(a), ny: Math.sin(a) });
  }
  return pts;
}

export const ElectricBorder: React.FC<{
  width: number;
  height: number;
  radius?: number;
  children: React.ReactNode;
}> = ({ width, height, radius = 16, children }) => {
  const frame = useCurrentFrame();
  const time = (frame / 30) * 1.4;
  const margin = 12;
  const count = Math.max(48, Math.round((2 * (width + height)) / 7));
  const pts = perimeter(width, height, radius, count);
  const amp = 3;
  const d =
    pts
      .map((p, i) => {
        const disp = (fbm(i * 0.35 + time) - 0.44) * amp;
        return `${i === 0 ? "M" : "L"}${(p.x + p.nx * disp + margin).toFixed(1)},${(p.y + p.ny * disp + margin).toFixed(1)}`;
      })
      .join(" ") + " Z";
  return (
    <div style={{ position: "relative", width, height, borderRadius: radius }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: radius, boxShadow: "0 0 34px -6px rgba(132,204,22,0.55), 0 0 12px -4px rgba(132,204,22,0.7)" }} />
      <div style={{ position: "absolute", inset: 0, borderRadius: radius, boxShadow: "0 0 8px -2px rgba(132,204,22,0.8), 0 0 3px -1px rgba(132,204,22,0.9)" }} />
      <svg
        width={width + margin * 2}
        height={height + margin * 2}
        style={{ position: "absolute", top: -margin, left: -margin, zIndex: 2, pointerEvents: "none" }}
      >
        <path d={d} fill="none" stroke={C.accent} strokeWidth={4.9} strokeOpacity={0.16} strokeLinejoin="round" />
        <path d={d} fill="none" stroke={C.accent} strokeWidth={1.4} strokeLinejoin="round" />
        <path d={d} fill="none" stroke="#f2ffe8" strokeWidth={0.7} strokeOpacity={0.85} strokeLinejoin="round" />
      </svg>
      <div style={{ position: "relative", zIndex: 1, height: "100%" }}>{children}</div>
    </div>
  );
};

// ── Sottocomponenti del fake site ────────────────────────────────────────────
const BrowserBar: React.FC = () => (
  <div
    style={{
      height: 52,
      backgroundColor: C.surface,
      borderBottom: `1px solid ${C.border}`,
      display: "flex",
      alignItems: "center",
      padding: "0 20px",
      gap: 8,
      flexShrink: 0,
    }}
  >
    {[0, 1, 2].map((i) => (
      <div key={i} style={{ width: 13, height: 13, borderRadius: 999, backgroundColor: C.border }} />
    ))}
    <div
      style={{
        margin: "0 auto",
        backgroundColor: C.background,
        border: `1px solid ${C.border}`,
        color: C.muted,
        fontSize: 15,
        fontFamily,
        borderRadius: 999,
        padding: "4px 22px",
      }}
    >
      gmsolar.it
    </div>
    <div style={{ width: 60 }} />
  </div>
);

const SiteHeader: React.FC = () => (
  <div
    style={{
      height: 72,
      backgroundColor: "rgba(255,255,255,0.92)",
      borderBottom: `1px solid ${C.border}`,
      display: "flex",
      alignItems: "center",
      padding: "0 28px",
      gap: 24,
      zIndex: 30,
      position: "relative",
      flexShrink: 0,
      fontFamily,
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 999,
          border: `2.5px solid ${C.accent}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ width: 12, height: 12, borderRadius: 999, backgroundColor: C.accent }} />
      </div>
      <div>
        <div style={{ fontWeight: 800, fontSize: 19, color: C.foreground, letterSpacing: "-0.01em" }}>GM SOLAR</div>
        <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.18em", color: C.accentInk }}>
          Energie Rinnovabili
        </div>
      </div>
    </div>
    <div style={{ marginLeft: "auto", display: "flex", gap: 26, fontSize: 16, color: C.muted }}>
      {["Home", "Chi Siamo", "Tipologia di Impianti", "Servizi", "Gallery", "Privacy"].map((v, i) => (
        <span key={v} style={i === 0 ? { color: C.foreground, fontWeight: 600 } : undefined}>
          {v}
        </span>
      ))}
    </div>
    <div
      style={{
        backgroundColor: C.accent,
        color: C.accentContrast,
        borderRadius: 999,
        padding: "8px 24px",
        fontSize: 16,
        fontWeight: 600,
      }}
    >
      Contattaci
    </div>
  </div>
);

const ServiceCard: React.FC<{ s: (typeof SERVIZI)[number] }> = ({ s }) => (
  <div
    style={{
      width: 290,
      borderRadius: 16,
      border: "1px solid rgba(255,255,255,0.1)",
      backgroundColor: "#0e1524",
      boxShadow: SHADOW.lift,
      overflow: "hidden",
      fontFamily,
    }}
  >
    <Img src={staticFile(s.img)} style={{ width: "100%", aspectRatio: "1 / 1", objectFit: "cover", display: "block" }} />
    <div style={{ padding: "16px 18px 20px" }}>
      <div style={{ color: C.accent, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.18em" }}>{s.kind}</div>
      <div style={{ color: "#fff", fontWeight: 700, fontSize: 20, marginTop: 6 }}>{s.title}</div>
      <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, marginTop: 4 }}>{s.desc}</div>
    </div>
  </div>
);

const Chevron: React.FC<{ up?: boolean; opacity: number }> = ({ up, opacity }) => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" style={{ opacity }}>
    <path d={up ? "m6 15 6-6 6 6" : "m6 9 6 6 6-6"} />
  </svg>
);

// ── Scena ────────────────────────────────────────────────────────────────────
export const SolarTwin: React.FC = () => {
  const frame = useCurrentFrame();

  // demo del cue: un ciclo su/giù del dot (yoyo sinusoidale)
  const demoU = prog(frame, DEMO, (x) => x);
  const dotY = 0.5 - 0.5 * Math.cos(2 * Math.PI * demoU); // 0→1→0
  const goingDown = Math.sin(2 * Math.PI * demoU) >= 0;
  const cueAlpha = 1 - prog(frame, CUE_FADE, EASE_OUT_SCENE);

  // split: metà video che si aprono
  const splitP = prog(frame, SPLIT, EASE_CAMERA);
  // slide del binario verso il Chi siamo
  const slideP = prog(frame, SLIDE, EASE_CAMERA);
  // float delle card nel hold
  const floatP = prog(frame, FLOAT, (x) => x);
  // marquee drift lineare
  const marq = prog(frame, { start: MARQUEE.start, dur: MARQUEE.end - MARQUEE.start, end: MARQUEE.end }, (x) => x);

  const card3d = (beat: typeof CARD_L, restY: number, baseRotY: number, slideRotY: number, z: number) => {
    const p = prog(frame, beat, EASE_IN_SCENE);
    const y = val(frame, beat, 90, 0) + restY * floatP;
    const rotX = val(frame, beat, 16, 0);
    const zNow = -180 + (z + 180) * p;
    const rotY = baseRotY + (slideRotY - baseRotY) * slideP;
    return {
      opacity: p,
      transform: `perspective(1100px) translateY(${y}px) translateZ(${zNow}px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(${0.92 + 0.08 * p})`,
      transformOrigin: "50% 60%",
    } as React.CSSProperties;
  };

  const veilP = prog(frame, EXIT_VEIL, EASE_OUT_SCENE);
  const progressBar = Math.min(1, frame / SOLAR_DURATION);

  // Frame VIDEO-LOCALE dello scrub eased: 0 prima di VIDEO, rampa power1.inOut
  // dentro VIDEO (da fermo → accelera → decelera), ultimo frame dopo.
  const videoFrame =
    frame < VIDEO.start
      ? 0
      : frame >= VIDEO.end
        ? VIDEO_LAST
        : Math.round(prog(frame, VIDEO, EASE_CAMERA) * VIDEO_LAST);

  return (
    <AbsoluteFill style={{ backgroundColor: C.background, alignItems: "center", justifyContent: "center" }}>
      {/* Device frame 16:10 */}
      <div
        style={{
          width: 1400,
          aspectRatio: "16 / 10",
          borderRadius: 16,
          border: `1px solid ${C.border}`,
          boxShadow: SHADOW.lift,
          backgroundColor: C.background,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <BrowserBar />
        <SiteHeader />
        {/* HERO */}
        <div style={{ flex: 1, position: "relative", overflow: "hidden", color: "#fff" }}>
          {/* fallback gradient */}
          <AbsoluteFill style={{ background: "linear-gradient(135deg, #0b1020, #13210a, #0b1020)", zIndex: -2 }} />
          {/* Video SCRUBBATO con ease (come l'AutoScroll web: parte da fermo,
              accelera, decelera): niente stacco statico→movimento. Prima di
              VIDEO è al frame 0; dentro VIDEO segue la rampa eased; dopo TIENE
              l'ultimo frame (copre lo split, niente flash del gradiente). */}
          <AbsoluteFill style={{ zIndex: 0 }}>
            <Freeze frame={videoFrame}>
              <OffthreadVideo muted src={staticFile("assets/solar-twin.mp4")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </Freeze>
          </AbsoluteFill>
          <AbsoluteFill style={{ backgroundColor: "rgba(0,0,0,0.2)", zIndex: 1 }} />
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "33%", background: "linear-gradient(to top, rgba(0,0,0,0.45), transparent)", zIndex: 1 }} />

          {/* TRACK orizzontale: servizi + chi siamo (visibile dallo split in poi) */}
          {frame >= SPLIT.start - 2 ? (
            <div
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 10,
                display: "flex",
                width: "200%",
                transform: `translateX(${-50 * slideP}%)`,
              }}
            >
              {/* Panel 1 · I nostri servizi */}
              <div style={{ width: "50%", position: "relative", backgroundColor: C.background, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 26 }}>
                <DotsTexture />
                <div style={{ textAlign: "center", position: "relative" }}>
                  <div style={{ ...{ opacity: prog(frame, KICKER, EASE_IN_SCENE), transform: `translateY(${val(frame, KICKER, 16, 0)}px)` }, color: C.accentInk, fontSize: 14, textTransform: "uppercase", letterSpacing: "0.22em", fontFamily }}>
                    I nostri servizi
                  </div>
                  <div style={{ ...maskReveal(frame, CARDS_TITLE, { dir: "l" }), color: C.foreground, fontFamily, fontWeight: 700, fontSize: 44, letterSpacing: "-0.02em", marginTop: 8 }}>
                    Dal tetto alla ricarica.
                  </div>
                </div>
                <div style={{ display: "flex", gap: 28, perspective: 1100, position: "relative" }}>
                  <div style={card3d(CARD_L, -8, 10, 24, -26)}>
                    <ServiceCard s={SERVIZI[0]} />
                  </div>
                  <div style={card3d(CARD_C, -14, 0, 14, 0)}>
                    <ElectricBorder width={290} height={430} radius={16}>
                      <ServiceCard s={SERVIZI[1]} />
                    </ElectricBorder>
                  </div>
                  <div style={card3d(CARD_R, -8, -10, 4, -26)}>
                    <ServiceCard s={SERVIZI[2]} />
                  </div>
                </div>
              </div>
              {/* Panel 2 · Chi siamo */}
              <div style={{ width: "50%", position: "relative", backgroundColor: C.background, display: "flex", flexDirection: "column", justifyContent: "center", gap: 28, overflow: "hidden", color: C.foreground }}>
                <div style={{ opacity: prog(frame, AB_KICKER, EASE_IN_SCENE), transform: `translateY(${val(frame, AB_KICKER, 16, 0)}px)`, color: C.accentInk, fontSize: 14, textTransform: "uppercase", letterSpacing: "0.22em", padding: "0 56px", fontFamily }}>
                  Chi siamo
                </div>
                <div style={{ whiteSpace: "nowrap", fontFamily, fontWeight: 700, fontSize: 74, textTransform: "uppercase", letterSpacing: "-0.02em", transform: `translateX(${-6 - 20 * marq}%)` }}>
                  {"Energia pulita · Dal sole alla casa · ".repeat(3)}
                </div>
                <div
                  style={{
                    whiteSpace: "nowrap",
                    fontFamily,
                    fontWeight: 700,
                    fontSize: 74,
                    textTransform: "uppercase",
                    letterSpacing: "-0.02em",
                    color: "transparent",
                    WebkitTextStroke: "1.5px rgba(11,16,32,0.32)",
                    transform: `translateX(${-26 + 20 * marq}%)`,
                  }}
                >
                  {"Progettiamo · Installiamo · Monitoriamo · ".repeat(3)}
                </div>
                <div style={{ opacity: prog(frame, AB_COPY, EASE_IN_SCENE), transform: `translateY(${val(frame, AB_COPY, 22, 0)}px)`, color: C.muted, fontSize: 20, maxWidth: 680, padding: "0 56px", fontFamily }}>
                  Dal 2008 progettiamo e installiamo impianti fotovoltaici e sistemi di ricarica: un solo interlocutore, dal
                  sopralluogo al collaudo.
                </div>
                <div style={{ display: "flex", gap: 64, padding: "0 56px" }}>
                  {STATS.map(([n, l], i) => {
                    const b = { start: AB_STATS.start + s2f(0.2) * i, dur: AB_STATS.dur, end: AB_STATS.end + s2f(0.2) * i };
                    return (
                      <div key={l} style={{ opacity: prog(frame, b, EASE_IN_SCENE), transform: `translateY(${val(frame, b, 18, 0)}px)` }}>
                        <div style={{ fontFamily, fontWeight: 700, fontSize: 40, color: C.foreground }}>{n}</div>
                        <div style={{ fontFamily, fontSize: 14, color: C.muted }}>{l}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : null}

          {/* SPLIT: le due metà (ultimo frame video) che si aprono */}
          {frame >= SPLIT.start - 2 && splitP < 1 ? (
            <>
              {(["l", "r"] as const).map((side) => (
                <div
                  key={side}
                  style={{
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    [side === "l" ? "left" : "right"]: 0,
                    width: "50%",
                    overflow: "hidden",
                    zIndex: 20,
                    transform: `translateX(${(side === "l" ? -101 : 101) * splitP}%)`,
                  }}
                >
                  <div style={{ position: "absolute", top: 0, bottom: 0, width: "200%", [side === "l" ? "left" : "right"]: 0, backgroundColor: "#0b1020" }}>
                    <Freeze frame={VIDEO_LAST}>
                      <OffthreadVideo muted src={staticFile("assets/solar-twin.mp4")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </Freeze>
                  </div>
                </div>
              ))}
            </>
          ) : null}

          {/* Scroll cue */}
          {cueAlpha > 0 && frame > CARD.out.start ? (
            <div style={{ position: "absolute", bottom: 28, left: 28, zIndex: 30, opacity: cueAlpha, display: "flex", flexDirection: "column", alignItems: "center", gap: 7 }}>
              <div style={{ color: "#fff", fontFamily, fontSize: 15, fontWeight: 500, letterSpacing: "0.25em", textTransform: "uppercase", textShadow: "0 2px 12px rgba(0,0,0,0.6)" }}>
                Scorri su e giù
              </div>
              <Chevron up opacity={frame >= DEMO.start && frame < DEMO.end && !goingDown ? 1 : 0.7} />
              <div style={{ position: "relative", height: 62, width: 36, borderRadius: 999, border: "2px solid rgba(255,255,255,0.7)" }}>
                <div
                  style={{
                    position: "absolute",
                    top: 9,
                    left: "50%",
                    width: 9,
                    height: 9,
                    borderRadius: 999,
                    backgroundColor: C.accent,
                    transform: `translateX(-50%) translateY(${dotY * 22}px)`,
                  }}
                />
              </div>
              <Chevron opacity={frame >= DEMO.start && frame < DEMO.end && goingDown ? 1 : 0.7} />
            </div>
          ) : null}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 4, backgroundColor: C.border, zIndex: 30 }}>
        <div style={{ height: "100%", width: "100%", backgroundColor: C.accent, transformOrigin: "left", transform: `scaleX(${progressBar})`, boxShadow: "0 0 14px 2px rgba(132,204,22,0.55)" }} />
      </div>

      {/* Title card di capitolo */}
      <ChapterCard title="Siti vetrina" subtitle="Con una forte narrativa, costruita tramite scrollytelling video." beats={CARD} lift={-48} />

      {/* Velo bianco d'uscita */}
      {veilP > 0 ? <AbsoluteFill style={{ backgroundColor: C.background, opacity: veilP, zIndex: 55 }} /> : null}
    </AbsoluteFill>
  );
};
