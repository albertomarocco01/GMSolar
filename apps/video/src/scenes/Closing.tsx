/**
 * SCENA FINALE · Fade a nero.
 * Nessuna card di chiusura: la scena precedente si dissolve qui (cross-dissolve
 * gestito dalla TransitionSeries) e resta il nero per una breve coda elegante.
 */
import React from "react";
import { AbsoluteFill } from "remotion";

export const CLOSING_DURATION = 45; // 1.5s @30fps: dissolve + coda nera

export const Closing: React.FC = () => <AbsoluteFill style={{ backgroundColor: "#000" }} />;
