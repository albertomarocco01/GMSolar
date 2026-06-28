/**
 * DashboardTopbar — barra superiore dell'area admin con breadcrumb, toggle
 * menu mobile e avatar utente. Accent-ink per le icone (leggibile su chiaro/scuro).
 */
"use client";

import { LayoutDashboard, Menu } from "lucide-react";
import type { DashboardTab } from "./DashboardSidebar";

type Props = {
  tab: DashboardTab;
  onMenuToggle: () => void;
};

const TAB_LABELS: Record<DashboardTab, string> = {
  telemetria: "Telemetria multi-sito",
  contenuti: "Gestione contenuti",
};

export default function DashboardTopbar({ tab, onMenuToggle }: Props) {
  return (
    <header className="border-border bg-surface flex h-14 shrink-0 items-center gap-4 border-b px-4 lg:px-6">
      {/* Hamburger mobile */}
      <button
        className="text-muted hover:bg-surface-2 hover:text-foreground rounded p-1.5 lg:hidden"
        onClick={onMenuToggle}
        aria-label="Apri menu navigazione"
        aria-haspopup="true"
      >
        <Menu size={20} aria-hidden />
      </button>

      {/* Breadcrumb */}
      <nav aria-label="Percorso di navigazione" className="flex items-center gap-2">
        <LayoutDashboard size={16} className="text-accent-ink" aria-hidden />
        <span className="text-muted text-sm" aria-hidden>
          /
        </span>
        <span className="text-foreground text-sm font-medium">{TAB_LABELS[tab]}</span>
      </nav>

      {/* Avatar / contesto utente */}
      <div className="ml-auto flex items-center gap-3">
        <span className="text-muted hidden text-xs sm:block">Regia unica multi-sito</span>
        <div
          className="bg-accent-soft text-accent-ink flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold"
          aria-label="Utente demo"
        >
          VS
        </div>
      </div>
    </header>
  );
}
