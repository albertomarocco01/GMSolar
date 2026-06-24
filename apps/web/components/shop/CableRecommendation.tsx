"use client";

/**
 * CABLE-FINDER — presentazione del consiglio (generative UI).
 *
 * Resa "ricca" del risultato del finder, usata sia dal percorso AI (evento
 * NDJSON `products`) sia dal wizard deterministico: una CARD CONSIGLIATA grande
 * + una TABELLA CONFRONTO compatta dei cavi proposti, con la riga consigliata
 * evidenziata. Tutti i contenuti (badge, bullet «perché», specifiche) sono
 * DERIVATI dai dati reali (`MatchContext` + `product.specs`): se un campo manca,
 * l'elemento viene omesso — niente claim inventati.
 */
import Link from "next/link";
import Badge from "@gmgroup/ui/Badge";
import Card from "@gmgroup/ui/Card";
import ScrollReveal from "@gmgroup/ui/ScrollReveal";
import { cn } from "@gmgroup/lib/utils";
import type { Product } from "@gmgroup/lib/types";
import ProductImage from "./ProductImage";
import AddToCartButton from "./cart/AddToCartButton";
import { formatPrice } from "./format";
import type { Phase } from "./cable-matcher";

/** Contesto del match per il "perché questo" (mirror del tipo lato server). */
export type MatchContext = {
  use: string;
  phase?: Phase | null;
  /** Auto riconosciuta da cui è stata dedotta la fase, es. "Tesla Model 3". */
  car?: string | null;
  relaxed: boolean;
};

/**
 * `length` e `current` non sono nel tipo condiviso `ProductSpecs` (zona
 * read-only): li leggiamo come estensione locale opzionale, come in `format.ts`.
 */
type ExtendedSpecs = Product["specs"] & { length?: string; current?: string };

/** Etichetta breve di una forma del connettore "Tipo X" (toglie il prefisso). */
function connectorLabel(connector?: string): string | null {
  if (!connector) return null;
  return `Tipo ${connector.replace(/^Tipo\s*/i, "")}`;
}

/** Capitalizza la prima lettera (per fase/forma minuscole nel JSON). */
function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Badge tecnici per la card consigliata, in ordine di rilevanza.
 * Solo campi presenti: best seller, Modo, Tipo connettore, fase, forma.
 */
function cardBadges(product: Product): { label: string; highlight: boolean }[] {
  const s = product.specs as ExtendedSpecs;
  const out: { label: string; highlight: boolean }[] = [];
  if (product.bestSeller) out.push({ label: "Best seller", highlight: true });
  if (s.mode) out.push({ label: s.mode, highlight: false });
  const t2 = connectorLabel(s.connector);
  if (t2) out.push({ label: t2, highlight: false });
  if (s.phase) out.push({ label: cap(s.phase), highlight: false });
  if (s.shape) out.push({ label: cap(s.shape), highlight: false });
  return out;
}

/**
 * Bullet «perché questo» (max 3), tutti derivati da dati reali: compatibilità
 * auto/fase dal contesto, uso, forma e scheda tecnica. Niente marketing inventato.
 */
function buildReasons(product: Product, context?: MatchContext): string[] {
  const s = product.specs as ExtendedSpecs;
  const out: string[] = [];

  if (context?.phase) {
    out.push(
      context.car
        ? `Compatibile con la tua ${context.car} (ricarica ${context.phase})`
        : `Ottimizzato per la ricarica ${context.phase}`,
    );
  }
  if (context?.use) out.push(`Pensato per: ${context.use}`);
  if (s.shape === "spiralato") out.push("Spiralato: resta compatto e non tocca terra");
  else if (s.shape === "liscio") out.push("Liscio: leggero e facile da riporre");

  const tech = [s.mode, s.current, s.length].filter(Boolean).join(" · ");
  if (tech && out.length < 3) out.push(tech);

  return out.slice(0, 3);
}

/** Descrittore compatto di un cavo per la tabella confronto (da dati reali). */
function cableSummary(product: Product): { shape: string; phase: string; length: string } {
  const s = product.specs as ExtendedSpecs;
  return {
    shape: s.shape ? cap(s.shape) : "—",
    phase: s.phase ? cap(s.phase) : "—",
    length: s.length ?? "—",
  };
}

export default function CableRecommendation({
  products,
  context,
}: {
  products: Product[];
  context?: MatchContext;
}) {
  if (products.length === 0) return null;

  const recommended = products[0];
  const compare = products.slice(0, 3);
  const reasons = buildReasons(recommended, context);
  const badges = cardBadges(recommended);

  // Micro-motion on-mount via il primitive condiviso (fade+rise, una volta,
  // già reduced-motion safe). `stagger` anima i figli diretti in cascata.
  return (
    <ScrollReveal className="w-full space-y-4" y={12} stagger={0.08} start="top 95%">
      <RecommendedCard
        product={recommended}
        badges={badges}
        reasons={reasons}
        relaxed={context?.relaxed ?? false}
      />
      {compare.length > 1 && <ComparisonTable products={compare} recommendedId={recommended.id} />}
    </ScrollReveal>
  );
}

/* ---------------- Card consigliata (grande) ---------------- */
function RecommendedCard({
  product,
  badges,
  reasons,
  relaxed,
}: {
  product: Product;
  badges: { label: string; highlight: boolean }[];
  reasons: string[];
  relaxed: boolean;
}) {
  return (
    <Card className="overflow-hidden">
      <div className="grid gap-0 sm:grid-cols-[9rem_1fr]">
        {/* Immagine prodotto (placeholder stilizzato sul brand) */}
        <Link
          href={`/shop/${product.id}`}
          aria-label={product.name}
          className="block shrink-0"
        >
          <ProductImage product={product} className="h-36 w-full sm:h-full" />
        </Link>

        <div className="min-w-0 p-5">
          <div className="mb-2 flex flex-wrap items-center gap-1.5">
            <span className="text-accent-ink text-[0.65rem] font-semibold tracking-widest uppercase">
              Consigliato
            </span>
            {relaxed && (
              <span className="bg-surface-2 text-muted rounded-full px-2 py-0.5 text-[0.7rem]">
                alternativa più vicina
              </span>
            )}
          </div>

          <Link href={`/shop/${product.id}`} className="hover:text-accent-ink transition-colors">
            <h4 className="font-display text-base leading-snug font-semibold text-balance">
              {product.name}
            </h4>
          </Link>

          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {badges.map((b) => (
              <Badge key={b.label} variant={b.highlight ? "accent" : "neutral"}>
                {b.label}
              </Badge>
            ))}
          </div>

          {reasons.length > 0 && (
            <ul className="mt-4 space-y-1.5">
              {reasons.map((r) => (
                <li key={r} className="text-foreground/90 flex items-start gap-2 text-sm">
                  <CheckIcon className="text-accent-ink mt-0.5 h-4 w-4 shrink-0" />
                  <span className="leading-snug">{r}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xl font-bold tracking-tight">{formatPrice(product.price)}</span>
            <AddToCartButton product={product} size="sm" />
          </div>
        </div>
      </div>
    </Card>
  );
}

/* ---------------- Tabella confronto (compatta) ---------------- */
function ComparisonTable({
  products,
  recommendedId,
}: {
  products: Product[];
  recommendedId: string;
}) {
  return (
    <Card className="overflow-hidden">
      <div className="border-border bg-surface-2/50 border-b px-4 py-2.5">
        <h5 className="text-sm font-semibold">Confronto rapido</h5>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <caption className="sr-only">
            Confronto dei cavi proposti: tipo, fase, lunghezza e prezzo
          </caption>
          <thead className="text-muted text-xs tracking-wider uppercase">
            <tr className="border-border border-b">
              <th scope="col" className="px-4 py-2.5 font-medium">
                Cavo
              </th>
              <th scope="col" className="px-4 py-2.5 font-medium">
                Fase
              </th>
              <th scope="col" className="px-4 py-2.5 font-medium">
                Lungh.
              </th>
              <th scope="col" className="px-4 py-2.5 text-right font-medium">
                Prezzo
              </th>
            </tr>
          </thead>
          <tbody className="divide-border divide-y">
            {products.map((p) => {
              const isRec = p.id === recommendedId;
              const s = cableSummary(p);
              return (
                <tr key={p.id} className={isRec ? "bg-accent-soft/50" : undefined}>
                  <td className="px-4 py-2.5">
                    <Link
                      href={`/shop/${p.id}`}
                      className="hover:text-accent-ink flex items-center gap-1.5 transition-colors"
                    >
                      {isRec && <CheckIcon className="text-accent-ink h-3.5 w-3.5 shrink-0" />}
                      <span className={cn("truncate", isRec && "text-accent-ink font-semibold")}>
                        {s.shape}
                      </span>
                    </Link>
                  </td>
                  <td className="text-muted px-4 py-2.5">{s.phase}</td>
                  <td className="text-muted px-4 py-2.5">{s.length}</td>
                  <td className="px-4 py-2.5 text-right font-medium">{formatPrice(p.price)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="m5 13 4 4L19 7"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
