/**
 * TrafficChart — LineChart recharts del traffico giornaliero (visite) per il
 * sito e il periodo selezionati. Componente client (recharts richiede il DOM).
 */
"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Card from "@gmgroup/ui/Card";
import { getChartData } from "@/data/telemetry";
import type { RangeKey, SiteFilter } from "@/data/telemetry";

const SITE_COLORS: Record<string, string> = {
  solar: "#a8d920",
  mobility: "#3c9e3a",
  shop: "#c8d400",
};

const SITE_LABELS: Record<string, string> = {
  solar: "Solar",
  mobility: "Mobility",
  shop: "Shop",
};

type Props = {
  siteFilter: SiteFilter;
  range: RangeKey;
};

export default function TrafficChart({ siteFilter, range }: Props) {
  const data = getChartData(siteFilter, range);
  const sites: string[] = siteFilter === "all" ? ["solar", "mobility", "shop"] : [siteFilter];

  // Meno tick sull'asse X per non sovraffollare
  const tickInterval = range === 7 ? 0 : range === 30 ? 6 : 13;

  return (
    <Card className="p-5">
      <h3 className="text-foreground mb-4 text-sm font-semibold">
        Traffico nel tempo (visite giornaliere)
      </h3>
      <ResponsiveContainer width="100%" height={256}>
        <LineChart data={data} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "var(--muted)" }}
            tickLine={false}
            interval={tickInterval}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "var(--muted)" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => v.toLocaleString("it-IT")}
          />
          <Tooltip
            contentStyle={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              fontSize: "12px",
              color: "var(--foreground)",
            }}
            formatter={(value) =>
              typeof value === "number" ? value.toLocaleString("it-IT") : String(value)
            }
            labelFormatter={(label) => `Data: ${label}`}
          />
          {sites.length > 1 && (
            <Legend
              wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
              formatter={(value: string) => SITE_LABELS[value] ?? value}
            />
          )}
          {sites.map((site) => (
            <Line
              key={site}
              type="monotone"
              dataKey={site}
              name={site}
              stroke={SITE_COLORS[site] ?? "#7c5cff"}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
