/**
 * Motore di filtro DETERMINISTICO e puro, condiviso da client e route handler.
 * Data un `GestionaleFilter`, restituisce il sottoinsieme di record per ogni
 * entità. Il server lo usa per RICALCOLARE il conteggio dei risultati (non si
 * fida del numero proposto dall'AI); il client lo usa per filtrare le tabelle.
 */
import {
  clienti,
  ordini,
  progetti,
  scadenze,
  type Cliente,
  type Ordine,
  type Progetto,
  type Scadenza,
} from "@/data/erp-mock";
import { ENTITY_LABELS, type EntityKey, type GestionaleFilter } from "./types";

const norm = (s: string) => s.toLowerCase().trim();
const has = (haystack: string, needle?: string) => !needle || norm(haystack).includes(norm(needle));

function matchImporto(value: number, f: GestionaleFilter): boolean {
  if (f.minImporto != null && value < f.minImporto) return false;
  if (f.maxImporto != null && value > f.maxImporto) return false;
  return true;
}

/** Ordini "aperti" = bozza o inviato (non ancora chiusi). */
function ordineStatoMatch(o: Ordine, stato?: string): boolean {
  if (!stato) return true;
  const s = norm(stato);
  if (s === "aperti" || s === "aperto") return o.stato === "bozza" || o.stato === "inviato";
  return o.stato === s;
}

export function filterClienti(f: GestionaleFilter): Cliente[] {
  return clienti.filter(
    (c) =>
      has(`${c.nome} ${c.referente} ${c.citta}`, f.text) &&
      has(c.regione, f.regione) &&
      has(c.citta, f.citta) &&
      has(c.settore, f.settore) &&
      matchImporto(c.valore, f),
  );
}

export function filterOrdini(f: GestionaleFilter): Ordine[] {
  return ordini.filter(
    (o) =>
      has(`${o.numero} ${o.cliente} ${o.citta}`, f.text) &&
      has(o.regione, f.regione) &&
      has(o.citta, f.citta) &&
      ordineStatoMatch(o, f.stato) &&
      matchImporto(o.importo, f),
  );
}

export function filterProgetti(f: GestionaleFilter): Progetto[] {
  return progetti.filter((p) => {
    if (f.inRitardo && p.stato !== "in ritardo") return false;
    return (
      has(`${p.nome} ${p.cliente} ${p.citta} ${p.tipo}`, f.text) &&
      has(p.regione, f.regione) &&
      has(p.citta, f.citta) &&
      has(p.stato, f.stato)
    );
  });
}

export function filterScadenze(f: GestionaleFilter): Scadenza[] {
  return scadenze.filter((s) => {
    if (f.inRitardo && s.stato !== "scaduta" && s.stato !== "in scadenza") return false;
    return (
      has(`${s.titolo} ${s.cliente} ${s.citta} ${s.tipo}`, f.text) &&
      has(s.regione, f.regione) &&
      has(s.citta, f.citta) &&
      has(s.stato, f.stato) &&
      matchImporto(s.importo, f)
    );
  });
}

/** Numero di record che soddisfano il filtro per l'entità indicata. */
export function countMatches(f: GestionaleFilter): number {
  switch (f.entity) {
    case "clienti":
      return filterClienti(f).length;
    case "ordini":
      return filterOrdini(f).length;
    case "progetti":
      return filterProgetti(f).length;
    case "scadenze":
      return filterScadenze(f).length;
  }
}

/** Descrizione in italiano dei criteri attivi (per la risposta dell'agente). */
export function describeFilter(f: GestionaleFilter): string {
  const parts: string[] = [];
  if (f.text) parts.push(`testo "${f.text}"`);
  if (f.citta) parts.push(`a ${f.citta}`);
  if (f.regione) parts.push(`in ${f.regione}`);
  if (f.settore) parts.push(`settore ${f.settore}`);
  if (f.stato) parts.push(`stato "${f.stato}"`);
  if (f.inRitardo) parts.push("in ritardo");
  if (f.minImporto != null) parts.push(`importo ≥ € ${f.minImporto.toLocaleString("it-IT")}`);
  if (f.maxImporto != null) parts.push(`importo ≤ € ${f.maxImporto.toLocaleString("it-IT")}`);
  return parts.join(", ");
}

/** Frase di sintesi: "Ho trovato N preventivi a Milano …". */
export function summarize(entity: EntityKey, count: number, f: GestionaleFilter): string {
  const { singolare, plurale } = ENTITY_LABELS[entity];
  const noun = count === 1 ? singolare : plurale;
  const desc = describeFilter(f);
  const coda = desc ? ` (${desc})` : "";
  if (count === 0) return `Nessun ${singolare} corrisponde alla richiesta${coda}.`;
  return `Ho trovato ${count} ${noun}${coda}. Li ho filtrati nella tabella.`;
}
