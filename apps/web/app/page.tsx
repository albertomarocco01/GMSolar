import IntroOverlay from "@/components/home/IntroOverlay";
import AutoScroll from "@/components/home/AutoScroll";
import ChapterHUD from "@/components/home/ChapterHUD";
import CinematicGrain from "@/components/home/CinematicGrain";
import VelocitySkew from "@/components/home/VelocitySkew";
import SolarTwinScene from "@/components/home/scenes/SolarTwinScene";
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
 *   Poi il capitolo ricarica: Ricarica EV → Integrazioni → chiusura GM Solar.
 *   CAPITOLI (P12): la presentazione è scandita in 7 capitoli (CHAPTERS, 01→07:
 *   Siti vetrina → Assistente AI → Dashboard → Segnalazioni → Gestionale
 *   colonnine → App di ricarica → Integrazioni). Ogni scena apre con una title
 *   card SCURA numerata (ChapterCard); l'HUD in alto a destra (ChapterHUD) segue
 *   il capitolo corrente via `data-chapter` e sparisce sulla chiusura.
 */
export default function HomePage() {
  return (
    <div id="top">
      <IntroOverlay />
      <AutoScroll />
      <ChapterHUD />
      <CinematicGrain />
      <VelocitySkew />

      {/* APERTURA — video solare scuro (impianto, gemello digitale) */}
      <SolarTwinScene />

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
