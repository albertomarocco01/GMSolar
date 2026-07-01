import IntroOverlay from "@/components/home/IntroOverlay";
import AutoScroll from "@/components/home/AutoScroll";
import ScrollHint from "@/components/home/ScrollHint";
import CinematicGrain from "@/components/home/CinematicGrain";
import VelocitySkew from "@/components/home/VelocitySkew";
import VetrinaScene from "@/components/home/scenes/VetrinaScene";
import SolarTwinScene from "@/components/home/scenes/SolarTwinScene";
import EvCableScene from "@/components/home/scenes/EvCableScene";
import FadeToBlackScene from "@/components/home/scenes/FadeToBlackScene";

// Scene-prodotto IMMERSIVE (full-screen, scrub, cursore + intermezzi descrittivi).
import ImmersiveAssistente from "@/components/home/immersive/ImmersiveAssistente";
import ImmersiveDashboard from "@/components/home/immersive/ImmersiveDashboard";
import ImmersiveSegnalazioni from "@/components/home/immersive/ImmersiveSegnalazioni";
import ImmersiveIntegrazioni from "@/components/home/immersive/ImmersiveIntegrazioni";
import ImmersiveRicarica from "@/components/home/immersive/ImmersiveRicarica";
import ImmersiveGestionale from "@/components/home/immersive/ImmersiveGestionale";

/**
 * Home = presentazione IMMERSIVA full-screen, chromeless, tema chiaro. Si apre in
 * fade dal nero su "Siti vetrina moderni"; ogni servizio riempie lo schermo e lo
 * scroll scrubba un walkthrough (frasi-intermezzo descrittive + cursore + pan
 * orizzontale dove serve). Transizioni verticali seamless tra prodotti.
 *   Capitolo VETRINA (video-scrub, scuro): Vetrina(drone) → Solare(gemello
 *   digitale) → Cavo EV. Poi INTERAZIONE: Assistente. Poi CONTROLLO (i capi):
 *   Dashboard → Gestionale → Segnalazioni. Poi Ricarica EV → Integrazioni →
 *   firma + fade to black.
 */
export default function HomePage() {
  return (
    <div id="top">
      <IntroOverlay />
      <AutoScroll />
      <ScrollHint />
      <CinematicGrain />
      <VelocitySkew />

      {/* Capitolo VETRINA — video-scrub scuri (drone → solare → cavo EV) */}
      <VetrinaScene />
      <SolarTwinScene />
      <EvCableScene />

      {/* INTERAZIONE — come le persone usano il sito */}
      <ImmersiveAssistente />

      {/* CONTROLLO — le interfacce dei capi */}
      <ImmersiveDashboard />
      <ImmersiveGestionale />
      <ImmersiveSegnalazioni />

      {/* App dedicata + integrazioni */}
      <ImmersiveRicarica />
      <ImmersiveIntegrazioni />

      <FadeToBlackScene />
    </div>
  );
}
