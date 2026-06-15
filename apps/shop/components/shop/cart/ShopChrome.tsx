"use client";

import { useCart } from "./CartProvider";
import CartDrawer from "./CartDrawer";

/**
 * "Chrome" della sezione Shop: bottone carrello flottante (l'Header globale è
 * zona condivisa e non si tocca) + drawer. Avvolge il contenuto delle pagine
 * shop nel layout di sezione.
 */
export default function ShopChrome({ children }: { children: React.ReactNode }) {
  const { count, open } = useCart();

  return (
    <>
      {children}

      {/* Bottone carrello flottante (in basso a destra). */}
      <button
        type="button"
        onClick={open}
        aria-label={`Apri il carrello${count > 0 ? ` (${count} articoli)` : ""}`}
        className="bg-accent text-accent-contrast hover:bg-accent-strong ease-out-expo shadow-lift fixed right-5 bottom-5 z-50 flex h-14 w-14 items-center justify-center rounded-full transition-[transform,background-color] duration-(--duration-fast) hover:-translate-y-0.5"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M6 6h15l-1.5 9h-12L6 6Zm0 0L5 3H2m6 18a1 1 0 100-2 1 1 0 000 2Zm10 0a1 1 0 100-2 1 1 0 000 2Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {count > 0 && (
          <span className="bg-background text-foreground border-accent absolute -top-1 -right-1 flex h-6 min-w-6 items-center justify-center rounded-full border px-1.5 text-xs font-bold tabular-nums">
            {count}
          </span>
        )}
      </button>

      <CartDrawer />
    </>
  );
}
