import IntroOverlay from "@/components/home/IntroOverlay";
import AutoScroll from "@/components/home/AutoScroll";
import CinematicGrain from "@/components/home/CinematicGrain";
import VelocitySkew from "@/components/home/VelocitySkew";
import VetrinaScene from "@/components/home/scenes/VetrinaScene";
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
 *   (fade dal nero) 01 Vetrina → 02 Dashboard → 03 Segnalazioni →
 *   04 Assistente → 05 Gestionale → 06 Ricarica EV → 07 Integrazioni →
 *   firma + fade to black.
 */
export default function HomePage() {
  return (
    <div id="top">
      <IntroOverlay />
      <AutoScroll />
      <CinematicGrain />
      <VelocitySkew />

      <VetrinaScene />
      <ImmersiveDashboard />
      <ImmersiveSegnalazioni />
      <ImmersiveAssistente />
      <ImmersiveGestionale />
      <ImmersiveRicarica />
      <ImmersiveIntegrazioni />

      <FadeToBlackScene />
    </div>
  );
}
