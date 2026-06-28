"use client";

/**
 * GestionaleApp — orchestratore della demo. Compone Topbar + Sidebar + vista
 * di sezione + AssistantPanel + DetailDrawer e tiene lo stato condiviso:
 * sezione attiva, filtro applicato dall'assistente, riga selezionata.
 *
 * Quando l'assistente risponde con entità + filtro, la app passa alla sezione
 * giusta e filtra la tabella mostrata (con banner "filtro attivo" rimovibile).
 */
import { useMemo, useState } from "react";
import { Filter, X } from "lucide-react";
import {
  clienti,
  ordini,
  progetti,
  scadenze,
  type Cliente,
  type Ordine,
  type Progetto,
  type Scadenza,
} from "@/data/erp-mock";
import {
  filterClienti,
  filterOrdini,
  filterProgetti,
  filterScadenze,
  describeFilter,
} from "./filters";
import { clientiColumns, ordiniColumns, progettiColumns, scadenzeColumns } from "./columns";
import { clienteDetail, ordineDetail, progettoDetail, scadenzaDetail } from "./details";
import {
  ENTITY_LABELS,
  type AssistantResult,
  type GestionaleFilter,
  type SectionKey,
} from "./types";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import OverviewView from "./OverviewView";
import DataTable from "./DataTable";
import DetailDrawer from "./DetailDrawer";
import AssistantPanel from "./AssistantPanel";

type Detail =
  | { entity: "clienti"; row: Cliente }
  | { entity: "ordini"; row: Ordine }
  | { entity: "progetti"; row: Progetto }
  | { entity: "scadenze"; row: Scadenza };

const searchCliente = (c: Cliente) =>
  `${c.id} ${c.nome} ${c.referente} ${c.citta} ${c.regione} ${c.settore}`;
const searchOrdine = (o: Ordine) => `${o.numero} ${o.cliente} ${o.citta} ${o.stato}`;
const searchProgetto = (p: Progetto) => `${p.nome} ${p.cliente} ${p.citta} ${p.tipo} ${p.stato}`;
const searchScadenza = (s: Scadenza) => `${s.titolo} ${s.cliente} ${s.citta} ${s.tipo} ${s.stato}`;

export default function GestionaleApp() {
  const [section, setSection] = useState<SectionKey>("panoramica");
  const [assistantOpen, setAssistantOpen] = useState(true);
  const [filter, setFilter] = useState<GestionaleFilter | null>(null);
  const [detail, setDetail] = useState<Detail | null>(null);

  // Il filtro vale solo sulla sezione corrispondente all'entità interrogata.
  const activeFilter = filter && filter.entity === section ? filter : null;

  const handleResult = (result: AssistantResult) => {
    if (result.ok && result.entity && result.filter) {
      setSection(result.entity);
      setFilter(result.filter);
    }
  };

  const detailFields = useMemo(() => {
    if (!detail) return [];
    switch (detail.entity) {
      case "clienti":
        return clienteDetail(detail.row);
      case "ordini":
        return ordineDetail(detail.row);
      case "progetti":
        return progettoDetail(detail.row);
      case "scadenze":
        return scadenzaDetail(detail.row);
    }
  }, [detail]);

  const detailTitle = detail
    ? detail.entity === "clienti"
      ? detail.row.nome
      : detail.entity === "ordini"
        ? detail.row.numero
        : detail.entity === "progetti"
          ? detail.row.nome
          : detail.row.titolo
    : "";

  function renderTable() {
    switch (section) {
      case "clienti":
        return (
          <DataTable<Cliente>
            rows={activeFilter ? filterClienti(activeFilter) : clienti}
            columns={clientiColumns}
            getRowId={(c) => c.id}
            onRowClick={(row) => setDetail({ entity: "clienti", row })}
            searchAccessor={searchCliente}
            initialSort={{ key: "valore", dir: "desc" }}
          />
        );
      case "ordini":
        return (
          <DataTable<Ordine>
            rows={activeFilter ? filterOrdini(activeFilter) : ordini}
            columns={ordiniColumns}
            getRowId={(o) => o.id}
            onRowClick={(row) => setDetail({ entity: "ordini", row })}
            searchAccessor={searchOrdine}
            initialSort={{ key: "data", dir: "desc" }}
          />
        );
      case "progetti":
        return (
          <DataTable<Progetto>
            rows={activeFilter ? filterProgetti(activeFilter) : progetti}
            columns={progettiColumns}
            getRowId={(p) => p.id}
            onRowClick={(row) => setDetail({ entity: "progetti", row })}
            searchAccessor={searchProgetto}
            initialSort={{ key: "scadenza", dir: "asc" }}
          />
        );
      case "scadenze":
        return (
          <DataTable<Scadenza>
            rows={activeFilter ? filterScadenze(activeFilter) : scadenze}
            columns={scadenzeColumns}
            getRowId={(s) => s.id}
            onRowClick={(row) => setDetail({ entity: "scadenze", row })}
            searchAccessor={searchScadenza}
            initialSort={{ key: "data", dir: "asc" }}
          />
        );
      case "panoramica":
        return <OverviewView />;
    }
  }

  return (
    <div className="border-border shadow-lift bg-background flex h-[82vh] min-h-[640px] flex-col overflow-hidden rounded-2xl border">
      <Topbar
        section={section}
        assistantOpen={assistantOpen}
        onToggleAssistant={() => setAssistantOpen((v) => !v)}
      />

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <Sidebar active={section} onSelect={setSection} />

        <main className="min-w-0 flex-1 overflow-y-auto p-4 sm:p-6">
          {activeFilter && section !== "panoramica" && (
            <div className="bg-accent-soft text-accent-ink mb-4 flex items-center justify-between gap-3 rounded-lg px-4 py-2.5 text-sm">
              <span className="flex items-center gap-2">
                <Filter className="h-4 w-4 shrink-0" />
                <span>
                  Filtro assistente su {ENTITY_LABELS[activeFilter.entity].plurale}
                  {describeFilter(activeFilter) ? `: ${describeFilter(activeFilter)}` : ""}
                </span>
              </span>
              <button
                type="button"
                onClick={() => setFilter(null)}
                className="hover:bg-accent/20 inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium transition-colors"
              >
                <X className="h-3.5 w-3.5" />
                Rimuovi
              </button>
            </div>
          )}
          {renderTable()}
        </main>

        {assistantOpen && (
          <AssistantPanel onResult={handleResult} onClose={() => setAssistantOpen(false)} />
        )}
      </div>

      <DetailDrawer
        open={detail !== null}
        title={detailTitle}
        eyebrow={detail ? ENTITY_LABELS[detail.entity].singolare : undefined}
        fields={detailFields}
        onClose={() => setDetail(null)}
      />
    </div>
  );
}
