"use client";

/**
 * GlobalAssistant — launcher floating dell'assistente di sito.
 *
 * Mostra una FAB in basso a destra che apre <SiteAssistant /> in un popover.
 * Presente SOLO sulla home vetrina ("/"): nascosto sulle aree servizio (che
 * hanno una loro UX) e sulla pagina /assistente (dove l'assistente è già
 * incorporato come demo). Accessibile: aria-expanded, Esc per chiudere;
 * rispetta prefers-reduced-motion via le utility motion-reduce.
 */
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { MessageCircle, X } from "lucide-react";
import SiteAssistant from "./SiteAssistant";

/** Prefissi su cui NON mostrare la FAB. */
const HIDE_ON = [
  "/assistente",
  "/dashboard",
  "/gestionale",
  "/integrazioni",
  "/segnalazioni",
];

export default function GlobalAssistant() {
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  if (HIDE_ON.some((p) => pathname.startsWith(p))) return null;

  return (
    <div className="fixed right-4 bottom-4 z-50 flex flex-col items-end gap-3 sm:right-5 sm:bottom-5">
      {open && (
        <div className="animate-fade-in origin-bottom-right">
          <SiteAssistant className="shadow-lift w-[min(23rem,calc(100vw-2rem))]" />
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "Chiudi l'assistente" : "Apri l'assistente"}
        className="bg-accent text-accent-contrast hover:bg-accent-strong flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105 motion-reduce:transition-none motion-reduce:hover:scale-100"
      >
        {open ? <X size={22} aria-hidden /> : <MessageCircle size={24} aria-hidden />}
      </button>
    </div>
  );
}
