"use client";

import { useMemo, useState } from "react";
import ScrollReveal from "@gmgroup/ui/ScrollReveal";
import ProductCard from "./ProductCard";
import { cn } from "@gmgroup/lib/utils";
import type { Product } from "@gmgroup/lib/types";

/**
 * Catalogo filtrabile (stato client): categoria + fase + forma. I filtri
 * "fase" e "forma" si applicano solo ai prodotti che hanno quella specifica.
 * La barra dei filtri è "sticky" da desktop (sotto l'header h-16); su mobile
 * resta statica per non rubare viewport. La griglia si rivela una volta allo
 * scroll (ScrollReveal) e NON ri-anima al cambio filtro.
 */
type PhaseFilter = "all" | "monofase" | "trifase";
type ShapeFilter = "all" | "liscio" | "spiralato";

export default function Catalog({ products }: { products: Product[] }) {
  const categories = useMemo(
    () => ["Tutti", ...Array.from(new Set(products.map((p) => p.category)))],
    [products],
  );
  // Indice STABILE nel catalogo completo (per l'etichetta "N° NN").
  const indexOf = useMemo(
    () => new Map(products.map((p, i) => [p.id, i] as const)),
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

  const isFiltered = category !== "Tutti" || phase !== "all" || shape !== "all";
  const reset = () => {
    setCategory("Tutti");
    setPhase("all");
    setShape("all");
  };

  return (
    <div>
      {/* Barra filtri (sticky da lg). */}
      <div className="bg-background/85 lg:border-border lg:shadow-card lg:sticky lg:top-16 lg:z-20 lg:-mx-3 lg:rounded-2xl lg:border lg:px-4 lg:py-4 lg:backdrop-blur">
        <div className="flex flex-col gap-4">
          <FilterRow label="Categoria">
            {categories.map((c) => (
              <Chip key={c} active={category === c} onClick={() => setCategory(c)}>
                {c}
              </Chip>
            ))}
          </FilterRow>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-10">
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

          {/* Conteggio live + reset. */}
          <div className="flex items-center justify-between gap-4">
            <p className="text-muted text-sm tabular-nums">
              <span className="text-foreground font-semibold">{filtered.length}</span> di{" "}
              {products.length} cavi
            </p>
            {isFiltered && (
              <button
                type="button"
                onClick={reset}
                className="text-muted hover:text-foreground text-xs underline underline-offset-2 transition-colors"
              >
                Azzera filtri
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Griglia */}
      {filtered.length > 0 ? (
        <ScrollReveal
          stagger={0.06}
          y={20}
          className="mt-8 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3"
        >
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} index={indexOf.get(p.id)} />
          ))}
        </ScrollReveal>
      ) : (
        <p className="text-muted mt-12 text-center text-sm">
          Nessun cavo con questi filtri. Prova ad allargare la selezione.
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
        "ease-out-expo rounded-full border px-3.5 py-1.5 text-sm font-medium transition-[background-color,color,border-color,box-shadow] duration-(--duration-fast)",
        active
          ? "bg-accent text-accent-contrast border-accent shadow-glow"
          : "border-border text-muted hover:text-foreground hover:border-accent/50",
      )}
    >
      {children}
    </button>
  );
}
