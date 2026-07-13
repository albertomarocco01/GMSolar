import { Composition } from "remotion";
import { Presentation, TOTAL_DURATION, FPS } from "./Presentation";
import { SolarTwin, SOLAR_DURATION } from "./scenes/SolarTwin";
import { Assistente, ASSISTENTE_DURATION } from "./scenes/Assistente";
import { Dashboard, DASHBOARD_DURATION } from "./scenes/Dashboard";
import { Segnalazioni, SEGNALAZIONI_DURATION } from "./scenes/Segnalazioni";
import { Gestionale, GESTIONALE_DURATION } from "./scenes/Gestionale";
import { Ricarica, RICARICA_DURATION } from "./scenes/Ricarica";
import { Closing, CLOSING_DURATION } from "./scenes/Closing";

// Comp singole per scena (frame LOCALI): utili per iterare/verificare una scena
// isolata nello Studio o via `remotion still Scene<Nome> --frame=N`.
const SCENE_COMPS = [
  { id: "SceneSolarTwin", C: SolarTwin, d: SOLAR_DURATION },
  { id: "SceneAssistente", C: Assistente, d: ASSISTENTE_DURATION },
  { id: "SceneDashboard", C: Dashboard, d: DASHBOARD_DURATION },
  { id: "SceneSegnalazioni", C: Segnalazioni, d: SEGNALAZIONI_DURATION },
  { id: "SceneGestionale", C: Gestionale, d: GESTIONALE_DURATION },
  { id: "SceneRicarica", C: Ricarica, d: RICARICA_DURATION },
  { id: "SceneClosing", C: Closing, d: CLOSING_DURATION },
] as const;

export const Root = () => {
  return (
    <>
      <Composition
        id="GmSolarPresentation"
        component={Presentation}
        durationInFrames={TOTAL_DURATION}
        fps={FPS}
        width={1920}
        height={1080}
      />
      {SCENE_COMPS.map(({ id, C, d }) => (
        <Composition key={id} id={id} component={C} durationInFrames={d} fps={FPS} width={1920} height={1080} />
      ))}
    </>
  );
};
