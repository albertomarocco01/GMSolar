"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Macchina a stati del player: indice corrente, play/pausa (preferenza utente),
 * visibilità della tab, e i comandi di navigazione. Cabla qui i controlli
 * "globali" (tastiera + visibilitychange); i gesti di puntatore/swipe e il
 * timing visivo restano nel TourPlayer (hanno bisogno del DOM).
 *
 * REGOLA DI PROGETTO: con prefers-reduced-motion non c'è auto-avanzamento; il
 * TourPlayer non crea il tween di avanzamento e nasconde il toggle play/pausa.
 * Qui `isPlaying` resta una preferenza, ma senza tween non muove nulla.
 */
export function useTourControls({
  count,
  reducedMotion,
  onExit,
}: {
  count: number;
  reducedMotion: boolean;
  onExit: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [hidden, setHidden] = useState(false);

  const goTo = useCallback(
    (i: number) => setIndex(() => Math.max(0, Math.min(count - 1, i))),
    [count],
  );
  const next = useCallback(() => setIndex((i) => Math.min(count - 1, i + 1)), [count]);
  const prev = useCallback(() => setIndex((i) => Math.max(0, i - 1)), []);
  const togglePlay = useCallback(() => setIsPlaying((p) => !p), []);
  const restart = useCallback(() => {
    setIndex(0);
    setIsPlaying(true);
  }, []);

  // Tab nascosta → segnala stop dell'auto-avanzamento (il player mette in pausa
  // il tween). Allinea lo stato iniziale al primo mount.
  useEffect(() => {
    const onVis = () => setHidden(document.hidden);
    onVis();
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  // Tastiera: ← → naviga, Spazio play/pausa (solo se non reduced-motion),
  // Esc esce. preventDefault su Spazio/frecce per non far scrollare la pagina.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        next();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
      } else if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        if (!reducedMotion) togglePlay();
      } else if (e.key === "Escape") {
        e.preventDefault();
        onExit();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, togglePlay, onExit, reducedMotion]);

  return { index, isPlaying, hidden, goTo, next, prev, togglePlay, restart, setIsPlaying };
}
