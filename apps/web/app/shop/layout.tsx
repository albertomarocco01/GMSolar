import CartProvider from "@/components/shop/cart/CartProvider";
import ShopChrome from "@/components/shop/cart/ShopChrome";

/**
 * Layout di sezione SHOP. Nel sito unico, il "chrome" del carrello (provider +
 * bottone flottante + drawer) NON sta nel layout root condiviso (sarebbe visibile
 * in tutti i mondi): vive qui, così avvolge solo le route /shop/*. Restando un
 * layout di segmento, sopravvive alla navigazione /shop ⇄ /shop/[id] (le PDP),
 * preservando lo stato del carrello (lo store è comunque esterno + localStorage).
 */
export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <ShopChrome>{children}</ShopChrome>
    </CartProvider>
  );
}
