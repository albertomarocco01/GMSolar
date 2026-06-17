/**
 * Set di icone inline (stroke, currentColor) per la sezione Solar.
 * Niente dipendenze esterne: SVG leggeri, dimensione controllata via CSS
 * (es. `className="h-6 w-6"`). Pensate per tipologie impianti e servizi.
 */
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

/* ---------- Tipologie impianti ---------- */

/** Residenziali — casa con sole. */
export function IconHome(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 11.5 12 5l8 6.5" />
      <path d="M6 10.5V19h12v-8.5" />
      <path d="M10.5 19v-4h3v4" />
    </svg>
  );
}

/** Industriali C&I — capannone / fabbrica. */
export function IconFactory(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3 20V10l5 3V10l5 3V8l5 3v9z" />
      <path d="M3 20h18" />
      <path d="M7 16h.01M12 16h.01M16.5 16h.01" />
    </svg>
  );
}

/** Solar Farm — campo di pannelli a terra. */
export function IconSolarFarm(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3 13h18l-1.5-7H4.5z" />
      <path d="M9.2 6 8 13M14.8 6 16 13M3.6 9.5h16.8" />
      <path d="M12 13v4M8 20h8M10 20l1-3M14 20l-1-3" />
    </svg>
  );
}

/** Revamping — repowering / aggiornamento (frecce circolari). */
export function IconRevamp(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M20 11a8 8 0 0 0-14-4.5L4 9" />
      <path d="M4 4v5h5" />
      <path d="M4 13a8 8 0 0 0 14 4.5L20 15" />
      <path d="M20 20v-5h-5" />
    </svg>
  );
}

/* ---------- Servizi ---------- */

/** Progettazione — riga + compasso. */
export function IconDesign(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="m12 3 7 12H5z" />
      <path d="M9 15v4M15 15v4M12 15v6" />
    </svg>
  );
}

/** Installazione — chiave inglese. */
export function IconWrench(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M14.5 5.5a3.5 3.5 0 0 1-4.6 4.6L5 15l4 4 4.9-4.9a3.5 3.5 0 0 1 4.6-4.6l-2.5 2.5-2-2z" />
    </svg>
  );
}

/** Monitoraggio — grafico/andamento. */
export function IconMonitor(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 19V5" />
      <path d="M4 19h16" />
      <path d="m7 15 3-4 3 2 4-6" />
    </svg>
  );
}

/** Gestione amministrativa — documento. */
export function IconDocument(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M7 3h7l4 4v14H7z" />
      <path d="M14 3v4h4" />
      <path d="M9.5 12h5M9.5 15.5h5" />
    </svg>
  );
}

/** Consulenza — dialogo. */
export function IconChat(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 5h16v10H9l-4 3v-3H4z" />
      <path d="M8 9h8M8 12h5" />
    </svg>
  );
}

/** Manutenzione O&M — scudo / affidabilità. */
export function IconShield(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3 5 6v5c0 4 3 7 7 9 4-2 7-5 7-9V6z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

/* ---------- Generiche UI ---------- */

/** Freccia destra (CTA). */
export function IconArrowRight(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

/** Sole (eyebrow/accento). */
export function IconSun(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}
