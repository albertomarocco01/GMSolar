"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Container from "@/components/ui/Container";
import { WORLDS } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * Header sticky con "group switcher": wordmark del gruppo + segmented control
 * verso i tre mondi. L'header CONSUMA l'accent attivo (--accent) impostato dal
 * ThemeProvider, quindi si ri-tematizza passando da una sezione all'altra.
 */
export default function Header() {
  const pathname = usePathname();

  return (
    <header className="border-border/70 bg-background/80 sticky top-0 z-50 border-b backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between gap-4">
        {/* Logo gruppo (wordmark): "Group" prende l'accent del mondo attivo. */}
        <Link
          href="/"
          className="font-display text-lg font-bold tracking-tight"
          aria-label="GM Group"
        >
          GM <span className="text-accent-ink">Group</span>
        </Link>

        {/* Group switcher: segmented control verso i tre mondi. */}
        <nav aria-label="Naviga tra i mondi del gruppo">
          <ul className="bg-surface-2 flex items-center gap-1 rounded-full p-1">
            {WORLDS.map((world) => {
              const active = pathname.startsWith(world.href);
              return (
                <li key={world.href}>
                  <Link
                    href={world.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "block rounded-full px-3 py-1.5 text-sm font-medium transition-colors sm:px-4",
                      active
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
