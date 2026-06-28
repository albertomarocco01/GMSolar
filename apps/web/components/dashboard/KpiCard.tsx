/**
 * KPI Card — mostra un singolo indicatore con AnimatedCounter e delta % vs
 * periodo precedente. Rispetta prefers-reduced-motion (via AnimatedCounter).
 */
"use client";

import AnimatedCounter from "@gmgroup/ui/AnimatedCounter";
import Card from "@gmgroup/ui/Card";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";

export type KpiCardProps = {
  label: string;
  value: number;
  /** Variazione percentuale vs periodo precedente (1 decimale). */
  delta: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
};

export default function KpiCard({
  label,
  value,
  delta,
  prefix,
  suffix,
  decimals = 0,
}: KpiCardProps) {
  const positive = delta > 0;
  const neutral = delta === 0;

  const deltaClass = neutral
    ? "text-muted"
    : positive
      ? "text-emerald-600 dark:text-emerald-400"
      : "text-red-500 dark:text-red-400";

  return (
    <Card className="flex flex-col gap-3 p-5">
      <p className="text-muted text-sm font-medium">{label}</p>

      <p className="text-foreground text-3xl font-bold">
        <AnimatedCounter value={value} prefix={prefix} suffix={suffix} decimals={decimals} />
      </p>

      <div
        className={`flex items-center gap-1.5 text-xs font-medium ${deltaClass}`}
        aria-label={`Variazione vs periodo precedente: ${delta > 0 ? "+" : ""}${delta}%`}
      >
        {neutral ? (
          <Minus size={12} aria-hidden />
        ) : positive ? (
          <TrendingUp size={12} aria-hidden />
        ) : (
          <TrendingDown size={12} aria-hidden />
        )}
        <span>
          {positive ? "+" : ""}
          {delta}% vs periodo prec.
        </span>
      </div>
    </Card>
  );
}
