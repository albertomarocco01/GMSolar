"use client";

import { useEffect, useRef } from "react";
import Container from "@gmgroup/ui/Container";
import Badge from "@gmgroup/ui/Badge";
import SplitTextReveal from "@gmgroup/ui/SplitTextReveal";
import ScrollReveal from "@gmgroup/ui/ScrollReveal";
import { gsap } from "@gmgroup/lib/gsap";
import { VIDEOS, POSTERS } from "@gmgroup/lib/assets";
import { useReducedMotion, useIsoLayoutEffect } from "@gmgroup/lib/motion";
import solar from "@/data/solar-projects.json";
import SolarProjectPhoto from "@/components/solar/SolarProjectPhoto";

const DRONE_POSTER = POSTERS.solarDrone;

const nf0 = new Intl.NumberFormat("it-IT", { maximumFractionDigits: 0 });
const nf1 = new Intl.NumberFormat("it-IT", { maximumFractionDigits: 1 });

/** CO₂/anno evitata (t) da kWp: 1200 kWh/kWp × 0,35 kg/kWh ÷ 1000 (stesse ipotesi del calcolatore). */
const co2AnnoT = (kWp: number) => (kWp * 1200 * 0.35) / 1000;

/** Potenza leggibile: ≥ 1 MW in MW, altrimenti in kWp. */
function powerLabel(kWp: number) {
  return kWp >= 1000
    ? { value: nf1.format(kWp / 1000), unit: "MW" }
    : { value: nf0.format(kWp), unit: "kWp" };
}

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

  // Video LAZY: è molto sotto la piega. Con `preload="none"` non si scarica al
  // primo load; lo avviamo (→ download) solo quando la sezione si avvicina al
  // viewport, così non compete con l'LCP dell'hero in cima alla pagina.
  useEffect(() => {
    const v = videoRef.current;
    const section = sectionRef.current;
    if (!v || !section) return;
    if (reduced) {
      v.pause();
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          void v.play().catch(() => {});
          io.disconnect();
        }
      },
      { rootMargin: "200px 0px" },
    );
    io.observe(section);
    return () => io.disconnect();
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
        className="absolute inset-x-0 top-[-15%] -z-10 h-[130%] w-full object-cover"
        muted
        loop={!reduced}
        playsInline
        preload="none"
        poster={DRONE_POSTER}
      >
        <source src={VIDEOS.solarDrone} type="video/mp4" />
      </video>

      {/* Overlay per leggibilità. */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-black/55" />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-linear-to-t from-black/85 via-black/30 to-black/60"
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
          {solar.progettiVetrina.map((p, i) => {
            const power = powerLabel(p.kWp);
            return (
              <article
                key={p.nome}
                className="group relative isolate overflow-hidden rounded-xl border border-white/15"
              >
                {/* Foto del progetto (PLACEHOLDER branded, sostituibile con una vera immagine). */}
                <SolarProjectPhoto
                  seed={i}
                  className="ease-out-expo absolute inset-0 -z-10 h-full w-full duration-(--duration-slow) motion-safe:transition-transform motion-safe:group-hover:scale-105"
                />
                {/* Overlay per la leggibilità del testo sopra la foto. */}
                <div
                  aria-hidden
                  className="absolute inset-0 -z-10 bg-linear-to-t from-black/85 via-black/35 to-transparent"
                />

                <div className="flex min-h-76 flex-col p-5">
                  <span className="text-accent w-fit rounded-full bg-black/40 px-3 py-1 text-xs font-medium tracking-wide backdrop-blur">
                    {p.tipo}
                  </span>

                  <div className="mt-auto pt-10">
                    <h3 className="font-display text-xl font-bold tracking-tight text-balance">
                      {p.nome}
                    </h3>
                    <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-3">
                      <div>
                        <dt className="text-[0.65rem] tracking-wide text-white/55 uppercase">
                          Potenza
                        </dt>
                        <dd className="font-display text-lg font-bold tabular-nums">
                          {power.value}
                          <span className="ml-1 text-sm font-medium text-white/70">
                            {power.unit}
                          </span>
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[0.65rem] tracking-wide text-white/55 uppercase">
                          CO₂ evitata
                        </dt>
                        <dd className="font-display text-lg font-bold tabular-nums">
                          {nf0.format(co2AnnoT(p.kWp))}
                          <span className="ml-1 text-sm font-medium text-white/70">t/anno</span>
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[0.65rem] tracking-wide text-white/55 uppercase">
                          Anno
                        </dt>
                        <dd className="font-display text-lg font-bold tabular-nums">{p.anno}</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </article>
            );
          })}
        </ScrollReveal>
      </Container>
    </section>
  );
}
