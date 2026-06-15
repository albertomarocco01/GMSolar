"use client";

import { useEffect, useRef, useState } from "react";
import type { WallboxPart } from "@/components/mobility/content";

/**
 * Pannello di dettaglio dell'explode interattivo: mostra il componente
 * selezionato (dal click sulla scena 3D o dalle liste accessibili). Non è un
 * modale bloccante — è una card complementare, ma è operabile da tastiera
 * (Escape per chiudere, focus sul titolo all'apertura) e annunciata come dialog.
 */
export default function PartDetailPanel({
  part,
  onClose,
}: {
  part: WallboxPart | null;
  onClose: () => void;
}) {
  if (!part) return null;
  // `key` = la card si rimonta a ogni cambio componente → entrata pulita.
  return <PanelCard key={part.id} part={part} onClose={onClose} />;
}

function PanelCard({ part, onClose }: { part: WallboxPart; onClose: () => void }) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    // Focus sul titolo per gli utenti da tastiera/screen reader.
    headingRef.current?.focus();
    // Entrata in dissolvenza (saltata da prefers-reduced-motion via classi).
    const id = requestAnimationFrame(() => setShown(true));
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-labelledby="part-detail-title"
      data-shown={shown}
      className="pointer-events-auto absolute inset-x-4 bottom-4 z-20 max-w-sm translate-y-2 opacity-0 transition duration-300 data-[shown=true]:translate-y-0 data-[shown=true]:opacity-100 motion-reduce:translate-y-0 motion-reduce:transition-none sm:right-6 sm:left-auto sm:mx-0"
    >
      <div className="border-accent/40 bg-surface/90 rounded-xl border p-5 shadow-2xl backdrop-blur-md">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="bg-accent-soft text-accent-ink inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold">
              Componente
            </span>
            <h3
              id="part-detail-title"
              ref={headingRef}
              tabIndex={-1}
              className="font-display mt-2 text-xl font-bold outline-none"
            >
              {part.label}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Chiudi dettaglio componente"
            className="text-muted hover:text-foreground hover:border-accent/50 border-border -mt-1 grid size-8 shrink-0 place-items-center rounded-full border transition-colors"
          >
            <svg viewBox="0 0 20 20" aria-hidden className="size-4">
              <path
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                d="M5 5l10 10M15 5L5 15"
              />
            </svg>
          </button>
        </div>

        <p className="text-muted mt-2 text-sm">{part.hint}</p>

        <ul className="mt-4 grid gap-2">
          {part.specs.map((s) => (
            <li key={s} className="flex gap-2.5 text-sm">
              <span className="bg-accent mt-1.5 inline-block size-1.5 shrink-0 rounded-full" />
              <span>{s}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
