"use client";

/**
 * DataTable<T> — tabella generica, ordinabile e filtrabile, riusabile da tutte
 * le sezioni. Markup semantico (`<table>/<th scope>`), header cliccabili per
 * l'ordinamento, ricerca testuale interna e supporto all'evidenziazione delle
 * righe (per il filtro dell'assistente AI). Tipizzata con generics: niente `any`.
 *
 * Props raggruppate in `DataTableProps<T>` (un solo parametro tipizzato); il
 * rendering di header/celle/righe è estratto in piccoli helper locali per
 * tenere bassa la complessità del componente principale.
 */
import { useMemo, useState, type ReactNode } from "react";
import { Search, ArrowUp, ArrowDown, ChevronsUpDown } from "lucide-react";
import { cn } from "@gmgroup/lib/utils";
import type { ColumnAlign, ColumnDef } from "./types";

export interface DataTableProps<T> {
  rows: T[];
  columns: ColumnDef<T>[];
  getRowId: (row: T) => string;
  onRowClick?: (row: T) => void;
  /** Accessor del testo usato dalla ricerca interna. */
  searchAccessor?: (row: T) => string;
  /** Id da evidenziare (righe che soddisfano il filtro dell'assistente). */
  highlightIds?: Set<string>;
  /** Ordinamento iniziale (chiave colonna + direzione). */
  initialSort?: { key: string; dir: "asc" | "desc" };
  searchPlaceholder?: string;
  emptyLabel?: string;
}

const ALIGN: Record<ColumnAlign, string> = {
  left: "text-left",
  right: "text-right",
  center: "text-center",
};

function alignClass(align: ColumnAlign | undefined): string {
  return ALIGN[align ?? "left"];
}

/** Casella di ricerca testuale interna (visibile solo se c'è un `searchAccessor`). */
function SearchBox({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative max-w-xs">
      <Search
        className="text-muted pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
        aria-hidden
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Filtra la tabella"
        className="border-border bg-surface focus:border-accent focus:ring-accent-ring w-full rounded-lg border py-2 pr-3 pl-9 text-sm outline-none focus:ring-2"
      />
    </div>
  );
}

/** Icona di stato ordinamento per una colonna (neutra / asc / desc). */
function SortIcon({ active, dir }: { active: boolean; dir: "asc" | "desc" }): ReactNode {
  if (!active) return <ChevronsUpDown className="h-3 w-3 opacity-40" aria-hidden />;
  return dir === "asc" ? (
    <ArrowUp className="h-3 w-3" aria-hidden />
  ) : (
    <ArrowDown className="h-3 w-3" aria-hidden />
  );
}

/** Cella di intestazione: testo semplice o bottone ordinabile con icona. */
function HeaderCell<T>({
  col,
  sortKey,
  sortDir,
  onSort,
}: {
  col: ColumnDef<T>;
  sortKey: string | null;
  sortDir: "asc" | "desc";
  onSort: (key: string) => void;
}) {
  return (
    <th
      scope="col"
      className={cn(
        "text-muted px-4 py-3 text-xs font-semibold tracking-wide",
        alignClass(col.align),
      )}
    >
      {col.sortValue ? (
        <button
          type="button"
          onClick={() => onSort(col.key)}
          aria-label={`Ordina per ${col.header}`}
          className={cn(
            "hover:text-foreground inline-flex items-center gap-1 transition-colors",
            col.align === "right" && "flex-row-reverse",
          )}
        >
          {col.header}
          <SortIcon active={sortKey === col.key} dir={sortDir} />
        </button>
      ) : (
        col.header
      )}
    </th>
  );
}

/** Riga dati: click opzionale + evidenziazione (righe filtrate dall'assistente). */
function DataRow<T>({
  row,
  columns,
  getRowId,
  onRowClick,
  highlighted,
}: {
  row: T;
  columns: ColumnDef<T>[];
  getRowId: (row: T) => string;
  onRowClick?: (row: T) => void;
  highlighted: boolean;
}) {
  return (
    <tr
      onClick={onRowClick ? () => onRowClick(row) : undefined}
      className={cn(
        "transition-colors",
        onRowClick && "hover:bg-surface-2 cursor-pointer",
        highlighted && "bg-accent-soft",
      )}
    >
      {columns.map((col) => (
        <td
          key={col.key}
          className={cn("text-foreground px-4 py-3 align-middle", alignClass(col.align))}
        >
          {col.cell(row)}
        </td>
      ))}
    </tr>
  );
}

export default function DataTable<T>(props: DataTableProps<T>) {
  const {
    rows,
    columns,
    getRowId,
    onRowClick,
    searchAccessor,
    highlightIds,
    initialSort,
    searchPlaceholder = "Cerca…",
    emptyLabel = "Nessun risultato.",
  } = props;

  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(initialSort?.key ?? null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">(initialSort?.dir ?? "asc");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || !searchAccessor) return rows;
    return rows.filter((r) => searchAccessor(r).toLowerCase().includes(q));
  }, [rows, query, searchAccessor]);

  const sorted = useMemo(() => {
    const col = columns.find((c) => c.key === sortKey);
    if (!col?.sortValue) return filtered;
    const dir = sortDir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const va = col.sortValue!(a);
      const vb = col.sortValue!(b);
      if (typeof va === "number" && typeof vb === "number") return (va - vb) * dir;
      return String(va).localeCompare(String(vb), "it") * dir;
    });
  }, [filtered, columns, sortKey, sortDir]);

  const toggleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  return (
    <div className="space-y-3">
      {searchAccessor && (
        <SearchBox value={query} onChange={setQuery} placeholder={searchPlaceholder} />
      )}

      <div className="border-border overflow-x-auto rounded-xl border">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-border bg-surface-2 border-b">
              {columns.map((col) => (
                <HeaderCell
                  key={col.key}
                  col={col}
                  sortKey={sortKey}
                  sortDir={sortDir}
                  onSort={toggleSort}
                />
              ))}
            </tr>
          </thead>
          <tbody className="divide-border divide-y">
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-muted px-4 py-10 text-center">
                  {emptyLabel}
                </td>
              </tr>
            ) : (
              sorted.map((row) => {
                const id = getRowId(row);
                return (
                  <DataRow
                    key={id}
                    row={row}
                    columns={columns}
                    getRowId={getRowId}
                    onRowClick={onRowClick}
                    highlighted={highlightIds?.has(id) ?? false}
                  />
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
