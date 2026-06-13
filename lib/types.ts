/**
 * Tipi dei dati di dominio. I record reali vivono in /data come JSON
 * placeholder e verranno sostituiti con i contenuti definitivi.
 */

export type GeoCoordinates = {
  lat: number;
  lng: number;
};

/** GM Solar — progetto fotovoltaico (per mappa progetti e stats). */
export type SolarProject = {
  id: string;
  name: string;
  location: string;
  capacityKwp: number;
  annualProductionMwh: number;
  year: number;
  coordinates: GeoCoordinates;
  image: string;
};

/** GMobility — punto di ricarica (wallbox / colonnina). */
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

/** Cavo Perfetto — prodotto del catalogo e-commerce. */
export type Product = {
  id: string;
  name: string;
  slug: string;
  connector: string;
  lengthM: number;
  currentA: number;
  phase: "mono" | "trifase";
  priceEur: number;
  image: string;
  compatibleWith: string[];
};
