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
  /** Sinonimi/forme naturali per il match ("m3", "golf elettrica", "i4"…). */
  aliases?: string[];
  note?: string;
};

export const EV_MODELS = evData as EvModel[];

/** Solo lettere/cifre: "ID.4" / "id 4" / "id4" → "id4". Annulla punteggiatura e spazi. */
function compact(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/** Token alfanumerici di una stringa, per i match "a parola intera" (alias). */
function tokens(s: string): string[] {
  return s.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
}

/**
 * `q` contiene `needle` come sottostringa, ma NON all'interno di un numero più
 * lungo: così "1500e" (millecinquecento euro) non viene scambiato per "500e".
 */
function includesToken(q: string, needle: string): boolean {
  if (needle.length < 2) return false;
  let from = 0;
  for (;;) {
    const i = q.indexOf(needle, from);
    if (i === -1) return false;
    const before = q[i - 1];
    if (!before || !/[0-9]/.test(before)) return true;
    from = i + 1;
  }
}

/**
 * Cerca il modello nella mini-knowledge. Match tollerante e disambiguante:
 *   1) marca+modello presenti nel testo (punteggio più alto),
 *   2) il solo modello (≥3 char, per evitare falsi positivi tipo "i4"),
 *   3) alias curati, confrontati per parole intere (gestisce "m3", "golf elettrica").
 * Vince il match con la chiave più lunga/specifica. Pensato per input naturale
 * ("ho una tesla model 3", "id4", "una 500 elettrica").
 */
export function lookupEvModel(query: string): EvModel | null {
  const q = compact(query);
  if (q.length < 2) return null;
  const qTokens = new Set(tokens(query));

  let best: { ev: EvModel; score: number } | null = null;

  for (const ev of EV_MODELS) {
    const full = compact(`${ev.brand} ${ev.model}`);
    const model = compact(ev.model);
    let score = 0;

    if (full.length >= 3 && includesToken(q, full)) {
      score = 100 + full.length;
    } else if (model.length >= 3 && includesToken(q, model)) {
      score = 50 + model.length;
    }

    for (const alias of ev.aliases ?? []) {
      const at = tokens(alias);
      if (at.length > 0 && at.every((t) => qTokens.has(t))) {
        score = Math.max(score, 40 + compact(alias).length);
      }
    }

    if (score > 0 && (!best || score > best.score)) best = { ev, score };
  }

  return best?.ev ?? null;
}
