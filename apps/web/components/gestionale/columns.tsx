/**
 * Definizioni di colonna (per la DataTable generica) e badge di stato per le
 * quattro entità ERP. Separato dalla tabella così le colonne sono riusabili e
 * tipizzate per entità (niente `any`). I colori di STATO usano la palette
 * semantica (esiti positivo/attenzione/negativo) coerente con le altre demo;
 * i neutri e l'info usano i token del design system (surface/accent).
 */
import type { Cliente, Ordine, Progetto, Scadenza } from "@/data/erp-mock";
import type { ColumnDef } from "./types";
import { formatDate, formatEuro, formatNumber } from "./format";

type Tone = "positive" | "warning" | "danger" | "neutral" | "info";

const TONE: Record<Tone, string> = {
  positive: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300",
  // amber-800 (non 700): su bg-amber-500/15 il 700 restava 4.48:1, sotto AA (4.5:1).
  warning: "bg-amber-500/15 text-amber-800 dark:text-amber-300",
  danger: "bg-rose-500/12 text-rose-700 dark:text-rose-300",
  neutral: "bg-surface-2 text-muted",
  info: "bg-accent-soft text-accent-ink",
};

const DOT: Record<Tone, string> = {
  positive: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-rose-500",
  neutral: "bg-muted",
  info: "bg-accent",
};

/** Pillola di stato accessibile: pallino + etichetta. */
export function StatusPill({ tone, label }: { tone: Tone; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${TONE[tone]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${DOT[tone]}`} aria-hidden />
      <span className="capitalize">{label}</span>
    </span>
  );
}

const ORDINE_TONE: Record<Ordine["stato"], Tone> = {
  bozza: "neutral",
  inviato: "info",
  accettato: "positive",
  perso: "danger",
};
const PROGETTO_TONE: Record<Progetto["stato"], Tone> = {
  "in corso": "info",
  completato: "positive",
  "in ritardo": "danger",
  pianificato: "neutral",
  sospeso: "warning",
};
const SCADENZA_TONE: Record<Scadenza["stato"], Tone> = {
  "in scadenza": "warning",
  scaduta: "danger",
  pianificata: "neutral",
  completata: "positive",
};

const mono = "font-mono text-xs text-accent-ink";
const numCell = (n: number, suffix = "") => (
  <span className="font-mono tabular-nums">
    {formatNumber(n)}
    {suffix}
  </span>
);

export const clientiColumns: ColumnDef<Cliente>[] = [
  {
    key: "id",
    header: "Codice",
    sortValue: (c) => c.id,
    cell: (c) => <span className={mono}>{c.id}</span>,
  },
  {
    key: "nome",
    header: "Cliente",
    sortValue: (c) => c.nome,
    cell: (c) => (
      <div>
        <div className="text-foreground font-semibold">{c.nome}</div>
        <div className="text-muted text-xs">{c.referente}</div>
      </div>
    ),
  },
  {
    key: "citta",
    header: "Sede",
    sortValue: (c) => c.citta,
    cell: (c) => (
      <div>
        <div>{c.citta}</div>
        <div className="text-muted text-xs">{c.regione}</div>
      </div>
    ),
  },
  { key: "settore", header: "Settore", sortValue: (c) => c.settore, cell: (c) => c.settore },
  {
    key: "valore",
    header: "Valore",
    align: "right",
    sortValue: (c) => c.valore,
    cell: (c) => <span className="font-mono tabular-nums">{formatEuro(c.valore)}</span>,
  },
];

export const ordiniColumns: ColumnDef<Ordine>[] = [
  {
    key: "numero",
    header: "Numero",
    sortValue: (o) => o.numero,
    cell: (o) => <span className={mono}>{o.numero}</span>,
  },
  {
    key: "cliente",
    header: "Cliente",
    sortValue: (o) => o.cliente,
    cell: (o) => (
      <div>
        <div className="text-foreground font-semibold">{o.cliente}</div>
        <div className="text-muted text-xs">{o.citta}</div>
      </div>
    ),
  },
  {
    key: "importo",
    header: "Importo",
    align: "right",
    sortValue: (o) => o.importo,
    cell: (o) => <span className="font-mono tabular-nums">{formatEuro(o.importo)}</span>,
  },
  {
    key: "stato",
    header: "Stato",
    sortValue: (o) => o.stato,
    cell: (o) => <StatusPill tone={ORDINE_TONE[o.stato]} label={o.stato} />,
  },
  { key: "data", header: "Data", sortValue: (o) => o.data, cell: (o) => formatDate(o.data) },
];

export const progettiColumns: ColumnDef<Progetto>[] = [
  {
    key: "nome",
    header: "Progetto",
    sortValue: (p) => p.nome,
    cell: (p) => (
      <div>
        <div className="text-foreground font-semibold">{p.nome}</div>
        <div className="text-muted text-xs">{p.cliente}</div>
      </div>
    ),
  },
  { key: "tipo", header: "Tipo", sortValue: (p) => p.tipo, cell: (p) => p.tipo },
  {
    key: "stato",
    header: "Stato",
    sortValue: (p) => p.stato,
    cell: (p) => <StatusPill tone={PROGETTO_TONE[p.stato]} label={p.stato} />,
  },
  {
    key: "avanzamento",
    header: "Avanzamento",
    sortValue: (p) => p.avanzamento,
    cell: (p) => (
      <div className="flex items-center gap-2">
        <div className="bg-surface-2 h-1.5 w-20 overflow-hidden rounded-full">
          <div className="bg-accent h-full rounded-full" style={{ width: `${p.avanzamento}%` }} />
        </div>
        <span className="text-muted w-9 text-right font-mono text-xs tabular-nums">
          {p.avanzamento}%
        </span>
      </div>
    ),
  },
  {
    key: "potenzaKWp",
    header: "Potenza",
    align: "right",
    sortValue: (p) => p.potenzaKWp,
    cell: (p) => numCell(p.potenzaKWp, " kWp"),
  },
  {
    key: "scadenza",
    header: "Scadenza",
    sortValue: (p) => p.scadenza,
    cell: (p) => formatDate(p.scadenza),
  },
];

export const scadenzeColumns: ColumnDef<Scadenza>[] = [
  {
    key: "titolo",
    header: "Scadenza",
    sortValue: (s) => s.titolo,
    cell: (s) => (
      <div>
        <div className="text-foreground font-semibold">{s.titolo}</div>
        <div className="text-muted text-xs">{s.cliente}</div>
      </div>
    ),
  },
  { key: "tipo", header: "Tipo", sortValue: (s) => s.tipo, cell: (s) => s.tipo },
  {
    key: "stato",
    header: "Stato",
    sortValue: (s) => s.stato,
    cell: (s) => <StatusPill tone={SCADENZA_TONE[s.stato]} label={s.stato} />,
  },
  {
    key: "importo",
    header: "Importo",
    align: "right",
    sortValue: (s) => s.importo,
    cell: (s) =>
      s.importo > 0 ? (
        <span className="font-mono tabular-nums">{formatEuro(s.importo)}</span>
      ) : (
        <span className="text-muted">—</span>
      ),
  },
  { key: "data", header: "Data", sortValue: (s) => s.data, cell: (s) => formatDate(s.data) },
];
