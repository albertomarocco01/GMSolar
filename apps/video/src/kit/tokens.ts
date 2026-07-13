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
  /**
   * Ombra "oggetto reale sollevato dal piano" a 4 STRATI (DeviceFrame, D1.1/D2.3):
   *   1. riflesso speculare sul bordo alto (inset highlight) — la luce prende lo spigolo,
   *   2. occlusione ambientale stretta — il buio che abbraccia il corpo,
   *   3. drop ancorato — l'ombra portata media che dà stacco,
   *   4. pavimento lungo e morbido — l'ombra che si allunga sul set illuminato.
   * Con `lift` (0..1) DeviceFrame approfondisce/allunga SOLO lo strato di pavimento.
   */
  device:
    "inset 0 1px 0 rgba(255,255,255,0.9), 0 1px 2px rgba(2,6,23,0.10), 0 12px 28px -10px rgba(2,6,23,0.22), 0 44px 80px -36px rgba(2,6,23,0.30)",
  /** Ombra di CONTATTO: ellisse corta e scura d'elevazione che àncora l'oggetto al piano. */
  contact: "0 4px 8px -4px rgba(2,6,23,0.38)",
  /**
   * Glow lime DORMIENTE (basato su accentStrong #65a30d): SOLO sotto elementi a
   * riempimento lime (la luce lime è un oggetto fisico, non un alone su superficie chiara).
   */
  glow: "0 6px 18px -6px rgba(101,163,13,0.42)",
} as const;
