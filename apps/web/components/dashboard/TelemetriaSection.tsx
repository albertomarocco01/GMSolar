/**
 * TelemetriaSection — area A della Dashboard: FilterBar, 4 KPI card animate,
 * LineChart traffico, BarChart interazioni, PieChart sorgenti, Top Pages table.
 */
"use client";

import ScrollReveal from "@gmgroup/ui/ScrollReveal";
import { getKpis } from "@/data/telemetry";
import type { RangeKey, SiteFilter } from "@/data/telemetry";
import FilterBar from "./FilterBar";
import InteractionsChart from "./InteractionsChart";
import KpiCard from "./KpiCard";
import SourcesChart from "./SourcesChart";
import TopPagesTable from "./TopPagesTable";
import TrafficChart from "./TrafficChart";

type Props = {
  siteFilter: SiteFilter;
  range: RangeKey;
  onSiteFilterChange: (s: SiteFilter) => void;
  onRangeChange: (r: RangeKey) => void;
};

export default function TelemetriaSection({
  siteFilter,
  range,
  onSiteFilterChange,
  onRangeChange,
}: Props) {
  const { current, delta } = getKpis(siteFilter, range);
  const today = new Date().toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      {/* Intestazione + filtri */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-foreground text-lg font-semibold">Telemetria multi-sito</h2>
          <p className="text-muted mt-0.5 text-sm">Dati dimostrativi — aggiornati al {today}</p>
        </div>
        <FilterBar
          siteFilter={siteFilter}
          range={range}
          onSiteFilterChange={onSiteFilterChange}
          onRangeChange={onRangeChange}
        />
      </div>

      {/* KPI card */}
      <ScrollReveal className="grid grid-cols-2 gap-4 lg:grid-cols-4" stagger={0.08} y={20}>
        <KpiCard label="Visite" value={current.visite} delta={delta.visite} />
        <KpiCard label="Utenti unici" value={current.utenti} delta={delta.utenti} />
        <KpiCard label="Interazioni" value={current.interazioni} delta={delta.interazioni} />
        <KpiCard label="Conversioni" value={current.conversioni} delta={delta.conversioni} />
      </ScrollReveal>

      {/* Grafici riga 1 */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <TrafficChart siteFilter={siteFilter} range={range} />
        <InteractionsChart siteFilter={siteFilter} range={range} />
      </div>

      {/* Grafici riga 2 */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <SourcesChart siteFilter={siteFilter} />
        <div className="xl:col-span-2">
          <TopPagesTable siteFilter={siteFilter} range={range} />
        </div>
      </div>
    </div>
  );
}
