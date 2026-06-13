import type { ReactNode } from "react";
import CartProvider from "@/components/shop/cart/CartProvider";
import ShopChrome from "@/components/shop/cart/ShopChrome";

/**
 * Layout della sezione Shop: fornisce il carrello (context + drawer + bottone
 * flottante) a TUTTE le pagine shop, comprese le PDP, così lo stato sopravvive
 * alla navigazione. L'accent lime acido è già impostato dal ThemeProvider sulla
 * route /shop (zona condivisa, non toccata qui).
 */
export default function ShopLayout({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      <ShopChrome>{children}</ShopChrome>
    </CartProvider>
  );
}
