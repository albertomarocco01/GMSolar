"use client";

/**
 * @descrizione  Sfondo animato della scena di CHIUSURA: bolle accent traslucide
 *   che fluttuano e rimbalzano sui bordi del viewport (canvas 2D, rAF, fisica
 *   time-based). Generato con Google AI Studio e adattato al progetto:
 *   rispetta reduced-motion (frame statico), si ferma a tab nascosta, fuori dal
 *   viewport (IntersectionObserver) e con la pausa globale della presentazione
 *   (`presentation:pausechange` + `data-presentation-paused`). Leggera
 *   repulsione attorno al cursore.
 * @indice
 * - ClosingBubbles → canvas full-bleed con le bolle animate
 */
import { useEffect, useRef } from "react";

interface ClosingBubblesProps {
  count?: number;
  minSize?: number;
  maxSize?: number;
  speedScale?: number;
  opacityScale?: number;
  blur?: number;
  sharpness?: number;
  /** Di quanto le bolle possono sconfinare oltre i bordi prima di rimbalzare (px). */
  edgeBleed?: number;
}

export default function ClosingBubbles({
  count = 12,
  minSize = 40,
  maxSize = 220,
  speedScale = 1.5,
  opacityScale = 1.0,
  blur = 0,
  sharpness = 0,
  edgeBleed = 100,
}: ClosingBubblesProps = {}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let lastTime = 0;
    let isHidden = false; // tab nascosta (visibilitychange)
    // Pausa globale della presentazione: montaggio a presentazione già in pausa
    // (es. remount) → parte congelato, come il vecchio loop GSAP.
    let presentationPaused = document.documentElement.hasAttribute("data-presentation-paused");
    // La scena di chiusura sta in fondo a ~30.000px di scrollytelling: senza
    // questo, il canvas girava (clear + 12 gradienti radiali full-viewport a
    // ogni frame) per TUTTA la presentazione, invisibile. Parte fermo e si
    // sveglia solo quando entra in campo.
    let offscreen = true;
    let width = 0;
    let height = 0;

    let mouseX = -1000;
    let mouseY = -1000;

    const handleMouseMove = (e: MouseEvent) => {
      if (offscreen) return; // niente layout forzato mentre la scena non è in campo
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouseX = -1000;
      mouseY = -1000;
    };

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    interface Bubble {
      x: number;
      y: number;
      vx: number;
      vy: number;
      baseRadius: number;
      phase: number;
      phaseSpeed: number;
      gradient: CanvasGradient;
      baseSpeed: number;
      breathAmplitude: number;
    }

    const bubbles: Bubble[] = [];
    const numBubbles = count;

    // Variazioni dell'accent lime (base #84CC16).
    const colors = [
      [132, 204, 22], // #84CC16
      [163, 230, 53], // #a3e635
      [101, 163, 13], // #65a30d
    ];

    const initBubbles = () => {
      bubbles.length = 0;
      for (let i = 0; i < numBubbles; i++) {
        const baseRadius = Math.random() * (maxSize - minSize) + minSize;

        const minX = -edgeBleed;
        const maxX = width + edgeBleed;
        const minY = -edgeBleed;
        const maxY = height + edgeBleed;

        const x = Math.random() * (maxX - minX) + minX;
        const y = Math.random() * (maxY - minY) + minY;

        // Velocità inversamente proporzionale alla dimensione.
        const speedBase = 1000 / baseRadius;
        const speed = speedBase * speedScale * (Math.random() * 0.5 + 0.75);

        const angle = Math.random() * Math.PI * 2;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;

        const color = colors[Math.floor(Math.random() * colors.length)];
        const opacity = (Math.random() * (0.7 - 0.4) + 0.4) * opacityScale;

        // Gradiente con raggio 1, scalato in fase di draw.
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
        gradient.addColorStop(0, `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${opacity})`);
        if (sharpness > 0) {
          gradient.addColorStop(
            Math.min(sharpness, 0.99),
            `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${opacity})`,
          );
        }
        gradient.addColorStop(1, `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0)`);

        bubbles.push({
          x,
          y,
          vx,
          vy,
          baseRadius,
          phase: Math.random() * Math.PI * 2,
          phaseSpeed: Math.random() * 0.5 + 0.2,
          gradient,
          baseSpeed: speed,
          breathAmplitude: Math.random() * 0.1 + 0.1, // "respiro" 10–20%
        });
      }
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < numBubbles; i++) {
        const b = bubbles[i];
        const currentRadius = b.baseRadius * (1 + Math.sin(b.phase) * b.breathAmplitude);
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.scale(currentRadius, currentRadius);
        ctx.fillStyle = b.gradient;
        ctx.beginPath();
        ctx.arc(0, 0, 1, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    };

    const update = (time: number) => {
      // Congelato: il loop muore qui e riparte dai gestori di resume.
      if (isHidden || presentationPaused || offscreen) return;

      if (!lastTime) lastTime = time;
      const dt = Math.min((time - lastTime) / 1000, 0.1); // step max 100ms
      lastTime = time;

      for (let i = 0; i < numBubbles; i++) {
        const b = bubbles[i];

        // Repulsione dal cursore.
        const dx = b.x - mouseX;
        const dy = b.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const repulseRadius = 250;

        if (dist < repulseRadius) {
          const force = (repulseRadius - dist) / repulseRadius;
          const repulseForce = force * 400;
          const angle = Math.atan2(dy, dx);

          b.vx += Math.cos(angle) * repulseForce * dt;
          b.vy += Math.sin(angle) * repulseForce * dt;
        }

        // Rientro morbido verso la velocità base dopo la spinta.
        const currentSpeed = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
        const targetSpeed = b.baseSpeed;

        // Ri-normalizzazione alla velocità base. I rapporti dividono per la
        // velocità corrente: a velocità ESATTAMENTE nulla (repulsione che annulla
        // il moto) darebbero Infinity → NaN su x/y, e la bolla sparirebbe per
        // sempre. Con velocità nulla si rilancia in una direzione qualsiasi.
        if (currentSpeed > targetSpeed) {
          const damping = Math.pow(0.85, dt * 60); // smorzamento indipendente dal frame-rate
          b.vx *= damping;
          b.vy *= damping;

          const newSpeed = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
          if (newSpeed < targetSpeed && newSpeed > 0) {
            const ratio = targetSpeed / newSpeed;
            b.vx *= ratio;
            b.vy *= ratio;
          }
        } else if (currentSpeed < targetSpeed) {
          if (currentSpeed === 0) {
            b.vx = targetSpeed;
            b.vy = 0;
          } else {
            const ratio = targetSpeed / currentSpeed;
            b.vx *= ratio;
            b.vy *= ratio;
          }
        }

        b.x += b.vx * dt;
        b.y += b.vy * dt;
        b.phase += b.phaseSpeed * dt;

        const minX = -edgeBleed;
        const maxX = width + edgeBleed;
        const minY = -edgeBleed;
        const maxY = height + edgeBleed;

        // Rimbalzo sui bordi (allargati di edgeBleed).
        if (b.x < minX) {
          b.x = minX;
          b.vx *= -1;
        } else if (b.x > maxX) {
          b.x = maxX;
          b.vx *= -1;
        }

        if (b.y < minY) {
          b.y = minY;
          b.vy *= -1;
        } else if (b.y > maxY) {
          b.y = maxY;
          b.vy *= -1;
        }
      }

      render();
      animationFrameId = requestAnimationFrame(update);
    };

    // Riavvia il loop solo se nessuna causa di pausa è ancora attiva.
    const resumeIfIdle = () => {
      if (prefersReducedMotion || isHidden || presentationPaused || offscreen) return;
      lastTime = performance.now();
      animationFrameId = requestAnimationFrame(update);
    };

    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;

      canvas.width = width * dpr;
      canvas.height = height * dpr;

      ctx.scale(dpr, dpr);

      // Rientra le bolle nei nuovi bounds.
      const minX = -edgeBleed;
      const maxX = width + edgeBleed;
      const minY = -edgeBleed;
      const maxY = height + edgeBleed;

      bubbles.forEach((b) => {
        if (b.x < minX) b.x = minX;
        if (b.x > maxX) b.x = maxX;
        if (b.y < minY) b.y = minY;
        if (b.y > maxY) b.y = maxY;
      });

      if (prefersReducedMotion || isHidden || presentationPaused || offscreen) {
        render();
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        isHidden = true;
      } else if (isHidden) {
        isHidden = false;
        resumeIfIdle();
      }
    };

    // Pausa globale della presentazione (stesso contratto del resto della home).
    const handlePauseChange = (e: Event) => {
      const paused = Boolean((e as CustomEvent<{ paused: boolean }>).detail?.paused);
      if (paused === presentationPaused) return;
      presentationPaused = paused;
      if (!paused) resumeIfIdle();
    };

    // Setup iniziale.
    const rect = canvas.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    initBubbles();
    render();

    // Sveglia/addormenta il loop all'entrata e all'uscita dal viewport. Un
    // margine generoso lo fa trovare già in moto quando la scena arriva.
    const io = new IntersectionObserver(
      ([e]) => {
        const nowOff = !e.isIntersecting;
        if (nowOff === offscreen) return;
        offscreen = nowOff;
        if (!offscreen) resumeIfIdle();
      },
      { rootMargin: "50% 0px" },
    );
    io.observe(canvas);

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("presentation:pausechange", handlePauseChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      io.disconnect();
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("presentation:pausechange", handlePauseChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [count, minSize, maxSize, speedScale, opacityScale, sharpness, edgeBleed]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        display: "block",
        filter: blur > 0 ? `blur(${blur}px)` : "none",
      }}
    />
  );
}
