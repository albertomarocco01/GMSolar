/**
 * ERP MOCK — dataset finto ma coerente per la demo "Gestionale con AI".
 *
 * Tutto è DETERMINISTICO (nessun Math.random / Date.now): le entità sono
 * scritte a mano come tuple compatte e le relazioni denormalizzate vengono
 * risolte una sola volta al caricamento del modulo tramite la mappa dei clienti.
 * Così client e server (route handler dell'assistente) vedono esattamente gli
 * stessi numeri.
 *
 * Quattro entità: Clienti, Ordini/Preventivi, Progetti/Impianti, Scadenze.
 * Le date sono ancorate al 2026 (oggi demo: 28/06/2026); gli stati "scaduta"/
 * "in ritardo" sono campi espliciti, non calcolati, per restare deterministici.
 */

/* ----------------------------- Tipi entità ----------------------------- */

export type Regione = "Piemonte" | "Lombardia" | "Veneto" | "Emilia-Romagna" | "Liguria";

export type ClienteSettore =
  | "Industria"
  | "Logistica"
  | "Agricoltura"
  | "Retail"
  | "Pubblica Amministrazione"
  | "Residenziale"
  | "Servizi";

export interface Cliente {
  id: string;
  nome: string;
  citta: string;
  regione: Regione;
  settore: ClienteSettore;
  /** Valore cliente (lifetime) in euro. */
  valore: number;
  referente: string;
}

export type OrdineStato = "bozza" | "inviato" | "accettato" | "perso";

export interface Ordine {
  id: string;
  numero: string;
  clienteId: string;
  cliente: string;
  citta: string;
  regione: Regione;
  importo: number;
  stato: OrdineStato;
  /** Data documento ISO (YYYY-MM-DD). */
  data: string;
}

export type ProgettoTipo =
  | "Solar Farm"
  | "Industriale C&I"
  | "Residenziale"
  | "Revamping"
  | "Wallbox"
  | "Storage";

export type ProgettoStato = "in corso" | "completato" | "in ritardo" | "pianificato" | "sospeso";

export interface Progetto {
  id: string;
  nome: string;
  clienteId: string;
  cliente: string;
  citta: string;
  regione: Regione;
  tipo: ProgettoTipo;
  stato: ProgettoStato;
  /** Avanzamento percentuale 0–100. */
  avanzamento: number;
  potenzaKWp: number;
  scadenza: string;
}

export type ScadenzaTipo = "Pagamento" | "Consegna" | "Manutenzione" | "Permesso" | "Collaudo";

export type ScadenzaStato = "in scadenza" | "scaduta" | "pianificata" | "completata";

export interface Scadenza {
  id: string;
  titolo: string;
  clienteId: string;
  cliente: string;
  citta: string;
  regione: Regione;
  tipo: ScadenzaTipo;
  stato: ScadenzaStato;
  importo: number;
  data: string;
}

/* ------------------------------- Clienti ------------------------------- */

type ClienteRaw = [
  id: string,
  nome: string,
  citta: string,
  regione: Regione,
  settore: ClienteSettore,
  valore: number,
  referente: string,
];

// prettier-ignore
const clientiRaw: ClienteRaw[] = [
  ["CLI-001", "Brixia Manifatturiera", "Brescia", "Lombardia", "Industria", 420000, "Laura Conti"],
  ["CLI-002", "LogiNord SpA", "Novara", "Piemonte", "Logistica", 310000, "Marco Ferri"],
  ["CLI-003", "AgriSole Cooperativa", "Cuneo", "Piemonte", "Agricoltura", 185000, "Giulia Rossi"],
  ["CLI-004", "Metalpiemonte Srl", "Torino", "Piemonte", "Industria", 540000, "Paolo Greco"],
  ["CLI-005", "Verde Retail Group", "Milano", "Lombardia", "Retail", 260000, "Sara Bianchi"],
  ["CLI-006", "Comune di Asti", "Asti", "Piemonte", "Pubblica Amministrazione", 150000, "Ufficio Tecnico"],
  ["CLI-007", "Adriatica Food", "Padova", "Veneto", "Industria", 295000, "Elena Marin"],
  ["CLI-008", "Po Logistics", "Piacenza", "Emilia-Romagna", "Logistica", 220000, "Davide Lupo"],
  ["CLI-009", "Residenze del Sole", "Pavia", "Lombardia", "Residenziale", 48000, "Anna Villa"],
  ["CLI-010", "Tecnoveneta SpA", "Verona", "Veneto", "Industria", 610000, "Luca Conte"],
  ["CLI-011", "Bergamo Plast", "Bergamo", "Lombardia", "Industria", 380000, "Chiara Riva"],
  ["CLI-012", "Ligure Servizi", "Genova", "Liguria", "Servizi", 130000, "Marco Costa"],
  ["CLI-013", "Emilia Carni", "Modena", "Emilia-Romagna", "Industria", 275000, "Franco Galli"],
  ["CLI-014", "Monza Mobility", "Monza", "Lombardia", "Servizi", 90000, "Ilaria Sala"],
  ["CLI-015", "Alessandria Agri", "Alessandria", "Piemonte", "Agricoltura", 165000, "Pietro Bo"],
  ["CLI-016", "NordCom Retail", "Milano", "Lombardia", "Retail", 410000, "Federica Neri"],
  ["CLI-017", "Veneta Logistica", "Venezia", "Veneto", "Logistica", 240000, "Stefano Polo"],
  ["CLI-018", "Cuneo Energia Coop", "Cuneo", "Piemonte", "Servizi", 70000, "Marta Bui"],
  ["CLI-019", "Torino Hospital", "Torino", "Piemonte", "Pubblica Amministrazione", 350000, "Direzione Tecnica"],
  ["CLI-020", "Brescia Acciai", "Brescia", "Lombardia", "Industria", 720000, "Giorgio Manzi"],
  ["CLI-021", "Padana Sementi", "Padova", "Veneto", "Agricoltura", 120000, "Rita Furlan"],
  ["CLI-022", "Genova Port Services", "Genova", "Liguria", "Logistica", 330000, "Aldo Parodi"],
  ["CLI-023", "Residence Lago", "Bergamo", "Lombardia", "Residenziale", 52000, "Nadia Fumagalli"],
  ["CLI-024", "Piemonte Wine Group", "Asti", "Piemonte", "Agricoltura", 210000, "Carlo Vinci"],
  ["CLI-025", "Modena Motori", "Modena", "Emilia-Romagna", "Industria", 880000, "Sergio Pini"],
  ["CLI-026", "Milano Cliniche", "Milano", "Lombardia", "Servizi", 290000, "Dott. Sala"],
  ["CLI-027", "Novara Tessile", "Novara", "Piemonte", "Industria", 175000, "Beatrice Goti"],
  ["CLI-028", "Vicenza Green Mall", "Verona", "Veneto", "Retail", 230000, "Omar Dani"],
];

export const clienti: Cliente[] = clientiRaw.map(
  ([id, nome, citta, regione, settore, valore, referente]) => ({
    id,
    nome,
    citta,
    regione,
    settore,
    valore,
    referente,
  }),
);

const byId = new Map(clienti.map((c) => [c.id, c]));

/** Risolve un cliente per id (lancia se assente: errore in fase di dati). */
function cli(id: string): Cliente {
  const c = byId.get(id);
  if (!c) throw new Error(`erp-mock: cliente sconosciuto ${id}`);
  return c;
}

/* ------------------------- Ordini / Preventivi ------------------------- */

type OrdineRaw = [
  numero: string,
  clienteId: string,
  importo: number,
  stato: OrdineStato,
  data: string,
];

// prettier-ignore
const ordiniRaw: OrdineRaw[] = [
  ["PRV-2026-001", "CLI-004", 124000, "accettato", "2026-01-12"],
  ["PRV-2026-002", "CLI-001", 86000, "inviato", "2026-01-18"],
  ["PRV-2026-003", "CLI-002", 53000, "perso", "2026-01-22"],
  ["PRV-2026-004", "CLI-010", 210000, "accettato", "2026-02-03"],
  ["PRV-2026-005", "CLI-005", 32000, "inviato", "2026-02-08"],
  ["PRV-2026-006", "CLI-006", 95000, "bozza", "2026-02-14"],
  ["PRV-2026-007", "CLI-013", 47000, "accettato", "2026-02-19"],
  ["PRV-2026-008", "CLI-020", 178000, "inviato", "2026-02-25"],
  ["PRV-2026-009", "CLI-003", 28000, "perso", "2026-03-02"],
  ["PRV-2026-010", "CLI-007", 64000, "accettato", "2026-03-06"],
  ["PRV-2026-011", "CLI-016", 132000, "inviato", "2026-03-11"],
  ["PRV-2026-012", "CLI-009", 18000, "bozza", "2026-03-15"],
  ["PRV-2026-013", "CLI-025", 245000, "inviato", "2026-03-20"],
  ["PRV-2026-014", "CLI-011", 72000, "accettato", "2026-03-24"],
  ["PRV-2026-015", "CLI-008", 41000, "perso", "2026-03-28"],
  ["PRV-2026-016", "CLI-019", 158000, "inviato", "2026-04-02"],
  ["PRV-2026-017", "CLI-012", 23000, "bozza", "2026-04-07"],
  ["PRV-2026-018", "CLI-017", 88000, "accettato", "2026-04-11"],
  ["PRV-2026-019", "CLI-024", 56000, "inviato", "2026-04-16"],
  ["PRV-2026-020", "CLI-001", 99000, "accettato", "2026-04-21"],
  ["PRV-2026-021", "CLI-022", 117000, "inviato", "2026-04-26"],
  ["PRV-2026-022", "CLI-014", 15000, "perso", "2026-05-02"],
  ["PRV-2026-023", "CLI-026", 76000, "inviato", "2026-05-06"],
  ["PRV-2026-024", "CLI-004", 134000, "bozza", "2026-05-10"],
  ["PRV-2026-025", "CLI-010", 188000, "accettato", "2026-05-15"],
  ["PRV-2026-026", "CLI-021", 34000, "inviato", "2026-05-19"],
  ["PRV-2026-027", "CLI-027", 61000, "accettato", "2026-05-23"],
  ["PRV-2026-028", "CLI-015", 29000, "bozza", "2026-05-28"],
  ["PRV-2026-029", "CLI-020", 203000, "inviato", "2026-06-02"],
  ["PRV-2026-030", "CLI-005", 44000, "perso", "2026-06-06"],
  ["PRV-2026-031", "CLI-016", 152000, "inviato", "2026-06-10"],
  ["PRV-2026-032", "CLI-025", 266000, "bozza", "2026-06-15"],
  ["PRV-2026-033", "CLI-007", 58000, "inviato", "2026-06-19"],
  ["PRV-2026-034", "CLI-028", 81000, "accettato", "2026-06-23"],
];

export const ordini: Ordine[] = ordiniRaw.map(([numero, clienteId, importo, stato, data]) => {
  const c = cli(clienteId);
  return {
    id: numero,
    numero,
    clienteId,
    cliente: c.nome,
    citta: c.citta,
    regione: c.regione,
    importo,
    stato,
    data,
  };
});

/* ------------------------ Progetti / Impianti ------------------------- */

type ProgettoRaw = [
  id: string,
  nome: string,
  clienteId: string,
  tipo: ProgettoTipo,
  stato: ProgettoStato,
  avanzamento: number,
  potenzaKWp: number,
  scadenza: string,
];

// prettier-ignore
const progettiRaw: ProgettoRaw[] = [
  ["PRG-001", "Solar Farm Metalpiemonte", "CLI-004", "Solar Farm", "in corso", 65, 4200, "2026-09-30"],
  ["PRG-002", "Tetto Brixia", "CLI-001", "Industriale C&I", "completato", 100, 900, "2026-03-15"],
  ["PRG-003", "Pensiline LogiNord", "CLI-002", "Industriale C&I", "in ritardo", 40, 1200, "2026-05-31"],
  ["PRG-004", "Agrivoltaico AgriSole", "CLI-003", "Solar Farm", "pianificato", 5, 3200, "2026-11-30"],
  ["PRG-005", "Revamping Tecnoveneta", "CLI-010", "Revamping", "in corso", 72, 1500, "2026-08-20"],
  ["PRG-006", "Wallbox Verde Retail", "CLI-005", "Wallbox", "completato", 100, 120, "2026-02-28"],
  ["PRG-007", "Tetto Comune Asti", "CLI-006", "Industriale C&I", "in corso", 55, 480, "2026-10-15"],
  ["PRG-008", "Storage Emilia Carni", "CLI-013", "Storage", "in ritardo", 30, 600, "2026-06-10"],
  ["PRG-009", "Solar Farm Brescia Acciai", "CLI-020", "Solar Farm", "in corso", 48, 6800, "2026-12-15"],
  ["PRG-010", "Impianto Adriatica Food", "CLI-007", "Industriale C&I", "completato", 100, 1100, "2026-04-30"],
  ["PRG-011", "Tetto NordCom", "CLI-016", "Industriale C&I", "in corso", 80, 1400, "2026-07-31"],
  ["PRG-012", "Condominio Residenze Sole", "CLI-009", "Residenziale", "completato", 100, 48, "2026-03-31"],
  ["PRG-013", "Solar Farm Modena Motori", "CLI-025", "Solar Farm", "in corso", 25, 7200, "2027-02-28"],
  ["PRG-014", "Tetto Bergamo Plast", "CLI-011", "Industriale C&I", "in corso", 60, 850, "2026-09-10"],
  ["PRG-015", "Pensiline Po Logistics", "CLI-008", "Industriale C&I", "sospeso", 35, 1000, "2026-08-31"],
  ["PRG-016", "Tetto Torino Hospital", "CLI-019", "Industriale C&I", "in corso", 70, 1600, "2026-10-31"],
  ["PRG-017", "Wallbox Ligure Servizi", "CLI-012", "Wallbox", "pianificato", 0, 80, "2026-12-01"],
  ["PRG-018", "Pensiline Veneta Logistica", "CLI-017", "Industriale C&I", "in ritardo", 45, 1300, "2026-05-20"],
  ["PRG-019", "Agrivoltaico Piemonte Wine", "CLI-024", "Solar Farm", "in corso", 50, 2100, "2026-11-15"],
  ["PRG-020", "Revamping Brixia", "CLI-001", "Revamping", "pianificato", 10, 700, "2027-01-31"],
  ["PRG-021", "Solar Farm Genova Port", "CLI-022", "Solar Farm", "in corso", 38, 3600, "2026-12-20"],
  ["PRG-022", "Wallbox Monza Mobility", "CLI-014", "Wallbox", "completato", 100, 150, "2026-01-31"],
  ["PRG-023", "Storage Modena Motori", "CLI-025", "Storage", "pianificato", 0, 900, "2027-03-15"],
  ["PRG-024", "Tetto Novara Tessile", "CLI-027", "Industriale C&I", "in corso", 58, 760, "2026-09-25"],
  ["PRG-025", "Agrivoltaico Alessandria", "CLI-015", "Solar Farm", "in ritardo", 42, 1900, "2026-06-15"],
  ["PRG-026", "Mall Solare Vicenza Green", "CLI-028", "Industriale C&I", "in corso", 33, 1250, "2026-10-05"],
];

export const progetti: Progetto[] = progettiRaw.map(
  ([id, nome, clienteId, tipo, stato, avanzamento, potenzaKWp, scadenza]) => {
    const c = cli(clienteId);
    return {
      id,
      nome,
      clienteId,
      cliente: c.nome,
      citta: c.citta,
      regione: c.regione,
      tipo,
      stato,
      avanzamento,
      potenzaKWp,
      scadenza,
    };
  },
);

/* ------------------------------ Scadenze ------------------------------ */

type ScadenzaRaw = [
  id: string,
  titolo: string,
  clienteId: string,
  tipo: ScadenzaTipo,
  stato: ScadenzaStato,
  importo: number,
  data: string,
];

// prettier-ignore
const scadenzeRaw: ScadenzaRaw[] = [
  ["SCA-001", "Saldo finale Solar Farm", "CLI-004", "Pagamento", "in scadenza", 62000, "2026-07-05"],
  ["SCA-002", "Consegna moduli LogiNord", "CLI-002", "Consegna", "scaduta", 0, "2026-06-15"],
  ["SCA-003", "Manutenzione O&M Tecnoveneta", "CLI-010", "Manutenzione", "pianificata", 12000, "2026-09-01"],
  ["SCA-004", "Acconto Modena Motori", "CLI-025", "Pagamento", "in scadenza", 80000, "2026-07-10"],
  ["SCA-005", "Permesso edilizio AgriSole", "CLI-003", "Permesso", "in scadenza", 0, "2026-07-02"],
  ["SCA-006", "Collaudo Adriatica Food", "CLI-007", "Collaudo", "completata", 0, "2026-04-28"],
  ["SCA-007", "Saldo Brescia Acciai", "CLI-020", "Pagamento", "pianificata", 95000, "2026-08-30"],
  ["SCA-008", "Manutenzione Verde Retail", "CLI-005", "Manutenzione", "scaduta", 3000, "2026-06-01"],
  ["SCA-009", "Consegna inverter Bergamo Plast", "CLI-011", "Consegna", "in scadenza", 0, "2026-07-08"],
  ["SCA-010", "Acconto Torino Hospital", "CLI-019", "Pagamento", "pianificata", 47000, "2026-08-15"],
  ["SCA-011", "Permesso Genova Port", "CLI-022", "Permesso", "in scadenza", 0, "2026-07-12"],
  ["SCA-012", "Collaudo Monza Mobility", "CLI-014", "Collaudo", "completata", 0, "2026-02-10"],
  ["SCA-013", "Saldo NordCom", "CLI-016", "Pagamento", "in scadenza", 39000, "2026-06-30"],
  ["SCA-014", "Manutenzione Po Logistics", "CLI-008", "Manutenzione", "scaduta", 4500, "2026-05-20"],
  ["SCA-015", "Acconto Piemonte Wine", "CLI-024", "Pagamento", "pianificata", 16000, "2026-09-20"],
  ["SCA-016", "Consegna strutture Vicenza Green", "CLI-028", "Consegna", "in scadenza", 0, "2026-07-15"],
  ["SCA-017", "Permesso Alessandria Agri", "CLI-015", "Permesso", "scaduta", 0, "2026-06-05"],
  ["SCA-018", "Saldo Tecnoveneta", "CLI-010", "Pagamento", "pianificata", 54000, "2026-10-01"],
  ["SCA-019", "Collaudo Residenze Sole", "CLI-009", "Collaudo", "completata", 0, "2026-03-20"],
  ["SCA-020", "Manutenzione Brixia", "CLI-001", "Manutenzione", "in scadenza", 2800, "2026-07-03"],
  ["SCA-021", "Acconto Veneta Logistica", "CLI-017", "Pagamento", "scaduta", 22000, "2026-06-12"],
  ["SCA-022", "Consegna moduli Cuneo Energia", "CLI-018", "Consegna", "pianificata", 0, "2026-09-05"],
];

export const scadenze: Scadenza[] = scadenzeRaw.map(
  ([id, titolo, clienteId, tipo, stato, importo, data]) => {
    const c = cli(clienteId);
    return {
      id,
      titolo,
      clienteId,
      cliente: c.nome,
      citta: c.citta,
      regione: c.regione,
      tipo,
      stato,
      importo,
      data,
    };
  },
);

/* ----------------------------- Aggregati ----------------------------- */

const sum = (ns: number[]) => ns.reduce((a, b) => a + b, 0);

export interface ErpKpi {
  clientiTotali: number;
  valoreClienti: number;
  ordiniAperti: number;
  valorePipeline: number;
  ordiniAccettati: number;
  valoreAcquisito: number;
  tassoConversione: number;
  progettiInCorso: number;
  progettiInRitardo: number;
  potenzaTotaleKWp: number;
  scadenzeAperte: number;
  importoDaIncassare: number;
}

/** KPI di sintesi per la Panoramica (calcolati una volta, deterministici). */
export function getKpi(): ErpKpi {
  const aperti = ordini.filter((o) => o.stato === "bozza" || o.stato === "inviato");
  const accettati = ordini.filter((o) => o.stato === "accettato");
  const persi = ordini.filter((o) => o.stato === "perso");
  const scadOpen = scadenze.filter((s) => s.stato === "in scadenza" || s.stato === "scaduta");
  const chiusi = accettati.length + persi.length;
  return {
    clientiTotali: clienti.length,
    valoreClienti: sum(clienti.map((c) => c.valore)),
    ordiniAperti: aperti.length,
    valorePipeline: sum(aperti.map((o) => o.importo)),
    ordiniAccettati: accettati.length,
    valoreAcquisito: sum(accettati.map((o) => o.importo)),
    tassoConversione: chiusi === 0 ? 0 : Math.round((accettati.length / chiusi) * 100),
    progettiInCorso: progetti.filter((p) => p.stato === "in corso").length,
    progettiInRitardo: progetti.filter((p) => p.stato === "in ritardo").length,
    potenzaTotaleKWp: sum(progetti.map((p) => p.potenzaKWp)),
    scadenzeAperte: scadOpen.length,
    importoDaIncassare: sum(scadOpen.map((s) => s.importo)),
  };
}

export interface StatoBucket {
  label: string;
  stato: OrdineStato;
  valore: number;
  conteggio: number;
}

/** Valore e conteggio dei preventivi per stato (grafico a barre). */
export function getOrdiniPerStato(): StatoBucket[] {
  const stati: { stato: OrdineStato; label: string }[] = [
    { stato: "bozza", label: "Bozza" },
    { stato: "inviato", label: "Inviato" },
    { stato: "accettato", label: "Accettato" },
    { stato: "perso", label: "Perso" },
  ];
  return stati.map(({ stato, label }) => {
    const rows = ordini.filter((o) => o.stato === stato);
    return { label, stato, valore: sum(rows.map((o) => o.importo)), conteggio: rows.length };
  });
}

const MESI = ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"];

export interface MesePoint {
  label: string;
  pipeline: number;
  acquisito: number;
}

/** Andamento mensile: pipeline (inviato) vs acquisito (accettato), Gen–Giu. */
export function getAndamentoMensile(): MesePoint[] {
  const out: MesePoint[] = [];
  for (let m = 0; m < 6; m++) {
    const mese = String(m + 1).padStart(2, "0");
    const rows = ordini.filter((o) => o.data.slice(5, 7) === mese);
    out.push({
      label: MESI[m],
      pipeline: sum(rows.filter((o) => o.stato === "inviato").map((o) => o.importo)),
      acquisito: sum(rows.filter((o) => o.stato === "accettato").map((o) => o.importo)),
    });
  }
  return out;
}
