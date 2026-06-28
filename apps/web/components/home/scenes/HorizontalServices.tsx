"use client";

/**
 * @descrizione  Cuore della scrollytelling: gli altri 6 servizi raccontati in un
 *   TRACK ORIZZONTALE pinnato. Scorrendo in verticale, i pannelli scorrono in
 *   orizzontale (GSAP pin+scrub). Ogni pannello riusa la visual animata del
 *   servizio e si ri-tematizza con il proprio accent. Reduced-motion: niente pin,
 *   il track diventa scroll orizzontale nativo (accessibile).
 * @indice
 * - HorizontalServices → terza sezione (dopo la vetrina video)
 */
import { useRef, type ComponentType, type CSSProperties } from "react";
import { gsap, ScrollTrigger } from "@gmgroup/lib/gsap";
import { prefersReducedMotion, useIsoLayoutEffect } from "@gmgroup/lib/motion";
import Container from "@gmgroup/ui/Container";
import { SERVICES, type ServiceKey } from "@gmgroup/lib/site";
import AssistenteVisual from "../visuals/AssistenteVisual";
import DashboardVisual from "../visuals/DashboardVisual";
import GestionaleVisual from "../visuals/GestionaleVisual";
import RicaricaVisual from "../visuals/RicaricaVisual";
import IntegrazioniVisual from "../visuals/IntegrazioniVisual";
import SegnalazioniVisual from "../visuals/SegnalazioniVisual";

/** Visual per servizio (la "vetrina" è il video, non entra nel track). */
const VISUALS: Partial<Record<ServiceKey, ComponentType>> = {
  assistente: AssistenteVisual,
  dashboard: DashboardVisual,
  gestionale: GestionaleVisual,
  ricarica: RicaricaVisual,
  integrazioni: IntegrazioniVisual,
  segnalazioni: SegnalazioniVisual,
};

/** Temi accent usati nel track (sottoinsieme di ThemeKey). */
type AccentTheme = "platform" | "mobility";

/** Accent per tema: vars consumate dalle visual/primitive del pannello. */
const ACCENTS: Record<AccentTheme, { a: string; s: string; c: string }> = {
  platform: { a: "#7c5cff", s: "#6344e6", c: "#ffffff" },
  mobility: { a: "#3c9e3a", s: "#2f7e2e", c: "#ffffff" },
};

function accentStyle(theme: string): CSSProperties {
  const t = ACCENTS[theme as AccentTheme] ?? ACCENTS.platform;
  return {
    ["--accent" as string]: t.a,
    ["--accent-strong" as string]: t.s,
    ["--accent-contrast" as string]: t.c,
  } as CSSProperties;
}

const PANELS = SERVICES.filter((s) => s.key !== "vetrina");

export default function HorizontalServices() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useIsoLayoutEffect(() => {
    const wrap = wrapRef.current;
    const track = trackRef.current;
    if (!wrap || !track || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      const total = () => track.scrollWidth - window.innerWidth;
      gsap.to(track, {
        x: () => -total(),
        ease: "none",
        scrollTrigger: {
          trigger: wrap,
          start: "top top",
          end: () => `+=${total()}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });
    }, wrap);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={wrapRef} className="overflow-hidden motion-reduce:overflow-x-auto">
      <div ref={trackRef} className="flex">
        {PANELS.map((s) => {
          const Visual = VISUALS[s.key];
          return (
            <section
              key={s.key}
              aria-label={s.label}
              style={accentStyle(s.theme)}
              className="flex h-screen w-screen shrink-0 items-center"
            >
              <Container>
                <div className="grid items-center gap-10 md:grid-cols-2">
                  {/* Testo */}
                  <div className="max-w-md">
                    <p className="text-muted">
                      <span className="font-mono text-sm font-bold tabular-nums">{s.number}</span>
                      <span className="text-accent-ink ml-3 text-sm font-semibold tracking-widest uppercase">
                        {s.label}
                      </span>
                    </p>
                    <h2 className="font-display mt-3 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
                      {s.title}
                    </h2>
                    <p className="text-muted mt-4 text-lg leading-relaxed">{s.blurb}</p>
                  </div>
                  {/* Visual animata del servizio */}
                  <div className="w-full">{Visual ? <Visual /> : null}</div>
                </div>
              </Container>
            </section>
          );
        })}
      </div>
    </div>
  );
}
