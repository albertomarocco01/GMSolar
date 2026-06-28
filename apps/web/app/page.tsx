import AutoScroll from "@/components/home/AutoScroll";
import HeroScene from "@/components/home/scenes/HeroScene";
import VetrinaScene from "@/components/home/scenes/VetrinaScene";
import FadeToBlackScene from "@/components/home/scenes/FadeToBlackScene";
import ServiceScene from "@/components/home/ServiceScene";
import { SERVICES, type ServiceKey } from "@gmgroup/lib/site";

// Moduli animati che "recitano" da soli (auto-play all'ingresso in vista).
import AssistenteModule from "@/components/home/modules/AssistenteModule";
import DashboardModule from "@/components/home/modules/DashboardModule";
import GestionaleModule from "@/components/home/modules/GestionaleModule";
import RicaricaModule from "@/components/home/modules/RicaricaModule";
import IntegrazioniModule from "@/components/home/modules/IntegrazioniModule";
import SegnalazioniModule from "@/components/home/modules/SegnalazioniModule";

/** Meta del servizio dal registry (numero/label/titolo/claim/tema). */
const svc = (key: ServiceKey) => SERVICES.find((s) => s.key === key)!;

/**
 * Home = UNA pagina scrollytelling seamless, CHROMELESS, a tema chiaro. Racconta
 * tutti i servizi INLINE: ogni modulo si FERMA all'ingresso e RECITA la sua
 * interazione (l'auto-scroll si sospende, poi riparte). Ordine narrativo:
 *   Hero → 01 Vetrina (finto-video: pannello solare + cavo) → 02 Assistente →
 *   03 Dashboard → 04 Gestionale → 05 Ricarica EV → 06 Integrazioni →
 *   07 Segnalazioni → fade to black. Tutto rispetta prefers-reduced-motion.
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

      {/* 01 — Sito vetrina: finto-video scrollytelling (pannello solare + cavo) */}
      <VetrinaScene />

      {/* 02 — Assistente AI di sito: domanda → risposta → UI generata */}
      <ServiceScene
        number={assistente.number}
        label={assistente.label}
        title={assistente.title}
        blurb={assistente.blurb}
        theme={assistente.theme}
      >
        <AssistenteModule />
      </ServiceScene>

      {/* 03 — Dashboard & telemetria multi-sito */}
      <ServiceScene
        number={dashboard.number}
        label={dashboard.label}
        title={dashboard.title}
        blurb={dashboard.blurb}
        theme={dashboard.theme}
        reverse
      >
        <DashboardModule />
      </ServiceScene>

      {/* 04 — Gestionale con assistente AI */}
      <ServiceScene
        number={gestionale.number}
        label={gestionale.label}
        title={gestionale.title}
        blurb={gestionale.blurb}
        theme={gestionale.theme}
      >
        <GestionaleModule />
      </ServiceScene>

      {/* 05 — App di ricarica EV con assistente */}
      <ServiceScene
        number={ricarica.number}
        label={ricarica.label}
        title={ricarica.title}
        blurb={ricarica.blurb}
        theme={ricarica.theme}
        reverse
      >
        <RicaricaModule />
      </ServiceScene>

      {/* 06 — Integrazioni API */}
      <ServiceScene
        number={integrazioni.number}
        label={integrazioni.label}
        title={integrazioni.title}
        blurb={integrazioni.blurb}
        theme={integrazioni.theme}
      >
        <IntegrazioniModule />
      </ServiceScene>

      {/* 07 — Segnalazioni */}
      <ServiceScene
        number={segnalazioni.number}
        label={segnalazioni.label}
        title={segnalazioni.title}
        blurb={segnalazioni.blurb}
        theme={segnalazioni.theme}
        reverse
      >
        <SegnalazioniModule />
      </ServiceScene>

      {/* Finale: fade to black (demo dal vivo, niente CTA). */}
      <FadeToBlackScene />
    </div>
  );
}
