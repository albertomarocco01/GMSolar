/**
 * @descrizione  Dati mock per la scena immersiva ASSISTENTE AI (capitolo 03).
 *   RISCRITTURA: la scena non è più «griglia prodotti + configuratore». Ora è la
 *   HOME di un sito vetrina fotovoltaico/EV generico dove:
 *     ② il cursore apre un megamenu «Catalogo» VOLUTAMENTE SOVRACCARICO ed esita
 *        sopra le voci senza cliccare — la fatica dell'interfaccia classica;
 *     ③ il visitatore scrive all'assistente una richiesta con TRE sfumature;
 *     ④ l'assistente fa UNA domanda di chiarimento;
 *     ⑤ il visitatore risponde;
 *     ⑥ l'assistente RAGIONA e COSTRUISCE nella chat l'interfaccia della risposta
 *        (card setup wallbox+cavo, mini-grafico finestra notturna, stima costi, CTA).
 *   Tutto deterministico e in italiano. AI SIMULATA: nessuna chiamata reale.
 *
 *   ELIMINATO rispetto alla versione precedente: `PRODUCTS` (griglia catalogo),
 *   `RECOMMENDATION`/`GENERATED` (vista dettaglio + configuratore) e la singola
 *   `QUERY`. Non servono più: la scena non mostra un catalogo né un configuratore.
 */

// ── ② Megamenu «Catalogo»: colonne volutamente SOVRACCARICHE ─────────────────
// L'eccesso di voci È il messaggio (la fatica dell'UI classica): tante diramazioni,
// il cursore non sa dove andare. Non serve che siano esaustive, solo TROPPE.
export type MegaColumn = { title: string; items: string[] };

export const MEGA_COLUMNS: MegaColumn[] = [
  {
    title: "Cavi di ricarica",
    items: [
      "per Wallbox",
      "per Colonnina",
      "Modo 2 · Schuko",
      "Modo 3 · Tipo 2",
      "Monofase",
      "Trifase",
      "Spiralato",
      "Dritto · 5 m",
      "Dritto · 7 m",
    ],
  },
  {
    title: "Wallbox",
    items: [
      "Monofase 3,7 kW",
      "Monofase 7,4 kW",
      "Trifase 11 kW",
      "Trifase 22 kW",
      "Con display",
      "Con lettore RFID",
      "Con contatore MID",
      "Da esterno · IP55",
    ],
  },
  {
    title: "Accessori",
    items: [
      "Supporti a muro",
      "Adattatori",
      "Contattori",
      "Protezioni DC",
      "Gestione carichi",
      "Kit fotovoltaico",
      "Colonnine da terra",
      "Cavi di prolunga",
    ],
  },
];

// Le due voci su cui il cursore ESITA (highlight hover, nessun click): sono
// PLAUSIBILI per la richiesta ma nessuna coglie tutte le sfumature → frustrazione.
export const MEGA_HOVER: { col: number; row: number }[] = [
  { col: 1, row: 1 }, // «Monofase 7,4 kW»
  { col: 0, row: 3 }, // «Modo 3 · Tipo 2»
];

// ── ③–⑤ Dialogo (una sola sorgente di verità per barra + bolle chat) ─────────
export const DIALOG = {
  /** ③ La richiesta con TRE sfumature: impianto FV già presente, ricarica
   *  notturna, paura del distacco del contatore. Nessun filtro le coglie tutte. */
  request:
    "Ho appena preso un'auto elettrica e a casa ho il fotovoltaico da 6 kW: che setup mi consigliate per ricaricare di notte senza far scattare il contatore?",
  /** ④ La domanda di chiarimento: chiede SOLO ciò che serve a decidere. */
  clarify: "Il contatore è da 3 kW o l'avete già potenziato? E quanti km fate in media al giorno?",
  /** ⑤ La risposta breve del visitatore. */
  answer: "3 kW, circa 40 km al giorno.",
  /** ⑥ Il ragionamento dell'assistente: spiega COSA ha pensato prima di proporre. */
  reasoning:
    "Con un contatore da 3 kW la chiave è la gestione dinamica del carico: la wallbox modula la potenza di notte e non fa scattare nulla. Per 40 km al giorno bastano circa 3 ore. Ecco il setup che ti propongo:",
} as const;

// ── ⑥a Setup consigliato: DUE prodotti, ognuno con la SUA foto reale ─────────
// Nella chat sono RIGHE compatte (thumb quadrata + nome + prezzo), non card alte:
// il thread deve stare tutto in vista, prima bolla compresa.
export type SetupItem = {
  /** Categoria breve (eyebrow della riga). */
  kind: string;
  name: string;
  /** Foto in /assets/products/: DEVE mostrare il prodotto indicato. */
  img: string;
  price: string;
};

export const SETUP: { eyebrow: string; title: string; items: SetupItem[] } = {
  eyebrow: "Costruito sulla tua richiesta",
  title: "Il setup che ti propongo",
  items: [
    {
      kind: "Wallbox",
      name: "Wallbox monofase 7,4 kW",
      img: "/assets/products/wallbox-detail.jpg",
      price: "790 €",
    },
    {
      kind: "Cavo di ricarica",
      name: "Cavo Modo 3 · Tipo 2 · 5 m",
      img: "/assets/products/cavo-03.jpg",
      price: "189 €",
    },
  ],
};

// ── ⑥b Mini-grafico «finestra di ricarica notturna» (barre orarie 22 → 07) ───
// Le ore ATTIVE (carica in corso) sono più alte: la wallbox concentra la ricarica
// nelle ore notturne piene, ~3 ore, poi si spegne. Fascia evidenziata = ore attive.
export type ChargeHour = { h: string; level: number; active: boolean };

export const NIGHT_WINDOW: ChargeHour[] = [
  { h: "22", level: 20, active: false },
  { h: "23", level: 34, active: false },
  { h: "00", level: 86, active: true },
  { h: "01", level: 94, active: true },
  { h: "02", level: 88, active: true },
  { h: "03", level: 42, active: false },
  { h: "04", level: 18, active: false },
  { h: "05", level: 15, active: false },
  { h: "06", level: 13, active: false },
  { h: "07", level: 11, active: false },
];

// ── ⑥c Stima costi (cifre a rullo) ───────────────────────────────────────────
export const COST = {
  label: "Stima ricarica notturna",
  /** Ore di ricarica a notte (rulla 0 → 3). */
  hours: 3,
  /** Euro al mese (rulla 0 → 34). */
  perMonth: 34,
  /** La sfumatura FV còlta: di giorno il fotovoltaico ricarica gratis. */
  note: "Di giorno il tuo fotovoltaico ricarica gratis",
} as const;

// ── ⑥d CTA ───────────────────────────────────────────────────────────────────
export const CTA = { label: "Prenota un sopralluogo", done: "Sopralluogo richiesto" } as const;

// ── Home vetrina (chrome minima: nav + hero) ─────────────────────────────────
export const SITE = {
  name: "Sole & Ricarica",
  /** Voci di nav; «Catalogo» è quella che apre il megamenu. */
  nav: ["Fotovoltaico", "Ricarica EV", "Catalogo", "Contatti"],
  heroKicker: "Fotovoltaico + ricarica, chiavi in mano",
  heroTitle: "L'energia del sole, fino alla tua auto.",
  heroText:
    "Progettiamo l'impianto, la wallbox e la gestione dei carichi come un sistema unico. Su misura per casa tua.",
  heroImg: "/assets/products/pannello-01.jpg",
} as const;
