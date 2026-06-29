"use client";

/**
 * Panoramica: griglia di KPI (AnimatedCounter) + grafici Recharts. È la
 * landing della webapp gestionale. Legge gli aggregati deterministici da
 * erp-mock; nessuno stato locale.
 */
import { Users, Wallet, FolderKanban, CalendarClock, TrendingUp, Zap } from "lucide-react";
import { getKpi } from "@/data/erp-mock";
import KpiCard from "./KpiCard";
import OverviewChart from "./OverviewChart";

export default function OverviewView() {
  const k = getKpi();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard label="Clienti" value={k.clientiTotali} icon={Users} hint="Anagrafica attiva" />
        <KpiCard
          label="Pipeline aperta"
          value={k.valorePipeline}
          prefix="€ "
          icon={Wallet}
          hint={`${k.ordiniAperti} preventivi aperti`}
        />
        <KpiCard
          label="Acquisito"
          value={k.valoreAcquisito}
          prefix="€ "
          icon={TrendingUp}
          hint={`${k.ordiniAccettati} ordini vinti`}
        />
        <KpiCard
          label="Conversione"
          value={k.tassoConversione}
          suffix="%"
          icon={TrendingUp}
          hint="Accettati su chiusi"
        />
        <KpiCard
          label="Progetti in corso"
          value={k.progettiInCorso}
          icon={FolderKanban}
          hint={`${k.progettiInRitardo} in ritardo`}
        />
        <KpiCard
          label="Da incassare"
          value={k.importoDaIncassare}
          prefix="€ "
          icon={CalendarClock}
          hint={`${k.scadenzeAperte} scadenze aperte`}
        />
      </div>

      <div className="border-border bg-surface flex items-center gap-3 rounded-xl border p-4">
        <span className="bg-accent-soft text-accent-ink rounded-lg p-2">
          <Zap className="h-5 w-5" />
        </span>
        <p className="text-muted text-sm">
          Potenza totale in portafoglio progetti:{" "}
          <span className="text-foreground font-semibold">
            {k.potenzaTotaleKWp.toLocaleString("it-IT", { useGrouping: "always" })} kWp
          </span>
          . Usa l&apos;<span className="text-accent-ink font-medium">Assistente AI</span> per
          filtrare i dati in linguaggio naturale.
        </p>
      </div>

      <OverviewChart />
    </div>
  );
}
