"use client";

/**
 * @descrizione  HUD DI CAPITOLO (P12): pill fissa in alto a destra che indica il
 *   capitolo corrente («Dashboard» — solo titolo, senza numerazione) + mini-rail
 *   di 8 puntini (l'attivo è accent). È un indicatore di REGIA, non navigazione: `pointer-events-none` e
 *   `aria-hidden`.
 *   Rilevamento: UN solo IntersectionObserver sulle section `[data-chapter]`
 *   (marcate da ImmersiveStage via prop `chapterIndex`; la scena Solare a mano).
 *   Le section sono alte 400–700vh → un threshold classico (0.5 sul rapporto di
 *   AREA della section) non scatterebbe mai: si usa la LINEA DI CENTRO viewport
 *   (rootMargin -50%/-50%, threshold 0) — il capitolo attivo è la section che
 *   contiene il centro dello schermo, semantica equivalente ("il capitolo occupa
 *   almeno metà viewport") e per costruzione ne è attiva al più UNA.
 *   Comportamento: nascosta finché non si entra nel capitolo 01; sulla
 *   ClosingScene (nessuna section marcata lì) il capitolo attivo decade a null →
 *   si nasconde da sola, senza criteri aggiuntivi. Crossfade breve del testo al
 *   cambio capitolo; sotto reduced-motion nessuna animazione (swap secco).
 *   Scene non ancora migrate (zero section marcate) → l'observer non parte e
 *   l'HUD resta invisibile: retro-compatibile.
 * @indice
 * - ChapterHUD → componente client da montare UNA volta in page.tsx
 */
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@gmgroup/lib/motion";
import { CHAPTERS } from "./immersive/shared";

/** Durata (ms) della metà "out" del crossfade del testo. */
const FADE_MS = 150;

export default function ChapterHUD() {
  const reduced = useReducedMotion();
  /** Capitolo ATTIVO rilevato dall'observer (null = fuori dai capitoli → pill nascosta). */
  const [active, setActive] = useState<number | null>(null);
  /** Capitolo MOSTRATO nel testo — insegue `active` con un crossfade breve. */
  const [shown, setShown] = useState<number | null>(null);
  const [fading, setFading] = useState(false);
  /** Specchio sincrono di `active` per la callback dell'observer (niente closure stantia). */
  const activeRef = useRef<number | null>(null);

  // UN solo IntersectionObserver su tutte le section marcate; disconnect su unmount.
  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>("section[data-chapter]");
    if (sections.length === 0) return; // scene non ancora migrate → HUD dorme
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const idx = Number((entry.target as HTMLElement).dataset.chapter);
          if (Number.isNaN(idx) || !CHAPTERS[idx]) continue;
          if (entry.isIntersecting) {
            activeRef.current = idx;
            setActive(idx);
          } else if (activeRef.current === idx) {
            // Usciti dall'ultimo capitolo attivo SENZA entrare in un altro
            // (ClosingScene, o risaliti sopra il capitolo 01) → nasconditi.
            activeRef.current = null;
            setActive(null);
          }
        }
      },
      // Linea di centro viewport (vedi @descrizione): attiva = contiene il centro.
      { rootMargin: "-50% 0px -50% 0px", threshold: 0 },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  // Crossfade breve del testo al cambio capitolo. Sotto reduced-motion, o alla
  // prima comparsa (nessun testo da cui sfumare), swap SECCO. Quando `active`
  // decade a null NON si tocca il testo: sfuma via l'intera pill col suo ultimo
  // contenuto (niente pill vuota durante il fade-out).
  // Tutti i setState partono da TIMER (mai sincroni nell'effect: regola lint
  // set-state-in-effect / render a cascata); nell'attesa del tick lo swap secco
  // è già corretto a schermo via il fallback `shown ?? active` nel render.
  useEffect(() => {
    if (active === null || active === shown) return;
    const snap = reduced || shown === null;
    const timers = snap
      ? [
          setTimeout(() => {
            setShown(active);
            setFading(false);
          }, 0),
        ]
      : [
          setTimeout(() => setFading(true), 0),
          setTimeout(() => {
            setShown(active);
            setFading(false);
          }, FADE_MS),
        ];
    return () => timers.forEach((t) => clearTimeout(t));
  }, [active, shown, reduced]);

  /** Indice mostrato: `shown` insegue `active` via timer; il fallback copre il
   *  primo tick (swap secco) senza bisogno di setState sincroni. */
  const displayIdx = shown ?? active;
  const chapter = displayIdx !== null ? CHAPTERS[displayIdx] : null;
  const visible = active !== null;

  return (
    <div
      aria-hidden
      // Capitolo 01: pill più in basso, SUL video (il finto sito ha una nav
      // mock h-14 + CTA in alto a destra da non coprire). Dagli altri capitoli
      // in poi risale ad "altezza header" (top-4).
      className={`pointer-events-none fixed right-5 z-40 ${
        displayIdx === 0 ? "top-28" : "top-4"
      } ${reduced ? "" : "transition-[top,opacity] duration-300"} ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="border-border bg-background/80 flex items-center gap-2.5 rounded-full border px-3.5 py-1.5 text-xs backdrop-blur">
        {/* Solo il TITOLO del capitolo (numerazione rimossa su richiesta cliente) */}
        <span
          className={`text-foreground font-medium whitespace-nowrap ${
            reduced ? "" : "transition-opacity duration-150"
          } ${fading ? "opacity-0" : "opacity-100"}`}
        >
          {chapter ? chapter.title : null}
        </span>
        {/* Mini-rail degli 8 capitoli: puntino attivo accent, gli altri neutri */}
        <span className="flex items-center gap-1">
          {CHAPTERS.map((c, i) => (
            <span
              key={c.title}
              className={`h-1.5 w-1.5 rounded-full ${i === displayIdx ? "bg-accent-ink" : "bg-border"}`}
            />
          ))}
        </span>
      </div>
    </div>
  );
}
