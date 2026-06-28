/**
 * Chiave di tema per "mondo" + mapping da pathname. Vive in @gmgroup/lib (non
 * in ui) perché è un tipo puro condiviso anche da `site.ts`: tenerlo qui evita
 * la dipendenza circolare lib ↔ ui.
 */
export type ThemeKey = "hub" | "solar" | "mobility" | "shop" | "platform";

/** Prefissi delle aree "piattaforma/admin" → accent viola (vedi tokens.css). */
const PLATFORM_PREFIXES = [
  "/dashboard",
  "/gestionale",
  "/integrazioni",
  "/segnalazioni",
  "/assistente",
] as const;

/**
 * Deduce il tema dalla pathname. I siti VETRINA d'esempio (solar/mobility/shop)
 * tengono il loro accent verde/lime; le aree PIATTAFORMA (dashboard, gestionale,
 * integrazioni, segnalazioni, assistente) usano l'accent viola "platform".
 * Tenere in sync con lo script no-flash in app/layout.tsx.
 */
export function themeFromPath(pathname: string): ThemeKey {
  if (pathname.startsWith("/solar")) return "solar";
  if (pathname.startsWith("/mobility")) return "mobility";
  if (pathname.startsWith("/shop")) return "shop";
  if (PLATFORM_PREFIXES.some((p) => pathname.startsWith(p))) return "platform";
  return "hub";
}
