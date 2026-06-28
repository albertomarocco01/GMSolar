/**
 * FlowNode — nodo singolo del diagramma di flusso.
 * Presentational: l'icona + etichetta con state "completed" (illuminato).
 * Usato all'interno di FlowDiagram (client component).
 */

import { type LucideIcon } from "lucide-react";
import { cn } from "@gmgroup/lib/utils";

export type FlowNodeProps = {
  icon: LucideIcon;
  label: string;
  /** true quando il flusso ha raggiunto o superato questo nodo. */
  completed: boolean;
};

export default function FlowNode({ icon: Icon, label, completed }: FlowNodeProps) {
  return (
    <div className="flex shrink-0 flex-col items-center gap-1.5" style={{ width: "4rem" }}>
      <div
        className={cn(
          "flex h-11 w-11 items-center justify-center rounded-full border-2",
          "transition-all duration-500",
          completed
            ? "bg-accent border-accent text-accent-contrast shadow-glow"
            : "bg-surface border-border text-muted",
        )}
        aria-hidden
      >
        <Icon size={18} />
      </div>
      <span
        className={cn(
          "w-full text-center text-[10px] leading-tight font-medium",
          "transition-colors duration-300",
          completed ? "text-accent-ink" : "text-muted",
        )}
      >
        {label}
      </span>
    </div>
  );
}
