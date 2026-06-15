"use client";

import { useMemo, useState } from "react";
import ProductCard from "./ProductCard";
import { cn } from "@gmgroup/lib/utils";
import type { Product } from "@gmgroup/lib/types";

/**
 * Catalogo filtrabile (stato client): categoria + fase + forma. I filtri
 * "fase" e "forma" si applicano solo ai prodotti che hanno quella specifica
 * (i servizi restano visibili solo con categoria "Tutti" o "Servizi").
 */
type PhaseFilter = "all" | "monofase" | "trifase";
type ShapeFilter = "all" | "liscio" | "spiralato";

export default function Catalog({ products }: { products: Product[] }) {
  const categories = useMemo(
    () => ["Tutti", ...Array.from(new Set(products.map((p) => p.category)))],
    [products],
  );

  const [category, setCategory] = useState<string>("Tutti");
  const [phase, setPhase] = useState<PhaseFilter>("all");
  const [shape, setShape] = useState<ShapeFilter>("all");

  const filtered = useMemo(
    () =>
      products.filter((p) => {
        if (category !== "Tutti" && p.category !== category) return false;
        if (phase !== "all" && p.specs.phase !== phase) return false;
        if (shape !== "all" && p.specs.shape !== shape) return false;
        return true;
      }),
    [products, category, phase, shape],
  );

  return (
    <div>
      <div className="flex flex-col gap-4">
        {/* Categoria */}
        <FilterRow label="Categoria">
          {categories.map((c) => (
            <Chip key={c} active={category === c} onClick={() => setCategory(c)}>
              {c}
            </Chip>
          ))}
        </FilterRow>

        {/* Fase + forma su una riga sui grandi schermi */}
        <div className="flex flex-col gap-4 sm:flex-row sm:gap-10">
          <FilterRow label="Fase">
            <Chip active={phase === "all"} onClick={() => setPhase("all")}>
              Tutte
            </Chip>
            <Chip active={phase === "monofase"} onClick={() => setPhase("monofase")}>
              Monofase
            </Chip>
            <Chip active={phase === "trifase"} onClick={() => setPhase("trifase")}>
              Trifase
            </Chip>
          </FilterRow>

          <FilterRow label="Forma">
            <Chip active={shape === "all"} onClick={() => setShape("all")}>
              Tutte
            </Chip>
            <Chip active={shape === "liscio"} onClick={() => setShape("liscio")}>
              Liscio
            </Chip>
            <Chip active={shape === "spiralato"} onClick={() => setShape("spiralato")}>
              Spiralato
            </Chip>
          </FilterRow>
        </div>
      </div>

      {/* Griglia */}
      {filtered.length > 0 ? (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <p className="text-muted mt-12 text-center text-sm">
          Nessun prodotto con questi filtri. Prova ad allargare la selezione.
        </p>
      )}
    </div>
  );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-muted mr-1 text-xs font-medium tracking-widest uppercase">{label}</span>
      {children}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
        active
          ? "bg-accent text-accent-contrast border-accent"
          : "border-border text-muted hover:text-foreground hover:border-accent/50",
      )}
    >
      {children}
    </button>
  );
}
