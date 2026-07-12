"use client";

/**
 * @descrizione  BEAM elettrico riusabile (border-beam stile 21st.dev/Aceternity):
 *   UNA capsula luminosa lime→ciano che percorre il PERIMETRO di un rettangolo
 *   arrotondato. Meccanica compositor-friendly, pensata per ZERO lag:
 *     · movimento = UN SOLO elemento animato con `offset-path: rect(… round R)`
 *       e `offset-distance` 0%→100% (keyframe a VALORI FISSI); `offset-rotate:auto`
 *       fa RUOTARE la capsula agli angoli (segue la tangente del bordo).
 *     · glow = box-shadow STATICO sulla capsula; corpo = gradiente STATICO.
 *       NIENTE conic animati, NIENTE filter/gradient animati.
 *   Sotto la capsula un OUTLINE statico "acceso" (bordo accent + glow) = STATO
 *   FINALE leggibile a progress(1)/reduced-motion: il moto è puro decoro,
 *   congelabile da `data-presentation-paused` (regola `#top *` di AutoScroll) e
 *   SPENTO sotto `prefers-reduced-motion` (resta solo il bordo acceso = "chiuso").
 *
 * @param radius    raggio del bordo in px (DEVE combaciare col rounded del box)
 * @param duration  secondi per un giro completo (default 4.2)
 * @param delay     ritardo d'avvio in s (per sfasare più beam) (default 0)
 * @param length    lunghezza della capsula in px (default 96)
 * @param className classi extra sul wrapper
 */
export default function ElectricBeam({
  radius,
  duration = 4.2,
  delay = 0,
  length = 96,
  className = "",
}: {
  radius: number;
  duration?: number;
  delay?: number;
  length?: number;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={`shw-beam pointer-events-none absolute inset-0 z-10 ${className}`}
      style={{ borderRadius: radius }}
    >
      {/* Bordo "acceso" STATICO = stato finale leggibile (reduced-motion / progress 1). */}
      <div
        className="absolute inset-0"
        style={{
          borderRadius: radius,
          border: "1px solid color-mix(in oklab, var(--accent) 42%, transparent)",
          boxShadow:
            "inset 0 0 0 1px color-mix(in oklab, var(--accent) 10%, transparent), 0 0 24px -8px color-mix(in oklab, var(--accent) 60%, transparent)",
        }}
      />
      {/* Capsula che percorre il perimetro via offset-path (un solo elemento). */}
      <div
        className="shw-beam-run absolute rounded-full"
        style={{
          width: length,
          height: 3,
          offsetPath: `rect(0 auto auto 0 round ${radius}px)`,
          offsetRotate: "auto",
          background:
            "linear-gradient(90deg, transparent, var(--accent) 42%, #22d3ee 78%, #eafff2)",
          boxShadow: "0 0 14px 2px color-mix(in oklab, #22d3ee 65%, transparent)",
          animation: `shwBeamRun ${duration}s linear ${delay}s infinite`,
          willChange: "offset-distance",
        }}
      />
      <style>{`
        @keyframes shwBeamRun { to { offset-distance: 100%; } }
        @media (prefers-reduced-motion: reduce) {
          .shw-beam-run { animation: none !important; opacity: 0; }
        }
      `}</style>
    </div>
  );
}
