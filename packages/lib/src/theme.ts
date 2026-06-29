/**
 * Chiave di tema per "mondo" + mapping da pathname. Vive in @gmgroup/lib (non
 * in ui) perché è un tipo puro condiviso anche da `site.ts`: tenerlo qui evita
 * la dipendenza circolare lib ↔ ui.
 */
export type ThemeKey = "hub" | "solar" | "mobility" | "shop";

/**
 * Deduce il tema dalla pathname. I siti VETRINA d'esempio (solar/mobility/shop)
 * tengono il loro accent dedicato; ogni altra route — incluse le aree servizio/
 * admin (dashboard, gestionale, integrazioni, segnalazioni, assistente) — usa
 * l'accent del gruppo "hub" (lime), unico colore brand del cliente.
 * Tenere in sync con lo script no-flash in app/layout.tsx.
 */
export function themeFromPath(pathname: string): ThemeKey {
  if (pathname.startsWith("/solar")) return "solar";
  if (pathname.startsWith("/mobility")) return "mobility";
  if (pathname.startsWith("/shop")) return "shop";
  return "hub";
}
