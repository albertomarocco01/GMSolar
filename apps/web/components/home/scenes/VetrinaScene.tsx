"use client";

/**
 * @descrizione  Servizio #1 "Siti vetrina": VIDEO SCROLLYTELLING. Il video è
 *   full-bleed e viene SCRUBBATO dallo scroll (currentTime ∝ progresso) mentre
 *   la sezione resta pinnata; le didascalie cambiano a beat. Niente 3D.
 *   Reduced-motion / assenza metadati video → poster statico + testo leggibile.
 * @indice
 * - VetrinaScene → seconda sezione (dopo l'hero)
 */
import { useRef } from "react";
import { gsap, ScrollTrigger } from "@gmgroup/lib/gsap";
import { prefersReducedMotion, useIsoLayoutEffect } from "@gmgroup/lib/motion";
import { VIDEOS, POSTERS } from "@gmgroup/lib/assets";

/** Beat della narrazione, sincronizzati col progresso dello scrub. */
const CAPTIONS = [
  {
    title: "Scrollytelling cinematografico",
    text: "Il racconto si muove con lo scroll: video, testo e ritmo in sincrono.",
  },
  {
    title: "Video 4K, zero compromessi",
    text: "Footage reale scrubbato frame-by-frame — non un loop, una regia.",
  },
  {
    title: "Veloce su ogni device",
    text: "Poster istantaneo, caricamento progressivo, fallback se serve.",
  },
];

export default function VetrinaScene() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const capRefs = useRef<(HTMLDivElement | null)[]>([]);

  useIsoLayoutEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video || prefersReducedMotion()) return;

    let st: ScrollTrigger | undefined;

    const setup = () => {
      const dur = video.duration;
      if (!dur || Number.isNaN(dur)) return; // niente metadati → resta il poster
      video.pause();
      st = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "+=200%",
        pin: true,
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const p = self.progress;
          // Scrub del video.
          const t = Math.min(dur - 0.05, p * dur);
          if (Math.abs(video.currentTime - t) > 0.02) video.currentTime = t;
          // Didascalia attiva a beat.
          const active = Math.min(CAPTIONS.length - 1, Math.floor(p * CAPTIONS.length));
          capRefs.current.forEach((el, i) => {
            if (el) el.style.opacity = i === active ? "1" : "0";
          });
        },
      });
      ScrollTrigger.refresh();
    };

    if (video.readyState >= 1) setup();
    else video.addEventListener("loadedmetadata", setup, { once: true });

    return () => {
      st?.kill();
      video.removeEventListener("loadedmetadata", setup);
    };
  }, []);

  return (
    <section ref={sectionRef} id="vetrina" className="relative h-screen overflow-hidden bg-black">
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        src={VIDEOS.solarDrone}
        poster={POSTERS.solarDrone}
        muted
        playsInline
        preload="auto"
        aria-hidden
      />
      {/* Velo per leggibilità del testo sopra il video */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/60"
      />

      {/* Etichetta servizio */}
      <div className="absolute top-24 left-0 w-full">
        <div className="mx-auto w-full max-w-6xl px-6">
          <p className="text-white/60">
            <span className="font-mono text-sm font-bold tabular-nums">01</span>
            <span className="ml-3 text-sm font-semibold tracking-widest uppercase">
              Siti vetrina moderni
            </span>
          </p>
          <h2 className="font-display mt-3 max-w-2xl text-3xl font-bold tracking-tight text-balance text-white sm:text-5xl">
            Un sito che si guarda come un film.
          </h2>
        </div>
      </div>

      {/* Didascalie a beat (sovrapposte; la prima è visibile di default) */}
      <div className="absolute bottom-16 left-0 w-full">
        <div className="relative mx-auto h-28 w-full max-w-6xl px-6">
          {CAPTIONS.map((c, i) => (
            <div
              key={c.title}
              ref={(el) => {
                capRefs.current[i] = el;
              }}
              className="absolute inset-x-6 transition-opacity duration-500"
              style={{ opacity: i === 0 ? 1 : 0 }}
            >
              <p className="text-accent text-sm font-semibold tracking-widest uppercase">
                {c.title}
              </p>
              <p className="mt-2 max-w-xl text-lg text-white/85">{c.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
