/**
 * GM Group — Pannello Segnalazioni
 * Lista delle segnalazioni con filtri per stato, priorità e ricerca testuale.
 * Tutto client-side, nessuna chiamata di rete.
 */

"use client";

import { useState } from "react";
import { cn } from "@gmgroup/lib/utils";
import { PRIORITA_LABEL, STATO_LABEL, type Priorita, type Segnalazione, type Stato } from "./types";
import ReportRow from "./ReportRow";

/* ─── Tipi interni ───────────────────────────────────────────────────────── */

type StatoFilter = Stato | "tutte";
type PrioritaFilter = Priorita | "tutte";

/* ─── Filtro pill ────────────────────────────────────────────────────────── */

function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-3 py-1 text-xs font-medium transition-colors duration-(--duration-fast)",
        active
          ? "bg-accent text-accent-contrast"
          : "bg-surface-2 text-muted hover:bg-surface hover:text-foreground border-border border",
      )}
    >
      {label}
    </button>
  );
}

/* ─── Componente principale ─────────────────────────────────────────────── */

export type ReportListProps = {
  items: Segnalazione[];
};

export default function ReportList({ items }: ReportListProps) {
  const [statoFilter, setStatoFilter] = useState<StatoFilter>("tutte");
  const [prioritaFilter, setPrioritaFilter] = useState<PrioritaFilter>("tutte");
  const [search, setSearch] = useState("");

  /* Filtraggio */
  const filtered = items.filter((item) => {
    if (statoFilter !== "tutte" && item.stato !== statoFilter) return false;
    if (prioritaFilter !== "tutte" && item.priorita !== prioritaFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (
        !item.titolo.toLowerCase().includes(q) &&
        !item.descrizione.toLowerCase().includes(q) &&
        !item.id.toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    return true;
  });

  const STATI: StatoFilter[] = ["tutte", "aperta", "in_lavorazione", "risolta"];
  const PRIORITA: PrioritaFilter[] = ["tutte", "urgente", "alta", "media", "bassa"];

  const statoLabel = (s: StatoFilter) => (s === "tutte" ? "Tutte" : STATO_LABEL[s]);
  const prioritaLabel = (p: PrioritaFilter) => (p === "tutte" ? "Tutte" : PRIORITA_LABEL[p]);

  return (
    <section aria-label="Lista segnalazioni" className="space-y-4">
      {/* ── Barra filtri ──────────────────────────────────────────────── */}
      <div className="space-y-3">
        {/* Ricerca */}
        <div className="relative">
          <svg
            className="text-muted pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cerca per titolo, descrizione o ID ticket…"
            aria-label="Cerca segnalazioni"
            className={cn(
              "border-border bg-surface text-foreground w-full rounded-md border py-2 pr-3 pl-9 text-sm",
              "focus:border-accent focus:ring-accent-ring focus:ring-2 focus:outline-none",
              "placeholder:text-muted",
            )}
          />
        </div>

        {/* Filtri stato */}
        <div role="group" aria-label="Filtra per stato" className="flex flex-wrap gap-2">
          <span className="text-muted self-center text-xs font-medium">Stato:</span>
          {STATI.map((s) => (
            <FilterPill
              key={s}
              label={statoLabel(s)}
              active={statoFilter === s}
              onClick={() => setStatoFilter(s)}
            />
          ))}
        </div>

        {/* Filtri priorità */}
        <div role="group" aria-label="Filtra per priorità" className="flex flex-wrap gap-2">
          <span className="text-muted self-center text-xs font-medium">Priorità:</span>
          {PRIORITA.map((p) => (
            <FilterPill
              key={p}
              label={prioritaLabel(p)}
              active={prioritaFilter === p}
              onClick={() => setPrioritaFilter(p)}
            />
          ))}
        </div>
      </div>

      {/* ── Risultati ────────────────────────────────────────────────── */}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="border-border bg-surface overflow-hidden rounded-lg border"
      >
        {filtered.length === 0 ? (
          <p className="text-muted px-4 py-10 text-center text-sm">
            Nessuna segnalazione trovata per i filtri selezionati.
          </p>
        ) : (
          <>
            {/* Header colonne (solo desktop) */}
            <div
              className="border-border text-muted hidden grid-cols-[160px_1fr_120px_100px] gap-4 border-b px-4 py-2 text-xs font-semibold tracking-wide uppercase sm:grid"
              aria-hidden="true"
            >
              <span>ID / Tipo</span>
              <span>Titolo</span>
              <span>Stato / Priorità</span>
              <span>Data</span>
            </div>
            <div role="list" aria-label={`${filtered.length} segnalazioni`}>
              {filtered.map((item) => (
                <div key={item.id} role="listitem">
                  <ReportRow item={item} />
                </div>
              ))}
            </div>
            <p className="border-border text-muted border-t px-4 py-2 text-right text-xs">
              {filtered.length} di {items.length} segnalazioni
            </p>
          </>
        )}
      </div>
    </section>
  );
}
