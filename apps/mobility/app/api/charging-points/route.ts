/**
 * Route handler — punti di ricarica REALI da Open Charge Map (Italia/Piemonte).
 *
 * Perché server-side: l'eventuale API key OCM resta sul server (mai nel client),
 * e possiamo cache-are la risposta per non martellare l'API gratuita. Se OCM non
 * risponde o non è raggiungibile → fallback ELEGANTE: lista vuota (la mappa mostra
 * comunque i pin showcase). Niente dati inventati.
 *
 * Key opzionale: process.env.OCM_API_KEY (server-only). OCM funziona anche senza,
 * per volumi bassi.
 */
import { NextResponse } from "next/server";
import { MAP_CENTER } from "@/components/mobility/content";

// Cache lato server: una richiesta a OCM ogni ora basta e avanza per la demo.
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

export async function GET() {
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

  const url = `https://api.openchargemap.io/v3/poi?${params.toString()}`;

  try {
    const res = await fetch(url, {
      headers: key ? { "X-API-Key": key } : {},
      next: { revalidate },
    });
    if (!res.ok) throw new Error(`OCM ${res.status}`);

    const data = (await res.json()) as OcmPoi[];
    const points: ApiChargingPoint[] = (Array.isArray(data) ? data : [])
      .map((poi) => {
        const a = poi.AddressInfo;
        if (!a || typeof a.Latitude !== "number" || typeof a.Longitude !== "number") return null;
        const powers = (poi.Connections ?? [])
          .map((c) => c.PowerKW)
          .filter((p): p is number => typeof p === "number" && p > 0);
        const connector = poi.Connections?.find((c) => c.ConnectionType?.Title)?.ConnectionType
          ?.Title;
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

    return NextResponse.json({ points, source: "openchargemap" });
  } catch {
    // Fallback elegante: nessun punto pubblico, ma niente errore lato UI.
    return NextResponse.json({ points: [], source: "unavailable" });
  }
}
