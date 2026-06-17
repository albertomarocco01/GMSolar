# GM Group — sito unico (demo)

**UN solo sito Next** (App Router) che racconta l'ecosistema **GM Group** (tre brand dello
stesso gruppo) come tre "mondi" sotto un unico server, più un hub che li presenta. Ogni
mondo ha una tecnica visiva diversa e il sito si **ri-tematizza in base alla route**:

- **/** (hub) — landing dell'ecosistema (le tre "porte" del gruppo)
- **/solar** — GM Solar (EPC fotovoltaico): video cinematic + scroll GSAP, stats, case study, calcolatore ROI
- **/mobility** — GMobility (wallbox/colonnine): 3D scroll storytelling con React Three Fiber + mappa OCM
- **/shop** — Cavo Perfetto (e-commerce cavi di ricarica): catalogo + carrello + AI "trova il cavo per la tua auto" (PDP a `/shop/[id]`)

> Tutti gli asset sono **placeholder**: la struttura è pensata per sostituirli facilmente.

> Storia: il progetto è nato come 4 app Next separate in un monorepo Turborepo (scelta di
> _deploy_). Sono state **consolidate in un'unica app** (`apps/web`) servita da un solo
> server — la visione originale di CLAUDE.md ("UN solo sito Next"). I `packages/*` restano
> librerie di workspace condivise.

## Stack

- **Turborepo** + **pnpm workspaces** (apps/_ + packages/_)
- **Next.js** (App Router) + **React** + **TypeScript** (strict), una build per app
- **Tailwind CSS v4** con token centralizzati in [`packages/tokens`](packages/tokens) (consumati via `@import` + `@source`)
- **Animazioni**: GSAP + ScrollTrigger + Lenis (rispetta sempre `prefers-reduced-motion`)
- **3D**: React Three Fiber + drei + postprocessing (solo `mobility`)
- **Mappe**: MapLibre GL + Open Charge Map (solo `mobility`)
- **AI**: route handler server-side, provider-agnostica (solo `shop`)
- **Tooling**: ESLint + Prettier · package manager **pnpm**

## Struttura

```
apps/
  web/         # IL sito unico (tutte le route)    → http://localhost:3000
    app/
      page.tsx            # / (hub)
      solar/              # /solar  (+ /solar/lead, /solar/analytics)
      mobility/           # /mobility (+ /mobility/agent)
      shop/               # /shop, /shop/[id] (PDP)
      api/                # cable-finder, charging-points (server-side)
    components/{home,solar,mobility,shop}/
    data/ · public/assets/ · types/three-jsx.d.ts
packages/
  ui/          # @gmgroup/ui    — primitive UI, Header/Footer, ThemeProvider, Lenis
  tokens/      # @gmgroup/tokens— tokens.css (@theme) + base.css globali
  lib/         # @gmgroup/lib   — site, types, utils, motion, gsap, assets, theme
  config/      # @gmgroup/config— tsconfig/eslint/prettier base condivisi
docs/scraping/ # provenienza dati (scraping dei siti reali)
tools/         # script dev-only una-tantum (es. extract-logo-colors)
turbo.json     # pipeline dev/build/lint/typecheck
```

Il tema **non è più fisso per app**: deriva dalla route (`ThemeProvider` deduce il "mondo"
dal pathname; uno script pre-paint nel root layout evita il flash dell'accent).

## Setup

Requisiti: Node 20+ e [pnpm](https://pnpm.io/) 11+.

```bash
pnpm install                          # installa tutto il workspace
cp .env.local.example apps/web/.env.local   # le chiavi vivono nell'app unica
```

## Comandi

Dalla root (via Turborepo):

```bash
pnpm dev          # UN solo server Next su http://localhost:3000
pnpm build        # build di produzione
pnpm lint         # ESLint su tutto
pnpm typecheck    # tsc --noEmit su tutto
pnpm format       # Prettier (write)
```

Equivalenti diretti sull'app:

```bash
pnpm --filter @gmgroup/web dev        # dev server (porta 3000)
pnpm --filter @gmgroup/web build      # build di produzione
pnpm --filter @gmgroup/web start      # avvia la build
```

## Note

- I design token sono l'unica fonte di verità: modificali in
  [`packages/tokens/tokens.css`](packages/tokens/tokens.css) e si propagano a tutto il sito.
- Le chiavi (AI del cable-finder, Open Charge Map della mappa) sono **solo server-side**.
  Senza chiave le feature degradano con eleganza (la demo non si rompe mai).
- Deploy: un unico progetto Vercel serve tutte le route. La navigazione cross-mondo usa
  path relativi (`/solar`, `/mobility`, `/shop`), quindi funziona out-of-the-box.
