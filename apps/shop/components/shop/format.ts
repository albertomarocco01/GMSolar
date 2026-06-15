/**
 * Helper di formattazione condivisi nella sezione Shop.
 */
import type { Product } from "@gmgroup/lib/types";

const EUR = new Intl.NumberFormat("it-IT", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

/** Prezzo formattato; i servizi senza prezzo fisso → "Su richiesta". */
export function formatPrice(price: number | null): string {
  return price === null ? "Su richiesta" : EUR.format(price);
}

/**
 * `length` e `current` non sono nel tipo condiviso `ProductSpecs` (zona
 * read-only): li leggiamo come estensione locale opzionale dal JSON, senza
 * toccare il pacchetto condiviso.
 */
type ExtendedSpecs = Product["specs"] & { length?: string; current?: string };

/** Chip di specifiche brevi da mostrare su card/PDP (salta i campi vuoti). */
export function specChips(product: Product): string[] {
  const s = product.specs as ExtendedSpecs;
  const chips: string[] = [];
  if (s.mode) chips.push(s.mode);
  if (s.connector) chips.push(`Tipo ${s.connector.replace(/^Tipo\s*/i, "")}`);
  if (s.plug && s.plug !== s.connector) chips.push(s.plug);
  if (s.phase) chips.push(s.phase);
  if (s.shape) chips.push(s.shape);
  if (s.current) chips.push(s.current);
  if (s.length) chips.push(s.length);
  if (s.coverage) chips.push(s.coverage);
  return chips;
}
