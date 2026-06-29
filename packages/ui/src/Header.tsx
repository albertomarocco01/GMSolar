"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Container from "./Container";
import { HUB_URL, SERVICES } from "@gmgroup/lib/site";
import { cn } from "@gmgroup/lib/utils";

/**
 * Header sticky, SENZA branding: un mark neutro (quadrato accent) + un menu
 * "Servizi" che dà accesso in un click ai 7 servizi della presentazione (dal
 * registry SERVICES) + una CTA che avvia il tour. CONSUMA l'accent attivo
 * (--accent, lime) dal ThemeProvider. Il menu segue il pattern disclosure
 * WAI-ARIA (Esc + click fuori).
 */
export default function Header() {
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
        {/* Mark neutro (no branding): quadrato accent dell'area attiva. */}
        <Link href={HUB_URL} className="group flex items-center gap-2" aria-label="Home">
          <span
            aria-hidden
            className="bg-accent inline-block h-5 w-5 rounded-[6px] transition-transform group-hover:rotate-12 motion-reduce:transition-none"
          />
          <span className="font-display text-foreground text-sm font-semibold tracking-tight">
            Servizi
          </span>
        </Link>

        <div className="flex items-center gap-2">
          {/* Menu "Servizi": accesso in un click ai 7 servizi (registry). */}
          <div ref={wrapRef} className="relative">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-haspopup="true"
              aria-expanded={open}
              aria-controls="services-menu"
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors sm:px-4",
                open
                  ? "border-accent bg-accent-soft text-accent-ink"
                  : "border-border text-muted hover:text-foreground",
              )}
            >
              <span>Servizi</span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden
                className={cn(
                  "transition-transform motion-reduce:transition-none",
                  open && "rotate-180",
                )}
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
                id="services-menu"
                className="border-border bg-background shadow-lift absolute right-0 z-50 mt-2 w-[min(22rem,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border p-1.5"
              >
                {SERVICES.map((s) => {
                  const current = pathname === s.href;
                  return (
                    <li key={s.key}>
                      <Link
                        href={s.href}
                        onClick={() => setOpen(false)}
                        aria-current={current ? "page" : undefined}
                        className={cn(
                          "block rounded-xl px-3 py-2.5 transition-colors motion-reduce:transition-none",
                          current ? "bg-accent-soft" : "hover:bg-surface-2",
                        )}
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-muted font-mono text-[11px] font-bold tabular-nums">
                            {s.number}
                          </span>
                          <span className="text-foreground text-sm font-semibold">{s.label}</span>
                        </span>
                        <span className="text-muted mt-0.5 block text-xs leading-snug">
                          {s.blurb}
                        </span>
                      </Link>
                    </li>
                  );
                })}

                <li className="border-border/70 my-1.5 border-t" aria-hidden />
                <li>
                  <Link
                    href={HUB_URL}
                    onClick={() => setOpen(false)}
                    className="bg-accent text-accent-contrast hover:bg-accent-strong flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors motion-reduce:transition-none"
                  >
                    <span aria-hidden>▶</span> Avvia il tour
                  </Link>
                </li>
              </ul>
            )}
          </div>

          {/* CTA tour, sempre visibile da desktop → la home è la scroll-narrativa
              cinematica (il "tour"). */}
          <Link
            href={HUB_URL}
            className="bg-accent text-accent-contrast hover:bg-accent-strong hidden rounded-full px-4 py-1.5 text-sm font-semibold transition-colors motion-reduce:transition-none sm:inline-block"
          >
            Tour
          </Link>
        </div>
      </Container>
    </header>
  );
}
