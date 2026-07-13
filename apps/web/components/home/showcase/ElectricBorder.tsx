"use client";

/**
 * @descrizione  ELECTRIC BORDER (stile reactbits.dev/animations/electric-border,
 *   tecnica CANVAS per-card). Traccia il PERIMETRO arrotondato della card come una
 *   polilinea i cui vertici sono SPOSTATI lungo la normale da un rumore octaved
 *   (fBm/value-noise) che scorre nel tempo → un bordo "elettrico" organico che
 *   FRIGGE. Ridisegnato in requestAnimationFrame. Sotto il canvas, DUE layer di
 *   GLOW pre-cotti (box-shadow STATICO, MAI filtri animati) danno l'alone; il
 *   contenuto della card sta dentro. È l'EFFETTO PER-ELEMENTO: vive su UNA sola
 *   card-eroe (la wallbox del pannello finale di SolarTwinScene), MAI sul
 *   perimetro del device.
 *
 *   PERFORMANCE — «zero lag» (vincolo di progetto):
 *     · il canvas è grande SOLO quanto la card (+ `margin` per l'alone), non il
 *       device; devicePixelRatio clampato a 2; ResizeObserver ri-misura la card.
 *     · GATE DI VISIBILITÀ: si osserva l'antenato `[data-quadro]` (in SolarTwin
 *       è il pannello `.st-cards`, che la timeline porta a autoAlpha 0/1 allo
 *       split): quando è nascosto (`visibility:hidden` o opacity ~0) il loop si
 *       FERMA — il canvas disegna SOLO nel suo momento.
 *     · GATE DI PAUSA: al mount legge `data-presentation-paused` su <html> e
 *       ascolta `presentation:pausechange`; in pausa il rAF si ferma (ultimo
 *       frame congelato).
 *     · REDUCED-MOTION: nessun loop — il bordo è disegnato UNA volta (stato
 *       statico "acceso", leggibile a progress(1)).
 *   UNA sola istanza montata, che disegna solo quando il suo pannello è visibile.
 *
 * @param radius     raggio del bordo in px (DEVE combaciare col rounded della card)
 * @param color      colore del filamento (default: var(--accent) risolta a runtime)
 * @param speed      moltiplicatore di velocità del "friggere" (default 1)
 * @param chaos      moltiplicatore d'ampiezza dello spostamento dei vertici (default 1)
 * @param thickness  spessore del filamento crisp in px (default 1.4)
 * @param margin     overscan del canvas per non tagliare alone/jitter (default 12)
 * @param className  classi extra sul wrapper (es. w-60, st-card)
 */
import { useRef } from "react";
import { prefersReducedMotion, useIsoLayoutEffect } from "@gmgroup/lib/motion";

// ── Rumore: value-noise 1D + fBm a 3 ottave (pseudo-perlin, deterministico) ──
function hash(n: number): number {
  const s = Math.sin(n) * 43758.5453123;
  return s - Math.floor(s);
}
function vnoise(x: number): number {
  const i = Math.floor(x);
  const f = x - i;
  const u = f * f * (3 - 2 * f); // smoothstep
  return hash(i) * (1 - u) + hash(i + 1) * u;
}
/** fBm 3 ottave → ~[0, 0.875]; il chiamante lo centra a 0. */
function fbm(x: number): number {
  let sum = 0;
  let amp = 0.5;
  let freq = 1;
  for (let o = 0; o < 3; o++) {
    sum += amp * vnoise(x * freq);
    freq *= 2;
    amp *= 0.5;
  }
  return sum;
}

type PerimeterPoint = { x: number; y: number; nx: number; ny: number };

/** Campiona il perimetro del rounded-rect (senso orario) in `count` punti, ognuno
 *  con la sua NORMALE uscente: 4 lati dritti + 4 archi, lunghezza-proporzionali. */
function buildPerimeter(w: number, h: number, r: number, count: number): PerimeterPoint[] {
  const rr = Math.max(0, Math.min(r, w / 2, h / 2));
  const sx = Math.max(0, w - 2 * rr); // lato orizzontale
  const sy = Math.max(0, h - 2 * rr); // lato verticale
  const arc = (Math.PI / 2) * rr; // quarto di cerchio
  const total = 2 * sx + 2 * sy + 4 * arc;
  const pts: PerimeterPoint[] = [];
  for (let k = 0; k < count; k++) pts.push(pointAt((k / count) * total));
  return pts;

  function pointAt(d: number): PerimeterPoint {
    // 1) lato alto (→)
    if (d < sx) return { x: rr + d, y: 0, nx: 0, ny: -1 };
    d -= sx;
    // 2) arco alto-dx (-90°→0°)
    if (d < arc) {
      const a = -Math.PI / 2 + d / rr;
      return {
        x: w - rr + rr * Math.cos(a),
        y: rr + rr * Math.sin(a),
        nx: Math.cos(a),
        ny: Math.sin(a),
      };
    }
    d -= arc;
    // 3) lato destro (↓)
    if (d < sy) return { x: w, y: rr + d, nx: 1, ny: 0 };
    d -= sy;
    // 4) arco basso-dx (0°→90°)
    if (d < arc) {
      const a = d / rr;
      return {
        x: w - rr + rr * Math.cos(a),
        y: h - rr + rr * Math.sin(a),
        nx: Math.cos(a),
        ny: Math.sin(a),
      };
    }
    d -= arc;
    // 5) lato basso (←)
    if (d < sx) return { x: w - rr - d, y: h, nx: 0, ny: 1 };
    d -= sx;
    // 6) arco basso-sx (90°→180°)
    if (d < arc) {
      const a = Math.PI / 2 + d / rr;
      return {
        x: rr + rr * Math.cos(a),
        y: h - rr + rr * Math.sin(a),
        nx: Math.cos(a),
        ny: Math.sin(a),
      };
    }
    d -= arc;
    // 7) lato sinistro (↑)
    if (d < sy) return { x: 0, y: h - rr - d, nx: -1, ny: 0 };
    d -= sy;
    // 8) arco alto-sx (180°→270°)
    const a = Math.PI + d / rr;
    return { x: rr + rr * Math.cos(a), y: rr + rr * Math.sin(a), nx: Math.cos(a), ny: Math.sin(a) };
  }
}

export default function ElectricBorder({
  radius = 16,
  color,
  speed = 1,
  chaos = 1,
  thickness = 1.4,
  margin = 12,
  className = "",
  children,
}: {
  radius?: number;
  color?: string;
  speed?: number;
  chaos?: number;
  thickness?: number;
  margin?: number;
  className?: string;
  children: React.ReactNode;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useIsoLayoutEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = prefersReducedMotion();
    // Colore filamento: prop → altrimenti token --accent risolto a runtime (chiaro
    // sul tema hub = lime). Il core caldo è un lime quasi-bianco costante.
    const stroke =
      color ??
      (getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#84cc16");
    const HOT = "#f2ffe8";

    let pts: PerimeterPoint[] = [];
    let cssW = 0;
    let cssH = 0;

    // Stato di gate (visibilità del quadro / pausa globale).
    const gate = wrap.closest<HTMLElement>("[data-quadro]");
    let visible = gate ? isVisible(gate) : true;
    let paused = document.documentElement.hasAttribute("data-presentation-paused");
    let raf = 0;

    function isVisible(el: HTMLElement): boolean {
      const cs = getComputedStyle(el);
      return cs.visibility !== "hidden" && parseFloat(cs.opacity || "1") > 0.02;
    }

    /** Un frame: perimetro con vertici spostati dal rumore che scorre nel tempo. */
    function drawFrame(t: number) {
      if (!ctx) return;
      ctx.clearRect(0, 0, cssW + margin * 2, cssH + margin * 2);
      const n = pts.length;
      if (n === 0) return;
      const amp = 3 * chaos; // spostamento max in px
      ctx.save();
      ctx.translate(margin, margin);
      ctx.lineJoin = "round";
      ctx.beginPath();
      for (let i = 0; i <= n; i++) {
        const p = pts[i % n];
        const disp = (fbm((i % n) * 0.35 + t) - 0.44) * amp;
        const x = p.x + p.nx * disp;
        const y = p.y + p.ny * disp;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      // Passo 1 — alone morbido largo (translucido).
      ctx.globalAlpha = 0.16;
      ctx.lineWidth = thickness + 3.5;
      ctx.strokeStyle = stroke;
      ctx.stroke();
      // Passo 2 — filamento accent crisp.
      ctx.globalAlpha = 1;
      ctx.lineWidth = thickness;
      ctx.strokeStyle = stroke;
      ctx.stroke();
      // Passo 3 — nucleo caldo sottile (l'anima "elettrica").
      ctx.globalAlpha = 0.85;
      ctx.lineWidth = Math.max(0.6, thickness * 0.5);
      ctx.strokeStyle = HOT;
      ctx.stroke();
      ctx.restore();
    }

    function loop(ts: number) {
      drawFrame((ts / 1000) * speed * 1.4);
      raf = requestAnimationFrame(loop);
    }
    function stop() {
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    }
    /** Avvia/ferma il loop secondo i gate; sotto reduced disegna una volta sola. */
    function sync() {
      if (reduced) {
        stop();
        drawFrame(0); // bordo statico "acceso"
        return;
      }
      if (!paused && visible) {
        if (!raf) raf = requestAnimationFrame(loop);
      } else {
        stop(); // pausa o quadro nascosto → congela l'ultimo frame
      }
    }

    function resize() {
      // clientWidth/Height = px di layout (indipendenti dai transform degli
      // antenati: camera/stage in hand-off non falsano la misura).
      cssW = wrap!.clientWidth;
      cssH = wrap!.clientHeight;
      if (cssW === 0 || cssH === 0) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cw = cssW + margin * 2;
      const ch = cssH + margin * 2;
      canvas!.style.width = `${cw}px`;
      canvas!.style.height = `${ch}px`;
      canvas!.width = Math.round(cw * dpr);
      canvas!.height = Math.round(ch * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.max(48, Math.round((2 * (cssW + cssH)) / 7));
      pts = buildPerimeter(cssW, cssH, radius, count);
      if (reduced || !raf) drawFrame(0); // ridisegna lo stato statico dopo il resize
    }

    // ── Osservatori & listener ──────────────────────────────────────────────
    const ro = new ResizeObserver(() => resize());
    ro.observe(wrap);

    let mo: MutationObserver | null = null;
    if (gate) {
      // autoAlpha di GSAP scrive inline `visibility`/`opacity` sul quadro: alla
      // mutazione ricalcolo la visibilità e sincronizzo il loop.
      mo = new MutationObserver(() => {
        const v = isVisible(gate);
        if (v !== visible) {
          visible = v;
          sync();
        }
      });
      mo.observe(gate, { attributes: true, attributeFilter: ["style", "class"] });
    }

    const onPause = (e: Event) => {
      paused = !!(e as CustomEvent<{ paused: boolean }>).detail?.paused;
      sync();
    };
    window.addEventListener("presentation:pausechange", onPause);

    resize();
    sync();

    return () => {
      stop();
      ro.disconnect();
      mo?.disconnect();
      window.removeEventListener("presentation:pausechange", onPause);
    };
  }, [radius, color, speed, chaos, thickness, margin]);

  return (
    <div ref={wrapRef} className={`relative ${className}`} style={{ borderRadius: radius }}>
      {/* GLOW pre-cotto (2 layer, box-shadow STATICO — mai filtri animati). */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          borderRadius: radius,
          boxShadow:
            "0 0 34px -6px color-mix(in oklab, var(--accent) 55%, transparent), 0 0 12px -4px color-mix(in oklab, var(--accent) 70%, transparent)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          borderRadius: radius,
          boxShadow:
            "0 0 8px -2px color-mix(in oklab, var(--accent) 80%, transparent), 0 0 3px -1px color-mix(in oklab, var(--accent) 90%, transparent)",
        }}
      />
      {/* Canvas del filamento: overscan `margin`, sopra il contenuto, non cliccabile. */}
      <canvas
        ref={canvasRef}
        aria-hidden
        className="pointer-events-none absolute z-[2]"
        style={{ top: -margin, left: -margin }}
      />
      {/* Contenuto della card. */}
      <div className="relative z-[1] h-full" style={{ borderRadius: radius }}>
        {children}
      </div>
    </div>
  );
}
