import type { DemoMotif } from "./types";

/**
 * Icone vettoriali dei motivi grafici usati dalle anteprime placeholder.
 * Disegnate a tratto con `currentColor` (= l'ink del brand della card, impostato
 * dal contenitore), così ogni card ha un segno riconoscibile senza alcun asset di
 * rete. Statiche: nessuna animazione → nessun problema di reduced-motion/perf.
 */

const STROKE = {
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 2.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/** Disegno (paths) per ogni motivo, su viewBox 0 0 64 64. */
const SHAPES: Record<DemoMotif, React.ReactNode> = {
  // Hub: tre nodi connessi attorno a un centro (l'ecosistema).
  ecosystem: (
    <>
      <circle cx="32" cy="32" r="5" {...STROKE} />
      <circle cx="32" cy="12" r="4" {...STROKE} />
      <circle cx="14" cy="46" r="4" {...STROKE} />
      <circle cx="50" cy="46" r="4" {...STROKE} />
      <path d="M32 16v11M29 36 17 43M35 36l12 7" {...STROKE} />
    </>
  ),
  // Solar: sole con raggi.
  rays: (
    <>
      <circle cx="32" cy="32" r="9" {...STROKE} />
      <path
        d="M32 8v6M32 50v6M8 32h6M50 32h6M15 15l4 4M45 45l4 4M49 15l-4 4M19 45l-4 4"
        {...STROKE}
      />
    </>
  ),
  // Mobility: cubo "esploso" (facce separate) → la scena 3D.
  cube: (
    <>
      <path d="M22 24 32 18l10 6v12l-10 6-10-6z" {...STROKE} />
      <path d="M22 24l10 6 10-6M32 30v12" {...STROKE} />
      <path d="M14 16l3-3M50 16l-3-3M14 48l3 3M50 48l-3 3" {...STROKE} />
    </>
  ),
  // Shop: spina + cavo ondulato.
  cable: (
    <>
      <rect x="24" y="10" width="16" height="13" rx="3" {...STROKE} />
      <path d="M29 10V6M35 10V6M32 23v5" {...STROKE} />
      <path d="M32 28c0 8-12 6-12 14s12 6 12 14" {...STROKE} />
    </>
  ),
  // AI: scintilla doppia (il "tocco" generativo).
  spark: (
    <>
      <path d="M30 12c0 8-3 12-11 12 8 0 11 4 11 12 0-8 3-12 11-12-8 0-11-4-11-12z" {...STROKE} />
      <path d="M46 38c0 4-1.5 6-5.5 6 4 0 5.5 2 5.5 6 0-4 1.5-6 5.5-6-4 0-5.5-2-5.5-6z" {...STROKE} />
    </>
  ),
  // Analytics: barre + asse.
  chart: (
    <>
      <path d="M14 14v36h38" {...STROKE} />
      <path d="M24 50V34M34 50V24M44 50V40" {...STROKE} />
    </>
  ),
  // Agente di bordo: percorso con pin di destinazione.
  route: (
    <>
      <path d="M16 50c8 0 8-12 16-12s8-12 16-12" {...STROKE} />
      <circle cx="16" cy="50" r="3" {...STROKE} />
      <path d="M48 14c4 0 7 3 7 7 0 5-7 11-7 11s-7-6-7-11c0-4 3-7 7-7z" {...STROKE} />
      <circle cx="48" cy="21" r="2" {...STROKE} />
    </>
  ),
  // Chatbot: fumetto con puntini.
  chat: (
    <>
      <path d="M14 18h36v22H30l-10 8v-8h-6z" {...STROKE} />
      <path d="M26 29h.01M32 29h.01M38 29h.01" {...STROKE} />
    </>
  ),
  // Dashboard: wireframe con barra, sidebar e blocchi.
  layout: (
    <>
      <rect x="12" y="14" width="40" height="36" rx="3" {...STROKE} />
      <path d="M12 24h40M24 24v26" {...STROKE} />
      <path d="M30 32h16M30 40h16" {...STROKE} />
    </>
  ),
};

export default function Motif({
  name,
  className,
}: {
  name: DemoMotif;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 64 64" className={className} role="presentation" aria-hidden>
      {SHAPES[name]}
    </svg>
  );
}
