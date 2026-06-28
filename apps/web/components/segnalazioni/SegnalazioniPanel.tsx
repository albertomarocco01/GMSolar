/**
 * GM Group — Pannello Segnalazioni
 * Orchestratore client: gestisce la lista in useReducer, mostra/nasconde il
 * form, emette il toast di conferma con l'ID ticket simulato.
 * Tutto lo stato è client-only (demo — nessun backend).
 */

"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import Card from "@gmgroup/ui/Card";
import Section from "@gmgroup/ui/Section";
import Button from "@gmgroup/ui/Button";
import { SEED_DATA } from "./mockData";
import { type FormDraft, type Segnalazione, type Stato } from "./types";
import ReportForm from "./ReportForm";
import ReportList from "./ReportList";

/* ─── Reducer lista ──────────────────────────────────────────────────────── */

type ListAction = { type: "ADD"; payload: Segnalazione };

function listReducer(state: Segnalazione[], action: ListAction): Segnalazione[] {
  switch (action.type) {
    case "ADD":
      return [action.payload, ...state];
    default:
      return state;
  }
}

/* ─── Helper date ────────────────────────────────────────────────────────── */

function today(): string {
  return new Date().toISOString().split("T")[0] as string;
}

/* ─── Toast ──────────────────────────────────────────────────────────────── */

function Toast({ ticketId, onDismiss }: { ticketId: string; onDismiss: () => void }) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={
        "fixed right-6 bottom-6 z-50 flex items-start gap-3 rounded-xl " +
        "bg-foreground text-background shadow-lift px-5 py-4 " +
        "animate-fade-in max-w-sm"
      }
    >
      <svg
        className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
      <div className="flex-1">
        <p className="text-sm font-semibold">Segnalazione inviata</p>
        <p className="mt-0.5 font-mono text-xs opacity-70">Ticket: {ticketId}</p>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Chiudi notifica"
        className="focus-visible:outline-background rounded p-1 opacity-60 hover:opacity-100 focus-visible:outline focus-visible:outline-2"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

/* ─── Componente principale ─────────────────────────────────────────────── */

export default function SegnalazioniPanel() {
  const [items, dispatch] = useReducer(listReducer, SEED_DATA);
  const [showForm, setShowForm] = useState(false);
  const [toastId, setToastId] = useState<string | null>(null);

  /* Contatore ID ticket: parte da SEED_DATA.length + 1 */
  const nextIdRef = useRef(SEED_DATA.length + 1);
  const formCardRef = useRef<HTMLDivElement>(null);

  /* Auto-dismiss toast dopo 6 secondi */
  useEffect(() => {
    if (!toastId) return;
    const t = setTimeout(() => setToastId(null), 6000);
    return () => clearTimeout(t);
  }, [toastId]);

  const handleOpenForm = () => {
    setShowForm(true);
    // Scroll al form dopo il render
    setTimeout(
      () => formCardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
      80,
    );
  };

  const handleSubmit = (draft: FormDraft) => {
    const n = nextIdRef.current++;
    const id = `SEG-2026-${String(n).padStart(4, "0")}`;
    const date = today();
    const newItem: Segnalazione = {
      id,
      ...draft,
      stato: "aperta" as Stato,
      dataCreazione: date,
      timeline: [{ stato: "aperta", data: date, nota: "Segnalazione creata" }],
    };
    dispatch({ type: "ADD", payload: newItem });
    setToastId(id);
    setShowForm(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <Section size="default">
        <div className="space-y-8">
          {/* ── Intestazione ─────────────────────────────────────────── */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-accent-ink mb-1 text-sm font-semibold tracking-widest uppercase">
                Canale interno
              </p>
              <h1 className="font-display text-display-sm text-foreground font-bold tracking-tight">
                Segnalazioni
              </h1>
              <p className="text-muted mt-2 max-w-xl text-base">
                Segnala un bug, richiedi una modifica o poni una domanda al nostro team. Ogni
                segnalazione viene tracciata con ID univoco.
              </p>
            </div>
            <div className="shrink-0">
              {!showForm ? (
                <Button variant="solid" size="md" onClick={handleOpenForm}>
                  + Nuova segnalazione
                </Button>
              ) : (
                <Button variant="ghost" size="md" onClick={() => setShowForm(false)}>
                  Annulla
                </Button>
              )}
            </div>
          </div>

          {/* ── Form collassabile ─────────────────────────────────────── */}
          {showForm && (
            <div ref={formCardRef}>
              <Card className="p-6">
                <h2 className="text-foreground mb-5 text-base font-semibold">Nuova segnalazione</h2>
                <ReportForm onSubmit={handleSubmit} />
              </Card>
            </div>
          )}

          {/* ── Lista ─────────────────────────────────────────────────── */}
          <ReportList items={items} />
        </div>
      </Section>

      {/* ── Toast di conferma ─────────────────────────────────────────── */}
      {toastId && <Toast ticketId={toastId} onDismiss={() => setToastId(null)} />}
    </>
  );
}
