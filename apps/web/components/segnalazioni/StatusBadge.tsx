/**
 * GM Group — Pannello Segnalazioni
 * Badge semantico per lo stato di una segnalazione.
 */

import { cn } from "@gmgroup/lib/utils";
import { STATO_LABEL, type Stato } from "./types";

/** Classi Tailwind per ogni stato. Palette built-in, nessun inline style. */
const STATO_CLASSES: Record<Stato, string> = {
  aperta: "bg-sky-100 text-sky-700",
  in_lavorazione: "bg-amber-100 text-amber-700",
  risolta: "bg-emerald-100 text-emerald-700",
};

/** Pallino indicatore di colore affiancato all'etichetta. */
const DOT_CLASSES: Record<Stato, string> = {
  aperta: "bg-sky-500",
  in_lavorazione: "bg-amber-500",
  risolta: "bg-emerald-500",
};

export type StatusBadgeProps = {
  stato: Stato;
  className?: string;
};

/** Pill colorata che mostra lo stato corrente di una segnalazione. */
export default function StatusBadge({ stato, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        STATO_CLASSES[stato],
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", DOT_CLASSES[stato])} aria-hidden="true" />
      {STATO_LABEL[stato]}
    </span>
  );
}
