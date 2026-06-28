/**
 * Tipi condivisi della demo Gestionale: contratto dell'assistente AI
 * (richiesta → filtro + risposta) e descrittori generici per la DataTable e
 * il DetailDrawer. Modulo PURO (nessun React/JSX) così è importabile sia dal
 * client sia dal route handler server `app/api/gestionale`.
 */
import type { ReactNode } from "react";

/** Le quattro entità interrogabili dell'ERP. */
export type EntityKey = "clienti" | "ordini" | "progetti" | "scadenze";

/** Sezioni navigabili della webapp (Panoramica + le entità). */
export type SectionKey = "panoramica" | EntityKey;

export const SECTION_ORDER: SectionKey[] = [
  "panoramica",
  "clienti",
  "ordini",
  "progetti",
  "scadenze",
];

/** Etichette leggibili (singolare/plurale) per le entità. */
export const ENTITY_LABELS: Record<EntityKey, { singolare: string; plurale: string }> = {
  clienti: { singolare: "cliente", plurale: "clienti" },
  ordini: { singolare: "preventivo", plurale: "preventivi" },
  progetti: { singolare: "progetto", plurale: "progetti" },
  scadenze: { singolare: "scadenza", plurale: "scadenze" },
};

/** Titoli delle sezioni in topbar/sidebar. */
export const SECTION_TITLES: Record<SectionKey, string> = {
  panoramica: "Panoramica",
  clienti: "Clienti",
  ordini: "Ordini & Preventivi",
  progetti: "Progetti & Impianti",
  scadenze: "Scadenze",
};

/**
 * Filtro normalizzato che l'assistente applica ai dati mostrati. Tutti i campi
 * sono opzionali: l'interpretazione (AI o euristica) compila solo quelli
 * rilevanti per la richiesta. `applyFilter` (filters.ts) lo applica all'entità.
 */
export interface GestionaleFilter {
  entity: EntityKey;
  /** Testo libero cercato sui campi principali dell'entità. */
  text?: string;
  regione?: string;
  citta?: string;
  settore?: string;
  /** Token di stato; per gli ordini ammette anche "aperti". */
  stato?: string;
  minImporto?: number;
  maxImporto?: number;
  /** Scorciatoia "in ritardo / scaduto" per progetti e scadenze. */
  inRitardo?: boolean;
}

/** Da dove proviene la risposta dell'assistente (badge nella UI). */
export type AssistantSource = "ai" | "fallback" | "guardrail";

/** Risposta del route handler dell'assistente. */
export interface AssistantResult {
  /** false = richiesta fuori dominio o bloccata dal guardrail. */
  ok: boolean;
  reply: string;
  source: AssistantSource;
  entity?: EntityKey;
  filter?: GestionaleFilter;
  /** Numero di record che soddisfano il filtro (ricalcolato lato server). */
  matchedCount?: number;
}

/** Allineamento di una colonna. */
export type ColumnAlign = "left" | "right" | "center";

/**
 * Descrittore di colonna per la DataTable generica. `sortValue` abilita
 * l'ordinamento; `cell` rende il contenuto (badge, barre, formattazioni).
 */
export interface ColumnDef<T> {
  key: string;
  header: string;
  align?: ColumnAlign;
  sortValue?: (row: T) => string | number;
  cell: (row: T) => ReactNode;
}

/** Campo del pannello di dettaglio (drawer). */
export interface DetailField {
  label: string;
  value: ReactNode;
}
