"use client";

/**
 * @descrizione  CHIUSURA della presentazione — versione MINIMALE (richiesta
 *   2026-07-12): SOLO il bottone «Ricomincia la presentazione», centrato.
 *   Niente titolo, niente contatti, niente animazione di sfondo (le bolle
 *   ClosingBubbles sono state rimosse con la loro componente).
 * @indice
 * - ClosingScene → ultima sezione: solo il replay
 */
import Section from "@gmgroup/ui/Section";
import ReplayButton from "@/components/home/ReplayButton";

export default function ClosingScene() {
  return (
    <Section fullBleed className="flex min-h-svh items-center justify-center">
      <ReplayButton />
    </Section>
  );
}
