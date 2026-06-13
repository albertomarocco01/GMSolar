/**
 * CABLE-FINDER — mini knowledge EV.
 *
 * Tabella INDICATIVA (dichiaratamente, è una demo) del caricatore di bordo AC
 * dei modelli elettrici più comuni: serve a dedurre se la ricarica è monofase o
 * trifase a partire dal modello auto. Se il modello non c'è, l'AI ripiega su
 * "dove ricarichi?".
 *
 * Fonte dati: `data/ev-onboard.json`.
 */
import evData from "@/data/ev-onboard.json";
import type { Phase } from "./cable-matcher";

export type EvModel = {
  brand: string;
  model: string;
  acPhase: Phase;
  acKw: number;
  note?: string;
};

export const EV_MODELS = evData as EvModel[];

/** Normalizza per il match: minuscolo, spazi compatti. */
function normalize(s: string): string {
  return s.toLowerCase().replace(/\s+/g, " ").trim();
}

/**
 * Cerca il modello nella mini-knowledge. Match tollerante: prima prova
 * "marca modello" intero, poi il solo modello. Pensato per input naturale
 * ("ho una tesla model 3", "id.4", "una 500 elettrica").
 */
export function lookupEvModel(query: string): EvModel | null {
  const q = normalize(query);
  if (!q) return null;

  // 1) match forte: la query contiene "marca modello" (o viceversa).
  for (const ev of EV_MODELS) {
    const full = normalize(`${ev.brand} ${ev.model}`);
    if (q.includes(full) || full.includes(q)) return ev;
  }
  // 2) match debole: la query contiene il solo nome del modello.
  for (const ev of EV_MODELS) {
    const model = normalize(ev.model);
    if (model.length >= 2 && q.includes(model)) return ev;
  }
  return null;
}
