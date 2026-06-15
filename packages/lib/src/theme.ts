/**
 * Chiave di tema per "mondo" + mapping da pathname. Vive in @gmgroup/lib (non
 * in ui) perché è un tipo puro condiviso anche da `site.ts`: tenerlo qui evita
 * la dipendenza circolare lib ↔ ui.
 */
export type ThemeKey = "hub" | "solar" | "mobility" | "shop";

/**
 * Deduce il tema dalla pathname. Usato dall'hub (sito multi-route); nelle app di
 * sezione il tema è FISSO e passato esplicitamente a <ThemeProvider theme=…>.
 */
export function themeFromPath(pathname: string): ThemeKey {
  if (pathname.startsWith("/solar")) return "solar";
  if (pathname.startsWith("/mobility")) return "mobility";
  if (pathname.startsWith("/shop")) return "shop";
  return "hub";
}
