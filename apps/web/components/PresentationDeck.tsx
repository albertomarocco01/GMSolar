"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { prefersReducedMotion } from "@gmgroup/lib/motion";
import { cn } from "@gmgroup/lib/utils";

/**
 * REGIA — barra di controllo per la presentazione commerciale.
 *
 * Una lista ORDINATA di "tappe" (route + etichetta) che racconta tutto
 * l'ecosistema in un percorso lineare. Prev/Next + frecce ←/→ per camminarci
 * avanti/indietro senza lanciare server diversi. Nascosta di default: si attiva
 * con `?deck=1` nell'URL oppure con la scorciatoia Shift+D (Esc per chiudere).
 * Navigazione client-side (router.push) per transizioni istantanee; rispetta
 * prefers-reduced-motion.
 */
type Stop = { label: string; href: string; world: string };

const STOPS: Stop[] = [
  { world: "Gruppo", label: "Hub — l'ecosistema", href: "/" },
  { world: "GM Solar", label: "Solar — EPC fotovoltaico", href: "/solar" },
  { world: "GM Solar", label: "Lead Qualifier AI", href: "/solar/lead" },
  { world: "GM Solar", label: "Analytics AI (NL→SQL)", href: "/solar/analytics" },
  { world: "GMobility", label: "Mobility — ricarica", href: "/mobility" },
  { world: "GMobility", label: "Agente di ricarica di bordo", href: "/mobility/agent" },
  { world: "Cavo Perfetto", label: "Shop — e-commerce cavi", href: "/shop" },
  { world: "Cavo Perfetto", label: "Trova il cavo (AI)", href: "/shop#cable-finder" },
];

const pathOf = (href: string) => href.split("#")[0];

/** È in corso la digitazione in un campo? (per non rubare i tasti). */
function isTyping(el: EventTarget | null): boolean {
  const node = el as HTMLElement | null;
  if (!node) return false;
  const tag = node.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || node.isContentEditable;
}

export default function PresentationDeck() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [lastPath, setLastPath] = useState<string | null>(null);

  // Allinea la tappa attiva alla route corrente. Pattern React "adjust state
  // during render" (niente effetto): quando il pathname cambia ricalcolo la
  // tappa, senza scavalcare la selezione di una tappa con hash sulla stessa
  // pagina (es. shop ⇄ cable-finder, entrambe su /shop).
  if (pathname !== lastPath) {
    setLastPath(pathname);
    const found = STOPS.findIndex((s) => pathOf(s.href) === pathname);
    if (found !== -1 && pathOf(STOPS[index].href) !== pathname) setIndex(found);
  }

  // Attivazione iniziale via ?deck=1 (solo client, dopo il mount: leggo da window
  // per non forzare il dynamic rendering dell'intero sito con useSearchParams).
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.has("deck") && params.get("deck") !== "0") {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- lettura una-tantum dell'URL (sistema esterno) post-mount
      setOpen(true);
    }
  }, []);

  const goTo = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(STOPS.length - 1, next));
      const stop = STOPS[clamped];
      setIndex(clamped);
      router.push(stop.href);

      // Tappa con hash sulla stessa pagina: scrolla all'ancora a mano.
      const hash = stop.href.split("#")[1];
      if (hash && pathOf(stop.href) === pathname) {
        requestAnimationFrame(() => {
          document.getElementById(hash)?.scrollIntoView({
            behavior: prefersReducedMotion() ? "auto" : "smooth",
            block: "start",
          });
        });
      }
    },
    [router, pathname],
  );

  // Scorciatoie da tastiera.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isTyping(e.target)) return;
      if (e.key === "D" && e.shiftKey) {
        e.preventDefault();
        setOpen((v) => !v);
        return;
      }
      if (!open) return;
      if (e.key === "Escape") setOpen(false);
      else if (e.key === "ArrowRight") {
        e.preventDefault();
        goTo(index + 1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goTo(index - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, index, goTo]);

  if (!open) return null;

  const stop = STOPS[index];
  const atStart = index === 0;
  const atEnd = index === STOPS.length - 1;

  return (
    <div
      role="region"
      aria-label="Regia della presentazione"
      className="ease-out-expo fixed inset-x-0 bottom-4 z-[80] flex justify-center px-4 transition-transform duration-(--duration-base) motion-reduce:transition-none"
    >
      <div className="bg-surface/95 border-border shadow-lift flex max-w-[min(46rem,100%)] items-center gap-3 rounded-full border px-3 py-2 backdrop-blur-md">
        {/* Indicatore tappa */}
        <div className="flex min-w-0 items-center gap-2 pl-1">
          <span className="bg-accent text-accent-contrast inline-flex h-7 shrink-0 items-center rounded-full px-2 font-mono text-xs font-bold tabular-nums">
            {index + 1}/{STOPS.length}
          </span>
          <div className="min-w-0">
            <p className="text-muted text-[10px] leading-none font-medium tracking-widest uppercase">
              {stop.world}
            </p>
            <p className="text-foreground truncate text-sm leading-tight font-semibold">
              {stop.label}
            </p>
          </div>
        </div>

        {/* Pallini di avanzamento */}
        <ol className="hidden items-center gap-1.5 px-1 sm:flex" aria-hidden>
          {STOPS.map((s, i) => (
            <li key={s.href}>
              <button
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Vai a ${s.label}`}
                className={cn(
                  "block h-2 w-2 rounded-full transition-colors motion-reduce:transition-none",
                  i === index ? "bg-accent" : "bg-border hover:bg-muted",
                )}
              />
            </li>
          ))}
        </ol>

        {/* Controlli */}
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            disabled={atStart}
            aria-label="Tappa precedente"
            className="text-foreground hover:bg-surface-2 flex h-9 w-9 items-center justify-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-30 motion-reduce:transition-none"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M15 18l-6-6 6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            disabled={atEnd}
            aria-label="Tappa successiva"
            className="bg-accent text-accent-contrast hover:bg-accent-strong flex h-9 items-center gap-1 rounded-full px-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-30 motion-reduce:transition-none"
          >
            Avanti
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M9 6l6 6-6 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Chiudi la regia (Esc)"
            title="Chiudi · Shift+D per riaprire"
            className="text-muted hover:bg-surface-2 hover:text-foreground ml-1 flex h-9 w-9 items-center justify-center rounded-full transition-colors motion-reduce:transition-none"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
