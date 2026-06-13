"use client";

import { useEffect, useRef } from "react";
import Container from "@/components/ui/Container";
import Badge from "@/components/ui/Badge";
import SplitTextReveal from "@/components/ui/SplitTextReveal";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { gsap } from "@/lib/gsap";
import { VIDEOS, POSTERS } from "@/lib/assets";
import { useReducedMotion, useIsoLayoutEffect } from "@/lib/motion";
import solar from "@/data/solar-projects.json";

const DRONE_POSTER = POSTERS.solarDrone;

/**
 * Case study con parallax: sezione full-bleed con video drone reale di sfondo
 * (gm-solar-drone.mp4) che scorre con un parallax leggero, e i progetti
 * vetrina reali (da data/solar-projects.json) come card "glass" in primo piano.
 *
 * Reduced-motion: niente parallax e video in pausa (resta il poster/overlay).
 */
export default function SolarCaseStudy() {
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (reduced) v.pause();
    else void v.play().catch(() => {});
  }, [reduced]);

  useIsoLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section || reduced) return;

    const ctx = gsap.context(() => {
      // Il video è sovradimensionato (h-[130%], -top-[15%]): lo trasliamo entro
      // quel margine così non si scoprono i bordi.
      gsap.fromTo(
        videoRef.current,
        { yPercent: -8 },
        {
          yPercent: 8,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );
    }, section);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <section ref={sectionRef} id="progetti" className="relative isolate overflow-hidden text-white">
      {/* Video di sfondo sovradimensionato per il parallax. */}
      <video
        ref={videoRef}
        className="absolute inset-x-0 -top-[15%] -z-10 h-[130%] w-full object-cover"
        autoPlay={!reduced}
        muted
        loop={!reduced}
        playsInline
        preload="metadata"
        poster={DRONE_POSTER}
      >
        <source src={VIDEOS.solarDrone} type="video/mp4" />
      </video>

      {/* Overlay per leggibilità. */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-black/55" />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-t from-black/85 via-black/30 to-black/60"
      />

      <Container className="py-section">
        <div className="max-w-2xl">
          <Badge className="backdrop-blur">Progetti realizzati</Badge>
          <SplitTextReveal
            as="h2"
            text="Dove il sole è già al lavoro"
            className="font-display text-display-sm mt-4 font-bold tracking-tight text-balance"
          />
          <p className="mt-4 text-lg text-white/80">
            Solar farm in scala utility e coperture industriali: alcuni degli impianti firmati GM
            Solar.
          </p>
        </div>

        <ScrollReveal className="mt-12 grid gap-6 md:grid-cols-3" stagger={0.12} y={36}>
          {solar.progettiVetrina.map((p) => (
            <article
              key={p.nome}
              className="flex h-full flex-col justify-between rounded-xl border border-white/15 bg-white/5 p-6 backdrop-blur-md"
            >
              <span className="text-accent w-fit rounded-full bg-white/10 px-3 py-1 text-xs font-medium tracking-wide">
                {p.tipo}
              </span>
              {p.potenzaMW != null ? (
                <p className="font-display mt-8 text-4xl font-bold tabular-nums">
                  {p.potenzaMW}
                  <span className="ml-1 text-2xl text-white/70">MW</span>
                </p>
              ) : (
                <div className="mt-8" />
              )}
              <h3 className="font-display mt-2 text-lg font-bold tracking-tight text-balance">
                {p.nome}
              </h3>
            </article>
          ))}
        </ScrollReveal>
      </Container>
    </section>
  );
}
