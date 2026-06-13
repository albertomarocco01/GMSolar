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
 * Poster dei video (fallback `poster=` dei <video> + prima frame mostrata).
 * Placeholder SVG branded: sostituire con un frame reale esportato dai video.
 */
export const POSTERS = {
  solarHero: "/assets/gm-solar-hero-poster.svg",
  solarDrone: "/assets/gm-solar-drone-poster.svg",
} as const;
