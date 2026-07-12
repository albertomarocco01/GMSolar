/**
 * Interprete EURISTICO della richiesta in linguaggio naturale: usato come
 * FALLBACK quando manca la chiave AI (la demo non si rompe mai) e come base del
 * guardrail. Tutto deterministico: keyword → `GestionaleFilter`. Nessuna rete.
 */
import { clienti } from "@/data/erp-mock";
import { countMatches, summarize } from "./filters";
import type { AssistantResult, EntityKey, GestionaleFilter } from "./types";

/** Città note (dai dati) per il riconoscimento "a <città>". */
const CITTA = Array.from(new Set(clienti.map((c) => c.citta.toLowerCase())));
const REGIONI = ["piemonte", "lombardia", "veneto", "emilia-romagna", "emilia", "liguria"];
const SETTORI = [
  "industria",
  "logistica",
  "agricoltura",
  "retail",
  "pubblica amministrazione",
  "residenziale",
  "servizi",
];

/** Tentativi di prompt-injection / esfiltrazione → bloccati dal gatekeeper. */
const INJECTION = [
  "ignora",
  "dimentica",
  "istruzioni",
  "system prompt",
  "prompt di sistema",
  "sei ora",
  "password",
  "api key",
  "chiave api",
  "token segreto",
  "rivela",
  "bypass",
];

/** Parole che indicano una richiesta pertinente all'ERP. */
const DOMAIN = [
  "client",
  "ordin",
  "preventiv",
  "offert",
  "progett",
  "impiant",
  "cantier",
  "scadenz",
  "pagament",
  "fattur",
  "import",
  "valore",
  "settore",
  "stato",
  "apert",
  "accettat",
  "pers",
  "ritard",
  "kwp",
  ...CITTA,
  ...REGIONI,
  ...SETTORI,
];

export function isInjection(q: string): boolean {
  const s = q.toLowerCase();
  return INJECTION.some((k) => s.includes(k));
}

export function isInDomain(q: string): boolean {
  const s = q.toLowerCase();
  return DOMAIN.some((k) => s.includes(k));
}

/** Deduce l'entità bersaglio dalla richiesta. */
function detectEntity(s: string): EntityKey {
  if (/scadenz|pagament|fattur|incass/.test(s)) return "scadenze";
  if (/progett|impiant|cantier|kwp|avanzament/.test(s)) return "progetti";
  if (/client/.test(s)) return "clienti";
  // ordini/preventivi è il default per importi, stati commerciali, "aperti".
  return "ordini";
}

/** Estrae una soglia numerica da frasi tipo "sopra 5.000€", "oltre 5k", "5 mila". */
function parseAmount(s: string): number | null {
  const m = /(\d+(?:[.,]\d+)?)\s*(k|mila|mln|milion[ei]?)?/.exec(s);
  if (!m) return null;
  let n = Number(m[1].replace(/\./g, "").replace(",", "."));
  const unit = m[2];
  if (unit === "k" || unit === "mila") n *= 1000;
  else if (unit && unit.startsWith("mln")) n *= 1_000_000;
  else if (unit && unit.startsWith("milion")) n *= 1_000_000;
  return Number.isFinite(n) ? n : null;
}

/**
 * Tabella pattern→stato per entità: sostituisce la catena di if annidati con
 * un lookup lineare (stessa priorità dell'originale, dall'alto in basso).
 */
const STATO_PATTERNS: { entity: EntityKey; test: RegExp; stato: string }[] = [
  { entity: "ordini", test: /apert/, stato: "aperti" },
  { entity: "ordini", test: /accettat|vint|chius[oi] positiv/, stato: "accettato" },
  { entity: "ordini", test: /pers|rifiutat/, stato: "perso" },
  { entity: "ordini", test: /inviat/, stato: "inviato" },
  { entity: "ordini", test: /bozza/, stato: "bozza" },
  { entity: "progetti", test: /ritard/, stato: "in ritardo" },
  { entity: "progetti", test: /complet|conclus/, stato: "completato" },
  { entity: "progetti", test: /in corso|attiv/, stato: "in corso" },
  { entity: "progetti", test: /pianificat|pianificad/, stato: "pianificato" },
  { entity: "progetti", test: /sospes/, stato: "sospeso" },
  { entity: "scadenze", test: /scadut/, stato: "scaduta" },
  { entity: "scadenze", test: /in scadenza|imminent|prossim/, stato: "in scadenza" },
  { entity: "scadenze", test: /pianificat/, stato: "pianificata" },
  { entity: "scadenze", test: /complet/, stato: "completata" },
];

function detectStato(s: string, entity: EntityKey): string | undefined {
  return STATO_PATTERNS.find((p) => p.entity === entity && p.test.test(s))?.stato;
}

/** Trova il primo elemento della lista contenuto nella query normalizzata. */
function firstMatch(s: string, list: string[]): string | undefined {
  return list.find((item) => s.includes(item));
}

/**
 * Tabella pattern→soglia importo: "test" apre il riconoscimento, "split"
 * isola il testo dopo il trigger da cui `parseAmount` estrae il numero.
 * (nota: per "minImporto" i due pattern differiscono di proposito — il test
 * richiede una cifra dopo "da", lo split no — comportamento invariato).
 */
const AMOUNT_PATTERNS: { field: "minImporto" | "maxImporto"; test: RegExp; split: RegExp }[] = [
  {
    field: "minImporto",
    test: /sopra|oltre|maggiore|più di|piu di|superior|da\s+\d/,
    split: /sopra|oltre|maggiore|più di|piu di|superior|da/,
  },
  {
    field: "maxImporto",
    test: /sotto|meno|entro|inferior|fino a|max/,
    split: /sotto|meno|entro|inferior|fino a|max/,
  },
];

/** Applica le soglie di importo riconosciute al filtro, in-place. */
function applyAmountThresholds(s: string, f: GestionaleFilter): void {
  for (const { field, test, split } of AMOUNT_PATTERNS) {
    if (!test.test(s)) continue;
    const after = s.split(split).pop() ?? "";
    const n = parseAmount(after);
    if (n != null) f[field] = n;
  }
}

/** Costruisce un filtro a partire dalla richiesta grezza. */
function buildFilter(query: string): GestionaleFilter {
  const s = query.toLowerCase();
  const entity = detectEntity(s);
  const f: GestionaleFilter = { entity };

  const citta = firstMatch(s, CITTA);
  if (citta) f.citta = citta;
  const regione = firstMatch(s, REGIONI);
  if (regione) f.regione = regione === "emilia" ? "Emilia-Romagna" : regione;
  const settore = firstMatch(s, SETTORI);
  if (settore) f.settore = settore;

  const stato = detectStato(s, entity);
  if (stato) f.stato = stato;
  if ((entity === "progetti" || entity === "scadenze") && /ritard|scadut|in scadenza/.test(s)) {
    f.inRitardo = true;
  }

  applyAmountThresholds(s, f);

  return f;
}

/** Interpretazione completa euristica → AssistantResult (source: fallback). */
export function heuristicParse(query: string): AssistantResult {
  const filter = buildFilter(query);
  const matchedCount = countMatches(filter);
  return {
    ok: true,
    source: "fallback",
    entity: filter.entity,
    filter,
    matchedCount,
    reply: summarize(filter.entity, matchedCount, filter),
  };
}

/** Messaggio standard del gatekeeper per richieste fuori ambito/bloccate. */
export const GUARDRAIL_REPLY =
  "Posso aiutarti solo con i dati del gestionale: clienti, ordini/preventivi, progetti e scadenze. " +
  "Prova ad esempio: «ordini aperti sopra 50.000 €», «clienti del Piemonte» o «progetti in ritardo».";
