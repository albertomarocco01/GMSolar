"use client";

/**
 * @descrizione  Scena "cavo EV" — terzo e ultimo video del capitolo (subito dopo il
 *   solare). Config del motore VideoScrubScene: il video del cavo (all-keyframe) viene
 *   scrubbato dallo scroll mentre i callout raccontano l'arco NARRATIVO: il cavo/
 *   connettore in generale → quanta potenza → per quali auto è adatto → trifase per
 *   la ricarica rapida → sessione live (SoC, tempo).
 * @indice
 * - EvCableScene → config cavo EV di VideoScrubScene
 */
import VideoScrubScene, { type Callout } from "./VideoScrubScene";

// Arco: standard connettore → potenza AC → auto adatte → trifase (rapida) →
// sessione live. Mock coerenti: 32 A · 230 V ≈ 7,4 kW mono; 3F 32 A ≈ 22 kW.
const CALLOUTS: Callout[] = [
  { at: 0.1, hold: 0.13, x: "7%", y: "20%", kicker: "Connettore", value: "Type 2", sub: "Standard europeo · IEC 62196" },
  { at: 0.26, hold: 0.13, x: "52%", y: "16%", kicker: "Potenza AC", value: "fino a 7,4 kW", sub: "monofase · 32 A" },
  { at: 0.42, hold: 0.14, x: "9%", y: "56%", kicker: "Ideale per", value: "plug-in & city EV", sub: "ricarica notturna completa" },
  { at: 0.58, hold: 0.14, x: "52%", y: "50%", kicker: "Trifase", value: "fino a 22 kW", sub: "EV a ricarica rapida" },
  { at: 0.74, hold: 0.13, x: "11%", y: "70%", kicker: "Stato di carica", value: "45% → 80%" },
  { at: 0.86, hold: 0.14, x: "50%", y: "66%", kicker: "Tempo stimato", value: "~2h 10min", sub: "energia erogata 12,6 kWh" },
];

export default function EvCableScene() {
  return (
    <VideoScrubScene
      src="/assets/ev-cable.mp4"
      poster="/assets/ev-cable-poster.webp"
      ariaLabel="Ricarica EV — energia nel cavo (video scrollytelling)"
      eyebrow="Ricarica che si racconta"
      title="L'energia che scorre nel cavo."
      lede="Dal connettore Type 2 alla batteria: quanta potenza, per quali auto, in quanto tempo — mentre scorri."
      callouts={CALLOUTS}
      exitToLight
    />
  );
}
