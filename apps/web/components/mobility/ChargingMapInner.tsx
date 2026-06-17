"use client";

import { useEffect, useRef } from "react";
import maplibregl, { type StyleSpecification } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { MAP_CENTER, SHOWCASE_PINS, type ShowcasePin } from "@/components/mobility/content";
import type { ApiChargingPoint } from "@/app/api/charging-points/route";

/* Stile mappa: override da env se presente, altrimenti raster scuro CARTO
   (gratuito, niente API key) — coerente col tema scuro della scena. */
const DARK_RASTER: StyleSpecification = {
  version: 8,
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
  return `<div style="font:13px/1.4 system-ui,sans-serif;color:#0b1020;max-width:200px">
    <strong style="display:block;margin-bottom:2px">${escapeHtml(title)}</strong>
    ${lines.map((l) => `<span style="display:block;color:#5b6472">${escapeHtml(l)}</span>`).join("")}
  </div>`;
}

/** Marker DOM piccolo per i punti pubblici (verde, più chiaro se fast). */
function publicMarkerEl(fast: boolean) {
  const el = document.createElement("div");
  el.style.cssText = `width:11px;height:11px;border-radius:9999px;cursor:pointer;border:1.5px solid rgba(255,255,255,.6);background:${fast ? "#7cf08a" : "#3c9e3a"};box-shadow:0 0 8px ${fast ? "rgba(124,240,138,.7)" : "rgba(60,158,58,.5)"}`;
  return el;
}

/** Marker showcase (cliente GMobility): pin più grande con pulse. */
function showcaseMarkerEl() {
  const el = document.createElement("div");
  el.className = "gm-showcase-pin";
  el.style.cssText =
    "width:18px;height:18px;border-radius:9999px;cursor:pointer;background:var(--accent);border:2px solid #fff;box-shadow:0 0 0 6px var(--accent-soft),0 2px 6px rgba(0,0,0,.4)";
  return el;
}

type Props = {
  points: ApiChargingPoint[];
};

/**
 * Mappa MapLibre GL (caricata in dynamic ssr:false dal wrapper). Mostra i punti
 * pubblici REALI (Open Charge Map, via route handler) + i pin showcase dei
 * clienti GMobility. Pulisce mappa e marker al dismount (no leak WebGL).
 */
export default function ChargingMapInner({ points }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const envStyle = process.env.NEXT_PUBLIC_MAP_STYLE_URL;
    const map = new maplibregl.Map({
      container,
      style: envStyle || DARK_RASTER,
      center: [MAP_CENTER.lng, MAP_CENTER.lat],
      zoom: 8.2,
      attributionControl: { compact: true },
      // su mobile evita di "intrappolare" lo scroll: pan con due dita.
      cooperativeGestures: true,
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

    const markers: maplibregl.Marker[] = [];

    // Punti pubblici reali.
    for (const p of points) {
      const fast = (p.powerKw ?? 0) >= 50;
      const popup = new maplibregl.Popup({ offset: 14, closeButton: false }).setHTML(
        popupHtml(
          p.name,
          [p.town ?? "", p.powerKw ? `${p.powerKw} kW` : "", p.connector ?? ""].filter(Boolean),
        ),
      );
      markers.push(
        new maplibregl.Marker({ element: publicMarkerEl(fast) })
          .setLngLat([p.lng, p.lat])
          .setPopup(popup)
          .addTo(map),
      );
    }

    // Pin showcase clienti GMobility.
    for (const s of SHOWCASE_PINS as ShowcasePin[]) {
      const popup = new maplibregl.Popup({ offset: 16, closeButton: false }).setHTML(
        popupHtml(`${s.name} · installazione GMobility`, [s.city]),
      );
      markers.push(
        new maplibregl.Marker({ element: showcaseMarkerEl() })
          .setLngLat([s.coordinates.lng, s.coordinates.lat])
          .setPopup(popup)
          .addTo(map),
      );
    }

    return () => {
      markers.forEach((m) => m.remove());
      map.remove();
    };
  }, [points]);

  return <div ref={containerRef} className="absolute inset-0" />;
}
