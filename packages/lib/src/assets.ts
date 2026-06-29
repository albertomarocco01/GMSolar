/**
 * Riferimenti centralizzati agli asset statici in /public/assets.
 * Tenerli qui rende banale sostituirli o aggiornarne i path.
 */

/** Video drone della scena vetrina della home (placeholder reale). */
export const VIDEOS = {
  solarDrone: "/assets/gm-solar-drone.mp4",
} as const;

/**
 * Poster dei video (fallback `poster=` dei <video> + primo frame mostrato).
 * Placeholder raster WebP leggero: candidato LCP valido che dipinge subito
 * al posto del testo. Sorgente SVG accanto, da sostituire con un frame reale.
 */
export const POSTERS = {
  solarDrone: "/assets/gm-solar-drone-poster.webp",
} as const;
