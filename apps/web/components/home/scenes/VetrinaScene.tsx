"use client";

/**
 * @descrizione  Servizio #1 "Siti vetrina": PLACEHOLDER di video-scrollytelling
 *   (niente video reale → niente lag). Una "schermata" entra in prospettiva con
 *   uno ZOOM-IN guidato dallo scroll (solo transform = performante) e dentro
 *   recita in loop una scena luminosa: sole, PANNELLO SOLARE che si accende a
 *   celle e un CAVO di ricarica con energia che scorre. Reduced-motion: scena
 *   ferma allo stato finale.
 * @indice
 * - VetrinaScene → seconda sezione (dopo l'hero)
 */
import { useRef } from "react";
import { gsap, ScrollTrigger } from "@gmgroup/lib/gsap";
import { prefersReducedMotion, useIsoLayoutEffect } from "@gmgroup/lib/motion";

const CELLS = Array.from({ length: 18 }); // pannello 6×3

export default function VetrinaScene() {
  const sectionRef = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  useIsoLayoutEffect(() => {
    const section = sectionRef.current;
    const frame = frameRef.current;
    if (!section || !frame) return;

    const reduced = prefersReducedMotion();

    const ctx = gsap.context(() => {
      // Loop interno: celle che si accendono a sweep, sole che pulsa, energia nel cavo.
      const loop = gsap.timeline({ repeat: reduced ? 0 : -1, repeatDelay: 0.6 });
      loop
        .fromTo(
          ".sp-glow",
          { opacity: 0 },
          {
            opacity: 1,
            stagger: { each: 0.06, from: "start" },
            duration: 0.5,
            ease: "power1.inOut",
          },
        )
        .to(".sp-glow", { opacity: 0.25, duration: 0.5 }, "+=0.4")
        .fromTo(
          ".cable-flow",
          { strokeDashoffset: 40 },
          { strokeDashoffset: 0, duration: 1, ease: "none" },
          0,
        )
        .fromTo(
          ".sun-glow",
          { scale: 0.9, opacity: 0.5 },
          { scale: 1.1, opacity: 0.9, duration: 1.2, yoyo: true, repeat: 1, ease: "sine.inOut" },
          0,
        );
      if (reduced) loop.progress(1).pause();

      // Zoom prospettico guidato dallo scroll (solo transform).
      if (!reduced) {
        gsap.fromTo(
          frame,
          { rotateX: 16, scale: 0.86, y: 40 },
          {
            rotateX: 0,
            scale: 1.06,
            y: 0,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: "+=120%",
              pin: true,
              scrub: true,
            },
          },
        );
      }
    }, section);

    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="vetrina"
      className="bg-background flex h-screen items-center overflow-hidden"
      style={{ perspective: "1200px" }}
    >
      <div className="mx-auto w-full max-w-6xl px-6">
        <p className="text-muted flex items-center gap-3">
          <span className="font-mono text-sm font-bold tabular-nums">01</span>
          <span className="text-accent-ink text-sm font-semibold tracking-widest uppercase">
            Siti vetrina moderni
          </span>
        </p>
        <h2 className="font-display mt-2 max-w-2xl text-3xl font-bold tracking-tight text-balance sm:text-5xl">
          Un sito che si guarda come un film.
        </h2>

        {/* "Schermata" del finto-video */}
        <div
          ref={frameRef}
          className="border-border shadow-lift relative mt-8 aspect-video w-full origin-bottom overflow-hidden rounded-2xl border"
        >
          {/* Cielo */}
          <div className="absolute inset-0 bg-gradient-to-b from-sky-200 via-sky-100 to-amber-50" />
          {/* Sole */}
          <div className="absolute top-6 right-10 h-16 w-16">
            <span className="sun-glow absolute inset-0 rounded-full bg-amber-300 blur-md" />
            <span className="absolute inset-2 rounded-full bg-amber-200" />
          </div>

          {/* Pannello solare (prospettico) */}
          <div
            className="absolute bottom-10 left-1/2 grid w-[58%] -translate-x-1/2 grid-cols-6 gap-1 rounded-md bg-slate-800 p-2"
            style={{ transform: "translateX(-50%) rotateX(52deg)", transformOrigin: "bottom" }}
          >
            {CELLS.map((_, i) => (
              <span key={i} className="relative aspect-square rounded-[2px] bg-slate-700">
                <span className="sp-glow bg-accent absolute inset-0 rounded-[2px] opacity-0" />
              </span>
            ))}
          </div>

          {/* Cavo di ricarica con energia che scorre */}
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 100 56"
            preserveAspectRatio="none"
          >
            <path
              d="M14 54 C 14 36, 30 34, 44 33"
              fill="none"
              className="stroke-slate-500"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            <path
              d="M14 54 C 14 36, 30 34, 44 33"
              fill="none"
              className="cable-flow stroke-accent"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeDasharray="6 34"
            />
            {/* Connettore */}
            <rect x="10.5" y="50" width="7" height="5" rx="1.2" className="fill-slate-700" />
          </svg>

          {/* Finto HUD "video" */}
          <div className="absolute top-3 left-3 flex items-center gap-2 rounded-full bg-black/40 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 motion-safe:animate-pulse" />{" "}
            SCROLLYTELLING
          </div>
        </div>
      </div>
    </section>
  );
}
