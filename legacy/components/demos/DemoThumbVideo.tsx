"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@gmgroup/lib/motion";

/**
 * Anteprima video muta e decorativa per una card del launcher. Riproduce solo
 * al passaggio del mouse o quando il link della card riceve il focus da tastiera
 * (play su `pointerenter`/`focusin` della card, stop all'uscita); altrimenti
 * mostra solo il poster. `preload="none"` → il file non si scarica finché non
 * serve. REGOLA DI PROGETTO: con prefers-reduced-motion NON parte mai (solo
 * poster). Gli eventi sono agganciati alla card (`[data-demo-card]`) perché
 * l'overlay del link "stretched" intercetta il puntatore sopra al video.
 */
export default function DemoThumbVideo({ src, poster }: { src: string; poster: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video || prefersReducedMotion()) return;

    const card = video.closest("[data-demo-card]");
    if (!card) return;

    const play = () => {
      void video.play().catch(() => {
        /* autoplay bloccato dal browser: resta il poster, nessun problema */
      });
    };
    const stop = () => {
      video.pause();
      video.currentTime = 0;
    };

    card.addEventListener("pointerenter", play);
    card.addEventListener("pointerleave", stop);
    card.addEventListener("focusin", play);
    card.addEventListener("focusout", stop);
    return () => {
      card.removeEventListener("pointerenter", play);
      card.removeEventListener("pointerleave", stop);
      card.removeEventListener("focusin", play);
      card.removeEventListener("focusout", stop);
      stop();
    };
  }, []);

  return (
    <video
      ref={ref}
      className="h-full w-full object-cover"
      poster={poster}
      muted
      loop
      playsInline
      preload="none"
      tabIndex={-1}
      aria-hidden
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}
