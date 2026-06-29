/**
 * Helper di formattazione (euro, numeri, date) per la demo Gestionale.
 * Locale fisso it-IT per coerenza con il resto del sito. Le date sono stringhe
 * ISO "YYYY-MM-DD": le formattiamo senza `new Date()` per evitare scostamenti
 * di fuso e mismatch di idratazione SSR/CSR.
 */
// useGrouping "always": il default "auto" per it-IT NON raggruppa i numeri a 4
// cifre (CLDR minimumGroupingDigits=2 → "1250"), mentre l'intento qui è "1.250".
// "always" garantisce il separatore ovunque e coincide tra Node (SSR) e browser.
const NF = new Intl.NumberFormat("it-IT", { useGrouping: "always" });

/** Numero intero con separatore delle migliaia (es. 1.250). */
export function formatNumber(n: number): string {
  return NF.format(n);
}

/** Importo in euro senza decimali (es. € 124.000). */
export function formatEuro(n: number): string {
  return `€ ${NF.format(Math.round(n))}`;
}

const MESI_BREVI = [
  "gen",
  "feb",
  "mar",
  "apr",
  "mag",
  "giu",
  "lug",
  "ago",
  "set",
  "ott",
  "nov",
  "dic",
];

/** "2026-09-30" → "30 set 2026". Robusto anche se la stringa è malformata. */
export function formatDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return iso;
  const [, y, mm, dd] = m;
  const mese = MESI_BREVI[Number(mm) - 1] ?? mm;
  return `${Number(dd)} ${mese} ${y}`;
}
