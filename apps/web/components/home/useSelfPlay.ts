"use client";

/**
 * @descrizione  Fa "recitare" un modulo, con ScrollTrigger come UNICA autorità su
 *   play/pausa (niente IntersectionObserver + soglia magica). All'ingresso in
 *   vista la timeline parte e chiede all'AutoScroll di fermarsi per la DURATA del
 *   ciclo (evento `autoscroll:hold`); all'uscita la timeline va in PAUSA (così le
 *   ~8 timeline `repeat:-1` non girano tutte insieme fuori schermo → niente lag).
 *   Reduced-motion: salta allo stato finale, nessun hold.
 * @indice
 * - useSelfPlay(build, { holdMs? }) → ref da mettere sul root del modulo
 */
import { useRef } from "react";
import { gsap, ScrollTrigger } from "@gmgroup/lib/gsap";
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

    const tl = build(root);

    if (prefersReducedMotion()) {
      tl.progress(1).pause();
      return () => tl.kill();
    }

    tl.pause();

    const st = ScrollTrigger.create({
      trigger: root,
      start: "top center",
      end: "bottom center",
      onToggle: (self) => {
        if (self.isActive) {
          tl.play();
          const ms = opts?.holdMs ?? tl.duration() * 1000;
          window.dispatchEvent(new CustomEvent("autoscroll:hold", { detail: { ms } }));
        } else {
          tl.pause();
        }
      },
    });

    return () => {
      st.kill();
      tl.kill();
    };
  }, []);

  return ref;
}
