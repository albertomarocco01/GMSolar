/**
 * Contenuti e costanti della sezione GMobility (wallbox/colonnine).
 * Vivono qui (dominio mobility) così le sezioni restano piccole e i testi sono
 * sostituibili in un solo punto. NB: regola di progetto — niente dati inventati
 * "spacciati per reali". I numeri di mercato sono REALI e citati in fonte.
 */
import type { GeoCoordinates } from "@/lib/types";

/* =============================================================
   Componenti della colonnina (etichette dell'explode 3D / spec list).
   L'ordine = ordine di "separazione" nello storytelling.
   ============================================================= */
export type WallboxPart = {
  id: string;
  /** Etichetta breve mostrata accanto al pezzo. */
  label: string;
  /** Micro-descrizione tecnica. */
  hint: string;
};

export const WALLBOX_PARTS: WallboxPart[] = [
  { id: "shell", label: "Corpo IP55", hint: "Scocca robusta per interni ed esterni" },
  { id: "strip", label: "Barra di stato LED", hint: "Stato di ricarica a colpo d'occhio" },
  { id: "socket", label: "Connettore Tipo 2", hint: "Standard europeo Mennekes" },
  { id: "cable", label: "Cavo Mode 3", hint: "Ricarica AC fino a 22 kW" },
  { id: "plate", label: "Piastra a muro", hint: "Installazione rapida e sicura" },
];

/* =============================================================
   Statistiche di mercato — DATI REALI.
   Fonti: EY Mobility Consumer Index 2023 · Motus-E (osservatorio).
   ============================================================= */
export type MarketStat = {
  /** Valore numerico per AnimatedCounter. */
  value: number;
  prefix?: string;
  suffix?: string;
  /** Etichetta principale. */
  label: string;
  /** Nota/contesto sotto al numero. */
  note: string;
};

export const MARKET_STATS: MarketStat[] = [
  {
    value: 70,
    suffix: "%",
    label: "Italiani verso l'elettrico",
    note: "Pronti a passare all'EV entro 24 mesi (EY MCI 2023)",
  },
  {
    value: 47000,
    label: "Punti di ricarica pubblici",
    note: "Rete in crescita costante in Italia (Motus-E)",
  },
  {
    value: 200000,
    label: "Auto elettriche circolanti",
    note: "Parco BEV in Italia, in continua espansione",
  },
  {
    value: 75,
    prefix: "−",
    suffix: "%",
    label: "Emissioni di CO₂",
    note: "Riduzione del 59–75% sul ciclo di vita vs termico",
  },
];

export const MARKET_SOURCE = "Fonte: EY Mobility Consumer Index 2023 · Motus-E";

/* =============================================================
   Soluzioni: due percorsi (Aziende / Residenziali). Partner: Mennekes.
   ============================================================= */
export type SolutionPath = {
  id: "business" | "home";
  eyebrow: string;
  title: string;
  description: string;
  features: string[];
  cta: string;
};

export const SOLUTIONS: SolutionPath[] = [
  {
    id: "business",
    eyebrow: "Per le aziende",
    title: "Ricarica per flotte e clienti",
    description:
      "Colonnine AC e DC fast per parcheggi aziendali, flotte e spazi aperti al pubblico, con gestione accessi e rendicontazione.",
    features: [
      "Colonnine AC 22 kW e DC fast fino a 150 kW",
      "Gestione utenti, accessi e billing",
      "Monitoraggio e manutenzione da remoto",
      "Incentivi e pratiche chiavi in mano",
    ],
    cta: "Soluzioni business",
  },
  {
    id: "home",
    eyebrow: "Per la casa",
    title: "Wallbox per la tua abitazione",
    description:
      "Wallbox Mennekes compatte e silenziose, perfette per box e posti auto privati, integrabili con il tuo impianto fotovoltaico GM Solar.",
    features: [
      "Wallbox Mennekes da 3,7 a 22 kW",
      "App per controllo e statistiche",
      "Ricarica con l'energia del tuo fotovoltaico",
      "Installazione certificata e a norma",
    ],
    cta: "Soluzioni casa",
  },
];

/* =============================================================
   Pin "showcase" — installazioni GMobility presso clienti REALI in Piemonte.
   NB: coordinate APPROSSIMATE a livello di città (demo): da confermare con i
   dati reali. NON sono punti di ricarica pubblici inventati: il grosso della
   mappa arriva da Open Charge Map (dati reali). Vedi ChargingMap.
   ============================================================= */
export type ShowcasePin = {
  id: string;
  name: string;
  city: string;
  coordinates: GeoCoordinates;
};

export const SHOWCASE_PINS: ShowcasePin[] = [
  { id: "sc-borello", name: "Borello", city: "Beinasco (TO)", coordinates: { lat: 45.0046, lng: 7.5876 } },
  { id: "sc-ronchiverdi", name: "Ronchiverdi", city: "Torino", coordinates: { lat: 45.0273, lng: 7.697 } },
  { id: "sc-bellini", name: "Bellini", city: "Torino", coordinates: { lat: 45.0709, lng: 7.6868 } },
];

/** Centro mappa di default: Torino / Piemonte. */
export const MAP_CENTER: GeoCoordinates = { lat: 45.07, lng: 7.69 };

/* =============================================================
   Configuratore "che soluzione ti serve" — opzioni del wizard.
   ============================================================= */
export type ConfigUsage = "home" | "business";

export const POWER_OPTIONS: Record<ConfigUsage, { value: string; label: string; hint: string }[]> = {
  home: [
    { value: "3.7", label: "3,7 kW", hint: "Monofase, ricarica notturna" },
    { value: "7.4", label: "7,4 kW", hint: "Monofase potenziata" },
    { value: "11", label: "11 kW", hint: "Trifase, ricarica veloce" },
    { value: "22", label: "22 kW", hint: "Trifase, massima potenza AC" },
  ],
  business: [
    { value: "22", label: "22 kW AC", hint: "Dipendenti e clienti" },
    { value: "50", label: "50 kW DC", hint: "Fast charge" },
    { value: "150", label: "150 kW DC", hint: "Ultra-fast per hub" },
  ],
};

export const COUNT_OPTIONS = [
  { value: "1", label: "1 punto" },
  { value: "2-5", label: "2–5 punti" },
  { value: "6-20", label: "6–20 punti" },
  { value: "20+", label: "Oltre 20" },
];
