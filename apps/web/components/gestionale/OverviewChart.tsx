"use client";

/**
 * Grafici della Panoramica (Recharts): valore preventivi per stato (barre) e
 * andamento mensile pipeline vs acquisito (linee). I colori usano i token
 * dell'accent (`var(--accent)`); gli esiti positivo/negativo usano la palette
 * semantica coerente con i badge di stato.
 */
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { getOrdiniPerStato, getAndamentoMensile, type OrdineStato } from "@/data/erp-mock";
import { formatEuro } from "./format";

// Palette per stato: neutri/accent dai token, esiti dalla palette semantica.
const STATO_COLOR: Record<OrdineStato, string> = {
  bozza: "var(--muted)",
  inviato: "var(--accent)",
  accettato: "#10b981",
  perso: "#f43f5e",
};

const TOOLTIP_STYLE = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: "8px",
  color: "var(--foreground)",
  fontSize: "12px",
} as const;

const kEuro = (v: number) => `${Math.round(v / 1000)}k`;

export default function OverviewChart() {
  const perStato = getOrdiniPerStato();
  const mensile = getAndamentoMensile();

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Valore preventivi per stato */}
      <div className="border-border bg-surface rounded-xl border p-4">
        <h3 className="text-foreground text-sm font-semibold">Valore preventivi per stato</h3>
        <p className="text-muted mb-2 text-xs">Importo totale (€) raggruppato per stato.</p>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={perStato} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis dataKey="label" stroke="var(--muted)" fontSize={11} tickLine={false} />
              <YAxis stroke="var(--muted)" fontSize={11} tickLine={false} tickFormatter={kEuro} />
              <Tooltip
                cursor={{ fill: "var(--accent-soft)" }}
                contentStyle={TOOLTIP_STYLE}
                formatter={(value) => [formatEuro(Number(value)), "Valore"]}
              />
              <Bar dataKey="valore" radius={[4, 4, 0, 0]}>
                {perStato.map((d) => (
                  <Cell key={d.stato} fill={STATO_COLOR[d.stato]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Andamento mensile */}
      <div className="border-border bg-surface rounded-xl border p-4">
        <h3 className="text-foreground text-sm font-semibold">Andamento mensile</h3>
        <p className="text-muted mb-2 text-xs">Pipeline (inviati) vs acquisito (accettati).</p>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mensile} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis dataKey="label" stroke="var(--muted)" fontSize={11} tickLine={false} />
              <YAxis stroke="var(--muted)" fontSize={11} tickLine={false} tickFormatter={kEuro} />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                formatter={(value) => formatEuro(Number(value))}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: "11px" }} />
              <Line
                type="monotone"
                dataKey="pipeline"
                name="Pipeline"
                stroke="var(--accent)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="acquisito"
                name="Acquisito"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
