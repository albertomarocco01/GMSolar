import { cn } from "@gmgroup/lib/utils";

/* =============================================================
   Look "film" della scena VETRINA (copia adattata dal legacy
   SolarHero → SolarFilmGrade). Tre layer puramente decorativi,
   sovrapposti al video, per dare grading, profondità e materia:

   - grade    → velatura calda nell'accent del mondo (chartreuse SOLAR)
   - vignette → bordi che si scuriscono: lo sguardo va al centro
   - grain    → grana di pellicola (SVG fractal-noise inline, 0 byte di rete)

   Sono STATICI (nessuna animazione propria): art direction, non motion,
   quindi restano coerenti anche con prefers-reduced-motion.
   ============================================================= */

/** Grana di pellicola: SVG inline (fractalNoise) come data-URI, niente fetch. */
const NOISE_SVG =
  "<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'>" +
  "<filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter>" +
  "<rect width='100%' height='100%' filter='url(#n)'/></svg>";
const NOISE_URL = `url("data:image/svg+xml,${encodeURIComponent(NOISE_SVG)}")`;

export type VetrinaFilmGradeProps = {
  className?: string;
  /** Mostra la velatura accent (grading caldo). Default true. */
  grade?: boolean;
  /** Intensità iniziale della velatura accent (0–1). */
  gradeOpacity?: number;
  /** Mostra la vignettatura. Default true. */
  vignette?: boolean;
  /** Intensità iniziale della vignettatura (0–1). */
  vignetteOpacity?: number;
  /** Opacità della grana di pellicola (0–1). Default 0.12. */
  grainOpacity?: number;
};

/**
 * Overlay decorativo full-cover. Va messo DENTRO una scena `relative`,
 * sopra al video ma sotto al contenuto testuale.
 */
export default function VetrinaFilmGrade({
  className,
  grade = true,
  gradeOpacity = 0.35,
  vignette = true,
  vignetteOpacity = 0.55,
  grainOpacity = 0.12,
}: VetrinaFilmGradeProps) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      {grade && (
        <div
          className="vt-grade absolute inset-0"
          style={{
            opacity: gradeOpacity,
            mixBlendMode: "soft-light",
            background:
              "radial-gradient(70% 55% at 18% 0%, color-mix(in oklab, var(--accent) 70%, transparent), transparent 60%)," +
              "radial-gradient(90% 70% at 85% 110%, color-mix(in oklab, var(--accent) 35%, transparent), transparent 65%)",
          }}
        />
      )}

      {vignette && (
        <div
          className="vt-vignette absolute inset-0"
          style={{
            opacity: vignetteOpacity,
            background:
              "radial-gradient(125% 125% at 50% 38%, transparent 48%, rgba(0,0,0,0.55) 100%)",
          }}
        />
      )}

      <div
        className="vt-grain absolute inset-0"
        style={{
          opacity: grainOpacity,
          mixBlendMode: "overlay",
          backgroundImage: NOISE_URL,
          backgroundSize: "140px 140px",
        }}
      />
    </div>
  );
}
