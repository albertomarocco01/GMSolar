/**
 * GM Group — Pannello Segnalazioni
 * Tipi condivisi fra tutti i sottocomponenti del modulo.
 */

export type Tipo = "bug" | "modifica" | "domanda";
export type Priorita = "bassa" | "media" | "alta" | "urgente";
export type Sito = "solar" | "mobility" | "shop" | "dashboard" | "altro";
export type Stato = "aperta" | "in_lavorazione" | "risolta";

export const TIPO_LABEL: Record<Tipo, string> = {
  bug: "Bug",
  modifica: "Richiesta modifica",
  domanda: "Domanda",
};

export const PRIORITA_LABEL: Record<Priorita, string> = {
  bassa: "Bassa",
  media: "Media",
  alta: "Alta",
  urgente: "Urgente",
};

export const SITO_LABEL: Record<Sito, string> = {
  solar: "GM Solar",
  mobility: "GMobility",
  shop: "Cavo Perfetto",
  dashboard: "Dashboard",
  altro: "Altro",
};

export const STATO_LABEL: Record<Stato, string> = {
  aperta: "Aperta",
  in_lavorazione: "In lavorazione",
  risolta: "Risolta",
};

/** Ordine canonico degli stati per confronti nella timeline. */
export const STATO_ORDER: Record<Stato, number> = {
  aperta: 0,
  in_lavorazione: 1,
  risolta: 2,
};

export interface TimelineStep {
  stato: Stato;
  data: string; // YYYY-MM-DD
  nota?: string;
}

export interface Segnalazione {
  id: string; // es. "SEG-2026-0001"
  tipo: Tipo;
  titolo: string;
  descrizione: string;
  priorita: Priorita;
  sito: Sito;
  allegatoNome?: string;
  stato: Stato;
  dataCreazione: string; // YYYY-MM-DD
  timeline: TimelineStep[];
}

/**
 * Dati grezzi del form prima che vengano arricchiti (id, stato, timeline)
 * e aggiunti alla lista in SegnalazioniPanel.
 */
export interface FormDraft {
  tipo: Tipo;
  titolo: string;
  descrizione: string;
  priorita: Priorita;
  sito: Sito;
  allegatoNome?: string;
}
