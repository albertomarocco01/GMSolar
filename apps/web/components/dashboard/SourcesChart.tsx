/**
 * SourcesChart — Donut PieChart recharts con sorgenti di traffico per sito.
 * I colori variano in base al sito attivo per restare riconoscibili nel tema.
 */
"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import Card from "@gmgroup/ui/Card";
import { getTrafficSources } from "@/data/telemetry";
import type { SiteFilter } from "@/data/telemetry";

type Props = {
  siteFilter: SiteFilter;
};

export default function SourcesChart({ siteFilter }: Props) {
  const data = getTrafficSources(siteFilter);

  return (
    <Card className="p-5">
      <h3 className="text-foreground mb-4 text-sm font-semibold">Sorgenti di traffico</h3>
      <ResponsiveContainer width="100%" height={256}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            innerRadius={55}
            outerRadius={88}
            dataKey="value"
            paddingAngle={2}
            label={false}
          >
            {data.map((entry, idx) => (
              <Cell key={`cell-${idx}`} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              fontSize: "12px",
              color: "var(--foreground)",
            }}
            formatter={(value) =>
              typeof value === "number" ? [`${value}%`, ""] : [String(value), ""]
            }
          />
          <Legend
            wrapperStyle={{ fontSize: "11px", paddingTop: "4px" }}
            iconType="circle"
            iconSize={8}
          />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
}
