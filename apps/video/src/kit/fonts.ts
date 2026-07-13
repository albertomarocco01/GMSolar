/**
 * Tipografia: la demo web usa Geist (next/font). Geist è su Google Fonts →
 * @remotion/google-fonts. Sans e display condividono la famiglia (display =
 * pesi alti + tracking stretto), come in tokens.css.
 */
import { loadFont } from "@remotion/google-fonts/Geist";
import { loadFont as loadMono } from "@remotion/google-fonts/GeistMono";

const geist = loadFont();
const geistMono = loadMono();

export const fontFamily = `${geist.fontFamily}, ui-sans-serif, system-ui, sans-serif`;
/** Superfici tecniche: URL, codici, valori mono (D0.4). NON i numeri display grandi
 *  (KPI/figure hero restano Geist Sans + tabular-nums, convenzione Apple/Stripe). */
export const monoFamily = `${geistMono.fontFamily}, ui-monospace, SFMono-Regular, monospace`;
