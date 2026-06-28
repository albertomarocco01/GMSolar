/**
 * FlowLog — terminale simulato che mostra i log di esecuzione del flusso
 * man mano che i passi si completano. Le voci appaiono con una fade-in
 * (classe animate-fade-in da globals.css). Accessibile via aria-live.
 *
 * Nota: questo è un LOG SIMULATO per scopi dimostrativi. Nessuna chiamata
 * reale viene effettuata. Il testo riflette ciò che succederebbe in produzione.
 */

import { CheckCircle2 } from "lucide-react";
import { type FlowLogEntry } from "./types";

export type FlowLogProps = {
  entries: FlowLogEntry[];
  /** Quante voci mostrare (guidato dallo stato di animazione del genitore). */
  visibleCount: number;
};

export default function FlowLog({ entries, visibleCount }: FlowLogProps) {
  const visible = entries.slice(0, visibleCount);

  return (
    <div
      role="log"
      aria-live="polite"
      aria-label="Log di esecuzione simulato"
      aria-atomic={false}
      className={
        "bg-surface-2 border-border h-44 overflow-y-auto rounded-lg border p-4 font-mono text-xs"
      }
    >
      {visible.length === 0 ? (
        <p className="text-muted italic">
          Premi &ldquo;Riproduci&rdquo; per avviare la simulazione.
        </p>
      ) : (
        visible.map((entry, i) => (
          <div key={i} className="animate-fade-in flex items-start gap-2 py-0.5">
            <CheckCircle2 size={12} className="text-accent-ink mt-0.5 shrink-0" aria-hidden />
            <span className="text-muted select-none">{entry.time}</span>
            <span className="text-foreground">{entry.text}</span>
          </div>
        ))
      )}
    </div>
  );
}
