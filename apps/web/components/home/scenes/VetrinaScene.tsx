"use client";

/**
 * @descrizione  Scena #1 della home: INTRO AZIENDA "GM Solar" (tema scuro
 *   cinematografico). Apre il capitolo video (azienda → impianto solare → cavo EV):
 *   un video drone in autoplay-loop LIBERO fa da fondale mentre lo scroll rivela i
 *   dati d'azienda (mock) e il cue "Scorri". Il drone NON è all-keyframe → si usa
 *   VideoScrubScene in modalità `scrub={false}` (niente seek, gira libero). Mantiene
 *   l'ancora `#vetrina` (link da menu/kb). reduced-motion → poster + dati impilati.
 *
 *   NB: prima era la scena "Siti vetrina" (finta homepage + card web-design); il
 *   riordino della demo l'ha trasformata nell'apertura-azienda della storia solare.
 * @indice
 * - VetrinaScene → config "azienda GM Solar" di VideoScrubScene (drone, free)
 */
import VideoScrubScene, { type Callout } from "./VideoScrubScene";

// Dati d'azienda MOCK (deterministici) che raccontano GM Solar mentre il drone
// sorvola l'impianto. Ordine = pacing uniforme, da ritarare sui beat reali.
const CALLOUTS: Callout[] = [
  { at: 0.12, hold: 0.15, x: "7%", y: "20%", kicker: "Chi siamo", value: "GM Solar", sub: "Fotovoltaico · accumulo · ricarica" },
  { at: 0.32, hold: 0.14, x: "52%", y: "18%", kicker: "Impianti installati", value: "+250", sub: "residenziale & business" },
  { at: 0.5, hold: 0.14, x: "9%", y: "56%", kicker: "Potenza gestita", value: "3,2 MWp" },
  { at: 0.66, hold: 0.14, x: "52%", y: "52%", kicker: "Autoconsumo medio", value: "72%", sub: "con accumulo" },
  { at: 0.82, hold: 0.16, x: "11%", y: "68%", kicker: "CO₂ evitata", value: "−1.100 t", sub: "ogni anno" },
];

export default function VetrinaScene() {
  return (
    <VideoScrubScene
      id="vetrina"
      scrub={false}
      src="/assets/gm-solar-drone.mp4"
      poster="/assets/gm-solar-drone-poster.webp"
      ariaLabel="GM Solar — l'azienda (video scrollytelling)"
      eyebrow="GM Solar"
      title={
        <>
          Energia che progettiamo, <span className="text-accent">installiamo</span> e raccontiamo.
        </>
      }
      lede="Impianti fotovoltaici, accumulo e ricarica EV — chiavi in mano. Guarda cosa costruiamo, mentre scorri."
      callouts={CALLOUTS}
    />
  );
}
