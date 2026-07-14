/**
 * SCENA 01 · Siti vetrina (porting di SolarTwinScene.tsx).
 * Apre come le altre scene: title card «Siti vetrina» (bianco su nero) → il sito
 * gmsolar.it con HERO video drone (scrub eased, pieno e visibile) → le due metà si
 * aprono sulle service card 3D → binario a «Chi siamo» (marquee) → uscita: lo slide
 * continua fino a un pannello bianco.
 */
import React from "react";
import {
  AbsoluteFill,
  Freeze,
  getRemotionEnvironment,
  Img,
  interpolate,
  OffthreadVideo,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { C, SHADOW } from "../kit/tokens";
import {
  CameraShot,
  EASE_CAMERA,
  EASE_IN_SCENE,
  EASE_OUT_SCENE,
  cameraAt,
  maskReveal,
  prog,
  s2f,
  seq,
  val,
} from "../kit/motion";
import { ChapterCard, chapterIntroBeats, DotsTexture, StageBackdrop } from "../kit/ui";
import { fontFamily } from "../kit/fonts";

// ── Timeline della scena (secondi → frame, costruita una volta) ──────────────
const t = seq();
const CARD = chapterIntroBeats(t); // title card «Siti vetrina» all'inizio (come le altre scene)
const VIDEO = t.add(10); // hero drone: scrub eased per l'intero clip (10s = 300f)
const SPLIT = t.add(1.2, 0.35); // le due metà si aprono sulle card
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
const EXIT = t.add(0.9); // lo slide continua fino al pannello bianco
t.hold(0.1);
export const SOLAR_DURATION = t.total;

// Frame VIDEO-LOCALE dell'ultimo fotogramma. Il <Freeze> mappa frame-composizione →
// tempo-video = frame/30, quindi per un clip di 10s l'ultimo frame locale è s2f(10)-1
// = 299. SLEGATO dalla durata del beat: se il beat VIDEO cambiasse, non si rompe.
const VIDEO_LAST = s2f(10) - 1;

// ── DEMO scroll-scrubbing ────────────────────────────────────────────────────
// Tra la card e la riproduzione in avanti: lo scroll trascina il video
// AVANTI → INDIETRO → AVANTI, poi lo lascia scorrere fino in fondo. Un cue "mouse"
// centrato sull'hero è in SYNC ESATTO col video (rotella + chevron nel verso di
// scroll). È il cuore della scena: lo scroll comanda il video.
const DEMO = { start: VIDEO.start, dur: s2f(4.5), end: VIDEO.start + s2f(4.5) };
const DEMO_K1 = DEMO.start + Math.round(DEMO.dur * 0.36); // fine 1ª fase (giù)
const DEMO_K2 = DEMO.start + Math.round(DEMO.dur * 0.66); // fine 2ª fase (su)

const MARQUEE = { start: SLIDE.start, end: EXIT.end }; // drift continuo
const CHROME_H = 124; // barra browser (52) + header sito (72)

// Camera neutra (nessun respiro, nessuna oscillazione): il video resta fermo e pieno.
const SHOTS: CameraShot[] = [];

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
  const { isRendering } = getRemotionEnvironment();
  const margin = 12;

  // Strati di glow lime (statici, gratis): sempre presenti — anteprima e render.
  const glow = (
    <>
      <div style={{ position: "absolute", inset: 0, borderRadius: radius, boxShadow: "0 0 34px -6px rgba(132,204,22,0.55), 0 0 12px -4px rgba(132,204,22,0.7)" }} />
      <div style={{ position: "absolute", inset: 0, borderRadius: radius, boxShadow: "0 0 8px -2px rgba(132,204,22,0.8), 0 0 3px -1px rgba(132,204,22,0.9)" }} />
    </>
  );

  // PERF: il bordo "elettrico" ricampiona fbm su ~140 punti del perimetro + 3 path
  // SVG A OGNI FRAME → costoso nell'anteprima dello Studio. In anteprima resta un
  // bordo lime STATICO (nessun ricalcolo per-frame); il dettaglio animato vive SOLO
  // al render. La demo scroll-scrubbing del video NON è toccata (resta live ovunque).
  if (!isRendering) {
    return (
      <div style={{ position: "relative", width, height, borderRadius: radius }}>
        {glow}
        <div style={{ position: "absolute", inset: -1, borderRadius: radius + 1, border: `1.6px solid ${C.accent}`, boxShadow: "inset 0 0 6px -2px rgba(242,255,232,0.9)", zIndex: 2, pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1, height: "100%" }}>{children}</div>
      </div>
    );
  }

  // RENDER: bordo elettrico pieno, animato sul frame. Count ridotto (era /7 → ~205
  // punti; ora /10 → ~144) mantenendo la scintilla.
  const time = (frame / 30) * 1.4;
  const count = Math.max(40, Math.round((2 * (width + height)) / 10));
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
      {glow}
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
  <div style={{ height: 52, backgroundColor: C.surface, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", padding: "0 20px", gap: 8, flexShrink: 0 }}>
    {[0, 1, 2].map((i) => (
      <div key={i} style={{ width: 13, height: 13, borderRadius: 999, backgroundColor: C.border }} />
    ))}
    <div style={{ margin: "0 auto", backgroundColor: C.background, border: `1px solid ${C.border}`, color: C.muted, fontSize: 15, fontFamily, borderRadius: 999, padding: "4px 22px" }}>
      gmsolar.it
    </div>
    <div style={{ width: 60 }} />
  </div>
);

const SiteHeader: React.FC = () => (
  <div style={{ height: 72, backgroundColor: "rgba(255,255,255,0.92)", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", padding: "0 28px", gap: 24, zIndex: 30, position: "relative", flexShrink: 0, fontFamily }}>
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ width: 34, height: 34, borderRadius: 999, border: `2.5px solid ${C.accent}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 12, height: 12, borderRadius: 999, backgroundColor: C.accent }} />
      </div>
      <div>
        <div style={{ fontWeight: 800, fontSize: 19, color: C.foreground, letterSpacing: "-0.01em" }}>GM SOLAR</div>
        <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.18em", color: C.accentInk }}>Energie Rinnovabili</div>
      </div>
    </div>
    <div style={{ marginLeft: "auto", display: "flex", gap: 26, fontSize: 16, color: C.muted }}>
      {["Home", "Chi Siamo", "Tipologia di Impianti", "Servizi", "Gallery", "Privacy"].map((v, i) => (
        <span key={v} style={i === 0 ? { color: C.foreground, fontWeight: 600 } : undefined}>{v}</span>
      ))}
    </div>
    <div style={{ backgroundColor: C.accent, color: C.accentContrast, borderRadius: 999, padding: "8px 24px", fontSize: 16, fontWeight: 600 }}>Contattaci</div>
  </div>
);

const ServiceCard: React.FC<{ s: (typeof SERVIZI)[number] }> = ({ s }) => (
  <div style={{ width: 290, borderRadius: 16, border: "1px solid rgba(255,255,255,0.1)", backgroundColor: "#0e1524", boxShadow: SHADOW.lift, overflow: "hidden", fontFamily }}>
    <Img src={staticFile(s.img)} style={{ width: "100%", aspectRatio: "1 / 1", objectFit: "cover", display: "block" }} />
    <div style={{ padding: "16px 18px 20px" }}>
      <div style={{ color: C.accent, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.18em" }}>{s.kind}</div>
      <div style={{ color: "#fff", fontWeight: 700, fontSize: 20, marginTop: 6 }}>{s.title}</div>
      <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, marginTop: 4 }}>{s.desc}</div>
    </div>
  </div>
);

// ── Cue "mouse" della demo scroll-scrubbing ──────────────────────────────────
// Mouse bianco (~34×56) con rotella che bobba NEL VERSO di scroll + chevron pulsanti
// (giù nelle fasi in avanti, su nella fase indietro) + etichetta «Scorri». Drop-shadow
// per leggibilità sul footage diurno luminoso. Deterministico (pura funzione del frame).
const CueChevron: React.FC<{ up: boolean; opacity: number }> = ({ up, opacity }) => (
  <svg width={26} height={13} viewBox="0 0 26 13" style={{ display: "block", opacity }}>
    <polyline
      points={up ? "3,10 13,4 23,10" : "3,3 13,9 23,3"}
      fill="none"
      stroke="#ffffff"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ScrollCue: React.FC<{ frame: number; dir: 1 | -1; opacity: number }> = ({ frame, dir, opacity }) => {
  if (opacity <= 0) return null;
  const period = s2f(1.1);
  const cyc = (((frame % period) + period) % period) / period; // 0..1 sawtooth
  // Rotella: viaggia NEL VERSO di scroll (dir), con dissolvenza in/out sul ciclo.
  const dotY = 11 + (12 * cyc - 3) * dir;
  const dotFade = Math.sin(cyc * Math.PI);
  // Chevron pulsanti, sfalsati: il più vicino al mouse pulsa per primo → onda che si
  // allontana nel verso di scroll.
  const pulse = (i: number) => {
    let t = cyc - i * 0.2;
    if (t < 0) t += 1;
    return 0.25 + 0.75 * Math.max(0, Math.sin(t * Math.PI));
  };
  const down = dir === 1;
  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "57%",
        transform: "translate(-50%, -50%)",
        zIndex: 25,
        opacity,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
        pointerEvents: "none",
        filter: "drop-shadow(0 1px 2px rgba(3,8,20,0.45)) drop-shadow(0 4px 12px rgba(3,8,20,0.5))",
      }}
    >
      {/* Chevron SOPRA (attivi quando si scrolla SU) — il più vicino al mouse è il basso. */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, height: 30, justifyContent: "flex-end" }}>
        <CueChevron up opacity={down ? 0 : pulse(1)} />
        <CueChevron up opacity={down ? 0 : pulse(0)} />
      </div>
      {/* Corpo mouse ~34×56 con rotella. */}
      <svg width={34} height={56} viewBox="0 0 34 56" style={{ display: "block" }}>
        <rect x={2} y={2} width={30} height={52} rx={15} fill="rgba(11,16,32,0.30)" stroke="#ffffff" strokeWidth={2.6} />
        <rect x={14} y={dotY} width={6} height={11} rx={3} fill="#ffffff" opacity={0.5 + 0.5 * dotFade} />
      </svg>
      {/* Chevron SOTTO (attivi quando si scrolla GIÙ) — il più vicino al mouse è l'alto. */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, height: 30, justifyContent: "flex-start" }}>
        <CueChevron up={false} opacity={down ? pulse(0) : 0} />
        <CueChevron up={false} opacity={down ? pulse(1) : 0} />
      </div>
      {/* Etichetta + hint (1 riga): è video comandato dallo scroll. */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
        <div style={{ fontFamily, fontSize: 15, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#ffffff" }}>Scorri</div>
        <div style={{ fontFamily, fontSize: 12, fontWeight: 500, letterSpacing: "0.02em", color: "rgba(255,255,255,0.85)" }}>lo scroll comanda il video</div>
      </div>
    </div>
  );
};

// ── Scena ────────────────────────────────────────────────────────────────────
export const SolarTwin: React.FC = () => {
  const frame = useCurrentFrame();

  const splitP = prog(frame, SPLIT, EASE_CAMERA); // metà video che si aprono
  const slideP = prog(frame, SLIDE, EASE_CAMERA); // slide del binario verso il Chi siamo
  const exitP = prog(frame, EXIT, EASE_CAMERA); // uscita: continua lo slide fino al bianco
  const floatP = prog(frame, FLOAT, (x) => x); // float delle card nel hold
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

  // scrollP (0..1) = posizione di scroll simulata. Oscilla per la DEMO
  // (avanti→indietro→avanti) e poi scorre fino a 1 (riproduzione in avanti fino allo
  // split). EASE_CAMERA è applicata PER-SEGMENTO da interpolate → velocità nulla a ogni
  // inversione (0.34 / 0.11 / 0.42): il drone frena e riparte in modo naturale.
  const scrollP = interpolate(
    frame,
    [DEMO.start, DEMO_K1, DEMO_K2, DEMO.end, VIDEO.end],
    [0, 0.34, 0.11, 0.42, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_CAMERA },
  );
  // Frame VIDEO-LOCALE = scrollP × ultimo frame del clip. Lo scroll comanda il video.
  const videoFrame = Math.round(scrollP * VIDEO_LAST);

  // Verso di scroll corrente (deve COINCIDERE col segno di dscrollP/dframe):
  // giù nelle due fasi in avanti, su nella fase indietro.
  const scrollDir: 1 | -1 = frame < DEMO_K1 ? 1 : frame < DEMO_K2 ? -1 : 1;
  // Il cue entra all'inizio della DEMO ed esce alla fine.
  const cueIn = prog(frame, { start: DEMO.start, dur: s2f(0.45), end: DEMO.start + s2f(0.45) }, EASE_IN_SCENE);
  const cueOut = prog(frame, { start: DEMO.end - s2f(0.45), dur: s2f(0.45), end: DEMO.end }, EASE_OUT_SCENE);
  const cueOpacity = Math.max(0, cueIn * (1 - cueOut));

  const showTrack = frame >= SPLIT.start - 2;
  // Il video hero è coperto dalle metà dello split (che mostrano lo stesso ultimo
  // frame) da SPLIT in poi; smonta l'OffthreadVideo quando non è più visibile → un
  // decode in meno nella fase finale (lo split usa già un solo frame congelato).
  const heroVideoOn = frame < SPLIT.start;

  return (
    <AbsoluteFill style={{ backgroundColor: C.background }}>
      <StageBackdrop />

      <AbsoluteFill style={cameraAt(frame, SHOTS)}>
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
          {/* Device wrapper (browser 16:10, 1400×875) */}
          <div style={{ position: "relative", width: 1400, height: 875 }}>
            <div style={{ position: "absolute", inset: 0, borderRadius: 16, boxShadow: SHADOW.device, pointerEvents: "none" }} />
            <div style={{ position: "absolute", inset: 0, borderRadius: 16, overflow: "hidden", backgroundColor: "#0b1020", color: "#fff", fontFamily }}>
              {/* HERO video full-bleed, pieno e visibile. Il video va in AbsoluteFill
                  (posizionato) → sta SOPRA il gradient di fallback (anch'esso posizionato). */}
              <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
                <AbsoluteFill style={{ background: "linear-gradient(135deg, #0b1020, #13210a, #0b1020)" }} />
                {/* Il video va in AbsoluteFill (posizionato) → paint SOPRA il gradient
                    di fallback (anch'esso posizionato). Resta pieno e visibile. */}
                {heroVideoOn ? (
                  <Freeze frame={videoFrame}>
                    <AbsoluteFill>
                      <OffthreadVideo muted src={staticFile("assets/solar-twin.mp4")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </AbsoluteFill>
                  </Freeze>
                ) : null}
              </div>

              {/* Cue MOUSE della demo scroll-scrubbing (sopra l'hero, sotto il chrome). */}
              <ScrollCue frame={frame} dir={scrollDir} opacity={cueOpacity} />

              {/* TRACK orizzontale (300%): servizi → chi siamo → BIANCO */}
              {showTrack ? (
                <div
                  style={{
                    position: "absolute",
                    top: CHROME_H,
                    left: 0,
                    bottom: 0,
                    zIndex: 10,
                    display: "flex",
                    width: "300%",
                    transform: `translateX(${(-33.3333 * slideP - 33.3333 * exitP).toFixed(4)}%)`,
                  }}
                >
                  {/* Panel 1 · I nostri servizi */}
                  <div style={{ width: "33.3333%", position: "relative", backgroundColor: C.background, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 26 }}>
                    <DotsTexture />
                    <div style={{ textAlign: "center", position: "relative" }}>
                      <div style={{ opacity: prog(frame, KICKER, EASE_IN_SCENE), transform: `translateY(${val(frame, KICKER, 16, 0)}px)`, color: C.accentInk, fontSize: 14, textTransform: "uppercase", letterSpacing: "0.22em", fontFamily }}>
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
                  <div style={{ width: "33.3333%", position: "relative", backgroundColor: C.background, display: "flex", flexDirection: "column", justifyContent: "center", gap: 28, overflow: "hidden", color: C.foreground }}>
                    <div style={{ opacity: prog(frame, AB_KICKER, EASE_IN_SCENE), transform: `translateY(${val(frame, AB_KICKER, 16, 0)}px)`, color: C.accentInk, fontSize: 14, textTransform: "uppercase", letterSpacing: "0.22em", padding: "0 56px", fontFamily }}>
                      Chi siamo
                    </div>
                    <div style={{ whiteSpace: "nowrap", fontFamily, fontWeight: 700, fontSize: 74, textTransform: "uppercase", letterSpacing: "-0.02em", transform: `translateX(${-6 - 20 * marq}%)` }}>
                      {"Energia pulita · Dal sole alla casa · ".repeat(3)}
                    </div>
                    <div style={{ whiteSpace: "nowrap", fontFamily, fontWeight: 700, fontSize: 74, textTransform: "uppercase", letterSpacing: "-0.02em", color: "transparent", WebkitTextStroke: "1.5px rgba(11,16,32,0.32)", transform: `translateX(${-26 + 20 * marq}%)` }}>
                      {"Progettiamo · Installiamo · Monitoriamo · ".repeat(3)}
                    </div>
                    <div style={{ opacity: prog(frame, AB_COPY, EASE_IN_SCENE), transform: `translateY(${val(frame, AB_COPY, 22, 0)}px)`, color: C.muted, fontSize: 20, maxWidth: 680, padding: "0 56px", fontFamily, overflowWrap: "break-word", lineHeight: 1.4 }}>
                      Dal 2008 progettiamo e installiamo impianti fotovoltaici e sistemi di ricarica: un solo interlocutore, dal sopralluogo al collaudo.
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
                  {/* Panel 3 · BIANCO (uscita motivata dal movimento) */}
                  <div style={{ width: "33.3333%", backgroundColor: C.background }} />
                </div>
              ) : null}

              {/* SPLIT: le due metà (ultimo frame video) che si aprono sulle card */}
              {showTrack && splitP < 1 ? (
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

              {/* CHROME: barra browser + nav del sito, sempre visibile sopra l'hero */}
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 30 }}>
                <BrowserBar />
                <SiteHeader />
              </div>
            </div>

            {/* Bordo finestra */}
            <div style={{ position: "absolute", inset: 0, borderRadius: 16, border: `1px solid ${C.border}`, pointerEvents: "none" }} />
          </div>
        </AbsoluteFill>
      </AbsoluteFill>

      {/* Title card «Siti vetrina» all'inizio (bianco su nero), come le altre scene */}
      <ChapterCard title="Siti vetrina" subtitle="Con una forte narrativa, costruita tramite scrollytelling video." beats={CARD} />
    </AbsoluteFill>
  );
};
