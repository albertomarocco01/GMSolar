/**
 * CABLE-FINDER — livello 1: matcher DETERMINISTICO.
 *
 * Pura logica, zero AI: filtra il catalogo (`data/products.json`) sulle
 * specifiche tecniche e restituisce i match ordinati. Gira lato server (nella
 * route AI) e lato client (nel wizard di fallback quando non c'è la chiave),
 * quindi NON deve dipendere da nulla di runtime-only.
 *
 * Il livello conversazionale (AI) sta sopra a questo: l'AI fa domande, deduce
 * la fase dal modello auto e poi chiama find_cable(). Se l'AI non è disponibile
 * il wizard chiama direttamente find_cable() — la demo non si rompe mai.
 */
import type { Product } from "@/lib/types";
import productsData from "@/data/products.json";

// Il JSON è "dati", non un tipo: lo riportiamo al tipo di dominio una volta sola.
const PRODUCTS = productsData as unknown as Product[];

export type ChargeLocation = "stazione" | "wallbox" | "presa";
export type Phase = "monofase" | "trifase";
export type Shape = "liscio" | "spiralato";

/** Mapping richiesto: dove ricarichi → `specs.use` del catalogo. */
const USE_BY_LOCATION: Record<ChargeLocation, string> = {
  stazione: "stazione pubblica / colonnina",
  wallbox: "wallbox residenziale",
  presa: "presa domestica",
};

/** Etichette leggibili per la UI (bottoni rapidi, bolle del wizard). */
export const LOCATION_LABELS: Record<ChargeLocation, string> = {
  stazione: "Colonnina / stazione pubblica",
  wallbox: "Wallbox di casa",
  presa: "Presa domestica (Schuko)",
};

export type FindCableQuery = {
  chargeLocation: ChargeLocation;
  phase?: Phase;
  shape?: Shape;
};

export type FindCableResult = {
  query: FindCableQuery;
  /** `specs.use` su cui abbiamo filtrato. */
  use: string;
  /** Match ordinati: best seller prima, poi prezzo crescente. */
  matches: Product[];
  /** true se abbiamo allentato i filtri per non restare a mani vuote. */
  relaxed: boolean;
  /** Nota onesta da mostrare quando `relaxed` o quando non c'è nulla a catalogo. */
  note?: string;
};

/** Ordine di rilevanza: best seller in testa, poi prezzo (null in fondo). */
function byRelevance(a: Product, b: Product): number {
  if (a.bestSeller !== b.bestSeller) return a.bestSeller ? -1 : 1;
  const pa = a.price ?? Number.POSITIVE_INFINITY;
  const pb = b.price ?? Number.POSITIVE_INFINITY;
  return pa - pb;
}

/**
 * Trova i cavi compatibili. Prima prova il filtro stretto (uso + fase + forma);
 * se resta a mani vuote allenta il vincolo più rigido (la fase) mantenendo
 * l'uso, così l'utente vede comunque l'alternativa più sensata invece di nulla.
 */
export function findCable(query: FindCableQuery): FindCableResult {
  const use = USE_BY_LOCATION[query.chargeLocation];
  const byUse = PRODUCTS.filter((p) => p.specs.use === use);

  const strict = byUse.filter((p) => {
    if (query.phase && p.specs.phase !== query.phase) return false;
    if (query.shape && p.specs.shape !== query.shape) return false;
    return true;
  });

  if (strict.length > 0) {
    return { query, use, matches: [...strict].sort(byRelevance), relaxed: false };
  }

  // Nessun match esatto: allenta la fase, tieni la forma se richiesta.
  const relaxed = query.shape ? byUse.filter((p) => p.specs.shape === query.shape) : byUse;
  const matches = (relaxed.length > 0 ? relaxed : byUse).sort(byRelevance);

  const note =
    byUse.length === 0
      ? "Per questo tipo di ricarica non abbiamo un cavo dedicato a catalogo: dai un'occhiata alle stazioni o alle wallbox."
      : "Nessun cavo con questi requisiti esatti — ti propongo le alternative più vicine per lo stesso utilizzo.";

  return { query, use, matches, relaxed: true, note };
}
