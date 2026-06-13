"use client";

import { useEffect, useRef } from "react";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import SplitTextReveal from "@/components/ui/SplitTextReveal";
import { VIDEOS } from "@/lib/assets";
import { useReducedMotion } from "@/lib/motion";

/**
 * Hero cinematic della home: video reale a tutto schermo (gm-solar-hero.mp4)
 * con overlay per la leggibilità del testo. Se l'utente preferisce meno
 * movimento il video resta in pausa sul primo frame (niente autoplay/loop) e
 * si appoggia comunque al gradiente di fallback.
 */
export default function Hero() {
  const reduced = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (reduced) v.pause();
    else void v.play().catch(() => {});
  }, [reduced]);

  return (
    <section className="relative isolate flex min-h-[88svh] items-end overflow-hidden text-white">
      {/* Fallback se il video non carica / non è disponibile. */}
      <div
        aria-hidden
        className="from-brand-950 via-background to-background absolute inset-0 -z-20 bg-gradient-to-br"
      />
      {/* Video reale (placeholder drone GM Solar). */}
      <video
        ref={videoRef}
        className="absolute inset-0 -z-10 h-full w-full object-cover"
        autoPlay={!reduced}
        muted
        loop={!reduced}
        playsInline
        preload="metadata"
      >
        <source src={VIDEOS.solarHero} type="video/mp4" />
      </video>
      {/* Overlay scuro per il contrasto del testo. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/25"
      />

      <Container className="relative z-10 pt-32 pb-16 md:pb-24">
        <div className="max-w-3xl">
          <Badge className="mb-5 backdrop-blur">GM Group · ecosistema</Badge>
          <SplitTextReveal
            as="h1"
            text="Un gruppo, tre mondi."
            className="font-display text-display-sm sm:text-display-md md:text-display-lg font-bold text-balance"
          />
          <p className="mt-6 max-w-xl text-lg text-white/80 md:text-xl">
            Produci la tua energia, muoviti in elettrico e collega tutto con il cavo giusto. GM
            Group unisce fotovoltaico, ricarica e accessori in un unico ecosistema.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button href="#ecosistema" size="lg">
              Scopri l&apos;ecosistema
            </Button>
            <Button href="/solar" variant="outline" size="lg" className="text-white">
              Entra in GM Solar
            </Button>
          </div>
        </div>
      </Container>

      {/* Indicatore di scroll. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-5 mx-auto w-fit text-xs tracking-widest text-white/60 uppercase"
      >
        Scorri
      </span>
    </section>
  );
}
