/**
 * Unisce classi CSS condizionali ignorando i valori falsy.
 * Helper leggero senza dipendenze (sostituibile con clsx/tailwind-merge
 * se in futuro servisse il merge intelligente delle classi Tailwind).
 */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
