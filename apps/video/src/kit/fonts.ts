/**
 * Tipografia: la demo web usa Geist (next/font). Geist è su Google Fonts →
 * @remotion/google-fonts. Sans e display condividono la famiglia (display =
 * pesi alti + tracking stretto), come in tokens.css.
 */
import { loadFont } from "@remotion/google-fonts/Geist";

const geist = loadFont();

export const fontFamily = `${geist.fontFamily}, ui-sans-serif, system-ui, sans-serif`;
