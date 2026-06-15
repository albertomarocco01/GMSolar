"use client";

import { useId } from "react";

/**
 * PLACEHOLDER "foto" di un progetto: scena solare astratta (cielo + sole +
 * trama di moduli) generata in SVG, brandizzata. Niente file da gestire e
 * nessun 404. Sostituibile 1:1 con una foto reale: basta rimpiazzare questo
 * componente con un <Image src={progetto.foto} … /> dove i progetti avranno
 * un campo `foto`. Decorativa → aria-hidden.
 *
 * `seed` varia sole e palette così le tre card non sono identiche.
 */
export default function SolarProjectPhoto({
  seed = 0,
  className,
}: {
  seed?: number;
  className?: string;
}) {
  // Id univoci per istanza (più SVG nella stessa pagina non devono collidere).
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const sky = `sky-${uid}`;
  const sun = `sun-${uid}`;
  const cells = `cells-${uid}`;

  // Variazioni morbide in base al seed.
  const sunX = [300, 110, 210][seed % 3];
  const sunY = [80, 64, 96][seed % 3];
  const horizon = [195, 205, 188][seed % 3];

  return (
    <svg
      viewBox="0 0 400 300"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      aria-hidden
      role="presentation"
    >
      <defs>
        <linearGradient id={sky} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0f2207" />
          <stop offset="58%" stopColor="#24400c" />
          <stop offset="100%" stopColor="#5b7d12" />
        </linearGradient>
        <radialGradient id={sun} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#eaff9b" stopOpacity="0.95" />
          <stop offset="35%" stopColor="#a8d920" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#a8d920" stopOpacity="0" />
        </radialGradient>
        {/* Trama di moduli fotovoltaici (celle arrotondate). */}
        <pattern id={cells} width="22" height="15" patternUnits="userSpaceOnUse">
          <rect
            x="1.2"
            y="1.2"
            width="19.6"
            height="12.6"
            rx="1.5"
            fill="#a8d920"
            fillOpacity="0.10"
            stroke="#dfffa0"
            strokeOpacity="0.22"
            strokeWidth="0.8"
          />
        </pattern>
      </defs>

      {/* Cielo */}
      <rect width="400" height="300" fill={`url(#${sky})`} />

      {/* Sole + alone */}
      <circle cx={sunX} cy={sunY} r="120" fill={`url(#${sun})`} />
      <circle cx={sunX} cy={sunY} r="22" fill="#f4ffce" fillOpacity="0.9" />

      {/* Campo di moduli: due fasce in “prospettiva” verso l'orizzonte. */}
      <g transform={`translate(0 ${horizon})`}>
        <polygon points="-20,120 420,120 360,18 40,18" fill="#142a06" fillOpacity="0.55" />
        <rect
          x="40"
          y="18"
          width="320"
          height="102"
          fill={`url(#${cells})`}
          transform="skewX(-6)"
          opacity="0.9"
        />
      </g>

      {/* Velatura cinematografica diagonale. */}
      <polygon points="0,0 200,0 60,300 0,300" fill="#ffffff" fillOpacity="0.04" />
    </svg>
  );
}
