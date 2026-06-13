/**
 * Fallback statico quando WebGL non è disponibile: una colonnina stilizzata in
 * SVG (stessa "anatomia" della scena 3D). Niente Canvas, niente WebGL.
 * L'alone emissivo usa l'accent del mondo (--accent) via currentColor.
 */
export default function WallboxPoster() {
  return (
    <div className="text-accent absolute inset-0 grid place-items-center p-6">
      <svg
        viewBox="0 0 200 280"
        role="img"
        aria-label="Colonnina di ricarica GMobility"
        className="h-full max-h-[70vmin] w-auto drop-shadow-2xl"
      >
        {/* piastra a muro */}
        <rect x="46" y="18" width="108" height="244" rx="10" fill="#0e1116" />
        {/* corpo */}
        <rect x="58" y="30" width="84" height="208" rx="20" fill="#171b22" stroke="#232b34" strokeWidth="2" />
        {/* display */}
        <rect x="74" y="52" width="52" height="34" rx="6" fill="#0a0e0b" stroke="currentColor" strokeOpacity="0.4" />
        {/* barra LED emissiva */}
        <rect x="66" y="60" width="7" height="120" rx="3.5" fill="currentColor">
          <animate attributeName="opacity" values="0.6;1;0.6" dur="2.4s" repeatCount="indefinite" />
        </rect>
        {/* connettore Tipo 2 */}
        <circle cx="100" cy="150" r="26" fill="#0c0f14" stroke="#232b34" strokeWidth="2" />
        <circle cx="100" cy="150" r="19" fill="#1b2026" />
        {[
          [100, 138],
          [89, 145],
          [111, 145],
          [89, 157],
          [111, 157],
          [95, 163],
          [105, 163],
        ].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="3.4" fill="#cdd3da" />
        ))}
        {/* cavo */}
        <path
          d="M100 176 C 110 210, 80 226, 96 252"
          fill="none"
          stroke="#0d100f"
          strokeWidth="7"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
