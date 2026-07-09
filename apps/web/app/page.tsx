import IntroOverlay from "@/components/home/IntroOverlay";
import AutoScroll from "@/components/home/AutoScroll";
import CinematicGrain from "@/components/home/CinematicGrain";
import VelocitySkew from "@/components/home/VelocitySkew";
import SolarTwinScene from "@/components/home/scenes/SolarTwinScene";
import InterfacceScene from "@/components/home/scenes/InterfacceScene";
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
 * fade dal nero DIRETTAMENTE sulla scena solare (video scrubbato del fotovoltaico);
 * ogni servizio riempie lo schermo e lo scroll scrubba un walkthrough (frasi-
 * intermezzo descrittive + cursore + pan orizzontale dove serve). Transizioni
 * verticali seamless tra prodotti.
 *   Apertura (video, scuro): Solare (impianto, gemello digitale). Poi INTERAZIONE:
 *   Assistente. Poi CONTROLLO (i capi): Dashboard → Segnalazioni (la segnalazione
 *   parte dal bottone «Segnala un problema» della dashboard) → Gestionale.
 *   Poi il capitolo ricarica: Ricarica EV → Integrazioni → chiusura minimale
 *   (solo «Rivedi la presentazione» su loop di sfondo).
 *   CAPITOLI (P12): la presentazione è scandita in 8 capitoli (CHAPTERS, 01→08:
 *   Siti vetrina → Interfacce grafiche moderne → Assistente AI → Dashboard →
 *   Segnalazioni → Gestionali su misura → App con assistente AI integrato →
 *   Integrazioni). Ogni scena apre con una title card numerata (ChapterCard).
 */
export default function HomePage() {
  return (
    <div id="top">
      <IntroOverlay />
      <AutoScroll />
      <CinematicGrain />
      <VelocitySkew />

      {/* APERTURA — video solare scuro (impianto, gemello digitale). SOLO video:
          i componenti UI sono ora il capitolo dedicato qui sotto. */}
      <SolarTwinScene />

      {/* INTERFACCE — i componenti UI premium su sfondo pulito, senza video */}
      <InterfacceScene />

      {/* INTERAZIONE — come le persone usano il sito */}
      <ImmersiveAssistente />

      {/* CONTROLLO — le interfacce dei capi. Segnalazioni viene SUBITO dopo la
          Dashboard: il suo walkthrough riparte dal bottone «Segnala un problema»
          mostrato in chiusura della scena precedente. */}
      <ImmersiveDashboard />
      <ImmersiveSegnalazioni />
      <ImmersiveGestionale />

      {/* Capitolo ricarica: app dedicata + integrazioni */}
      <ImmersiveRicarica />
      <ImmersiveIntegrazioni />

      <ClosingScene />
    </div>
  );
}
