"use client";

import { useEffect, useRef } from "react";
import Section from "@gmgroup/ui/Section";
import Container from "@gmgroup/ui/Container";
import Badge from "@gmgroup/ui/Badge";
import Button from "@gmgroup/ui/Button";
import SplitTextReveal from "@gmgroup/ui/SplitTextReveal";
import { gsap } from "@gmgroup/lib/gsap";
import { VIDEOS, POSTERS } from "@gmgroup/lib/assets";
import { useReducedMotion, useIsoLayoutEffect } from "@gmgroup/lib/motion";
import { IconArrowRight } from "@/components/solar/SolarIcons";

/** Poster placeholder branded: sostituire con un frame reale del video. */
const HERO_POSTER = POSTERS.solarHero;

/**
 * Hero cinematografico di GM Solar: video reale a tutto schermo (Section
 * fullBleed), overlay scuro per il contrasto, headline con reveal tipografico
 * e scroll-cue animato.
 *
 * Motion (saltato con prefers-reduced-motion):
 * - parallax leggero del video allo scroll;
 * - fade + rise del contenuto mentre si esce dall'hero.
 * Fallback: gradiente sempre dietro al video + poster, così su mobile (o se
 * l'autoplay non parte) si vede comunque una superficie branded, mai il nero.
 */
export default function SolarHero() {
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Avvio DIFFERITO del video (solo se l'utente non chiede meno movimento).
  // Il video pesa: con `preload="none"` e senza l'attributo `autoPlay` non viene
  // scaricato/decodificato durante il primo paint, così a fare da LCP è il poster
  // leggero (e il testo dell'hero) — niente più render-delay da decode video.
  // Dopo il primo frame avviamo play() (che innesca il download).
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (reduced) {
      v.pause();
      return;
    }
    let timer = 0;
    const raf = requestAnimationFrame(() => {
      timer = window.setTimeout(() => void v.play().catch(() => {}), 200);
    });
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, [reduced]);

  // Parallax video + fade contenuto, guidati dallo scroll (scrub).
  useIsoLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section || reduced) return;

    const ctx = gsap.context(() => {
      const trigger = {
        trigger: section,
        start: "top top",
        end: "bottom top",
        scrub: true,
      } as const;

      gsap.to(videoRef.current, { yPercent: 12, ease: "none", scrollTrigger: trigger });
      gsap.to(contentRef.current, {
        opacity: 0,
        y: -48,
        ease: "none",
        scrollTrigger: { ...trigger, end: "60% top" },
      });
    }, section);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <Section fullBleed>
      <div
        ref={sectionRef}
        className="relative isolate flex min-h-svh items-end overflow-hidden text-white"
      >
        {/* Fallback branded: visibile se il video non carica / non parte. */}
        <div
          aria-hidden
          className="from-brand-950 via-background to-background absolute inset-0 -z-20 bg-linear-to-br"
        />

        {/* Video reale (placeholder). Leggermente sovradimensionato in altezza
            così il parallax non scopre i bordi. */}
        <video
          ref={videoRef}
          className="absolute inset-x-0 top-0 -z-10 h-[112%] w-full object-cover"
          muted
          loop={!reduced}
          playsInline
          preload="none"
          poster={HERO_POSTER}
        >
          <source src={VIDEOS.solarHero} type="video/mp4" />
        </video>

        {/* Overlay per la leggibilità del testo. */}
        <div
          aria-hidden
          className="absolute inset-0 bg-linear-to-t from-black/85 via-black/45 to-black/20"
        />

        <Container className="relative z-10 pt-32 pb-20 md:pb-28">
          <div ref={contentRef} className="max-w-4xl">
            <Badge className="mb-6 backdrop-blur">GM Solar · EPC fotovoltaico</Badge>
            <SplitTextReveal
              as="h1"
              by="word"
              text="Our Best Chance to Save the Planet is You"
              className="font-display text-display-sm sm:text-display-md md:text-display-lg font-bold text-balance"
            />
            <p className="mt-6 max-w-2xl text-lg text-white/80 md:text-xl">
              EPC Contractor per impianti fotovoltaici di media e grande scala: progettiamo,
              realizziamo e manuteniamo l&apos;energia che ti rende indipendente.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button href="#calcolatore" size="lg">
                Stima il tuo risparmio
                <IconArrowRight className="h-4 w-4" />
              </Button>
              <Button href="#progetti" variant="outline" size="lg" className="text-white">
                Guarda i progetti
              </Button>
            </div>
          </div>
        </Container>

        {/* Scroll-cue animato (animate-bounce è azzerato da reduced-motion via CSS). */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-6 mx-auto flex w-fit flex-col items-center gap-2 text-white/70"
        >
          <span className="text-[0.7rem] font-medium tracking-[0.25em] uppercase">Scorri</span>
          <span className="animate-bounce">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </span>
        </div>
      </div>
    </Section>
  );
}
