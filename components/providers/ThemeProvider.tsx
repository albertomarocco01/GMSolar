"use client";

import { createContext, useContext, useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";

/**
 * Theming per "mondo": l'accent attivo cambia in base alla sezione e
 * ri-tematizza TUTTO il sito (header/footer compresi). L'accent vive come
 * CSS var --accent (vedi app/tokens.css, blocchi [data-theme]). Qui ci
 * limitiamo a impostare data-theme su <html> e a esporre la chiave via
 * context. Le sezioni CONSUMANO --accent (utility bg-accent/text-accent…),
 * non lo ridefiniscono.
 */

export type ThemeKey = "hub" | "solar" | "mobility" | "shop";

/** Mappa una pathname alla chiave di tema. Tenuta in sync con lo script
 *  no-FOUC in app/layout.tsx (stessa logica, in JS inline). */
export function themeFromPath(pathname: string): ThemeKey {
  if (pathname.startsWith("/solar")) return "solar";
  if (pathname.startsWith("/mobility")) return "mobility";
  if (pathname.startsWith("/shop")) return "shop";
  return "hub";
}

const ThemeContext = createContext<ThemeKey>("hub");

/** Legge il "mondo" attivo (es. per badge/illustrazioni contestuali). */
export function useTheme(): ThemeKey {
  return useContext(ThemeContext);
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const theme = useMemo(() => themeFromPath(pathname ?? "/"), [pathname]);

  // usePathname è corretto già in SSR, ma data-theme va riflesso sul DOM
  // anche dopo navigazioni client-side.
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}
