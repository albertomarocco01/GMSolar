import IntroOverlay from "@/components/home/IntroOverlay";
import AutoScroll from "@/components/home/AutoScroll";
import CinematicGrain from "@/components/home/CinematicGrain";
import VelocitySkew from "@/components/home/VelocitySkew";
import VetrinaScene from "@/components/home/scenes/VetrinaScene";
import SolarTwinScene from "@/components/home/scenes/SolarTwinScene";
import EvCableScene from "@/components/home/scenes/EvCableScene";
import ClosingScene from "@/components/home/scenes/ClosingScene";

// Scene-prodotto IMMERSIVE (full-screen, scrub, cursore + intermezzi descrittivi).
import ImmersiveAssistente from "@/components/home/immersive/ImmersiveAssistente";
import ImmersiveDashboard from "@/components/home/immersive/ImmersiveDashboard";
import ImmersiveSegnalazioni from "@/components/home/immersive/ImmersiveSegnalazioni";
import ImmersiveIntegrazioni from "@/components/home/immersive/ImmersiveIntegrazioni";
import ImmersiveRicarica from "@/components/home/immersive/ImmersiveRicarica";
import ImmersiveGestionale from "@/components/home/immersive/ImmersiveGestionale";

/**
 * Home = presentazione IMMERSIVA full-screen, chromeless, tema chiaro. Si apre in
 * fade dal nero sull'intro AZIENDA GM Solar; ogni servizio riempie lo schermo e lo
 * scroll scrubba un walkthrough (frasi-intermezzo descrittive + cursore + pan
 * orizzontale dove serve). Transizioni verticali seamless tra prodotti.
 *   Capitolo AZIENDA (video, scuro): GM Solar/azienda (drone) → Solare (impianto,
 *   gemello digitale). Poi INTERAZIONE: Assistente. Poi CONTROLLO (i capi):
 *   Dashboard → Gestionale → Segnalazioni. Poi lo STACCO EV (video cavo, scuro)
 *   introduce il capitolo ricarica: Ricarica EV → Integrazioni → chiusura GM Solar.
 */
export default function HomePage() {
  return (
    <div id="top">
      <IntroOverlay />
      <AutoScroll />
      <CinematicGrain />
      <VelocitySkew />

      {/* Capitolo AZIENDA — video scuri (GM Solar/drone → impianto solare) */}
      <VetrinaScene />
      <SolarTwinScene />

      {/* INTERAZIONE — come le persone usano il sito */}
      <ImmersiveAssistente />

      {/* CONTROLLO — le interfacce dei capi */}
      <ImmersiveDashboard />
      <ImmersiveGestionale />
      <ImmersiveSegnalazioni />

      {/* STACCO EV — video scuro (cavo) che introduce il capitolo ricarica */}
      <EvCableScene />

      {/* App dedicata + integrazioni */}
      <ImmersiveRicarica />
      <ImmersiveIntegrazioni />

      <ClosingScene />
    </div>
  );
}
