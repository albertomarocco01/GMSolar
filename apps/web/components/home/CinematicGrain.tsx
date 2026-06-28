/**
 * @descrizione  Strato cinematografico globale: vignette morbida + grana SVG
 *   (fractalNoise inline, zero byte di rete). Fixed su tutto il viewport, molto
 *   sottile su tema chiaro → coesione "pellicola" senza sporcare. Decorativo.
 * @indice
 * - CinematicGrain → overlay globale, montato una volta nella home
 */
export default function CinematicGrain() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[55]">
      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{ boxShadow: "inset 0 0 220px 60px rgba(8,10,20,0.16)" }}
      />
      {/* Grana */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.035] mix-blend-multiply">
        <filter id="cg-grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.85"
            numOctaves="2"
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#cg-grain)" />
      </svg>
    </div>
  );
}
