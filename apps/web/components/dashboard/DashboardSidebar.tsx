/**
 * DashboardSidebar — sidebar di navigazione admin. Su mobile è un drawer
 * fisso che scorre sopra il contenuto (z-50); su desktop è inline nel flex layout.
 * Il bottone di chiusura è accessibile e la navigazione usa aria-current.
 */
"use client";

import { BarChart2, FileText, X } from "lucide-react";

export type DashboardTab = "telemetria" | "contenuti";

type NavItem = {
  tab: DashboardTab;
  label: string;
  icon: React.ReactNode;
  description: string;
};

const NAV_ITEMS: NavItem[] = [
  {
    tab: "telemetria",
    label: "Telemetria",
    icon: <BarChart2 size={18} aria-hidden />,
    description: "Metriche multi-sito",
  },
  {
    tab: "contenuti",
    label: "Contenuti",
    icon: <FileText size={18} aria-hidden />,
    description: "Blocchi e pagine",
  },
];

type Props = {
  open: boolean;
  onClose: () => void;
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
};

export default function DashboardSidebar({ open, onClose, activeTab, onTabChange }: Props) {
  return (
    <>
      {/* Overlay mobile */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={[
          // Base: struttura e sfondo
          "border-border bg-surface flex flex-col border-r",
          // Mobile: drawer fisso che parte dall'alto (copre il site header su mobile)
          "fixed inset-y-0 left-0 z-50 w-64",
          // Transizione apertura/chiusura (ridotta con prefers-reduced-motion via base.css)
          "ease-out-expo transition-transform duration-(--duration-base)",
          open ? "translate-x-0" : "-translate-x-full",
          // Desktop: statico nel flex layout, sempre visibile
          "lg:static lg:z-auto lg:translate-x-0",
        ].join(" ")}
        aria-label="Navigazione dashboard"
      >
        {/* Intestazione sidebar */}
        <div className="border-border flex items-center justify-between border-b p-5">
          <div>
            <p className="text-muted text-[10px] font-bold tracking-widest uppercase">
              Vetrina Servizi
            </p>
            <p className="text-foreground mt-0.5 text-sm font-semibold">Dashboard</p>
          </div>
          <button
            className="text-muted hover:bg-surface-2 hover:text-foreground rounded p-1.5 lg:hidden"
            onClick={onClose}
            aria-label="Chiudi menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Voci di navigazione */}
        <nav className="flex-1 p-4">
          <ul className="space-y-1" role="list">
            {NAV_ITEMS.map(({ tab, label, icon, description }) => (
              <li key={tab}>
                <button
                  onClick={() => onTabChange(tab)}
                  aria-current={activeTab === tab ? "page" : undefined}
                  className={[
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left",
                    "text-sm font-medium transition-colors",
                    activeTab === tab
                      ? "bg-accent-soft text-accent-ink"
                      : "text-muted hover:bg-surface-2 hover:text-foreground",
                  ].join(" ")}
                >
                  {icon}
                  <span>
                    <span className="block">{label}</span>
                    <span className="block text-[11px] font-normal">{description}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Nota demo */}
        <div className="border-border border-t p-4">
          <p className="text-muted text-center text-[11px]">Dati dimostrativi</p>
        </div>
      </aside>
    </>
  );
}
