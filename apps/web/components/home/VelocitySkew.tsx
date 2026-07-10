"use client";

/**
 * @descrizione  Tocco premium "fisico": inclina leggermente il contenuto delle
 *   scene (.imm-skew) in base alla VELOCITÀ di scroll di Lenis → senso di inerzia.
 *   Gira nel ticker GSAP (un solo loop). Reduced-motion: non fa nulla.
 * @indice
 * - VelocitySkew → montato una volta nella home, agisce su tutte le .imm-skew
 */
import { useEffect } from "react";
import { gsap, ScrollTrigger } from "@gmgroup/lib/gsap";
import { prefersReducedMotion } from "@gmgroup/lib/motion";

/** Sotto questa soglia (gradi) lo skew è invisibile: lo trattiamo come zero e non
 *  riscriviamo il transform. Evita di sporcare ogni frame il layer che contiene
 *  l'intera scena mentre la pagina è ferma (o in pausa). */
const EPS = 0.005;

export default function VelocitySkew() {
  useEffect(() => {
    if (prefersReducedMotion()) return;

    // Nodi risolti UNA volta (e ri-risolti quando il layout cambia): prima ogni
    // frame faceva un querySelectorAll globale via il selettore GSAP.
    let nodes: HTMLElement[] = [];
    const collect = () => {
      nodes = Array.from(document.querySelectorAll<HTMLElement>(".imm-skew"));
    };
    collect();

    const clamp = (v: number) => Math.max(-2, Math.min(2, v));
    let last = 0;
    const tick = () => {
      if (nodes.length === 0) {
        collect(); // le scene montano dopo di noi al primo frame
        if (nodes.length === 0) return;
      }
      const v = (window as unknown as { __lenis?: { velocity?: number } }).__lenis?.velocity ?? 0;
      const skew = clamp(v * 0.012);
      // Scrittura solo quando il valore cambia davvero: a scroll fermo (o in
      // pausa) il ticker gira comunque, ma non tocchiamo più il DOM.
      if (Math.abs(skew - last) < EPS) return;
      last = skew;
      gsap.set(nodes, { skewY: skew });
    };
    gsap.ticker.add(tick);
    ScrollTrigger.addEventListener("refresh", collect);
    return () => {
      gsap.ticker.remove(tick);
      ScrollTrigger.removeEventListener("refresh", collect);
    };
  }, []);
  return null;
}
