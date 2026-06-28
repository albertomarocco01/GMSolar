/**
 * Set di icone inline (stroke, currentColor) per la scena VETRINA.
 * Niente dipendenze esterne: SVG leggeri, dimensione controllata via CSS
 * (es. `className="h-5 w-5"`). Servono per l'eyebrow e le card 3D fluttuanti.
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

/** Sole — eyebrow/accento del mondo Solar. */
export function IconSun(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

/** Scrollytelling — strati/sezioni che si impilano. */
export function IconLayers(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="m12 2 9 5-9 5-9-5 9-5Z" />
      <path d="m3 12 9 5 9-5" />
      <path d="m3 17 9 5 9-5" />
    </svg>
  );
}

/** 3D in tempo reale — cubo in prospettiva. */
export function IconCube(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="m12 2 9 5v10l-9 5-9-5V7l9-5Z" />
      <path d="m3 7 9 5 9-5" />
      <path d="M12 12v10" />
    </svg>
  );
}

/** Performance — tachimetro. */
export function IconGauge(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 18a8 8 0 1 1 16 0" />
      <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
      <path d="m13.6 10.4 3-3" />
    </svg>
  );
}

/** Motion su misura — bacchetta + scintilla. */
export function IconWand(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M5 19 16 8" />
      <path d="m18 4 .9 2.1L21 7l-2.1.9L18 10l-.9-2.1L15 7l2.1-.9L18 4Z" />
      <path d="m6.4 4.4.5 1.2 1.2.5-1.2.5-.5 1.2-.5-1.2L4.7 6l1.2-.5.5-1.1Z" />
    </svg>
  );
}
