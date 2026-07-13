/**
 * Presentazione GM SOLAR — montaggio delle 7 scene-capitolo in un unico film.
 * Le scene si CONCATENANO con un cross-dissolve a molla (TransitionSeries):
 * si sovrappongono per ~0.7s, niente stacco secco. Ogni scena apre su una
 * title card BIANCA opaca, quindi la dissolvenza è un "dip-to-white" pulito
 * tra un capitolo e l'altro — il raccordo tipico delle presentazioni montate.
 * Grana cinematografica su tutto.
 */
import { AbsoluteFill, Sequence } from "remotion";
import { TransitionSeries, springTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { C } from "./kit/tokens";
import { CinematicGrain } from "./kit/ui";
import { SolarTwin, SOLAR_DURATION } from "./scenes/SolarTwin";
import { Assistente, ASSISTENTE_DURATION } from "./scenes/Assistente";
import { Dashboard, DASHBOARD_DURATION } from "./scenes/Dashboard";
import { Segnalazioni, SEGNALAZIONI_DURATION } from "./scenes/Segnalazioni";
import { Gestionale, GESTIONALE_DURATION } from "./scenes/Gestionale";
import { Ricarica, RICARICA_DURATION } from "./scenes/Ricarica";
import { Closing, CLOSING_DURATION } from "./scenes/Closing";

export const FPS = 30;

/** Sovrapposizione della dissolvenza tra due scene (frame). ~0.7s = lunghezza
 *  tipica di una cross-dissolve montata. */
const OVERLAP = 22;

const SCENES = [
  { Comp: SolarTwin, d: SOLAR_DURATION },
  { Comp: Assistente, d: ASSISTENTE_DURATION },
  { Comp: Dashboard, d: DASHBOARD_DURATION },
  { Comp: Segnalazioni, d: SEGNALAZIONI_DURATION },
  { Comp: Gestionale, d: GESTIONALE_DURATION },
  { Comp: Ricarica, d: RICARICA_DURATION },
  { Comp: Closing, d: CLOSING_DURATION },
] as const;

// Le transizioni CONSUMANO frame dalla sovrapposizione: la durata totale è la
// somma delle scene meno una sovrapposizione per ogni raccordo.
export const TOTAL_DURATION =
  SCENES.reduce((sum, s) => sum + s.d, 0) - (SCENES.length - 1) * OVERLAP;

// Molla sovra-smorzata: ease morbida senza rimbalzo (cross-dissolve, non un pop).
const dissolve = springTiming({ durationInFrames: OVERLAP, config: { damping: 200 } });

export const Presentation = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: C.background }}>
      <TransitionSeries>
        {SCENES.flatMap(({ Comp, d }, i) => {
          const seq = (
            <TransitionSeries.Sequence key={`s${i}`} durationInFrames={d}>
              <Comp />
            </TransitionSeries.Sequence>
          );
          if (i === 0) return [seq];
          const trans = (
            <TransitionSeries.Transition key={`t${i}`} presentation={fade()} timing={dissolve} />
          );
          return [trans, seq];
        })}
      </TransitionSeries>
      <Sequence>
        <CinematicGrain />
      </Sequence>
    </AbsoluteFill>
  );
};
