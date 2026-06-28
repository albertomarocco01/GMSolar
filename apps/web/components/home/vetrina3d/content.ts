/**
 * Dati della colonnina/wallbox usati dalla scena 3D della VETRINA (home).
 * Copia ridotta da `legacy/components/mobility/content.ts`: qui serve SOLO
 * l'anatomia dei pezzi (etichette dell'explode). Niente dipendenze da
 * `@gmgroup/lib/types` né dati di mercato/mappa (non servono in questa scena).
 */
export type WallboxPart = {
  id: string;
  /** Etichetta breve mostrata accanto al pezzo. */
  label: string;
  /** Micro-descrizione tecnica. */
  hint: string;
  /** Specifiche di dettaglio (qui non mostrate, tenute per parità con il legacy). */
  specs: string[];
};

/* Ordine = ordine di "separazione" nello storytelling (explode). */
export const WALLBOX_PARTS: WallboxPart[] = [
  {
    id: "shell",
    label: "Corpo IP55",
    hint: "Scocca robusta per interni ed esterni",
    specs: [
      "Grado di protezione IP55 (polvere e getti d'acqua)",
      "Tecnopolimero anti-UV per installazione all'aperto",
      "Funzionamento da −25 °C a +40 °C",
    ],
  },
  {
    id: "strip",
    label: "Barra di stato LED",
    hint: "Stato di ricarica a colpo d'occhio",
    specs: [
      "Colore = stato: standby, in carica, errore",
      "Leggibile anche in pieno giorno",
      "Attenuazione automatica di notte",
    ],
  },
  {
    id: "socket",
    label: "Connettore Tipo 2",
    hint: "Standard europeo Mennekes",
    specs: [
      "Standard europeo Mennekes (IEC 62196-2)",
      "Fino a 22 kW in AC trifase",
      "Otturatori di sicurezza sui contatti",
    ],
  },
  {
    id: "cable",
    label: "Cavo Mode 3",
    hint: "Ricarica AC fino a 22 kW",
    specs: [
      "Ricarica AC controllata (Mode 3, IEC 61851)",
      "Cavo solidale fino a 5 m, Type 2 → Type 2",
      "Alloggiamento integrato sul corpo",
    ],
  },
  {
    id: "plate",
    label: "Piastra a muro",
    hint: "Installazione rapida e sicura",
    specs: [
      "Dima di foratura inclusa",
      "Ingresso cavi dal retro o dal basso",
      "Posa a cura di elettricista qualificato",
    ],
  },
];
