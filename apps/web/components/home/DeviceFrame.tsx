"use client";

/**
 * @descrizione  Cornice "browser" che incorpora un DEMO REALE come anteprima
 *   viva. Monta il contenuto solo quando entra in vista (IntersectionObserver →
 *   perf: i demo pesanti non partono tutti insieme). Di default l'anteprima è
 *   NON interattiva (pointer-events-none) per non intrappolare lo scroll della
 *   presentazione; passare `interactive` per renderla cliccabile.
 * @indice
 * - DeviceFrame → wrappa un componente-demo in un mockup browser, lazy + clip
 */
import { useEffect, useRef, useState } from "react";
import { cn } from "@gmgroup/lib/utils";

export default function DeviceFrame({
  children,
  label,
  interactive = false,
  className,
}: {
  children: React.ReactNode;
  /** Testo nella barra indirizzi del mockup. */
  label: string;
  interactive?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setMounted(true);
          io.disconnect();
        }
      },
      { rootMargin: "300px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        "border-border bg-surface shadow-lift overflow-hidden rounded-2xl border",
        className,
      )}
    >
      {/* Barra del browser */}
      <div className="border-border bg-background flex items-center gap-2 border-b px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-red-400/70" />
        <span className="size-2.5 rounded-full bg-amber-400/70" />
        <span className="size-2.5 rounded-full bg-emerald-400/70" />
        <span className="bg-surface-2 text-muted ml-3 hidden min-w-0 flex-1 truncate rounded-full px-3 py-1 text-xs sm:block">
          {label}
        </span>
      </div>

      {/* Viewport: il demo reale, clippato e lazy. */}
      <div className="relative h-[58vh] overflow-hidden">
        <div
          className={cn(
            "absolute inset-0 overflow-hidden",
            interactive ? "" : "pointer-events-none",
          )}
        >
          {mounted ? (
            children
          ) : (
            <div className="bg-surface-2/40 h-full w-full animate-pulse" aria-hidden />
          )}
        </div>
        {/* Sfumatura inferiore: suggerisce che il contenuto continua. */}
        <div className="from-surface pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t to-transparent" />
      </div>
    </div>
  );
}
