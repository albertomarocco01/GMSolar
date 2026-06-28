/**
 * InteractionsChart — BarChart recharts con totale interazioni per sito nel
 * periodo selezionato. Ogni barra ha il colore del brand corrispondente.
 */
"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Card from "@gmgroup/ui/Card";
import { getInteractionsBySite } from "@/data/telemetry";
import type { RangeKey, SiteFilter } from "@/data/telemetry";

type Props = {
  siteFilter: SiteFilter;
  range: RangeKey;
};

export default function InteractionsChart({ siteFilter, range }: Props) {
  const data = getInteractionsBySite(siteFilter, range);

  return (
    <Card className="p-5">
      <h3 className="text-foreground mb-4 text-sm font-semibold">Interazioni totali per sito</h3>
      <ResponsiveContainer width="100%" height={256}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="site"
            tick={{ fontSize: 12, fill: "var(--muted)" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "var(--muted)" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => `${Math.round(v / 1000)}k`}
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
              typeof value === "number"
                ? [value.toLocaleString("it-IT"), "Interazioni"]
                : [String(value), "Interazioni"]
            }
            cursor={{ fill: "var(--surface-2)" }}
          />
          <Bar dataKey="valore" maxBarSize={80} radius={[4, 4, 0, 0]}>
            {data.map((entry, idx) => (
              <Cell key={`cell-${idx}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
