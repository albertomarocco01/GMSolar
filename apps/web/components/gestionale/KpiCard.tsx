/**
 * KpiCard — scheda metrica della Panoramica. Usa AnimatedCounter (conteggio
 * allo scroll-in, rispetta reduced-motion) e i token del design system.
 */
import type { ComponentType } from "react";
import Card from "@gmgroup/ui/Card";
import AnimatedCounter from "@gmgroup/ui/AnimatedCounter";

export interface KpiCardProps {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  hint?: string;
  icon?: ComponentType<{ className?: string }>;
}

export default function KpiCard({
  label,
  value,
  prefix,
  suffix,
  decimals,
  hint,
  icon: Icon,
}: KpiCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <span className="text-muted text-xs font-medium tracking-wide">{label}</span>
        {Icon && (
          <span className="bg-accent-soft text-accent-ink rounded-lg p-1.5">
            <Icon className="h-4 w-4" />
          </span>
        )}
      </div>
      <div className="text-foreground mt-3 text-2xl font-bold tracking-tight tabular-nums">
        <AnimatedCounter value={value} prefix={prefix} suffix={suffix} decimals={decimals} />
      </div>
      {hint && <div className="text-muted mt-1 text-xs">{hint}</div>}
    </Card>
  );
}
