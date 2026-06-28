/**
 * DashboardApp — shell principale della Dashboard centralizzata GM Group.
 * Gestisce stato globale (filtri, tab attiva, sidebar) e coordina le due aree:
 * A) Telemetria multi-sito  B) Gestione contenuti.
 * Componente client: tutta la logica interattiva è qui.
 */
"use client";

import { useState } from "react";
import type { RangeKey, SiteFilter } from "@/data/telemetry";
import ContenutiSection from "./ContenutiSection";
import DashboardSidebar, { type DashboardTab } from "./DashboardSidebar";
import DashboardTopbar from "./DashboardTopbar";
import TelemetriaSection from "./TelemetriaSection";

export default function DashboardApp() {
  const [siteFilter, setSiteFilter] = useState<SiteFilter>("all");
  const [range, setRange] = useState<RangeKey>(30);
  const [tab, setTab] = useState<DashboardTab>("telemetria");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function handleTabChange(t: DashboardTab) {
    setTab(t);
    setSidebarOpen(false); // chiudi il drawer mobile dopo la navigazione
  }

  return (
    /*
     * Layout admin: flex row.
     * Mobile: sidebar è un drawer fisso fuori dal flusso → solo l'area destra è visibile.
     * Desktop (lg+): sidebar è static e occupa 16rem (w-64), il resto è flex-1.
     */
    <div className="bg-background flex min-h-[calc(100vh-4rem)]">
      <DashboardSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeTab={tab}
        onTabChange={handleTabChange}
      />

      {/* Area principale: topbar + contenuto scrollabile */}
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopbar tab={tab} onMenuToggle={() => setSidebarOpen((v) => !v)} />

        <main
          id="dashboard-main"
          className="flex-1 overflow-auto p-4 md:p-6"
          tabIndex={-1}
          aria-label="Contenuto dashboard"
        >
          {tab === "telemetria" ? (
            <TelemetriaSection
              siteFilter={siteFilter}
              range={range}
              onSiteFilterChange={setSiteFilter}
              onRangeChange={setRange}
            />
          ) : (
            <ContenutiSection />
          )}
        </main>
      </div>
    </div>
  );
}
