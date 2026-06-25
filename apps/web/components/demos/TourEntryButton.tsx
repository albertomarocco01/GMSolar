"use client";

import { useEffect } from "react";
import Button from "@gmgroup/ui/Button";

/**
 * Entry point del tour sul launcher. È un client component per gestire il
 * RIPRISTINO DEL FOCUS: quando si esce dal tour (Esc / chiudi), il player segna
 * un flag in sessionStorage e torna a /demos; al rientro questo bottone, se trova
 * il flag, riprende il focus (WCAG 2.4.3 — l'utente da tastiera/AT non resta
 * disorientato). Su prima visita normale il flag è assente: nessun furto di focus.
 */
export const TOUR_RETURN_FOCUS_KEY = "gm-tour-return-focus";

export default function TourEntryButton() {
  useEffect(() => {
    let returning = false;
    try {
      returning = sessionStorage.getItem(TOUR_RETURN_FOCUS_KEY) === "1";
      if (returning) sessionStorage.removeItem(TOUR_RETURN_FOCUS_KEY);
    } catch {
      /* sessionStorage non disponibile: nessun ripristino, non bloccante */
    }
    if (returning) document.getElementById("avvia-il-tour")?.focus();
  }, []);

  return (
    <Button id="avvia-il-tour" href="/demos/tour" size="lg">
      <span aria-hidden>▶</span> Avvia il tour
    </Button>
  );
}
