import { forwardRef } from "react";

/**
 * Barra di avanzamento segmentata in stile Stories/Wrapped: un segmento per
 * slide. È DECORATIVA (`aria-hidden`): l'avanzamento è annunciato a parte da una
 * regione aria-live nel player. I "fill" partono a scaleX(0) da sinistra; è il
 * TourPlayer a pilotarli in modo imperativo con GSAP (segmenti passati pieni,
 * attivo animato sulla durata della slide, futuri vuoti) per non ri-renderizzare
 * a ogni frame. Esposto un ref al contenitore per leggere i `[data-fill]`.
 */
const TourProgress = forwardRef<HTMLDivElement, { count: number }>(function TourProgress(
  { count },
  ref,
) {
  return (
    <div ref={ref} aria-hidden className="flex w-full items-center gap-1.5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="relative h-1 flex-1 overflow-hidden rounded-full bg-white/25">
          <span
            data-fill
            className="absolute inset-0 origin-left scale-x-0 rounded-full bg-white"
          />
        </div>
      ))}
    </div>
  );
});

export default TourProgress;
