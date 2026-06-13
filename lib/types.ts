/**
 * Tipi dei dati di dominio. I record vivono in /data come JSON: contenuti
 * "mock ma realistici" derivati dallo scraping dei siti reali dei brand
 * (vedi /scraping per la provenienza e i sourceUrl).
 */

export type GeoCoordinates = {
  lat: number;
  lng: number;
};

/* =============================================================
   GM Solar — EPC fotovoltaico
   File: data/solar-projects.json
   ============================================================= */

/** Numeri chiave dell'azienda (per la sezione stats). */
export type SolarStats = {
  potenzaInstallataKWp: number;
  co2RisparmiataT: number;
  energiaProdottaMWh: number;
  progettiRealizzati: number;
};

/** Progetto in vetrina (potenzaMW non sempre disponibile). */
export type SolarShowcaseProject = {
  nome: string;
  tipo: string;
  potenzaMW?: number;
};

export type SolarContent = {
  stats: SolarStats;
  tipologie: string[];
  servizi: string[];
  progettiVetrina: SolarShowcaseProject[];
};

/* =============================================================
   GMobility — wallbox / colonnine di ricarica
   File: data/charging-points.json
   ============================================================= */

export type ChargingPoint = {
  id: string;
  name: string;
  address: string;
  city: string;
  coordinates: GeoCoordinates;
  powerKw: number;
  connector: string;
  status: "available" | "busy" | "offline";
};

/* =============================================================
   Cavo Perfetto — e-commerce cavi di ricarica
   File: data/products.json
   ============================================================= */

/** Specifiche tecniche del cavo (campi variabili per categoria/servizio). */
export type ProductSpecs = {
  mode?: string;
  connector?: string;
  plug?: string;
  phase?: "monofase" | "trifase";
  shape?: "liscio" | "spiralato";
  use?: string;
  /** Per i servizi/add-on (es. estensione garanzia). */
  type?: string;
  coverage?: string;
};

export type Product = {
  id: string;
  name: string;
  category: string;
  /** null per i servizi senza prezzo fisso. */
  price: number | null;
  currency: string;
  bestSeller: boolean;
  specs: ProductSpecs;
  image: string;
  sourceUrl: string;
};
