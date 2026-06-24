# Brief — Cavo Perfetto: rebuild premium (catalogo, scheda prodotto, carrello)

> Per una chat Claude **nello stesso repo**. Gira **in parallelo** alla chat del Cable Advisor.

## Contesto
Repo monorepo (`apps/web`), DEMO per colloquio. L'attuale `cavoperfetto.it` è un **WooCommerce datato**.
Rifacciamo l'esperienza shop in chiave **PREMIUM**, **mantenendo dati, carrello e routing** già nel repo.

> ⚠️ **Coordinamento:** il "Cable Advisor" (`components/shop/CableFinder.tsx`) è gestito da **un'altra
> chat in parallelo** → **NON toccare `CableFinder.tsx`** (evita conflitti). Lascia il suo punto
> d'inserimento in `/shop`.

## Prima leggi
`PLAN.md`, `CLAUDE.md`, `NOTES-shared.md`; e in `apps/web`: `components/shop/` (ShopHero, Catalog,
ProductCard, ProductImage, `cart/{CartProvider,CartDrawer,AddToCartButton,ShopChrome}`, format.ts),
`app/shop/{page.tsx, layout.tsx, [id]/page.tsx}`, `data/products.json`, tipo `Product` da
`@gmgroup/lib/types`.

**Contenuti reali (dal sito vero):** cavi **Mennekes Modo 3 / Tipo 2** liscio/spiralato ~€219,
**Modo 2 / Tipo 2 Schuko** ~€389; claim trust: "Spedizioni gratuite / Reso facile / Rivendita
autorizzata / Alta qualità garantita".

## Regole ferree
- Lavori SOLO in `apps/web/app/shop/**` e `apps/web/components/shop/**` (**TRANNE `CableFinder.tsx`**).
  NON toccare la zona condivisa (`packages/**`, layout root, token, `globals.css`): se serve →
  `NOTES-shared.md` e **fermati**.
- **Mantieni:** dati (`data/products.json` + `Product`), stato carrello (`CartProvider`/store +
  localStorage), routing (`/shop`, `/shop/[id]` SSG), `AddToCartButton`, logica `CartDrawer`/`ShopChrome`.
- Import `@gmgroup/ui/*`, `@gmgroup/lib/*`, `@/...`. **Niente nuove dipendenze.**
- Mobile-first, accessibile, copy **ITALIANO**, accent shop (lime) via `data-theme` (testo su chiaro =
  `text-accent-ink`). Rispetta `prefers-reduced-motion`. Performance: immagini ottimizzate, niente CLS.

## Cosa ridisegnare (look premium da zero, stessi dati)
1. **ShopHero**: hero premium (usa l'asset hero disponibile; spazio negativo, headline IT forte tipo
   "Ricarica, ovunque", CTA verso il catalogo).
2. **Catalog + ProductCard**: griglia elegante; card con immagine (`ProductImage`), **badge**
   (Mode/Tipo/forma/best-seller), prezzo (`format`), hover/motion sobri; **filtri** semplici (per
   Modo/forma) se rapidi. Fascia con i claim trust.
3. **PDP `/shop/[id]`**: pagina prodotto premium — immagine grande, titolo, prezzo, **specifiche**
   (`specs`), descrizione, `AddToCartButton`, blocco "perché questo cavo", **prodotti correlati**.
   Mantieni l'SSG.
4. **Carrello (`CartDrawer`)**: drawer raffinato — riepilogo, quantità, totale, CTA **checkout FINTO**
   (nessun pagamento reale: "Vai al checkout" → toast/stato "checkout demo"). Mantieni store/persistenza.
5. Lascia incluso `CableFinder` in `/shop` (non rimuoverlo, non modificarlo).

## Output atteso
- Componenti shop aggiornati (no `CableFinder.tsx`); `pnpm --filter @gmgroup/web build` + `lint` +
  `typecheck` **VERDI**; riepilogo file toccati + cosa cambiato; poi **fermati per review**.

## Accettazione
- `/shop` e `/shop/[id]` premium e on-brand; carrello funziona (add/remove/persist/**checkout finto**);
  copy IT; reduced-motion ok; **0 errori console**; **nessun file condiviso né `CableFinder.tsx`
  toccato**; build/lint/typecheck verdi.
