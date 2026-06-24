"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useCart, MAX_QTY } from "./CartProvider";
import Button from "@gmgroup/ui/Button";
import ProductImage from "@/components/shop/ProductImage";
import { formatPrice } from "@/components/shop/format";
import { cardSpecLine } from "@/components/shop/product-copy";
import { cn } from "@gmgroup/lib/utils";
import productsData from "@/data/products.json";
import type { Product } from "@gmgroup/lib/types";

type CheckoutState = "idle" | "processing" | "done";

// Lookup id → prodotto, per la miniatura e la riga di specifiche nel carrello.
const PRODUCTS = productsData as unknown as Product[];
const byId = new Map(PRODUCTS.map((p) => [p.id, p] as const));

// Keyframe locale per il "pop" elastico della conferma (zona NON condivisa).
// La regola globale prefers-reduced-motion lo congela allo stato finale.
const POP_CSS = `.cp-pop{animation:cp-pop var(--duration-base) var(--ease-spring) both;}@keyframes cp-pop{from{transform:scale(.8);opacity:0;}to{transform:scale(1);opacity:1;}}`;

/**
 * Drawer carrello (slide-in da destra). Checkout MOCK: simula l'ordine, genera
 * un riferimento d'ordine fittizio e svuota il carrello. Predisposto per Stripe
 * test mode: basta sostituire `mockCheckout` con la chiamata alla route.
 */
export default function CartDrawer() {
  const { items, total, count, isOpen, close, remove, setQty, clear } = useCart();
  const [checkout, setCheckout] = useState<CheckoutState>("idle");
  const [orderRef, setOrderRef] = useState("");

  // Chiusura unica per tutti i punti d'uscita: azzera anche lo stato del
  // checkout, così alla riapertura non resta lo schermo di conferma.
  const handleClose = useCallback(() => {
    setCheckout("idle");
    close();
  }, [close]);

  // Chiudi con ESC.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, handleClose]);

  async function mockCheckout() {
    setCheckout("processing");
    // Simulazione: in produzione qui andrebbe la sessione Stripe (test mode).
    await new Promise((r) => setTimeout(r, 1100));
    setOrderRef(String(Math.floor(1000 + Math.random() * 9000)));
    clear();
    setCheckout("done");
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: POP_CSS }} />

      {/* Backdrop */}
      <div
        aria-hidden
        onClick={handleClose}
        className={cn(
          "fixed inset-0 z-60 bg-black/40 backdrop-blur-sm transition-opacity duration-300",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      {/* Pannello */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Carrello"
        className={cn(
          "bg-background border-border ease-out-expo shadow-lift fixed top-0 right-0 z-61 flex h-full w-full max-w-md flex-col border-l transition-transform duration-(--duration-base)",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <header className="border-border flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="font-display text-lg font-bold tracking-tight">
              Carrello{count > 0 ? ` · ${count}` : ""}
            </h2>
            <p className="text-muted text-xs">Riepilogo ordine</p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-muted hover:text-foreground rounded-full p-1.5 transition-colors"
            aria-label="Chiudi carrello"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {checkout === "done" ? (
            <div className="animate-fade-in flex h-full flex-col items-center justify-center text-center">
              <div className="cp-pop bg-accent text-accent-contrast flex h-14 w-14 items-center justify-center rounded-full">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M5 13l4 4L19 7"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className="font-display mt-4 text-lg font-bold">Ordine confermato</h3>
              {orderRef && (
                <p className="text-muted mt-1 font-mono text-xs">Rif. ordine CP-{orderRef}</p>
              )}
              <p className="text-muted mt-3 text-sm">
                Demo: nessun pagamento reale è stato effettuato. Grazie per aver provato Cavo
                Perfetto.
              </p>
              <Button type="button" variant="outline" className="mt-6" onClick={handleClose}>
                Continua a navigare
              </Button>
            </div>
          ) : items.length === 0 ? (
            <div className="text-muted flex h-full flex-col items-center justify-center text-center">
              <EmptyGlyph />
              <p className="text-foreground font-display mt-4 font-bold">Il carrello è vuoto</p>
              <p className="mt-1 text-sm">Aggiungi un cavo dal catalogo per iniziare.</p>
              <Button href="/shop#catalogo" variant="ghost" className="mt-5" onClick={handleClose}>
                Vai al catalogo
              </Button>
            </div>
          ) : (
            <ul className="flex flex-col gap-4">
              {items.map((item) => {
                const product = byId.get(item.id);
                const specs = product ? cardSpecLine(product).slice(0, 2).join(" · ") : "";
                const lineTotal = item.price === null ? null : item.price * item.qty;
                return (
                  <li key={item.id} className="border-border flex gap-3 border-b pb-4">
                    <div className="border-border h-14 w-14 shrink-0 overflow-hidden rounded-md border">
                      {product ? (
                        <ProductImage product={product} className="h-full w-full" />
                      ) : null}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-sm leading-snug font-medium">{item.name}</p>
                      {specs && (
                        <p className="text-muted mt-0.5 truncate text-xs capitalize">{specs}</p>
                      )}
                      <p className="text-muted mt-0.5 text-xs tabular-nums">
                        {formatPrice(item.price)} / pz
                      </p>

                      <div className="mt-2 flex items-center justify-between gap-2">
                        {/* Pillola quantità segmentata */}
                        <div className="border-border inline-flex items-center rounded-full border">
                          <QtyButton label="Diminuisci" onClick={() => setQty(item.id, item.qty - 1)}>
                            −
                          </QtyButton>
                          <span
                            aria-live="polite"
                            className="w-7 text-center text-sm tabular-nums"
                          >
                            {item.qty}
                          </span>
                          <QtyButton
                            label="Aumenta"
                            onClick={() => setQty(item.id, item.qty + 1)}
                            disabled={item.qty >= MAX_QTY}
                          >
                            +
                          </QtyButton>
                        </div>
                        {lineTotal !== null && (
                          <span className="text-sm font-medium tabular-nums">
                            {formatPrice(lineTotal)}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => remove(item.id)}
                      className="text-muted hover:text-foreground self-start text-xs underline underline-offset-2"
                    >
                      Rimuovi
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {checkout !== "done" && items.length > 0 && (
          <footer className="border-border border-t px-6 py-4">
            <dl className="space-y-1.5 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-muted">Subtotale</dt>
                <dd className="tabular-nums">{formatPrice(total)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted">Spedizione</dt>
                <dd className="text-accent-ink font-medium">Gratuita</dd>
              </div>
            </dl>
            <div className="border-border mt-3 flex items-center justify-between border-t pt-3">
              <span className="text-muted text-sm">Totale</span>
              <span className="font-display text-xl font-bold tabular-nums">
                {formatPrice(total)}
              </span>
            </div>
            <Button
              type="button"
              size="lg"
              className="mt-4 w-full"
              onClick={mockCheckout}
              disabled={checkout === "processing"}
            >
              {checkout === "processing" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Elaborazione…
                </>
              ) : (
                "Procedi al checkout"
              )}
            </Button>
            <p className="text-muted mt-2 text-center text-xs">
              Checkout dimostrativo — nessun pagamento reale.
            </p>
          </footer>
        )}
      </aside>
    </>
  );
}

function QtyButton({
  children,
  label,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="text-muted not-disabled:hover:text-foreground flex h-7 w-7 items-center justify-center text-base leading-none transition-colors disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}

/** Glifo Tipo 2 tenue per lo stato "carrello vuoto". */
function EmptyGlyph() {
  return (
    <svg
      width="64"
      height="64"
      viewBox="0 0 120 120"
      fill="none"
      className="text-accent-ink/30"
      aria-hidden
    >
      <circle cx="60" cy="56" r="34" stroke="currentColor" strokeWidth="3" />
      <circle cx="60" cy="40" r="4.5" fill="currentColor" />
      <circle cx="48" cy="52" r="5" fill="currentColor" />
      <circle cx="72" cy="52" r="5" fill="currentColor" />
      <circle cx="52" cy="70" r="5.5" fill="currentColor" />
      <circle cx="68" cy="70" r="5.5" fill="currentColor" />
    </svg>
  );
}
