"use client";

/**
 * @descrizione  Fa "recitare" un modulo quando entra in vista: alla prima
 *   intersezione costruisce una timeline GSAP (che si auto-riproduce) e chiede
 *   all'AutoScroll di FERMARSI per `holdMs` (l'evento `autoscroll:hold`), così
 *   l'utente vede l'interazione prima che lo scroll riparta. Reduced-motion:
 *   salta all'ultimo frame (stato finale leggibile), senza hold.
 * @indice
 * - useSelfPlay(build, { holdMs }) → ref da mettere sul root del modulo
 */
import { useRef } from "react";
import type { gsap } from "@gmgroup/lib/gsap";
import { prefersReducedMotion, useIsoLayoutEffect } from "@gmgroup/lib/motion";

type Timeline = gsap.core.Timeline;

export function useSelfPlay<T extends HTMLElement>(
  build: (root: T) => Timeline,
  opts?: { holdMs?: number },
) {
  const ref = useRef<T>(null);

  useIsoLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;

    if (prefersReducedMotion()) {
      const tl = build(root);
      tl.progress(1).pause();
      return () => tl.kill();
    }

    let tl: Timeline | undefined;
    const io = new IntersectionObserver(
      (entries) => {
        if (tl) return;
        if (entries.some((e) => e.isIntersecting)) {
          tl = build(root);
          const ms = opts?.holdMs ?? tl.duration() * 1000;
          window.dispatchEvent(new CustomEvent("autoscroll:hold", { detail: { ms } }));
          io.disconnect();
        }
      },
      { threshold: 0.55 },
    );
    io.observe(root);

    return () => {
      io.disconnect();
      tl?.kill();
    };
  }, []);

  return ref;
}
