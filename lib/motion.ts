/**
 * Helper di motion condivisi: rilevazione di prefers-reduced-motion e
 * costanti di durata/easing allineate ai token CSS (app/tokens.css).
 *
 * REGOLA DI PROGETTO: rispettare SEMPRE prefers-reduced-motion. Le
 * animazioni non essenziali vanno saltate quando l'utente lo richiede.
 */
import { useEffect, useLayoutEffect, useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

/**
 * useLayoutEffect lato client (per impostare lo stato iniziale GSAP prima
 * del paint ed evitare flash), useEffect lato server per non emettere warning.
 */
export const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/** Lettura una-tantum (safe su server: ritorna false). */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia(QUERY).matches;
}

function subscribeReducedMotion(callback: () => void): () => void {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

/**
 * Hook reattivo: ritorna true se l'utente preferisce meno movimento e si
 * aggiorna se la preferenza cambia a runtime. Usa useSyncExternalStore così
 * è SSR-safe (snapshot server = false) e senza setState dentro un effect.
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
}

/** Durate in SECONDI (GSAP usa i secondi), allineate ai token CSS. */
export const DURATION = {
  fast: 0.2,
  base: 0.4,
  slow: 0.7,
  slower: 1.1,
} as const;

/** Easing GSAP (built-in, niente plugin premium) coerenti con il feel del sito. */
export const EASE = {
  out: "power3.out",
  outExpo: "expo.out",
  inOut: "power2.inOut",
  spring: "back.out(1.6)",
} as const;
