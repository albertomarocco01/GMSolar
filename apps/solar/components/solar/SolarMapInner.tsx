"use client";

import { useEffect, useRef } from "react";
import maplibregl, { type StyleSpecification, type GeoJSONSource } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useReducedMotion } from "@gmgroup/lib/motion";
import solar from "@/data/solar-projects.json";

/* Accent solar (chartreuse): qui in valore statico perché i layer MapLibre non
   leggono le CSS var. Se cambia il token, allineare questo. */
const ACCENT = "#a8d920";
const INK = "#0b1020";

/* Stile mappa: override da env (NEXT_PUBLIC_MAP_STYLE_URL) altrimenti raster
   scuro CARTO (gratuito, niente API key) — fa risaltare i pin chartreuse.
   `glyphs` serve solo a disegnare il numero dentro i cluster; se l'endpoint
   non è raggiungibile la mappa funziona comunque (resta senza etichetta). */
const DARK_RASTER: StyleSpecification = {
  version: 8,
  glyphs: "https://fonts.openmaptiles.org/{fontstack}/{range}.pbf",
  sources: {
    carto: {
      type: "raster",
      tiles: [
        "https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        "https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        "https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      ],
      tileSize: 256,
      attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a> © CARTO',
    },
  },
  layers: [{ id: "carto", type: "raster", source: "carto" }],
};

function escapeHtml(s: string) {
  return s.replace(
    /[&<>"]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!,
  );
}

function popupHtml(title: string, lines: string[]) {
  return `<div style="font:13px/1.4 system-ui,sans-serif;color:#0b1020;max-width:210px">
    <strong style="display:block;margin-bottom:2px">${escapeHtml(title)}</strong>
    ${lines.map((l) => `<span style="display:block;color:#5b6472">${escapeHtml(l)}</span>`).join("")}
  </div>`;
}

const nfIt = new Intl.NumberFormat("it-IT");

/* Progetti → GeoJSON (proprietà solo primitive: servono ai layer/popup).
   Tipi LOCALI con stringhe-letterali, niente namespace globale `GeoJSON`: così
   non serve aggiungere @types/geojson e l'oggetto resta strutturalmente
   compatibile con quello che MapLibre si aspetta in `addSource({ data })`. */
type ProjectProps = { nome: string; tipo: string; kWp: number; anno: number };
type ProjectFeature = {
  type: "Feature";
  geometry: { type: "Point"; coordinates: [number, number] };
  properties: ProjectProps;
};
const PROJECTS_GEOJSON: { type: "FeatureCollection"; features: ProjectFeature[] } = {
  type: "FeatureCollection",
  features: solar.mappaProgetti.map((p) => ({
    type: "Feature",
    geometry: { type: "Point", coordinates: [p.lng, p.lat] },
    properties: { nome: p.nome, tipo: p.tipo, kWp: p.kWp, anno: p.anno },
  })),
};

/**
 * Mappa progetti GM Solar (MapLibre GL, caricata in dynamic ssr:false dal
 * wrapper). Sorgente GeoJSON con clustering nativo: i punti vicini si
 * raggruppano in bolle che si espandono al click; i singoli impianti mostrano
 * un popup con potenza (kWp) e anno. Pulisce mappa e listener al dismount.
 */
export default function SolarMapInner() {
  const containerRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const envStyle = process.env.NEXT_PUBLIC_MAP_STYLE_URL;
    const map = new maplibregl.Map({
      container,
      style: envStyle || DARK_RASTER,
      center: [8.6, 45.2], // nord-ovest Italia (baricentro dei progetti demo)
      zoom: 6,
      attributionControl: { compact: true },
      cooperativeGestures: true, // su mobile non "intrappola" lo scroll
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

    const popup = new maplibregl.Popup({ offset: 14, closeButton: false, maxWidth: "240px" });

    map.on("load", () => {
      map.addSource("progetti", {
        type: "geojson",
        data: PROJECTS_GEOJSON,
        cluster: true,
        clusterRadius: 48,
        clusterMaxZoom: 9,
      });

      // Alone morbido sotto i punti singoli (effetto "glow" chartreuse).
      map.addLayer({
        id: "glow",
        type: "circle",
        source: "progetti",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": ACCENT,
          "circle-blur": 1,
          "circle-opacity": 0.35,
          "circle-radius": [
            "interpolate",
            ["linear"],
            ["get", "kWp"],
            10,
            10,
            1000,
            16,
            18000,
            30,
          ],
        },
      });

      // Bolle dei cluster: raggio in base al numero di impianti raggruppati.
      map.addLayer({
        id: "clusters",
        type: "circle",
        source: "progetti",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": ACCENT,
          "circle-opacity": 0.9,
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": 2,
          "circle-radius": ["step", ["get", "point_count"], 18, 3, 24, 6, 30],
        },
      });

      // Conteggio dentro al cluster (richiede `glyphs`; se mancano, niente crash).
      map.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "progetti",
        filter: ["has", "point_count"],
        layout: {
          "text-field": ["get", "point_count_abbreviated"],
          "text-font": ["Noto Sans Bold", "Noto Sans Regular"],
          "text-size": 13,
        },
        paint: { "text-color": INK },
      });

      // Impianti singoli: pin pieno, raggio in base alla potenza (kWp).
      map.addLayer({
        id: "impianti",
        type: "circle",
        source: "progetti",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": ACCENT,
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": 2,
          "circle-radius": [
            "interpolate",
            ["linear"],
            ["get", "kWp"],
            10,
            5,
            1000,
            9,
            6000,
            13,
            18000,
            18,
          ],
        },
      });

      // Click su cluster → zoom fino a separarlo.
      map.on("click", "clusters", (e) => {
        const feature = map.queryRenderedFeatures(e.point, { layers: ["clusters"] })[0];
        if (!feature) return;
        const clusterId = feature.properties?.cluster_id;
        const source = map.getSource("progetti") as GeoJSONSource | undefined;
        const geom = feature.geometry;
        if (clusterId == null || !source || geom.type !== "Point") return;
        const [lng, lat] = geom.coordinates;
        source.getClusterExpansionZoom(clusterId).then((zoom) => {
          map.easeTo({ center: [lng, lat], zoom, duration: reduced ? 0 : 600 });
        });
      });

      // Click su impianto → popup con tipo, potenza, anno.
      map.on("click", "impianti", (e) => {
        const f = e.features?.[0];
        if (!f || f.geometry.type !== "Point") return;
        const p = f.properties as ProjectProps;
        const [lng, lat] = f.geometry.coordinates;
        popup
          .setLngLat([lng, lat])
          .setHTML(popupHtml(p.nome, [p.tipo, `${nfIt.format(p.kWp)} kWp`, `Anno ${p.anno}`]))
          .addTo(map);
      });

      // Cursore "mano" sopra cluster e impianti.
      for (const layer of ["clusters", "impianti"]) {
        map.on("mouseenter", layer, () => (map.getCanvas().style.cursor = "pointer"));
        map.on("mouseleave", layer, () => (map.getCanvas().style.cursor = ""));
      }

      // Inquadra tutti i progetti.
      const bounds = new maplibregl.LngLatBounds();
      for (const f of PROJECTS_GEOJSON.features) {
        bounds.extend(f.geometry.coordinates);
      }
      if (!bounds.isEmpty()) {
        map.fitBounds(bounds, { padding: 56, maxZoom: 9, animate: !reduced });
      }
    });

    return () => {
      popup.remove();
      map.remove();
    };
  }, [reduced]);

  return <div ref={containerRef} className="absolute inset-0" />;
}
