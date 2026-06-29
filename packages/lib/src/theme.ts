/**
 * Chiave di tema + mapping da pathname. Vive in @gmgroup/lib (non in ui) perché
 * è un tipo puro condiviso anche da `site.ts`: tenerlo qui evita la dipendenza
 * circolare lib ↔ ui.
 *
 * La presentazione è de-brandizzata: un solo accent (lime "hub", l'unico colore
 * brand del cliente) su TUTTE le route. `themeFromPath` resta come unico punto di
 * mapping se in futuro servisse re-introdurre un accent per-area. Tenere in sync
 * con lo script no-flash in app/layout.tsx.
 */
export type ThemeKey = "hub";

export function themeFromPath(_pathname: string): ThemeKey {
  return "hub";
}
