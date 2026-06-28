"use client";

/**
 * Sidebar di navigazione tra le sezioni del gestionale. Su desktop è una
 * colonna verticale; su mobile diventa una riga di tab scorrevole. Usa i token
 * (accent per la voce attiva) e ruoli/aria per l'accessibilità.
 */
import { LayoutDashboard, Users, FileText, FolderKanban, CalendarClock } from "lucide-react";
import type { ComponentType } from "react";
import { cn } from "@gmgroup/lib/utils";
import { SECTION_ORDER, SECTION_TITLES, type SectionKey } from "./types";

const ICONS: Record<SectionKey, ComponentType<{ className?: string }>> = {
  panoramica: LayoutDashboard,
  clienti: Users,
  ordini: FileText,
  progetti: FolderKanban,
  scadenze: CalendarClock,
};

export interface SidebarProps {
  active: SectionKey;
  onSelect: (section: SectionKey) => void;
}

export default function Sidebar({ active, onSelect }: SidebarProps) {
  return (
    <nav
      aria-label="Sezioni gestionale"
      className="border-border bg-surface flex shrink-0 gap-1 overflow-x-auto border-b p-2 lg:w-56 lg:flex-col lg:overflow-visible lg:border-r lg:border-b-0 lg:p-3"
    >
      {SECTION_ORDER.map((key) => {
        const Icon = ICONS[key];
        const isActive = key === active;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onSelect(key)}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors",
              isActive
                ? "bg-accent-soft text-accent-ink"
                : "text-muted hover:bg-surface-2 hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span>{SECTION_TITLES[key]}</span>
          </button>
        );
      })}
    </nav>
  );
}
