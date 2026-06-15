/**
 * Route handler — punti di ricarica REALI da Open Charge Map (Italia/Piemonte).
 *
 * Perché server-side: l'eventuale API key OCM resta sul server (mai nel client)
 * e possiamo cache-are la risposta per non martellare l'API gratuita.
 *
 * Resilienza (la mappa NON deve mai restare vuota in demo):
 *  1) OCM ok  → punti reali in tempo reale (`source: "openchargemap"`), salvati
 *     anche come "ultima risposta buona" in memoria.
 *  2) OCM ko/empty ma c'è una risposta buona precedente → la riusiamo
 *     (`source: "cache"`).
 *  3) Niente di tutto ciò → fallback CURATO di punti in comuni reali del
 *     Piemonte (`source: "curated"`, vedi data/charging-fallback.ts).
 *
 * NB: dal 2024 l'endpoint pubblico OCM richiede una API key — senza, risponde
 * 403. Imposta `OCM_API_KEY` (server-only) per avere la rete in tempo reale.
 */
import { NextResponse } from "next/server";
import { MAP_CENTER } from "@/components/mobility/content";
import { CURATED_PIEMONTE } from "@/data/charging-fallback";

// Cache lato server (Next): una richiesta a OCM ogni ora basta per la demo.
export const revalidate = 3600;

export type ApiChargingPoint = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  town: string | null;
  powerKw: number | null;
  connector: string | null;
};

export type ChargingSource = "openchargemap" | "cache" | "curated";

/* Forma (parziale) della risposta Open Charge Map che ci interessa. */
type OcmPoi = {
  ID: number;
  AddressInfo?: {
    Title?: string;
    Latitude?: number;
    Longitude?: number;
    Town?: string;
  } | null;
  Connections?: Array<{
    PowerKW?: number | null;
    ConnectionType?: { Title?: string } | null;
  }> | null;
};

/* "Ultima risposta buona" da OCM, tenuta in memoria del processo. In serverless
   può azzerarsi tra i cold start: è solo un cuscinetto best-effort, il fallback
   curato garantisce comunque punti. */
let lastGood: ApiChargingPoint[] | null = null;

function mapOcm(data: unknown): ApiChargingPoint[] {
  const arr = Array.isArray(data) ? (data as OcmPoi[]) : [];
  return arr
    .map((poi) => {
      const a = poi.AddressInfo;
      if (!a || typeof a.Latitude !== "number" || typeof a.Longitude !== "number") return null;
      const powers = (poi.Connections ?? [])
        .map((c) => c.PowerKW)
        .filter((p): p is number => typeof p === "number" && p > 0);
      const connector = poi.Connections?.find((c) => c.ConnectionType?.Title)?.ConnectionType?.Title;
      return {
        id: `ocm-${poi.ID}`,
        name: a.Title ?? "Punto di ricarica",
        lat: a.Latitude,
        lng: a.Longitude,
        town: a.Town ?? null,
        powerKw: powers.length ? Math.max(...powers) : null,
        connector: connector ?? null,
      } satisfies ApiChargingPoint;
    })
    .filter((p): p is ApiChargingPoint => p !== null);
}

async function fetchOcm(): Promise<ApiChargingPoint[]> {
  const params = new URLSearchParams({
    output: "json",
    countrycode: "IT",
    latitude: String(MAP_CENTER.lat),
    longitude: String(MAP_CENTER.lng),
    distance: "70",
    distanceunit: "KM",
    maxresults: "120",
    compact: "true",
    verbose: "false",
  });

  const key = process.env.OCM_API_KEY;
  if (key) params.set("key", key);

  const res = await fetch(`https://api.openchargemap.io/v3/poi?${params.toString()}`, {
    // OCM richiede la key (header preferito) + un User-Agent identificativo.
    headers: {
      "User-Agent": "GMobilityDemo/1.0 (+https://gmgroup.example)",
      ...(key ? { "X-API-Key": key } : {}),
    },
    next: { revalidate },
  });
  if (!res.ok) throw new Error(`OCM ${res.status}`);
  return mapOcm(await res.json());
}

export async function GET() {
  // 1) Tentativo OCM in tempo reale.
  try {
    const points = await fetchOcm();
    if (points.length) {
      lastGood = points;
      return NextResponse.json({ points, source: "openchargemap" satisfies ChargingSource });
    }
  } catch {
    // gestito sotto coi fallback
  }

  // 2) Ultima risposta buona (dati OCM reali, non in tempo reale).
  if (lastGood?.length) {
    return NextResponse.json({ points: lastGood, source: "cache" satisfies ChargingSource });
  }

  // 3) Fallback curato: la mappa resta sempre popolata.
  return NextResponse.json({ points: CURATED_PIEMONTE, source: "curated" satisfies ChargingSource });
}
