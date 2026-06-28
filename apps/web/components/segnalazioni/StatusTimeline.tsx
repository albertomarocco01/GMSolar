/**
 * GM Group — Pannello Segnalazioni
 * Timeline verticale degli stati (creata → presa in carico → risolta).
 * Mostra sempre tutti e tre gli step; quelli non ancora raggiunti appaiono in
 * tono neutro, quelli raggiunti con colore e data effettiva.
 */

import { cn } from "@gmgroup/lib/utils";
import { STATO_ORDER, type Stato, type TimelineStep } from "./types";

const STEPS: { stato: Stato; label: string }[] = [
  { stato: "aperta", label: "Creata" },
  { stato: "in_lavorazione", label: "Presa in carico" },
  { stato: "risolta", label: "Risolta" },
];

/** Colori del dot per ogni step raggiunto. */
const DOT_ACTIVE: Record<Stato, string> = {
  aperta: "bg-sky-500 ring-sky-200",
  in_lavorazione: "bg-amber-500 ring-amber-200",
  risolta: "bg-emerald-500 ring-emerald-200",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("it-IT", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export type StatusTimelineProps = {
  timeline: TimelineStep[];
  statoAttuale: Stato;
};

/**
 * Mostra la progressione degli stati come lista verticale connessa.
 * `timeline` contiene solo i passi effettivamente avvenuti (con data e nota).
 */
export default function StatusTimeline({ timeline, statoAttuale }: StatusTimelineProps) {
  const currentOrder = STATO_ORDER[statoAttuale];

  return (
    <ol aria-label="Storico stati segnalazione" className="relative space-y-0">
      {STEPS.map((step, i) => {
        const reached = STATO_ORDER[step.stato] <= currentOrder;
        const entry = timeline.find((t) => t.stato === step.stato);
        const isLast = i === STEPS.length - 1;

        return (
          <li key={step.stato} className="relative flex gap-4 pb-5 last:pb-0">
            {/* Linea verticale connettore */}
            {!isLast && (
              <span
                className={cn(
                  "absolute top-6 left-[11px] h-full w-px",
                  reached ? "bg-border" : "bg-border/40",
                )}
                aria-hidden="true"
              />
            )}

            {/* Dot step */}
            <span
              className={cn(
                "relative mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ring-2",
                reached ? DOT_ACTIVE[step.stato] : "bg-surface-2 ring-border text-muted",
              )}
              aria-hidden="true"
            >
              {reached && (
                <svg viewBox="0 0 8 8" className="h-2.5 w-2.5 fill-white" aria-hidden="true">
                  <circle cx="4" cy="4" r="3" />
                </svg>
              )}
            </span>

            {/* Contenuto step */}
            <div className="min-w-0 flex-1">
              <p className={cn("text-sm font-medium", reached ? "text-foreground" : "text-muted")}>
                {step.label}
              </p>
              {entry && (
                <>
                  <p className="text-muted mt-0.5 text-xs">{formatDate(entry.data)}</p>
                  {entry.nota && <p className="text-muted mt-0.5 text-xs italic">{entry.nota}</p>}
                </>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
