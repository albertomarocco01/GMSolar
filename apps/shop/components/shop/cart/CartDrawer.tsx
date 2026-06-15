"use client";

import { useCallback, useEffect, useState } from "react";
import { useCart, MAX_QTY } from "./CartProvider";
import Button from "@gmgroup/ui/Button";
import { formatPrice } from "@/components/shop/format";
import { cn } from "@gmgroup/lib/utils";

type CheckoutState = "idle" | "processing" | "done";

/**
 * Drawer carrello (slide-in da destra). Checkout MOCK: simula l'ordine e
 * svuota il carrello. Predisposto per Stripe test mode (non bloccante): basta
 * sostituire `mockCheckout` con la chiamata alla route di pagamento.
 */
export default function CartDrawer() {
  const { items, total, count, isOpen, close, remove, setQty, clear } = useCart();
  const [checkout, setCheckout] = useState<CheckoutState>("idle");

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
    clear();
    setCheckout("done");
  }

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden
        onClick={handleClose}
        className={cn(
          "fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm transition-opacity duration-300",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      {/* Pannello */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Carrello"
        className={cn(
          "bg-background border-border ease-out-expo shadow-lift fixed top-0 right-0 z-[61] flex h-full w-full max-w-md flex-col border-l transition-transform duration-(--duration-base)",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <header className="border-border flex items-center justify-between border-b px-6 py-4">
          <h2 className="font-display text-lg font-bold tracking-tight">
            Carrello{count > 0 ? ` · ${count}` : ""}
          </h2>
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
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="bg-accent text-accent-contrast flex h-14 w-14 items-center justify-center rounded-full">
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
              <p className="text-muted mt-2 text-sm">
                Demo: nessun pagamento reale è stato effettuato. Grazie per aver provato Cavo
                Perfetto.
              </p>
              <Button type="button" variant="outline" className="mt-6" onClick={handleClose}>
                Continua a navigare
              </Button>
            </div>
          ) : items.length === 0 ? (
            <div className="text-muted flex h-full flex-col items-center justify-center text-center">
              <p className="text-sm">Il carrello è vuoto.</p>
              <Button href="/#catalogo" variant="ghost" className="mt-4" onClick={handleClose}>
                Vai al catalogo
              </Button>
            </div>
          ) : (
            <ul className="flex flex-col gap-4">
              {items.map((item) => (
                <li key={item.id} className="border-border flex gap-3 border-b pb-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-snug font-medium">{item.name}</p>
                    <p className="text-muted mt-1 text-sm">{formatPrice(item.price)}</p>
                    <div className="mt-2 inline-flex items-center gap-2">
                      <QtyButton label="Diminuisci" onClick={() => setQty(item.id, item.qty - 1)}>
                        −
                      </QtyButton>
                      <span className="w-6 text-center text-sm tabular-nums">{item.qty}</span>
                      <QtyButton
                        label="Aumenta"
                        onClick={() => setQty(item.id, item.qty + 1)}
                        disabled={item.qty >= MAX_QTY}
                      >
                        +
                      </QtyButton>
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
              ))}
            </ul>
          )}
        </div>

        {checkout !== "done" && items.length > 0 && (
          <footer className="border-border border-t px-6 py-4">
            <div className="flex items-center justify-between">
              <span className="text-muted text-sm">Totale</span>
              <span className="font-display text-xl font-bold">{formatPrice(total)}</span>
            </div>
            <Button
              type="button"
              size="lg"
              className="mt-4 w-full"
              onClick={mockCheckout}
              disabled={checkout === "processing"}
            >
              {checkout === "processing" ? "Elaborazione…" : "Procedi al checkout"}
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
      className="border-border flex h-7 w-7 items-center justify-center rounded-full border text-base leading-none transition-colors not-disabled:hover:border-accent disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}
