/**
 * Fallback CURATO della rete di ricarica pubblica — Piemonte.
 *
 * A cosa serve: quando Open Charge Map non è raggiungibile o manca la
 * `OCM_API_KEY` (l'endpoint pubblico oggi risponde 403 senza key), la mappa non
 * deve restare vuota in demo. Questo è un set INDICATIVO di punti in COMUNI
 * REALI del Piemonte, con coordinate a livello di città/area (NON l'indirizzo
 * GPS esatto di una specifica colonnina) e potenze plausibili.
 *
 * Onestà (regola di progetto): non è un feed in tempo reale e non spaccia
 * indirizzi precisi per reali. La UI lo segnala con una nota "punti indicativi"
 * (vedi ChargingMap) e il route lo marca `source: "curated"`. La rete vera,
 * puntuale e aggiornata, arriva da OCM appena è configurata `OCM_API_KEY`.
 */
import type { ApiChargingPoint } from "@/app/api/charging-points/route";

export const CURATED_PIEMONTE: ApiChargingPoint[] = [
  {
    id: "curated-torino-centro",
    name: "Ricarica pubblica · Torino centro",
    lat: 45.0703,
    lng: 7.6869,
    town: "Torino",
    powerKw: 22,
    connector: "Type 2",
  },
  {
    id: "curated-torino-lingotto",
    name: "Hub ricarica · Torino Lingotto",
    lat: 45.0312,
    lng: 7.6646,
    town: "Torino",
    powerKw: 150,
    connector: "CCS",
  },
  {
    id: "curated-moncalieri",
    name: "Ricarica pubblica · Moncalieri",
    lat: 45.0009,
    lng: 7.6846,
    town: "Moncalieri",
    powerKw: 50,
    connector: "CCS",
  },
  {
    id: "curated-rivoli",
    name: "Ricarica pubblica · Rivoli",
    lat: 45.0701,
    lng: 7.5164,
    town: "Rivoli",
    powerKw: 22,
    connector: "Type 2",
  },
  {
    id: "curated-collegno",
    name: "Ricarica pubblica · Collegno",
    lat: 45.0782,
    lng: 7.5731,
    town: "Collegno",
    powerKw: 22,
    connector: "Type 2",
  },
  {
    id: "curated-grugliasco",
    name: "Hub ricarica · Grugliasco",
    lat: 45.0663,
    lng: 7.5786,
    town: "Grugliasco",
    powerKw: 50,
    connector: "CCS",
  },
  {
    id: "curated-settimo",
    name: "Ricarica pubblica · Settimo Torinese",
    lat: 45.1369,
    lng: 7.7693,
    town: "Settimo Torinese",
    powerKw: 22,
    connector: "Type 2",
  },
  {
    id: "curated-beinasco",
    name: "Hub ricarica · Beinasco",
    lat: 45.0131,
    lng: 7.5871,
    town: "Beinasco",
    powerKw: 150,
    connector: "CCS",
  },
  {
    id: "curated-chieri",
    name: "Ricarica pubblica · Chieri",
    lat: 45.0111,
    lng: 7.8226,
    town: "Chieri",
    powerKw: 22,
    connector: "Type 2",
  },
  {
    id: "curated-pinerolo",
    name: "Ricarica pubblica · Pinerolo",
    lat: 44.8853,
    lng: 7.3306,
    town: "Pinerolo",
    powerKw: 50,
    connector: "CCS",
  },
  {
    id: "curated-ivrea",
    name: "Hub ricarica · Ivrea",
    lat: 45.4677,
    lng: 7.8754,
    town: "Ivrea",
    powerKw: 50,
    connector: "CCS",
  },
  {
    id: "curated-asti",
    name: "Ricarica pubblica · Asti",
    lat: 44.9009,
    lng: 8.2064,
    town: "Asti",
    powerKw: 22,
    connector: "Type 2",
  },
];
