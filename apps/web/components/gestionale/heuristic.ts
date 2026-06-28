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

function detectStato(s: string, entity: EntityKey): string | undefined {
  if (entity === "ordini") {
    if (/apert/.test(s)) return "aperti";
    if (/accettat|vint|chius[oi] positiv/.test(s)) return "accettato";
    if (/pers|rifiutat/.test(s)) return "perso";
    if (/inviat/.test(s)) return "inviato";
    if (/bozza/.test(s)) return "bozza";
  }
  if (entity === "progetti") {
    if (/ritard/.test(s)) return "in ritardo";
    if (/complet|conclus/.test(s)) return "completato";
    if (/in corso|attiv/.test(s)) return "in corso";
    if (/pianificat|pianificad/.test(s)) return "pianificato";
    if (/sospes/.test(s)) return "sospeso";
  }
  if (entity === "scadenze") {
    if (/scadut/.test(s)) return "scaduta";
    if (/in scadenza|imminent|prossim/.test(s)) return "in scadenza";
    if (/pianificat/.test(s)) return "pianificata";
    if (/complet/.test(s)) return "completata";
  }
  return undefined;
}

/** Costruisce un filtro a partire dalla richiesta grezza. */
export function buildFilter(query: string): GestionaleFilter {
  const s = query.toLowerCase();
  const entity = detectEntity(s);
  const f: GestionaleFilter = { entity };

  const citta = CITTA.find((c) => s.includes(c));
  if (citta) f.citta = citta;
  const regione = REGIONI.find((r) => s.includes(r));
  if (regione) f.regione = regione === "emilia" ? "Emilia-Romagna" : regione;
  const settore = SETTORI.find((se) => s.includes(se));
  if (settore) f.settore = settore;

  const stato = detectStato(s, entity);
  if (stato) f.stato = stato;
  if ((entity === "progetti" || entity === "scadenze") && /ritard|scadut|in scadenza/.test(s)) {
    f.inRitardo = true;
  }

  // Soglie di importo: "sopra/oltre/maggiore" → min, "sotto/meno/entro" → max.
  if (/sopra|oltre|maggiore|più di|piu di|superior|da\s+\d/.test(s)) {
    const after = s.split(/sopra|oltre|maggiore|più di|piu di|superior|da/).pop() ?? "";
    const n = parseAmount(after);
    if (n != null) f.minImporto = n;
  }
  if (/sotto|meno|entro|inferior|fino a|max/.test(s)) {
    const after = s.split(/sotto|meno|entro|inferior|fino a|max/).pop() ?? "";
    const n = parseAmount(after);
    if (n != null) f.maxImporto = n;
  }

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
