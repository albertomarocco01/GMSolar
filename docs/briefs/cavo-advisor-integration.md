# Brief — Cavo Perfetto: porta il "Cable Advisor" (generative UI) nel sito reale

> Per una chat Claude **nello stesso repo**.

## Contesto
Repo monorepo (`apps/web`), è una DEMO. AI Studio ha prodotto un prototipo dell'advisor cavi in
`ev-cable-advisor/` (app **Vite standalone, FUORI da apps/web**). Ci piace la sua **presentazione
generative-UI**: card prodotto grande + tabella confronto, look dark premium lime.

Il sito reale ha **GIÀ** un advisor funzionante ma con UI modesta:
`apps/web/components/shop/CableFinder.tsx` (percorso AI in streaming NDJSON **+** wizard
deterministico senza chiave, matcher reale, accessibilità, reduced-motion).

**Obiettivo:** alzare la **presentazione** di `CableFinder` al livello del prototipo (card consigliata
grande + tabella confronto 2-3 cavi), **mantenendo tutta la logica/dati/route reali**. NON è un
rifacimento: è un **upgrade visivo** del componente esistente.

## Prima leggi
- **Prototipo (solo RIFERIMENTO visivo, NON importare da qui):**
  `ev-cable-advisor/src/components/{ProductCard,ComparisonTable,ChatWidget}.tsx`, `src/types.ts`, `src/data.ts`.
- **Reale (qui lavori):** `apps/web/components/shop/CableFinder.tsx`, `cable-matcher.ts`, `ev-onboard.ts`,
  `ProductImage.tsx`, `format.ts`, `cart/AddToCartButton.tsx`; route `app/api/cable-finder/route.ts` +
  `providers.ts`; dati `apps/web/data/products.json`; tipo `Product` da `@gmgroup/lib/types`.

## Regole ferree
- Lavori SOLO in `apps/web/app/shop/**` e `apps/web/components/shop/**`. NON toccare la zona condivisa
  (`packages/**`, layout, token, `globals.css`). Se ti serve qualcosa lì → annotalo in `NOTES-shared.md`
  e **fermati**.
- **NON importare codice da `ev-cable-advisor/`** (stack diverso, fuori da apps/web): **ricrea** i
  componenti dentro `components/shop/`, ritematizzati sui nostri token e tipi.
- Import: `@gmgroup/ui/*`, `@gmgroup/lib/{utils,types}`, `@/...`. **Niente nuove dipendenze.**
- **Mantieni entrambi i percorsi**: AI in streaming NDJSON (eventi `{type:"text"}` /
  `{type:"products", products, context}` / `{type:"error"}`) **e** wizard deterministico senza chiave
  (`findCable`, `lookupEvModel`, bottoni location/shape). La demo DEVE funzionare anche **senza
  `AI_API_KEY`**.
- Mantieni l'**accessibilità** esistente (live region per l'ultimo messaggio, label, `sr-only`) e
  `prefers-reduced-motion`. Copy **ITALIANO**. Accent shop (lime) via `data-theme`.

## Cosa costruire (presentazione nuova, dati invariati)
1. Quando arriva un consiglio (evento `products` dall'AI, **o** risultato del wizard), invece delle
   mini-card attuali rendi:
   a. **Card consigliata grande**: immagine (`ProductImage`), nome, **badge** Mode/Tipo/forma, prezzo
      (`formatPrice`), **3 bullet "perché"** derivati da `MatchContext` (use/phase/car) + `product.specs`,
      link a `/shop/[id]`, `AddToCartButton`.
   b. **Tabella confronto** compatta di 2-3 cavi (i `products` restituiti), con la riga **consigliata
      evidenziata**.
   Ispirati a `ProductCard.tsx`/`ComparisonTable.tsx` del prototipo per layout/stile, ma usa i **nostri**
   dati e componenti.
2. Conserva chat bubbles, typing dots, quick-button (location/shape), datalist auto. Alza il polish
   (spaziature, micro-motion on-mount, coerente con reduced-motion).
3. Badge e bullet "perché" **derivati da dati reali** (`MatchContext`, `product.specs`), **mai inventati**.
   Se manca un campo per un badge → ometti il badge.

## Output atteso
- `CableFinder.tsx` aggiornato (+ eventuali sotto-componenti nuovi in `components/shop/`, es.
  `AdvisorRecommendation.tsx`, `AdvisorCompareTable.tsx`).
- `pnpm --filter @gmgroup/web build` + `lint` + `typecheck` **VERDI**.
- Provato **con e senza** `AI_API_KEY` (il wizard deve mostrare la stessa nuova UI card+tabella).
- Riepilogo file toccati + cosa cambiato, poi **fermati per review**.

## Accettazione
- `/shop` sezione `#cable-finder`: digitando un'auto (es. "Tesla Model 3") o usando i bottoni,
  l'assistente mostra **card consigliata + tabella confronto**, on-brand, in italiano.
- Funziona **senza chiave** (wizard) e **con chiave** (streaming).
- reduced-motion ok, accessibilità mantenuta, **0 errori console**.
- Nessun file della zona condivisa toccato; build/lint/typecheck verdi.
