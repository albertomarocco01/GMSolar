"use client";

/**
 * @descrizione  Scena "gemello digitale" del fotovoltaico — momento WOW del capitolo
 *   Siti vetrina (subito dopo il drone). Config del motore VideoScrubScene: il video
 *   solare (all-keyframe) viene scrubbato dallo scroll mentre i callout tecnici solari
 *   compaiono in sync coi beat (drone → x-ray → energia lime nei pannelli → accumulo).
 * @indice
 * - SolarTwinScene → config solare di VideoScrubScene
 */
import VideoScrubScene, { type Callout } from "./VideoScrubScene";

const CALLOUTS: Callout[] = [
  { at: 0.1, hold: 0.13, x: "7%", y: "20%", kicker: "Modulo", value: "440 Wp", sub: "Monocristallino PERC" },
  { at: 0.26, hold: 0.13, x: "52%", y: "16%", kicker: "Efficienza modulo", value: "22,1%" },
  { at: 0.42, hold: 0.13, x: "9%", y: "56%", kicker: "Impianto", value: "6,6 kWp", sub: "15 moduli · 30° · Sud" },
  { at: 0.56, hold: 0.13, x: "52%", y: "50%", kicker: "Inverter ibrido", value: "6 kW", sub: "MPPT · 97,5%" },
  { at: 0.7, hold: 0.13, x: "11%", y: "70%", kicker: "Accumulo", value: "13,5 kWh", sub: "SoC 85%" },
  { at: 0.84, hold: 0.14, x: "50%", y: "66%", kicker: "Produzione oggi", value: "28,4 kWh", sub: "Autoconsumo 72% · −3,4 t CO₂/anno" },
];

export default function SolarTwinScene() {
  return (
    <VideoScrubScene
      src="/assets/solar-twin.mp4"
      poster="/assets/solar-twin-poster.webp"
      ariaLabel="Fotovoltaico — gemello digitale (video scrollytelling)"
      eyebrow="Esperienze immersive"
      title="Il gemello digitale del tuo impianto."
      lede="Dal render alla realtà: l'energia che scorre, dato per dato, mentre scorri."
      callouts={CALLOUTS}
    />
  );
}
