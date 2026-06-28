"use client";

/**
 * DetailDrawer — pannello laterale (destra) di dettaglio record. Accessibile:
 * `role="dialog"` + `aria-modal`, chiusura con Esc e click sul backdrop.
 * Rispetta prefers-reduced-motion: l'eventuale transizione è gestita via CSS
 * di base del progetto; qui usiamo solo classi token.
 */
import { useEffect } from "react";
import { X } from "lucide-react";
import Badge from "@gmgroup/ui/Badge";
import type { DetailField } from "./types";

export interface DetailDrawerProps {
  open: boolean;
  title: string;
  eyebrow?: string;
  fields: DetailField[];
  onClose: () => void;
}

export default function DetailDrawer({ open, title, eyebrow, fields, onClose }: DetailDrawerProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Chiudi dettaglio"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />
      {/* Pannello */}
      <div className="bg-background border-border shadow-lift relative flex h-full w-full max-w-md flex-col overflow-y-auto border-l">
        <div className="border-border flex items-start justify-between border-b p-5">
          <div>
            {eyebrow && <Badge>{eyebrow}</Badge>}
            <h2 className="text-foreground mt-2 text-lg font-semibold tracking-tight">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Chiudi"
            className="text-muted hover:bg-surface-2 hover:text-foreground -mr-1 rounded-lg p-2 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <dl className="divide-border divide-y">
          {fields.map((f) => (
            <div key={f.label} className="flex items-start justify-between gap-4 px-5 py-3">
              <dt className="text-muted text-sm">{f.label}</dt>
              <dd className="text-foreground text-right text-sm font-medium">{f.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
