"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Container from "./Container";
import { useTheme } from "./ThemeProvider";
import { WORLDS, worldHref, HUB_URL, DEMOS } from "@gmgroup/lib/site";
import { cn } from "@gmgroup/lib/utils";

/**
 * Header sticky con "group switcher" (i tre mondi) + menu "Demo AI" che dà
 * accesso in un click, da qualunque pagina, ai prototipi agentici
 * (/solar/lead, /solar/analytics, /mobility/agent). CONSUMA l'accent attivo
 * (--accent) dal ThemeProvider e marca la sezione corrente via `useTheme`.
 * I link cross-mondo usano `worldHref`; l'elenco demo arriva da `DEMOS` (site.ts).
 */
export default function Header() {
  const active = useTheme();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Chiudi il menu al cambio di route.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Disclosure menu: chiusura con Esc e click fuori (pattern WAI-ARIA).
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <header className="border-border/70 bg-background/80 sticky top-0 z-50 border-b backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between gap-3">
        {/* Logo gruppo (wordmark): "Group" prende l'accent del mondo attivo. */}
        <Link
          href={HUB_URL}
          className="font-display text-lg font-bold tracking-tight"
          aria-label="GM Group"
        >
          GM <span className="text-accent-ink">Group</span>
        </Link>

        <div className="flex items-center gap-2">
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

          {/* Menu "Demo AI": accesso globale in un click ai prototipi agentici. */}
          <div ref={wrapRef} className="relative">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-haspopup="true"
              aria-expanded={open}
              aria-controls="demo-ai-menu"
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors sm:px-4",
                open
                  ? "border-accent bg-accent-soft text-accent-ink"
                  : "border-border text-muted hover:text-foreground",
              )}
            >
              <span aria-hidden>✨</span>
              <span className="hidden sm:inline">Demo IAchi</span>
              <span className="sm:hidden">Demo</span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden
                className={cn("transition-transform motion-reduce:transition-none", open && "rotate-180")}
              >
                <path
                  d="M6 9l6 6 6-6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {open && (
              <ul
                id="demo-ai-menu"
                className="border-border bg-background shadow-lift absolute right-0 z-50 mt-2 w-[min(20rem,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border p-1.5"
              >
                {DEMOS.map((demo) => {
                  const worldLabel = WORLDS.find((w) => w.key === demo.world)?.label ?? demo.world;
                  const current = pathname === demo.href;
                  return (
                    <li key={demo.href}>
                      <Link
                        href={demo.href}
                        onClick={() => setOpen(false)}
                        aria-current={current ? "page" : undefined}
                        className={cn(
                          "block rounded-xl px-3 py-2.5 transition-colors motion-reduce:transition-none",
                          current ? "bg-accent-soft" : "hover:bg-surface-2",
                        )}
                      >
                        <span className="flex items-center gap-2">
                          <span
                            className={cn(
                              "rounded-full px-1.5 py-0.5 text-[10px] font-bold tracking-widest uppercase",
                              demo.world === "solar"
                                ? "bg-solar/15 text-(--solar-ink)"
                                : "bg-mobility/15 text-(--mobility-ink)",
                            )}
                          >
                            {worldLabel}
                          </span>
                          <span className="text-foreground text-sm font-semibold">{demo.label}</span>
                        </span>
                        <span className="text-muted mt-0.5 block text-xs leading-snug">
                          {demo.blurb}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </Container>
    </header>
  );
}
