'use client';

import React, { useEffect, useRef } from 'react';

interface ClosingBubblesProps {
  count?: number;
  minSize?: number;
  maxSize?: number;
  speedScale?: number;
  opacityScale?: number;
  blur?: number;
  sharpness?: number;
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
    
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let lastTime = 0;
    let isPaused = false;
    let width = 0;
    let height = 0;

    let mouseX = -1000;
    let mouseY = -1000;

    const handleMouseMove = (e: MouseEvent) => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouseX = -1000;
      mouseY = -1000;
    };

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
    // Number of bubbles based on config
    const numBubbles = count;
    
    const colors = [
      [132, 204, 22], // #84CC16
      [163, 230, 53], // #a3e635
      [101, 163, 13]  // #65a30d
    ];

    const initBubbles = () => {
      bubbles.length = 0;
      for (let i = 0; i < numBubbles; i++) {
        const baseRadius = Math.random() * (maxSize - minSize) + minSize;
        
        // Start within bounds safely
        const minX = -edgeBleed;
        const maxX = width + edgeBleed;
        const minY = -edgeBleed;
        const maxY = height + edgeBleed;
        
        const x = Math.random() * (maxX - minX) + minX;
        const y = Math.random() * (maxY - minY) + minY;
        
        // Inversely proportional speed
        const speedBase = 1000 / baseRadius;
        const speedMultiplier = speedScale; 
        const speed = speedBase * speedMultiplier * (Math.random() * 0.5 + 0.75);
        
        const angle = Math.random() * Math.PI * 2;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        
        const color = colors[Math.floor(Math.random() * colors.length)];
        const opacity = (Math.random() * (0.7 - 0.4) + 0.4) * opacityScale;
        
        // Gradient with radius 1, scaled later
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
        gradient.addColorStop(0, `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${opacity})`);
        if (sharpness > 0) {
          gradient.addColorStop(Math.min(sharpness, 0.99), `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${opacity})`);
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
          breathAmplitude: Math.random() * 0.1 + 0.1 // 10% to 20% breathing amplitude
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
      if (isPaused) return;

      if (!lastTime) lastTime = time;
      const dt = Math.min((time - lastTime) / 1000, 0.1); // Max 100ms step
      lastTime = time;

      for (let i = 0; i < numBubbles; i++) {
        const b = bubbles[i];
        
        // Mouse repulsion
        const dx = b.x - mouseX;
        const dy = b.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const repulseRadius = 250;
        
        if (dist < repulseRadius) {
          const force = (repulseRadius - dist) / repulseRadius;
          const repulseForce = force * 400; // Magnitude of push
          const angle = Math.atan2(dy, dx);
          
          b.vx += Math.cos(angle) * repulseForce * dt;
          b.vy += Math.sin(angle) * repulseForce * dt;
        }

        const currentSpeed = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
        const targetSpeed = b.baseSpeed;

        if (currentSpeed > targetSpeed) {
           const damping = Math.pow(0.85, dt * 60); // frame-rate independent damping
           b.vx *= damping;
           b.vy *= damping;
           
           const newSpeed = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
           if (newSpeed < targetSpeed) {
              const ratio = targetSpeed / newSpeed;
              b.vx *= ratio;
              b.vy *= ratio;
           }
        } else if (currentSpeed < targetSpeed) {
           const ratio = targetSpeed / currentSpeed;
           b.vx *= ratio;
           b.vy *= ratio;
        }

        b.x += b.vx * dt;
        b.y += b.vy * dt;
        b.phase += b.phaseSpeed * dt;
        
        const minX = -edgeBleed;
        const maxX = width + edgeBleed;
        const minY = -edgeBleed;
        const maxY = height + edgeBleed;

        // Bounce bounds
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

    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      
      ctx.scale(dpr, dpr);
      
      // Re-constrain bubbles inside new window bounds
      const minX = -edgeBleed;
      const maxX = width + edgeBleed;
      const minY = -edgeBleed;
      const maxY = height + edgeBleed;

      bubbles.forEach(b => {
        if (b.x < minX) b.x = minX;
        if (b.x > maxX) b.x = maxX;
        if (b.y < minY) b.y = minY;
        if (b.y > maxY) b.y = maxY;
      });

      if (prefersReducedMotion || isPaused) {
        render();
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        isPaused = true;
      } else {
        const wasPaused = isPaused;
        isPaused = false;
        lastTime = performance.now();
        if (wasPaused && !prefersReducedMotion) {
          animationFrameId = requestAnimationFrame(update);
        }
      }
    };

    // Initial setup
    const rect = canvas.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    initBubbles();
    render();

    if (!prefersReducedMotion) {
      lastTime = performance.now();
      animationFrameId = requestAnimationFrame(update);
    }

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [count, minSize, maxSize, speedScale, opacityScale, sharpness, edgeBleed]);

  return (
    <canvas 
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        display: 'block',
        filter: blur > 0 ? `blur(${blur}px)` : 'none'
      }}
    />
  );
}
