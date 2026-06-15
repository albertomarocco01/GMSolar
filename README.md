# GM Group — monorepo (demo)

Monorepo **Turborepo + pnpm workspaces** che racconta l'ecosistema **GM Group** (tre
brand dello stesso gruppo), ognuno come **app Next indipendente** con una tecnica visiva
diversa, più un hub che le presenta:

- **hub** — landing dell'ecosistema (le tre "porte" del gruppo)
- **solar** — GM Solar (EPC fotovoltaico): video cinematic + scroll GSAP, stats, case study, calcolatore ROI
- **mobility** — GMobility (wallbox/colonnine): 3D scroll storytelling con React Three Fiber + mappa OCM
- **shop** — Cavo Perfetto (e-commerce cavi di ricarica): catalogo + carrello + AI "trova il cavo per la tua auto"

> Tutti gli asset sono **placeholder**: la struttura è pensata per sostituirli facilmente.

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
  hub/         # landing dell'ecosistema           → http://localhost:3000
  solar/       # GM Solar                          (serve la sezione a "/")
  mobility/    # GMobility (+ /api/charging-points)
  shop/        # Cavo Perfetto (+ /[id] PDP, /api/cable-finder)
packages/
  ui/          # @gmgroup/ui    — primitive UI, Header/Footer, ThemeProvider, Lenis
  tokens/      # @gmgroup/tokens— tokens.css (@theme) + base.css globali
  lib/         # @gmgroup/lib   — site, types, utils, motion, gsap, assets, theme
  config/      # @gmgroup/config— tsconfig/eslint/prettier base condivisi
docs/scraping/ # provenienza dati (scraping dei siti reali)
tools/         # script dev-only una-tantum (es. extract-logo-colors)
turbo.json     # pipeline dev/build/lint/typecheck
```

Ogni app ha `data/` e `public/` propri e un tema fisso (`hub`/`solar`/`mobility`/`shop`).

## Setup

Requisiti: Node 20+ e [pnpm](https://pnpm.io/) 11+.

```bash
pnpm install                          # installa tutto il workspace
cp .env.local.example apps/shop/.env.local   # le chiavi vivono nella cartella dell'app
```

## Comandi

Tutto il monorepo (via Turborepo):

```bash
pnpm dev          # avvia tutte le app in parallelo
pnpm build        # build di tutte le app
pnpm lint         # ESLint su tutto
pnpm typecheck    # tsc --noEmit su tutto
pnpm format       # Prettier (write)
```

Una singola app (`hub` | `solar` | `mobility` | `shop`):

```bash
pnpm --filter @gmgroup/shop dev        # dev server (porta 3000 di default)
pnpm --filter @gmgroup/shop build      # build di produzione
pnpm --filter @gmgroup/shop start      # avvia la build
pnpm --filter @gmgroup/shop lint
pnpm --filter @gmgroup/shop typecheck
```

> Per avviarne più di una insieme, passa porte diverse:
> `pnpm --filter @gmgroup/solar dev -- -p 3002`.

## Note

- I design token sono l'unica fonte di verità: modificali in
  [`packages/tokens/tokens.css`](packages/tokens/tokens.css) e si propagano a tutte le app.
- Le chiavi (AI per `shop`, Open Charge Map per `mobility`) sono **solo server-side**.
  Senza chiave le feature degradano con eleganza (la demo non si rompe mai).
- Deploy: ogni app è indipendente (es. un progetto Vercel per app). Per la navigazione
  cross-app tra domini separati, imposta gli URL via env (vedi `.env.local.example`).
