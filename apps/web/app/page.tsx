import AutoScroll from "@/components/home/AutoScroll";
import HeroScene from "@/components/home/scenes/HeroScene";
import VetrinaScene from "@/components/home/scenes/VetrinaScene";
import FadeToBlackScene from "@/components/home/scenes/FadeToBlackScene";
import ServiceScene from "@/components/home/ServiceScene";
import DeviceFrame from "@/components/home/DeviceFrame";
import { SERVICES, type ServiceKey } from "@gmgroup/lib/site";

// I demo REALI già costruiti, incorporati nella presentazione.
import SiteAssistant from "@/components/assistente/SiteAssistant";
import DashboardApp from "@/components/dashboard/DashboardApp";
import GestionaleApp from "@/components/gestionale/GestionaleApp";
import EvAgentApp from "@/components/mobility/agent/EvAgentApp";
import SegnalazioniPanel from "@/components/segnalazioni/SegnalazioniPanel";
import FlowDiagram from "@/components/integrazioni/FlowDiagram";
import { SCENARIOS } from "@/components/integrazioni/data";

/** Meta del servizio dal registry (numero/label/titolo/claim/tema). */
const svc = (key: ServiceKey) => SERVICES.find((s) => s.key === key)!;

/**
 * Home = UNA pagina scrollytelling seamless, CHROMELESS (niente header/footer),
 * a tema chiaro. Racconta tutti i servizi INLINE incorporando i demo REALI:
 *   Hero → Vetrina (video scrubbato) → 6 scene-servizio con la demo vera a fianco
 *   (assistente, dashboard, gestionale, ricarica, integrazioni, segnalazioni) →
 *   chiusura. Lo scroll è AUTOMATICO (AutoScroll); muovendo il mouse si prende il
 *   controllo, all'inattività riparte. Tutto rispetta prefers-reduced-motion.
 */
export default function HomePage() {
  const assistente = svc("assistente");
  const dashboard = svc("dashboard");
  const gestionale = svc("gestionale");
  const ricarica = svc("ricarica");
  const integrazioni = svc("integrazioni");
  const segnalazioni = svc("segnalazioni");

  return (
    <div id="top">
      <AutoScroll />
      <HeroScene />

      {/* 01 — Sito vetrina: video scrollytelling (niente 3D) */}
      <VetrinaScene />

      {/* 02 — Assistente AI: il widget reale, interattivo */}
      <ServiceScene
        number={assistente.number}
        label={assistente.label}
        title={assistente.title}
        blurb={assistente.blurb}
        theme={assistente.theme}
      >
        <SiteAssistant className="w-full" />
      </ServiceScene>

      {/* 03 — Dashboard & telemetria: app reale in anteprima */}
      <ServiceScene
        number={dashboard.number}
        label={dashboard.label}
        title={dashboard.title}
        blurb={dashboard.blurb}
        theme={dashboard.theme}
        reverse
      >
        <DeviceFrame label="console.tuosito.it/dashboard">
          <DashboardApp />
        </DeviceFrame>
      </ServiceScene>

      {/* 04 — Gestionale con AI: app reale in anteprima */}
      <ServiceScene
        number={gestionale.number}
        label={gestionale.label}
        title={gestionale.title}
        blurb={gestionale.blurb}
        theme={gestionale.theme}
      >
        <DeviceFrame label="gestionale.tuazienda.it">
          <GestionaleApp />
        </DeviceFrame>
      </ServiceScene>

      {/* 05 — App ricarica EV: il simulatore reale in anteprima */}
      <ServiceScene
        number={ricarica.number}
        label={ricarica.label}
        title={ricarica.title}
        blurb={ricarica.blurb}
        theme={ricarica.theme}
        reverse
      >
        <DeviceFrame label="app ricarica — simulatore di bordo">
          <EvAgentApp />
        </DeviceFrame>
      </ServiceScene>

      {/* 06 — Integrazioni API: il diagramma di flusso reale, interattivo */}
      <ServiceScene
        number={integrazioni.number}
        label={integrazioni.label}
        title={integrazioni.title}
        blurb={integrazioni.blurb}
        theme={integrazioni.theme}
      >
        <div className="border-border bg-surface shadow-lift rounded-2xl border p-5">
          <FlowDiagram scenarioId={SCENARIOS[0].id} />
        </div>
      </ServiceScene>

      {/* 07 — Segnalazioni: il pannello reale in anteprima */}
      <ServiceScene
        number={segnalazioni.number}
        label={segnalazioni.label}
        title={segnalazioni.title}
        blurb={segnalazioni.blurb}
        theme={segnalazioni.theme}
        reverse
      >
        <DeviceFrame label="segnalazioni — pannello richieste">
          <SegnalazioniPanel />
        </DeviceFrame>
      </ServiceScene>

      {/* Finale: fade to black (demo dal vivo, niente CTA). */}
      <FadeToBlackScene />
    </div>
  );
}
