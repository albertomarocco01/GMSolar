/**
 * FilterBar — selettore Sito (Tutti / Solar / Mobility / Shop) e Periodo
 * (7 / 30 / 90 giorni). Controlli pill con aria-pressed per l'accessibilità.
 */
"use client";

import type { RangeKey, SiteFilter } from "@/data/telemetry";

type Props = {
  siteFilter: SiteFilter;
  range: RangeKey;
  onSiteFilterChange: (s: SiteFilter) => void;
  onRangeChange: (r: RangeKey) => void;
};

const SITE_OPTIONS: { value: SiteFilter; label: string }[] = [
  { value: "all", label: "Tutti" },
  { value: "solar", label: "Solar" },
  { value: "mobility", label: "Mobility" },
  { value: "shop", label: "Shop" },
];

const RANGE_OPTIONS: { value: RangeKey; label: string }[] = [
  { value: 7, label: "7 gg" },
  { value: 30, label: "30 gg" },
  { value: 90, label: "90 gg" },
];

function PillGroup<T extends string | number>({
  label,
  options,
  active,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  active: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex items-center gap-2" role="group" aria-label={label}>
      <span className="text-muted text-xs font-medium">{label}:</span>
      <div className="border-border flex overflow-hidden rounded-lg border">
        {options.map((opt) => (
          <button
            key={String(opt.value)}
            onClick={() => onChange(opt.value)}
            aria-pressed={active === opt.value}
            className={`px-3 py-1.5 text-xs font-medium transition-colors ${
              active === opt.value
                ? "bg-accent text-accent-contrast"
                : "bg-surface text-muted hover:bg-surface-2"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function FilterBar({ siteFilter, range, onSiteFilterChange, onRangeChange }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <PillGroup
        label="Sito"
        options={SITE_OPTIONS}
        active={siteFilter}
        onChange={onSiteFilterChange}
      />
      <PillGroup label="Periodo" options={RANGE_OPTIONS} active={range} onChange={onRangeChange} />
    </div>
  );
}
