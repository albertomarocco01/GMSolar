/**
 * Tipi condivisi dell'assistente di sito.
 *
 * Modulo di soli tipi (nessun "use client", nessun runtime): è la fonte unica
 * del CONTRATTO tra la route `/api/assistant` e l'UI, importabile sia dal client
 * sia dal route handler server-side senza trascinare codice React.
 */

/** Ruolo di un turno di conversazione. */
export type ChatRole = "user" | "assistant";

/** Link di approfondimento proposto con una risposta. */
export interface Suggestion {
  /** Etichetta cliccabile. */
  label: string;
  /** Destinazione interna (deep-link a una sezione/servizio). */
  href: string;
}

/** Messaggio mostrato nel widget. */
export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  /** Suggerimenti allegati alla risposta dell'assistente. */
  suggestions?: Suggestion[];
}

/** Turno inviato alla route (sottoinsieme di ChatMessage). */
export interface ChatTurn {
  role: ChatRole;
  content: string;
}

/** Contratto di risposta dell'endpoint POST /api/assistant. */
export interface AssistantResponse {
  answer: string;
  suggestions: Suggestion[];
}
