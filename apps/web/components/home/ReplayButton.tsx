"use client";

/**
 * @descrizione  CTA "Rivedi la presentazione": riavvolge lo scroll fino in cima in
 *   modo SMOOTH (un "refresh" morbido che riattraversa le scene) e fa ripartire
 *   l'auto-scroll. Se Lenis è attivo delega ad AutoScroll via evento (lui pilota il
 *   rewind e riprende l'auto); altrimenti — reduced-motion / Lenis assente — fa uno
 *   scroll nativo in cima, rispettando la preferenza di movimento.
 * @indice
 * - ReplayButton → usato in ClosingScene al posto del vecchio link `#top`
 */
import Button from "@gmgroup/ui/Button";
import { prefersReducedMotion } from "@gmgroup/lib/motion";

export default function ReplayButton() {
  const onClick = () => {
    const hasLenis = !!(window as unknown as { __lenis?: unknown }).__lenis;
    if (hasLenis) {
      window.dispatchEvent(new Event("presentation:replay"));
    } else {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" });
    }
  };

  return (
    <Button variant="solid" size="lg" onClick={onClick}>
      Rivedi la presentazione
    </Button>
  );
}
