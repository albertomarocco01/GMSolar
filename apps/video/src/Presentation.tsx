/**
 * Presentazione GM SOLAR — montaggio delle 7 scene-capitolo in un unico film.
 * Le scene si CONCATENANO con un cross-dissolve a molla (TransitionSeries):
 * si sovrappongono per ~0.7s, niente stacco secco. Ogni scena apre su una
 * title card BIANCA opaca, quindi la dissolvenza è un "dip-to-white" pulito
 * tra un capitolo e l'altro — il raccordo tipico delle presentazioni montate.
 * Grana cinematografica su tutto.
 */
import React from "react";
import { AbsoluteFill, Sequence, getRemotionEnvironment } from "remotion";
import { TransitionSeries, springTiming } from "@remotion/transitions";
import type { TransitionPresentation, TransitionPresentationComponentProps } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { CameraMotionBlur } from "@remotion/motion-blur";
import { C } from "./kit/tokens";
import { CinematicGrain } from "./kit/ui";
import { SolarTwin, SOLAR_DURATION } from "./scenes/SolarTwin";
import { Assistente, ASSISTENTE_DURATION } from "./scenes/Assistente";
import { Dashboard, DASHBOARD_DURATION } from "./scenes/Dashboard";
import { Segnalazioni, SEGNALAZIONI_DURATION } from "./scenes/Segnalazioni";
import { Gestionale, GESTIONALE_DURATION } from "./scenes/Gestionale";
import { Ricarica, RICARICA_DURATION } from "./scenes/Ricarica";
import { Integrazioni, INTEGRAZIONI_DURATION } from "./scenes/Integrazioni";
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
  { Comp: Integrazioni, d: INTEGRAZIONI_DURATION },
  { Comp: Closing, d: CLOSING_DURATION },
] as const;

// Le transizioni CONSUMANO frame dalla sovrapposizione: la durata totale è la
// somma delle scene meno una sovrapposizione per ogni raccordo.
export const TOTAL_DURATION =
  SCENES.reduce((sum, s) => sum + s.d, 0) - (SCENES.length - 1) * OVERLAP;

// Molla sovra-smorzata: ease morbida senza rimbalzo (cross-dissolve, non un pop).
const dissolve = springTiming({ durationInFrames: OVERLAP, config: { damping: 200 } });

/**
 * CROSS-ZOOM (transizione-firma per il raccordo verso Integrazioni): la scena
 * uscente cresce e sfuma, la entrante arriva da leggermente rimpicciolita → un
 * "push through" cinematografico che varia il montaggio dal solo dip-to-white.
 */
const CrossZoom: React.FC<TransitionPresentationComponentProps<Record<string, never>>> = ({
  children,
  presentationProgress: p,
  presentationDirection,
}) => {
  const entering = presentationDirection === "entering";
  const scale = entering ? 0.86 + 0.14 * p : 1 + 0.18 * p;
  const opacity = entering ? p : 1 - p;
  return (
    <AbsoluteFill style={{ opacity, transform: `scale(${scale})`, transformOrigin: "50% 50%" }}>
      {children}
    </AbsoluteFill>
  );
};
const crossZoom = (): TransitionPresentation<Record<string, never>> => ({ component: CrossZoom, props: {} });

export const Presentation = () => {
  // PERF: in anteprima (Studio) i due costi dominanti sono il motion-blur (10
  // sotto-frame per frame → 10×) e la grana SVG turbolenta. Li attiviamo SOLO al
  // RENDER: l'anteprima resta fluida (giudichi timing/camera/coreografia), il
  // file finale ha tutto. `isRendering` è false in Studio/Player, true al render.
  const { isRendering } = getRemotionEnvironment();

  const series = (
    <TransitionSeries>
      {SCENES.flatMap(({ Comp, d }, i) => {
        const seq = (
          <TransitionSeries.Sequence key={`s${i}`} durationInFrames={d}>
            <Comp />
          </TransitionSeries.Sequence>
        );
        if (i === 0) return [seq];
        // i===6 = raccordo Ricarica→Integrazioni: cross-zoom (transizione-firma).
        // Gli altri restano dip-to-white; i===3 (Dashboard→Segnalazioni) è la
        // dissolvenza-match-cut (shell identico → sparisce sulla chrome).
        const trans = (
          <TransitionSeries.Transition
            key={`t${i}`}
            presentation={(i === 6 ? crossZoom() : fade()) as TransitionPresentation<Record<string, never>>}
            timing={dissolve}
          />
        );
        return [trans, seq];
      })}
    </TransitionSeries>
  );

  return (
    <AbsoluteFill style={{ backgroundColor: C.background }}>
      {/* Motion blur cinematografico su TUTTO il montaggio (solo al render). */}
      {isRendering ? (
        <CameraMotionBlur shutterAngle={180} samples={10}>
          {series}
        </CameraMotionBlur>
      ) : (
        series
      )}
      <Sequence>
        <CinematicGrain />
      </Sequence>
    </AbsoluteFill>
  );
};
