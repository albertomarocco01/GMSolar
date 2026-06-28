/**
 * GM Group — Pannello Segnalazioni
 * Badge semantico per la priorità di una segnalazione.
 */

import { cn } from "@gmgroup/lib/utils";
import { PRIORITA_LABEL, type Priorita } from "./types";

/** Classi Tailwind per ogni livello di priorità. */
const PRIORITA_CLASSES: Record<Priorita, string> = {
  bassa: "bg-surface-2 text-muted",
  media: "bg-blue-100 text-blue-700",
  alta: "bg-orange-100 text-orange-700",
  urgente: "bg-red-100 text-red-700 font-semibold",
};

export type PriorityBadgeProps = {
  priorita: Priorita;
  className?: string;
};

/** Pill colorata che mostra il livello di priorità di una segnalazione. */
export default function PriorityBadge({ priorita, className }: PriorityBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        PRIORITA_CLASSES[priorita],
        className,
      )}
    >
      {priorita === "urgente" && (
        <span className="mr-1" aria-hidden="true">
          ↑
        </span>
      )}
      {PRIORITA_LABEL[priorita]}
    </span>
  );
}
