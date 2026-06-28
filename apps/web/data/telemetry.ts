/**
 * Dati dimostrativi per la Dashboard centralizzata GM Group.
 * Tutti i valori sono generati deterministicamente a livello di modulo
 * (nessun Math.random() durante il render React — valori fissi, calcolati una volta).
 */

// ── Types ───────────────────────────────────────────────────────────────────

export type SiteKey = "solar" | "mobility" | "shop";
export type SiteFilter = "all" | SiteKey;
export type RangeKey = 7 | 30 | 90;

export type SiteMetrics = {
  visite: number;
  utenti: number;
  interazioni: number;
  conversioni: number;
};

export type DayRecord = {
  date: string; // 'YYYY-MM-DD'
  solar: SiteMetrics;
  mobility: SiteMetrics;
  shop: SiteMetrics;
};

export type ChartDayPoint = {
  /** Data formattata per l'asse X (es. '06/21'). */
  date: string;
  solar?: number;
  mobility?: number;
  shop?: number;
};

export type InteractionBySite = {
  site: string;
  valore: number;
  fill: string;
};

export type TrafficSource = {
  name: string;
  value: number;
  fill: string;
};

export type TopPage = {
  path: string;
  label: string;
  site: SiteKey;
  visite: number;
  utenti: number;
  interazioni: number;
  conversioni: number;
};

export type ContentBlock = {
  id: string;
  site: SiteKey | "hub";
  nome: string;
  stato: "pubblicato" | "bozza";
  ultimaModifica: string; // 'YYYY-MM-DD'
  titolo: string;
  contenuto: string;
};

// ── Generazione deterministica ───────────────────────────────────────────────

/** LCG seeded: eseguito una sola volta al caricamento del modulo. */
function makeLcg(seed: number): () => number {
  let s = seed;
  return (): number => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 4294967296;
  };
}

function isoDate(start: Date, offsetDays: number): string {
  const d = new Date(start);
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

/**
 * 180 giorni: indice 0 = più vecchio (2025-12-29), indice 179 = ieri (2026-06-26).
 * Usando 180 giorni abbiamo sempre un "periodo precedente" valido per tutti i range
 * (7, 30, 90 giorni) senza ricorrere a dati fittizi extra.
 */
function buildAllDays(): DayRecord[] {
  const rng = makeLcg(7337);
  const start = new Date("2025-12-29");
  const records: DayRecord[] = [];

  for (let i = 0; i < 180; i++) {
    const date = isoDate(start, i);
    const d = new Date(date);
    const dow = d.getDay(); // 0 = Dom, 6 = Sab
    const wknd = dow === 0 || dow === 6 ? 0.72 : 1.0;
    const trend = 1 + (i / 180) * 0.18; // lieve crescita nel periodo

    const mk = (base: number): number =>
      Math.max(1, Math.round(base * trend * wknd * (0.82 + rng() * 0.36)));

    const sv = mk(1100); // solar visits
    const mv = mk(650); // mobility visits
    const sh = mk(850); // shop visits

    records.push({
      date,
      solar: {
        visite: sv,
        utenti: Math.round(sv * (0.74 + rng() * 0.1)),
        interazioni: Math.round(sv * (3.4 + rng() * 1.6)),
        conversioni: Math.max(1, Math.round(sv * (0.008 + rng() * 0.006))),
      },
      mobility: {
        visite: mv,
        utenti: Math.round(mv * (0.71 + rng() * 0.1)),
        interazioni: Math.round(mv * (4.5 + rng() * 2.0)),
        conversioni: Math.max(1, Math.round(mv * (0.006 + rng() * 0.005))),
      },
      shop: {
        visite: sh,
        utenti: Math.round(sh * (0.65 + rng() * 0.12)),
        interazioni: Math.round(sh * (5.8 + rng() * 2.8)),
        conversioni: Math.max(1, Math.round(sh * (0.024 + rng() * 0.016))),
      },
    });
  }

  return records;
}

/** Array immutabile di 180 giorni (calcolato una sola volta). */
export const ALL_DAYS: readonly DayRecord[] = buildAllDays();

// ── Helper di aggregazione ───────────────────────────────────────────────────

function sumMetrics(days: readonly DayRecord[], site: SiteFilter): SiteMetrics {
  const acc: SiteMetrics = { visite: 0, utenti: 0, interazioni: 0, conversioni: 0 };
  const keys: SiteKey[] = site === "all" ? ["solar", "mobility", "shop"] : [site];
  for (const d of days) {
    for (const k of keys) {
      acc.visite += d[k].visite;
      acc.utenti += d[k].utenti;
      acc.interazioni += d[k].interazioni;
      acc.conversioni += d[k].conversioni;
    }
  }
  return acc;
}

function pctDelta(curr: number, prev: number): number {
  if (prev === 0) return 0;
  return Math.round(((curr - prev) / prev) * 1000) / 10; // 1 decimale
}

/** KPI aggregati per periodo corrente + delta % vs periodo precedente. */
export function getKpis(
  site: SiteFilter,
  range: RangeKey,
): { current: SiteMetrics; delta: SiteMetrics } {
  const n = ALL_DAYS.length; // 180
  const curr = ALL_DAYS.slice(n - range);
  const prev = ALL_DAYS.slice(n - range * 2, n - range);

  const current = sumMetrics(curr, site);
  const previous = sumMetrics(prev, site);

  return {
    current,
    delta: {
      visite: pctDelta(current.visite, previous.visite),
      utenti: pctDelta(current.utenti, previous.utenti),
      interazioni: pctDelta(current.interazioni, previous.interazioni),
      conversioni: pctDelta(current.conversioni, previous.conversioni),
    },
  };
}

/** Dati giornalieri per il LineChart (visite per sito). */
export function getChartData(site: SiteFilter, range: RangeKey): ChartDayPoint[] {
  const days = ALL_DAYS.slice(ALL_DAYS.length - range);
  return days.map((d) => {
    const label = d.date.slice(5).replace("-", "/"); // 'MM/DD'
    const point: ChartDayPoint = { date: label };
    if (site === "all" || site === "solar") point.solar = d.solar.visite;
    if (site === "all" || site === "mobility") point.mobility = d.mobility.visite;
    if (site === "all" || site === "shop") point.shop = d.shop.visite;
    return point;
  });
}

/** Totale interazioni per sito nel periodo (per BarChart). */
export function getInteractionsBySite(site: SiteFilter, range: RangeKey): InteractionBySite[] {
  const days = ALL_DAYS.slice(ALL_DAYS.length - range);
  const defs: { key: SiteKey; label: string; fill: string }[] = [
    { key: "solar", label: "Solar", fill: "#a8d920" },
    { key: "mobility", label: "Mobility", fill: "#3c9e3a" },
    { key: "shop", label: "Shop", fill: "#c8d400" },
  ];
  const filtered = site === "all" ? defs : defs.filter((s) => s.key === site);
  return filtered.map((s) => ({
    site: s.label,
    valore: days.reduce((a, d) => a + d[s.key].interazioni, 0),
    fill: s.fill,
  }));
}

// ── Dati statici ─────────────────────────────────────────────────────────────

const TRAFFIC_SOURCES: Record<SiteFilter, TrafficSource[]> = {
  all: [
    { name: "Organica", value: 38, fill: "#7c5cff" },
    { name: "Diretto", value: 22, fill: "#a78bfa" },
    { name: "Social", value: 18, fill: "#818cf8" },
    { name: "Email", value: 12, fill: "#c4b5fd" },
    { name: "Referral", value: 10, fill: "#ddd6fe" },
  ],
  solar: [
    { name: "Organica", value: 45, fill: "#a8d920" },
    { name: "Referral", value: 20, fill: "#8fbc15" },
    { name: "Diretto", value: 18, fill: "#c5eb4a" },
    { name: "Email", value: 10, fill: "#d9f198" },
    { name: "Social", value: 7, fill: "#eaf7b4" },
  ],
  mobility: [
    { name: "Organica", value: 32, fill: "#3c9e3a" },
    { name: "Referral", value: 28, fill: "#2f7e2e" },
    { name: "Diretto", value: 20, fill: "#4dbe4b" },
    { name: "Social", value: 13, fill: "#7dd87c" },
    { name: "Email", value: 7, fill: "#adf0ac" },
  ],
  shop: [
    { name: "Organica", value: 30, fill: "#c8d400" },
    { name: "Social", value: 25, fill: "#a8b200" },
    { name: "Diretto", value: 22, fill: "#dde600" },
    { name: "Email", value: 15, fill: "#eaf046" },
    { name: "Referral", value: 8, fill: "#f2f57a" },
  ],
};

export function getTrafficSources(site: SiteFilter): TrafficSource[] {
  return TRAFFIC_SOURCES[site];
}

const ALL_TOP_PAGES: TopPage[] = [
  {
    path: "/solar",
    label: "Solar — Homepage",
    site: "solar",
    visite: 14820,
    utenti: 11890,
    interazioni: 62400,
    conversioni: 148,
  },
  {
    path: "/shop",
    label: "Shop — Catalogo",
    site: "shop",
    visite: 13200,
    utenti: 8900,
    interazioni: 89400,
    conversioni: 528,
  },
  {
    path: "/mobility",
    label: "Mobility — Homepage",
    site: "mobility",
    visite: 11650,
    utenti: 8940,
    interazioni: 57520,
    conversioni: 87,
  },
  {
    path: "/solar/lead",
    label: "Solar — Lead Qualifier",
    site: "solar",
    visite: 8340,
    utenti: 6720,
    interazioni: 41200,
    conversioni: 334,
  },
  {
    path: "/solar/analytics",
    label: "Solar — Analytics AI",
    site: "solar",
    visite: 7220,
    utenti: 5890,
    interazioni: 33100,
    conversioni: 72,
  },
  {
    path: "/shop/cavo-tipo2",
    label: "Shop — Cavo Tipo 2 32A",
    site: "shop",
    visite: 6840,
    utenti: 4560,
    interazioni: 54720,
    conversioni: 342,
  },
  {
    path: "/mobility/wallbox",
    label: "Mobility — Wallbox 11 kW",
    site: "mobility",
    visite: 5920,
    utenti: 4350,
    interazioni: 32560,
    conversioni: 59,
  },
  {
    path: "/shop/finder",
    label: "Shop — Trova il tuo cavo",
    site: "shop",
    visite: 5430,
    utenti: 3890,
    interazioni: 49870,
    conversioni: 217,
  },
];

/** Top pagine filtrate per sito (il range non scala i valori nella demo). */
export function getTopPages(site: SiteFilter, _range: RangeKey): TopPage[] {
  return site === "all" ? ALL_TOP_PAGES : ALL_TOP_PAGES.filter((p) => p.site === site);
}

export const CONTENT_BLOCKS: ContentBlock[] = [
  {
    id: "solar-hero",
    site: "solar",
    nome: "Hero Solar",
    stato: "pubblicato",
    ultimaModifica: "2026-06-20",
    titolo: "Energia solare. Potenza industriale.",
    contenuto:
      "GM Solar è il partner EPC di riferimento per impianti fotovoltaici di media e grande scala. Progettiamo, installiamo e monitoriamo impianti da 50 kWp a 10 MWp per imprese, enti pubblici e sviluppatori.",
  },
  {
    id: "solar-stats",
    site: "solar",
    nome: "Statistiche Solar",
    stato: "pubblicato",
    ultimaModifica: "2026-06-18",
    titolo: "I numeri di GM Solar",
    contenuto:
      "Oltre 120 impianti installati, 85 MW di capacità totale, 12 regioni servite, 0 incidenti in cantiere. Dati aggiornati al Q2 2026.",
  },
  {
    id: "mobility-hero",
    site: "mobility",
    nome: "Hero Mobility",
    stato: "pubblicato",
    ultimaModifica: "2026-06-15",
    titolo: "La ricarica diventa intelligente.",
    contenuto:
      "GMobility distribuisce e installa wallbox e colonnine Mennekes per privati, condomini e flotte aziendali. Distributore autorizzato Mennekes in Italia.",
  },
  {
    id: "mobility-map",
    site: "mobility",
    nome: "Mappa Colonnine",
    stato: "bozza",
    ultimaModifica: "2026-06-24",
    titolo: "Dove ricaricare in Italia",
    contenuto:
      "Rete di punti di ricarica GMobility distribuita in 8 regioni. Potenza disponibile: 22 kW AC, 50 kW DC, 150 kW DC HPC. Localizzazione in tempo reale.",
  },
  {
    id: "shop-hero",
    site: "shop",
    nome: "Hero Shop",
    stato: "bozza",
    ultimaModifica: "2026-06-25",
    titolo: "Il cavo giusto per la tua auto.",
    contenuto:
      "Cavo Perfetto offre cavi di ricarica certificati per ogni veicolo elettrico. Compatibili con Mennekes Tipo 2, CCS, CHAdeMO e Tesla.",
  },
  {
    id: "shop-finder",
    site: "shop",
    nome: "CableFinder AI",
    stato: "pubblicato",
    ultimaModifica: "2026-06-22",
    titolo: "Trova il tuo cavo con l'AI",
    contenuto:
      "Descrivici il tuo veicolo e ti diciamo quale cavo fa per te. Il motore AI analizza il connettore, la potenza di ricarica e le tue abitudini di utilizzo.",
  },
  {
    id: "hub-intro",
    site: "hub",
    nome: "Introduzione Hub",
    stato: "pubblicato",
    ultimaModifica: "2026-06-10",
    titolo: "L'ecosistema GM Group",
    contenuto:
      "GM Group integra tre brand complementari: GM Solar per il fotovoltaico, GMobility per la mobilità elettrica, Cavo Perfetto per i cavi di ricarica. Un ecosistema unico per la transizione energetica.",
  },
];
