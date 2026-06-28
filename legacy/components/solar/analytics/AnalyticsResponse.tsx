"use client";

import { ShieldCheck, ShieldAlert, LineChart as LineChartIcon } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { AgentSimulationState } from "./types";

interface AnalyticsResponseProps {
  state: AgentSimulationState | null;
  loading: boolean;
}

export default function AnalyticsResponse({ state, loading }: AnalyticsResponseProps) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center space-y-2 px-2 py-4">
        <div className="flex items-center space-x-2">
          <div className="border-t-accent h-5 w-5 animate-spin rounded-full border-2 border-slate-200"></div>
          <span className="font-mono text-xs font-semibold text-slate-500">
            Elaborazione Query SQL...
          </span>
        </div>
        <p className="text-[10px] text-slate-400">
          Verifica criteri GDPR e sicurezza della rete attiva
        </p>
      </div>
    );
  }

  if (!state) {
    return null;
  }

  const {
    authorized,
    sqlQuery,
    responseMarkdown,
    chartType,
    chartData,
    chartKeys,
    chartTitle,
    rejectionReason,
  } = state;

  return (
    <div className="space-y-4 text-xs">
      {/* Security Check Banner */}
      {authorized ? (
        <div className="bg-accent/10 border-accent/20 text-accent-ink flex items-center justify-between rounded-lg border p-2 text-[11px]">
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="text-accent-ink h-3.5 w-3.5 shrink-0" />
            <span className="font-semibold">Sicurezza GDPR Verificata</span>
          </div>
          <span className="bg-accent/15 text-accent-ink rounded px-1 font-mono text-[8px] font-bold">
            PASS
          </span>
        </div>
      ) : (
        <div className="animate-pulse space-y-1 rounded-lg border border-rose-100 bg-rose-50 p-2.5 text-rose-800">
          <div className="flex items-start space-x-1.5">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
            <div>
              <span className="block text-[9px] font-bold tracking-wider uppercase">
                ACCESSO NEGATO (GDPR BLOCKED)
              </span>
              <p className="mt-0.5 leading-relaxed font-semibold text-rose-700">
                {rejectionReason ||
                  "Tentativo di estrazione pin o dati di contatto privati non autorizzato."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Embedded SQL query view */}
      {sqlQuery && (
        <div className="overflow-hidden rounded-lg border border-slate-800 bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-2.5 py-1 font-mono text-[8px] text-slate-400">
            <span>QUERY COMPILATA</span>
            <span className="text-accent font-bold uppercase">SQL SAFE</span>
          </div>
          <pre className="text-accent overflow-x-auto p-2.5 font-mono text-[10px] leading-relaxed whitespace-pre select-all">
            {sqlQuery}
          </pre>
        </div>
      )}

      {/* Chart outputs inside the bubble card */}
      {authorized && chartType && chartType !== "none" && chartData && chartData.length > 0 && (
        <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-2.5">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
            <div className="flex items-center space-x-1">
              <LineChartIcon className="text-accent-ink h-3 w-3" />
              <span className="text-[9px] font-bold tracking-wider text-slate-700 uppercase">
                {chartTitle || "Analisi Consumi"}
              </span>
            </div>
          </div>

          <div className="h-40 w-full font-mono text-[9px]">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === "line" ? (
                <LineChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="label" stroke="#94A3B8" fontSize={8} tickLine={false} />
                  <YAxis
                    stroke="#94A3B8"
                    fontSize={8}
                    tickLine={false}
                    tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(value) => [`${Number(value).toLocaleString()} kWh`, "Energia"]}
                    contentStyle={{
                      background: "#0F172A",
                      border: "none",
                      borderRadius: "4px",
                      color: "#FFF",
                      fontSize: "9px",
                    }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: "8px" }} />
                  <Line
                    type="monotone"
                    dataKey="Pubbliche Fast (kWh)"
                    stroke="#a8d920"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="Private Aziendali (kWh)"
                    stroke="#6366f1"
                    strokeWidth={1.5}
                    dot={false}
                  />
                </LineChart>
              ) : (
                <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="label" stroke="#94A3B8" fontSize={8} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={8} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: "#0F172A",
                      border: "none",
                      borderRadius: "4px",
                      color: "#FFF",
                      fontSize: "9px",
                    }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: "8px" }} />
                  {chartKeys &&
                    chartKeys.map((key, index) => (
                      <Bar
                        key={key}
                        dataKey={key}
                        fill={index === 0 ? "#a8d920" : index === 1 ? "#6366f1" : "#F59E0B"}
                        radius={[2, 2, 0, 0]}
                      />
                    ))}
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Main response text */}
      <div className="space-y-2.5 leading-relaxed font-normal whitespace-pre-line text-slate-700">
        {responseMarkdown
          ? responseMarkdown.split("\n\n").map((para, i) => {
              if (para.startsWith("### ")) {
                return (
                  <h5
                    key={i}
                    className="mt-2 border-b border-slate-100 pb-0.5 text-xs font-bold tracking-tight text-slate-900"
                  >
                    {para.substring(4)}
                  </h5>
                );
              }
              if (para.startsWith("#### ")) {
                return (
                  <h6
                    key={i}
                    className="text-accent-ink mt-1.5 text-[10px] font-bold tracking-wider uppercase"
                  >
                    {para.substring(5)}
                  </h6>
                );
              }
              if (para.includes("\n- ") || para.includes("\n1. ")) {
                const listItems = para.split("\n");
                return (
                  <ul key={i} className="list-disc space-y-1 pl-4 text-xs text-slate-600">
                    {listItems.map((item, idx) => {
                      const cleanItem = item.replace(/^[-\d.\s*]+/, "");
                      const parts = cleanItem.split("**");
                      return (
                        <li key={idx}>
                          {parts.map((p, pIdx) =>
                            pIdx % 2 !== 0 ? (
                              <strong key={pIdx} className="font-bold text-slate-900">
                                {p}
                              </strong>
                            ) : (
                              p
                            ),
                          )}
                        </li>
                      );
                    })}
                  </ul>
                );
              }

              const boldParts = para.split("**");
              if (boldParts.length > 1) {
                return (
                  <p key={i}>
                    {boldParts.map((part, index) =>
                      index % 2 !== 0 ? (
                        <strong key={index} className="font-bold text-slate-900">
                          {part}
                        </strong>
                      ) : (
                        part
                      ),
                    )}
                  </p>
                );
              }

              return <p key={i}>{para}</p>;
            })
          : null}
      </div>
    </div>
  );
}
