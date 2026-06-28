/**
 * GM Group — Pannello Segnalazioni
 * Riga singola della lista: compatta di default, espandibile al click
 * per mostrare descrizione completa, allegato e timeline degli stati.
 */

"use client";

import { useState } from "react";
import { cn } from "@gmgroup/lib/utils";
import { SITO_LABEL, TIPO_LABEL, type Segnalazione } from "./types";
import StatusBadge from "./StatusBadge";
import PriorityBadge from "./PriorityBadge";
import StatusTimeline from "./StatusTimeline";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("it-IT", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export type ReportRowProps = {
  item: Segnalazione;
};

/** Riga ticket: ID, tipo, titolo, badge stato/priorità; espandibile con dettaglio + timeline. */
export default function ReportRow({ item }: ReportRowProps) {
  const [open, setOpen] = useState(false);
  const detailId = `detail-${item.id}`;

  return (
    <div className="border-border border-b last:border-b-0">
      {/* ── Riga compatta ───────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={detailId}
        className={cn(
          "group w-full px-4 py-4 text-left transition-colors duration-(--duration-fast)",
          "hover:bg-surface-2 focus-visible:bg-surface-2 focus-visible:outline-none",
        )}
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
          {/* ID + tipo */}
          <div className="flex shrink-0 items-center gap-2">
            <span className="text-muted font-mono text-xs">{item.id}</span>
            <span className="text-border hidden text-xs sm:inline" aria-hidden="true">
              ·
            </span>
            <span className="text-muted text-xs">{TIPO_LABEL[item.tipo]}</span>
          </div>

          {/* Titolo */}
          <p className="text-foreground flex-1 text-sm leading-snug font-medium">{item.titolo}</p>

          {/* Badge + sito + data + chevron */}
          <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
            <StatusBadge stato={item.stato} />
            <PriorityBadge priorita={item.priorita} />
            <span className="text-muted hidden text-xs lg:inline">{SITO_LABEL[item.sito]}</span>
            <span className="text-muted hidden text-xs lg:inline">
              {formatDate(item.dataCreazione)}
            </span>
            {/* Chevron */}
            <svg
              className={cn(
                "text-muted h-4 w-4 shrink-0 transition-transform duration-(--duration-fast)",
                open && "rotate-180",
              )}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </button>

      {/* ── Dettaglio espanso ────────────────────────────────────────── */}
      {open && (
        <div
          id={detailId}
          role="region"
          aria-label={`Dettaglio segnalazione ${item.id}`}
          className="border-border bg-surface-2/50 border-t px-4 py-5"
        >
          <div className="grid gap-6 md:grid-cols-[1fr_220px]">
            {/* Colonna sinistra: info + descrizione */}
            <div className="space-y-4">
              {/* Meta */}
              <dl className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
                <div className="flex gap-1.5">
                  <dt className="text-muted">Sito:</dt>
                  <dd className="text-foreground font-medium">{SITO_LABEL[item.sito]}</dd>
                </div>
                <div className="flex gap-1.5">
                  <dt className="text-muted">Aperta il:</dt>
                  <dd className="text-foreground font-medium">{formatDate(item.dataCreazione)}</dd>
                </div>
                {item.allegatoNome && (
                  <div className="flex gap-1.5">
                    <dt className="text-muted">Allegato:</dt>
                    <dd className="text-foreground font-medium">{item.allegatoNome}</dd>
                  </div>
                )}
              </dl>

              {/* Descrizione */}
              <div>
                <p className="text-muted mb-1 text-xs font-semibold tracking-wide uppercase">
                  Descrizione
                </p>
                <p className="text-foreground text-sm leading-relaxed whitespace-pre-wrap">
                  {item.descrizione}
                </p>
              </div>
            </div>

            {/* Colonna destra: timeline */}
            <div>
              <p className="text-muted mb-3 text-xs font-semibold tracking-wide uppercase">
                Storico stati
              </p>
              <StatusTimeline timeline={item.timeline} statoAttuale={item.stato} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
