/**
 * Tipi del "Demo launcher" interno (route /demos). Una sola fonte dati
 * (`/data/demos.json`) descrive ogni demo; questi tipi la rendono type-safe.
 * Aggiungere una demo = una voce nel JSON (vedi `catalog.ts`).
 */

/** Chiave di accent per la card. Riusa i colori statici di brand dei token. */
export type AccentKey = "solar" | "mobility" | "shop" | "group";

/** Stato di avanzamento mostrato dal badge della card. */
export type DemoStatus = "ready" | "wip";

/** Raggruppamento in sezioni della dashboard. */
export type DemoSection = "worlds" | "ai" | "planned";

/** Motivo grafico dell'anteprima placeholder (vedi `Motif.tsx`). */
export type DemoMotif =
  | "ecosystem"
  | "rays"
  | "cube"
  | "cable"
  | "spark"
  | "chart"
  | "route"
  | "chat"
  | "layout";

/**
 * Anteprima reale opzionale (placeholder, sostituibile). Se assente la card
 * mostra il motivo grafico procedurale `motif`. `image` e `video` puntano a
 * file in /public — swappabili senza toccare il codice.
 */
export type DemoMedia =
  | { type: "image"; src: string }
  | { type: "video"; src: string; poster: string };

/** Una demo dell'ecosistema. */
export type Demo = {
  /** Identificatore stabile (key React + ancore). */
  key: string;
  title: string;
  /** Brand di appartenenza → colore accent della card. */
  world: AccentKey;
  /** Sezione della dashboard in cui compare. */
  section: DemoSection;
  /** Route della demo. Assente = non ancora navigabile (status `wip`). */
  href?: string;
  /** Una riga in italiano. */
  description: string;
  status: DemoStatus;
  /** Motivo grafico dell'anteprima placeholder. */
  motif: DemoMotif;
  /** Anteprima reale opzionale (immagine o video muto). */
  media?: DemoMedia;
};
