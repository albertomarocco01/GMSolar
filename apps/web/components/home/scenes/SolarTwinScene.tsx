"use client";

/**
 * @descrizione  Scena "impianto solare" — gemello digitale del fotovoltaico e ULTIMO
 *   video del capitolo azienda (subito dopo l'intro drone). Non è più seguita dal
 *   cavo EV: apre direttamente i servizi. Poiché la scena successiva (l'Assistente)
 *   è CHIARA, alza un velo chiaro sul finale (`exitToLight`) → ingresso pulito, senza
 *   flash scuro. Config del motore VideoScrubScene: il video solare (all-keyframe)
 *   viene scrubbato dallo scroll mentre i callout raccontano l'arco NARRATIVO:
 *   impianto chiavi in mano → cos'è il modulo → efficienza → inverter → accumulo →
 *   produzione reale (dal progetto all'energia, zoom via via più tecnico).
 * @indice
 * - SolarTwinScene → config solare di VideoScrubScene
 */
import VideoScrubScene, { type Callout } from "./VideoScrubScene";

// Arco: installazione/impianto → modulo (cosa sono) → specifiche → zoom tecnico →
// risultato (produzione). Mock internamente coerenti.
const CALLOUTS: Callout[] = [
  { at: 0.1, hold: 0.13, x: "7%", y: "20%", kicker: "Impianto chiavi in mano", value: "6,6 kWp", sub: "15 moduli · 30° · Sud" },
  { at: 0.26, hold: 0.13, x: "52%", y: "16%", kicker: "Modulo", value: "440 Wp", sub: "Monocristallino PERC" },
  { at: 0.42, hold: 0.13, x: "9%", y: "56%", kicker: "Efficienza modulo", value: "22,1%" },
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
      eyebrow="Impianto fotovoltaico"
      title="Il tuo impianto, dato per dato."
      lede="Dalla posa dei moduli alla produzione reale: ogni numero del fotovoltaico GM Solar, mentre scorri."
      callouts={CALLOUTS}
      exitToLight
    />
  );
}
