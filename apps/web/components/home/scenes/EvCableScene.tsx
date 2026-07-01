"use client";

/**
 * @descrizione  Scena "cavo EV" — secondo momento WOW del capitolo (subito dopo il
 *   solare). Config del motore VideoScrubScene: il video del cavo (all-keyframe) viene
 *   scrubbato dallo scroll mentre i callout di ricarica compaiono in sync coi beat
 *   (push-in auto → connettore Type 2 → energia lime nel cavo → porta che pulsa).
 * @indice
 * - EvCableScene → config cavo EV di VideoScrubScene
 */
import VideoScrubScene, { type Callout } from "./VideoScrubScene";

// Mock internamente coerenti: 32 A · 230 V ≈ 7,4 kW (AC monofase).
const CALLOUTS: Callout[] = [
  { at: 0.1, hold: 0.13, x: "7%", y: "20%", kicker: "Connettore", value: "Type 2", sub: "IEC 62196" },
  { at: 0.26, hold: 0.13, x: "52%", y: "16%", kicker: "Potenza", value: "7,4 kW", sub: "AC monofase" },
  { at: 0.42, hold: 0.13, x: "9%", y: "56%", kicker: "Corrente", value: "32 A", sub: "230 V" },
  { at: 0.56, hold: 0.13, x: "52%", y: "50%", kicker: "Stato di carica", value: "45% → 80%" },
  { at: 0.7, hold: 0.13, x: "11%", y: "70%", kicker: "Tempo stimato", value: "~2h 10min", sub: "alla carica" },
  { at: 0.84, hold: 0.14, x: "50%", y: "66%", kicker: "Energia erogata", value: "12,6 kWh", sub: "sessione in corso" },
];

export default function EvCableScene() {
  return (
    <VideoScrubScene
      src="/assets/ev-cable.mp4"
      poster="/assets/ev-cable-poster.webp"
      ariaLabel="Ricarica EV — energia nel cavo (video scrollytelling)"
      eyebrow="Ricarica che si racconta"
      title="L'energia che scorre nel cavo."
      lede="Dal connettore alla batteria: potenza, corrente e tempo, in tempo reale mentre scorri."
      callouts={CALLOUTS}
      exitToLight
    />
  );
}
