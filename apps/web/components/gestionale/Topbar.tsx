"use client";

/**
 * Topbar del gestionale: titolo della sezione attiva, data demo statica e
 * pulsante per mostrare/nascondere il pannello dell'assistente AI.
 */
import { Sparkles, PanelRightClose, PanelRightOpen } from "lucide-react";
import { SECTION_TITLES, type SectionKey } from "./types";

export interface TopbarProps {
  section: SectionKey;
  assistantOpen: boolean;
  onToggleAssistant: () => void;
}

/** Data "oggi" della demo: statica per restare deterministica (no hydration). */
const OGGI = "28 giugno 2026";

export default function Topbar({ section, assistantOpen, onToggleAssistant }: TopbarProps) {
  return (
    <header className="border-border bg-surface flex h-16 shrink-0 items-center justify-between gap-4 border-b px-4 sm:px-6">
      <div className="min-w-0">
        <div className="text-muted text-xs">Gestionale</div>
        <h1 className="text-foreground truncate text-base font-semibold tracking-tight">
          {SECTION_TITLES[section]}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-muted hidden text-xs sm:inline">{OGGI}</span>
        <button
          type="button"
          onClick={onToggleAssistant}
          aria-pressed={assistantOpen}
          aria-label="Assistente AI"
          className="bg-accent text-accent-contrast hover:bg-accent-strong inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors"
        >
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">Assistente AI</span>
          {assistantOpen ? (
            <PanelRightClose className="h-4 w-4" />
          ) : (
            <PanelRightOpen className="h-4 w-4" />
          )}
        </button>
      </div>
    </header>
  );
}
