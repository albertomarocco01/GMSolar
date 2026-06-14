/**
 * Riferimenti centralizzati agli asset statici in /public/assets.
 * Tenerli qui rende banale sostituirli o aggiornarne i path.
 */

/** Loghi dei tre brand del gruppo. */
export const LOGOS = {
  gmSolar: "/assets/gm-solar-logo.png",
  gmobility: "/assets/gmobility-logo.png",
  cavoPerfetto: "/assets/cavo-perfetto-logo.png",
} as const;

/** Video (placeholder reali per la sezione Solar). */
export const VIDEOS = {
  solarHero: "/assets/gm-solar-hero.mp4",
  solarDrone: "/assets/gm-solar-drone.mp4",
} as const;

/**
 * Poster dei video (fallback `poster=` dei <video> + primo frame mostrato).
 * Placeholder branded in WebP (~5–7KB): RASTER apposta, così è un candidato LCP
 * valido e leggero (gli SVG poster vengono esclusi dall'LCP da Chrome) e dipinge
 * subito al posto del testo. Sorgenti SVG accanto, da sostituire con frame reali.
 */
export const POSTERS = {
  solarHero: "/assets/gm-solar-hero-poster.webp",
  solarDrone: "/assets/gm-solar-drone-poster.webp",
} as const;
