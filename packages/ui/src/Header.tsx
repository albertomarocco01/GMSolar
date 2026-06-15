"use client";

import Link from "next/link";
import Container from "./Container";
import { useTheme } from "./ThemeProvider";
import { WORLDS, worldHref, HUB_URL } from "@gmgroup/lib/site";
import { cn } from "@gmgroup/lib/utils";

/**
 * Header sticky con "group switcher": wordmark del gruppo + segmented control
 * verso i tre mondi. CONSUMA l'accent attivo (--accent) dal ThemeProvider, e
 * marca come attiva la sezione corrente leggendo il tema (`useTheme`) — nel
 * monorepo ogni app ha un tema fisso. I link cross-app usano `worldHref`
 * (configurabile via env per i deploy separati; default = path della sezione).
 */
export default function Header() {
  const active = useTheme();

  return (
    <header className="border-border/70 bg-background/80 sticky top-0 z-50 border-b backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between gap-4">
        {/* Logo gruppo (wordmark): "Group" prende l'accent del mondo attivo. */}
        <Link
          href={HUB_URL}
          className="font-display text-lg font-bold tracking-tight"
          aria-label="GM Group"
        >
          GM <span className="text-accent-ink">Group</span>
        </Link>

        {/* Group switcher: segmented control verso i tre mondi. */}
        <nav aria-label="Naviga tra i mondi del gruppo">
          <ul className="bg-surface-2 flex items-center gap-1 rounded-full p-1">
            {WORLDS.map((world) => {
              const isActive = active === world.key;
              return (
                <li key={world.key}>
                  <Link
                    href={worldHref(world)}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "block rounded-full px-3 py-1.5 text-sm font-medium transition-colors sm:px-4",
                      isActive
                        ? "bg-accent text-accent-contrast shadow-sm"
                        : "text-muted hover:text-foreground",
                    )}
                  >
                    {world.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </Container>
    </header>
  );
}
