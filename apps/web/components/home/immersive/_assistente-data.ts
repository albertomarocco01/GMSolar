/**
 * @descrizione  Dati per la scena immersiva ASSISTENTE AI (servizio 02).
 *   Prodotti realistici ripresi da `legacy/data/products.json` (cavi di ricarica
 *   Cavo Perfetto), ridotti ai soli campi mostrati a schermo. Uno è marcato
 *   `recommended`: è il match che l'assistente "genera" per la richiesta della
 *   scena — «ricaricare a casa» → wallbox residenziale, monofase, best seller.
 *   La logica originale sta nel legacy (`cable-matcher.ts`); qui ne mostriamo
 *   solo l'esito, perché la scena è una vetrina dimostrativa, non il finder live.
 */

export type ImmProduct = {
  id: string;
  /** Nome breve, pensato per la card della griglia. */
  name: string;
  /** Uso/categoria leggibile (es. "Wallbox residenziale"). */
  use: string;
  phase: "Monofase" | "Trifase";
  shape: "Liscio" | "Spiralato";
  /** Prezzo già formattato (la scena non fa calcoli). */
  price: string;
  bestSeller?: boolean;
  /** true sul prodotto che l'assistente raccomanda per la richiesta della scena. */
  recommended?: boolean;
};

/** Vetrina mostrata in griglia (cavi di ricarica, da products.json). */
export const PRODUCTS: ImmProduct[] = [
  {
    id: "modo3-t2-monofase-liscio",
    name: "Cavo Modo 3 · Tipo 2 · Monofase Liscio · 5 m",
    use: "Wallbox residenziale",
    phase: "Monofase",
    shape: "Liscio",
    price: "189 €",
    bestSeller: true,
    recommended: true,
  },
  {
    id: "modo3-t2-monofase-spiralato",
    name: "Cavo Modo 3 · Tipo 2 · Monofase Spiralato · 5 m",
    use: "Wallbox residenziale",
    phase: "Monofase",
    shape: "Spiralato",
    price: "199 €",
  },
  {
    id: "modo3-t2-trifase-spiralato",
    name: "Cavo Modo 3 · Tipo 2 · Trifase Spiralato · 5 m",
    use: "Stazione / colonnina",
    phase: "Trifase",
    shape: "Spiralato",
    price: "219 €",
    bestSeller: true,
  },
  {
    id: "modo3-t2-trifase-liscio",
    name: "Cavo Modo 3 · Tipo 2 · Trifase Liscio · 5 m",
    use: "Stazione / colonnina",
    phase: "Trifase",
    shape: "Liscio",
    price: "219 €",
  },
  {
    id: "modo3-t2-trifase-liscio-wallbox",
    name: "Cavo Modo 3 · Tipo 2 · Trifase Liscio · Wallbox 11 kW",
    use: "Wallbox residenziale",
    phase: "Trifase",
    shape: "Liscio",
    price: "239 €",
  },
  {
    id: "modo2-t2-schuko-liscio",
    name: "Cavo Modo 2 · Schuko · Liscio · 5 m",
    use: "Presa domestica",
    phase: "Monofase",
    shape: "Liscio",
    price: "389 €",
  },
];

/**
 * Contenuto della card-raccomandazione "generata" dall'assistente (look di
 * `CableRecommendation`). Nome e prezzo sono duplicati dal prodotto consigliato
 * per evitare lookup a runtime; badge e motivazioni derivano dalle sue specs.
 */
export type ImmReco = {
  productId: string;
  /** Frase introduttiva dell'assistente sopra la card. */
  lead: string;
  name: string;
  price: string;
  /** Badge tecnici: il primo è evidenziato (accent). */
  badges: string[];
  /** Motivazioni «perché questo» (max 3), derivate dai dati reali. */
  reasons: string[];
};

export const RECOMMENDATION: ImmReco = {
  productId: "modo3-t2-monofase-liscio",
  lead: "Per ricaricare a casa la tua auto ti consiglio questo:",
  name: "Cavo Modo 3 · Tipo 2 · Monofase Liscio · 5 m",
  price: "189 €",
  badges: ["Best seller", "Modo 3", "Tipo 2", "Monofase", "Liscio"],
  reasons: [
    "Pensato per la ricarica a casa, su wallbox residenziale",
    "Monofase, lo standard della maggior parte degli impianti domestici",
    "Modo 3 · Tipo 2 · 5 m, pronto all'uso",
  ],
};

/** La richiesta che il visitatore digita nella barra dell'assistente. */
export const QUERY = "Cerco un cavo per ricaricare a casa la mia auto";
