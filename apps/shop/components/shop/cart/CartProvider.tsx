"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import type { Product } from "@gmgroup/lib/types";

/**
 * Stato carrello LOCALE (demo): un piccolo store esterno con persistenza su
 * localStorage, letto via useSyncExternalStore. Niente backend, checkout mock.
 * Lo store è SSR-safe (snapshot server = vuoto) e non usa setState dentro un
 * effect, così resta lint-clean. Vive nel layout della sezione Shop, quindi
 * sopravvive alla navigazione verso le PDP.
 */
export type CartItem = {
  id: string;
  name: string;
  price: number | null;
  qty: number;
};

const STORAGE_KEY = "cavoperfetto-cart";
const EMPTY: CartItem[] = [];

// Sorgente di verità in-memory + idratazione una-tantum da localStorage.
let cartState: CartItem[] = EMPTY;
const listeners = new Set<() => void>();

if (typeof window !== "undefined") {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) cartState = JSON.parse(raw) as CartItem[];
  } catch {
    /* storage non disponibile: si parte da carrello vuoto */
  }
}

function persistAndNotify() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cartState));
  } catch {
    /* ignora quota/permessi */
  }
  listeners.forEach((l) => l());
}

function setCart(next: CartItem[]) {
  cartState = next;
  persistAndNotify();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
const getSnapshot = () => cartState;
const getServerSnapshot = () => EMPTY;

// Operazioni sullo store (pure: producono un nuovo array).
function addItem(product: Pick<Product, "id" | "name" | "price">) {
  const existing = cartState.find((i) => i.id === product.id);
  setCart(
    existing
      ? cartState.map((i) => (i.id === product.id ? { ...i, qty: i.qty + 1 } : i))
      : [...cartState, { id: product.id, name: product.name, price: product.price, qty: 1 }],
  );
}
function setItemQty(id: string, qty: number) {
  setCart(
    qty <= 0
      ? cartState.filter((i) => i.id !== id)
      : cartState.map((i) => (i.id === id ? { ...i, qty } : i)),
  );
}
function removeItem(id: string) {
  setCart(cartState.filter((i) => i.id !== id));
}
function clearCart() {
  setCart([]);
}

type CartContextValue = {
  items: CartItem[];
  count: number;
  total: number;
  isOpen: boolean;
  add: (product: Pick<Product, "id" | "name" | "price">) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart deve essere usato dentro <CartProvider>");
  return ctx;
}

export default function CartProvider({ children }: { children: React.ReactNode }) {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [isOpen, setIsOpen] = useState(false);

  const add: CartContextValue["add"] = useCallback((product) => {
    addItem(product);
    setIsOpen(true);
  }, []);
  const remove = useCallback((id: string) => removeItem(id), []);
  const setQty = useCallback((id: string, qty: number) => setItemQty(id, qty), []);
  const clear = useCallback(() => clearCart(), []);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((n, i) => n + i.qty, 0);
    const total = items.reduce((sum, i) => sum + (i.price ?? 0) * i.qty, 0);
    return { items, count, total, isOpen, add, remove, setQty, clear, open, close };
  }, [items, isOpen, add, remove, setQty, clear, open, close]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
