"use client";

import { createContext, useContext, useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import { themeFromPath, type ThemeKey } from "@gmgroup/lib/theme";

/**
 * Theming per "mondo": imposta `data-theme` su <html> e lo espone via context.
 * Le sezioni CONSUMANO l'accent (`--accent`, utility bg-accent/text-accent…),
 * non lo ridefiniscono.
 *
 * Monorepo: ogni app è UN brand, quindi passa un `theme` FISSO. Se omesso (es.
 * hub multi-route) il tema è dedotto dalla pathname.
 */
export type { ThemeKey };

const ThemeContext = createContext<ThemeKey>("hub");

/** Legge il "mondo" attivo (es. switcher dell'header, badge contestuali). */
export function useTheme(): ThemeKey {
  return useContext(ThemeContext);
}

export default function ThemeProvider({
  theme,
  children,
}: {
  /** Tema fisso dell'app. Se assente, dedotto dalla pathname. */
  theme?: ThemeKey;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const resolved = useMemo(() => theme ?? themeFromPath(pathname ?? "/"), [theme, pathname]);

  useEffect(() => {
    document.documentElement.dataset.theme = resolved;
  }, [resolved]);

  return <ThemeContext.Provider value={resolved}>{children}</ThemeContext.Provider>;
}
