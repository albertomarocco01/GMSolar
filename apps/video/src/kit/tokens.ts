/**
 * Design token del progetto (fonte: packages/tokens/tokens.css).
 * Valori risolti a costanti: in un video non ci sono CSS var runtime.
 */
export const C = {
  background: "#ffffff",
  foreground: "#0b1020",
  muted: "#5b6472",
  border: "#e4e8ee",
  surface: "#f7f9fc",
  surface2: "#eef2f7",

  accent: "#84cc16",
  accentStrong: "#65a30d",
  accentContrast: "#0b1020",
  /** color-mix(accent 14%, transparent) */
  accentSoft: "rgba(132, 204, 22, 0.14)",
  /** color-mix(accent, foreground 46%) — accent leggibile come testo */
  accentInk: "#4c761b",
} as const;

export const RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  pill: 9999,
} as const;

export const SHADOW = {
  card: "0 1px 2px rgba(2,6,23,0.06), 0 8px 24px rgba(2,6,23,0.08)",
  lift: "0 2px 4px rgba(2,6,23,0.08), 0 18px 40px rgba(2,6,23,0.16)",
  glow: `0 0 0 1px rgba(132,204,22,0.14), 0 12px 40px rgba(132,204,22,0.14)`,
} as const;
