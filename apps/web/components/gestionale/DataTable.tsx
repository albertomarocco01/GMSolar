"use client";

/**
 * DataTable<T> — tabella generica, ordinabile e filtrabile, riusabile da tutte
 * le sezioni. Markup semantico (`<table>/<th scope>`), header cliccabili per
 * l'ordinamento, ricerca testuale interna e supporto all'evidenziazione delle
 * righe (per il filtro dell'assistente AI). Tipizzata con generics: niente `any`.
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

export default function DataTable<T>({
  rows,
  columns,
  getRowId,
  onRowClick,
  searchAccessor,
  highlightIds,
  initialSort,
  searchPlaceholder = "Cerca…",
  emptyLabel = "Nessun risultato.",
}: DataTableProps<T>) {
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

  const sortIcon = (key: string): ReactNode => {
    if (sortKey !== key) return <ChevronsUpDown className="h-3 w-3 opacity-40" aria-hidden />;
    return sortDir === "asc" ? (
      <ArrowUp className="h-3 w-3" aria-hidden />
    ) : (
      <ArrowDown className="h-3 w-3" aria-hidden />
    );
  };

  return (
    <div className="space-y-3">
      {searchAccessor && (
        <div className="relative max-w-xs">
          <Search
            className="text-muted pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label="Filtra la tabella"
            className="border-border bg-surface focus:border-accent focus:ring-accent-ring w-full rounded-lg border py-2 pr-3 pl-9 text-sm outline-none focus:ring-2"
          />
        </div>
      )}

      <div className="border-border overflow-x-auto rounded-xl border">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-border bg-surface-2 border-b">
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={cn(
                    "text-muted px-4 py-3 text-xs font-semibold tracking-wide",
                    ALIGN[col.align ?? "left"],
                  )}
                >
                  {col.sortValue ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(col.key)}
                      aria-label={`Ordina per ${col.header}`}
                      className={cn(
                        "hover:text-foreground inline-flex items-center gap-1 transition-colors",
                        col.align === "right" && "flex-row-reverse",
                      )}
                    >
                      {col.header}
                      {sortIcon(col.key)}
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
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
                const highlighted = highlightIds?.has(id) ?? false;
                return (
                  <tr
                    key={id}
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
                        className={cn(
                          "text-foreground px-4 py-3 align-middle",
                          ALIGN[col.align ?? "left"],
                        )}
                      >
                        {col.cell(row)}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
