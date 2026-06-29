/**
 * GM Group — Pannello Segnalazioni
 * Form per la creazione di una nuova segnalazione.
 * Validazione client robusta con messaggi d'errore accessibili (aria-describedby).
 * Nessun upload reale: l'allegato mostra solo il nome del file scelto.
 *
 * ── Integrazione email reale (Resend) ──────────────────────────────────────
 * Il punto di aggancio è la funzione `handleSubmit`, nel blocco
 * "// [EMAIL] Qui si invierebbe la segnalazione via server action / fetch".
 * In produzione: creare una route handler Next.js (es. POST /api/segnalazioni)
 * che riceve i dati, compone il template e chiama:
 *   import { Resend } from "resend";
 *   const resend = new Resend(process.env.RESEND_API_KEY);
 *   await resend.emails.send({ from, to, subject, react: SegnalazioneEmail(draft) });
 * La chiave RESEND_API_KEY va in .env.local e NON nel bundle client.
 * ──────────────────────────────────────────────────────────────────────────
 */

"use client";

import { useRef, useState } from "react";
import { cn } from "@gmgroup/lib/utils";
import Button from "@gmgroup/ui/Button";
import {
  PRIORITA_LABEL,
  SITO_LABEL,
  TIPO_LABEL,
  type FormDraft,
  type Priorita,
  type Sito,
  type Tipo,
} from "./types";

/* ─── Tipi interni ───────────────────────────────────────────────────────── */

interface FormErrors {
  tipo?: string;
  titolo?: string;
  descrizione?: string;
  priorita?: string;
  sito?: string;
}

/* ─── Validazione ────────────────────────────────────────────────────────── */

function validate(fields: {
  tipo: Tipo | "";
  titolo: string;
  descrizione: string;
  priorita: Priorita | "";
  sito: Sito | "";
}): FormErrors {
  const errs: FormErrors = {};
  if (!fields.tipo) errs.tipo = "Seleziona il tipo di segnalazione.";
  if (!fields.priorita) errs.priorita = "Seleziona la priorità.";
  if (!fields.sito) errs.sito = "Seleziona il sito coinvolto.";
  const t = fields.titolo.trim();
  if (!t) errs.titolo = "Il titolo è obbligatorio.";
  else if (t.length < 5) errs.titolo = "Almeno 5 caratteri.";
  else if (t.length > 120) errs.titolo = "Massimo 120 caratteri.";
  const d = fields.descrizione.trim();
  if (!d) errs.descrizione = "La descrizione è obbligatoria.";
  else if (d.length < 20) errs.descrizione = "Almeno 20 caratteri.";
  else if (d.length > 2000) errs.descrizione = "Massimo 2000 caratteri.";
  return errs;
}

/* ─── Classi condivise ───────────────────────────────────────────────────── */

const FIELD_BASE =
  "w-full rounded-md border bg-surface px-3 py-2 text-sm text-foreground " +
  "focus:outline-none focus:ring-2 focus:ring-accent-ring focus:border-accent " +
  "disabled:opacity-50 transition-colors duration-(--duration-fast)";

const FIELD_INVALID = "border-red-400 focus:border-red-400 focus:ring-red-200";
const FIELD_VALID = "border-border";

/* ─── Sotto-componenti ───────────────────────────────────────────────────── */

function FieldError({ id, msg }: { id: string; msg?: string }) {
  if (!msg) return null;
  return (
    <p id={id} role="alert" className="mt-1 text-xs text-red-600">
      {msg}
    </p>
  );
}

function Label({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="text-foreground mb-1 block text-sm font-medium">
      {children}
    </label>
  );
}

/* ─── Componente principale ─────────────────────────────────────────────── */

export type ReportFormProps = {
  onSubmit: (draft: FormDraft) => void;
};

export default function ReportForm({ onSubmit }: ReportFormProps) {
  const [tipo, setTipo] = useState<Tipo | "">("");
  const [titolo, setTitolo] = useState("");
  const [descrizione, setDescrizione] = useState("");
  const [priorita, setPrioritа] = useState<Priorita | "">("");
  const [sito, setSito] = useState<Sito | "">("");
  const [allegatoNome, setAllegatoNome] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAllegatoNome(e.target.files?.[0]?.name ?? "");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validate({ tipo, titolo, descrizione, priorita, sito });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Focus il primo campo con errore per accessibilità.
      const firstKey = Object.keys(newErrors)[0] as keyof FormErrors;
      formRef.current?.querySelector<HTMLElement>(`#field-${firstKey}`)?.focus();
      return;
    }

    // [EMAIL] Qui si invierebbe la segnalazione via server action / fetch a Resend.
    // Vedi il commento in cima al file per i dettagli dell'integrazione.

    onSubmit({
      tipo: tipo as Tipo,
      titolo: titolo.trim(),
      descrizione: descrizione.trim(),
      priorita: priorita as Priorita,
      sito: sito as Sito,
      allegatoNome: allegatoNome || undefined,
    } satisfies FormDraft);

    // Reset form.
    setTipo("");
    setTitolo("");
    setDescrizione("");
    setPrioritа("");
    setSito("");
    setAllegatoNome("");
    setErrors({});
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 100);
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate aria-label="Nuova segnalazione">
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Tipo */}
        <div>
          <Label htmlFor="field-tipo">
            Tipo <span aria-hidden="true">*</span>
          </Label>
          <select
            id="field-tipo"
            value={tipo}
            onChange={(e) => setTipo(e.target.value as Tipo | "")}
            aria-required="true"
            aria-invalid={!!errors.tipo}
            aria-describedby={errors.tipo ? "err-tipo" : undefined}
            className={cn(FIELD_BASE, errors.tipo ? FIELD_INVALID : FIELD_VALID)}
          >
            <option value="">— Seleziona —</option>
            {(Object.entries(TIPO_LABEL) as [Tipo, string][]).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
          <FieldError id="err-tipo" msg={errors.tipo} />
        </div>

        {/* Priorità */}
        <div>
          <Label htmlFor="field-priorita">
            Priorità <span aria-hidden="true">*</span>
          </Label>
          <select
            id="field-priorita"
            value={priorita}
            onChange={(e) => setPrioritа(e.target.value as Priorita | "")}
            aria-required="true"
            aria-invalid={!!errors.priorita}
            aria-describedby={errors.priorita ? "err-priorita" : undefined}
            className={cn(FIELD_BASE, errors.priorita ? FIELD_INVALID : FIELD_VALID)}
          >
            <option value="">— Seleziona —</option>
            {(Object.entries(PRIORITA_LABEL) as [Priorita, string][]).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
          <FieldError id="err-priorita" msg={errors.priorita} />
        </div>

        {/* Titolo */}
        <div className="sm:col-span-2">
          <Label htmlFor="field-titolo">
            Titolo <span aria-hidden="true">*</span>
          </Label>
          <input
            id="field-titolo"
            type="text"
            value={titolo}
            onChange={(e) => setTitolo(e.target.value)}
            maxLength={120}
            aria-required="true"
            aria-invalid={!!errors.titolo}
            aria-describedby={errors.titolo ? "err-titolo" : undefined}
            placeholder="Descrivi brevemente il problema o la richiesta"
            className={cn(FIELD_BASE, errors.titolo ? FIELD_INVALID : FIELD_VALID)}
          />
          <div className="mt-1 flex items-start justify-between gap-2">
            <FieldError id="err-titolo" msg={errors.titolo} />
            <span className="text-muted ml-auto shrink-0 text-xs">{titolo.length}/120</span>
          </div>
        </div>

        {/* Sito coinvolto */}
        <div>
          <Label htmlFor="field-sito">
            Sito coinvolto <span aria-hidden="true">*</span>
          </Label>
          <select
            id="field-sito"
            value={sito}
            onChange={(e) => setSito(e.target.value as Sito | "")}
            aria-required="true"
            aria-invalid={!!errors.sito}
            aria-describedby={errors.sito ? "err-sito" : undefined}
            className={cn(FIELD_BASE, errors.sito ? FIELD_INVALID : FIELD_VALID)}
          >
            <option value="">— Seleziona —</option>
            {(Object.entries(SITO_LABEL) as [Sito, string][]).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
          <FieldError id="err-sito" msg={errors.sito} />
        </div>

        {/* Allegato simulato */}
        <div>
          <Label htmlFor="field-allegato">Allegato (opzionale)</Label>
          <div className="relative">
            <label
              htmlFor="field-allegato"
              className={cn(
                FIELD_BASE,
                FIELD_VALID,
                "flex cursor-pointer items-center gap-2 truncate",
                allegatoNome ? "text-foreground" : "text-muted",
              )}
            >
              <svg
                className="text-muted h-4 w-4 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 002.112 2.13"
                />
              </svg>
              <span className="truncate">{allegatoNome || "Scegli un file…"}</span>
            </label>
            <input
              id="field-allegato"
              type="file"
              onChange={handleFile}
              accept="image/*,.pdf,.txt,.docx,.xlsx,.csv"
              className="sr-only"
              tabIndex={-1}
            />
          </div>
          <p className="text-muted mt-1 text-xs">Nessun upload reale — solo nome file (demo).</p>
        </div>

        {/* Descrizione */}
        <div className="sm:col-span-2">
          <Label htmlFor="field-descrizione">
            Descrizione <span aria-hidden="true">*</span>
          </Label>
          <textarea
            id="field-descrizione"
            value={descrizione}
            onChange={(e) => setDescrizione(e.target.value)}
            rows={5}
            maxLength={2000}
            aria-required="true"
            aria-invalid={!!errors.descrizione}
            aria-describedby={errors.descrizione ? "err-descrizione" : undefined}
            placeholder="Fornisci tutti i dettagli utili: browser, dispositivo, passi per riprodurre…"
            className={cn(FIELD_BASE, "resize-y", errors.descrizione ? FIELD_INVALID : FIELD_VALID)}
          />
          <div className="mt-1 flex items-start justify-between gap-2">
            <FieldError id="err-descrizione" msg={errors.descrizione} />
            <span className="text-muted ml-auto shrink-0 text-xs">{descrizione.length}/2000</span>
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="mt-6 flex items-center justify-between gap-4">
        <p className="text-muted text-xs">
          I campi con <span aria-hidden="true">*</span> sono obbligatori.
        </p>
        <Button type="submit" variant="solid" size="md" disabled={submitted}>
          Invia segnalazione
        </Button>
      </div>
    </form>
  );
}
