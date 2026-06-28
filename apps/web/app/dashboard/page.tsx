import type { Metadata } from "next";
import DashboardApp from "@/components/dashboard/DashboardApp";

export const metadata: Metadata = {
  title: "Dashboard & telemetria",
  description:
    "Regia centralizzata: telemetria multi-sito e gestione contenuti — dati dimostrativi.",
};

/**
 * Dashboard centralizzata (servizio #3).
 * Area A — Telemetria multi-sito: KPI, grafici, top pagine.
 * Area B — Gestione contenuti: lista blocchi con editor simulato.
 */
export default function DashboardPage() {
  return <DashboardApp />;
}
