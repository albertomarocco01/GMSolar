/**
 * Modello dati del "Demo Wrapped" — lo story-tour a /demos/tour. Riusa lo STESSO
 * catalogo del launcher (`DEMOS` da catalog.ts) così tour e griglia non divergono
 * mai: aggiungere una demo al JSON = una slide in più nel tour.
 */
import { DEMOS } from "./catalog";
import type { AccentKey, Demo } from "./types";

/** Durata (secondi) di auto-avanzamento per slide. */
export const SLIDE_SECONDS = 6;

/**
 * Mappa brand → valore `data-theme`. Impostato sulla radice della slide
 * ri-tematizza il sottoalbero sull'accent del brand (i token definiscono
 * `[data-theme="…"] { --accent… }`), così il Button condiviso usa il colore
 * giusto CON il contrasto corretto, senza dipendere dall'accent runtime della
 * route (che qui è quello del gruppo).
 */
export const THEME_FOR_WORLD: Record<AccentKey, "hub" | "solar" | "mobility" | "shop"> = {
  group: "hub",
  solar: "solar",
  mobility: "mobility",
  shop: "shop",
};

/** Una slide del tour: intro, una per demo (in ordine di catalogo), recap finale. */
export type TourSlide =
  | { id: string; kind: "intro"; world: AccentKey }
  | { id: string; kind: "demo"; world: AccentKey; demo: Demo }
  | { id: string; kind: "closing"; world: AccentKey };

/** Costruisce la sequenza: intro → [una slide per demo] → recap. */
export function buildTourSlides(demos: Demo[] = DEMOS): TourSlide[] {
  return [
    { id: "intro", kind: "intro", world: "group" },
    ...demos.map(
      (demo): TourSlide => ({ id: `demo-${demo.key}`, kind: "demo", world: demo.world, demo }),
    ),
    { id: "closing", kind: "closing", world: "group" },
  ];
}

/** Titolo testuale della slide (per la regione aria-live e i fallback). */
export function slideTitle(slide: TourSlide): string {
  if (slide.kind === "intro") return "Il tour delle demo";
  if (slide.kind === "closing") return "Riepilogo del tour";
  return slide.demo.title;
}
