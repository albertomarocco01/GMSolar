# Vetrina Servizi — demo (de-brandizzata)

**UN solo sito Next** (App Router) come **presentazione interattiva** delle nostre capacità:
una scroll-narrativa cinematografica (home chromeless) più alcune pagine-demo dei servizi.
È una **demo mock e de-brandizzata** (niente nomi/loghi reali): mostra a un cliente cosa
sappiamo fare su **7 servizi digitali**.

- **/** — home immersiva chromeless (scroll-narrativa; capitoli "Siti vetrina" e "App ricarica EV")
- **/assistente** — assistente AI di sito (chatbot demo)
- **/dashboard** — dashboard & telemetria (mock analytics)
- **/gestionale** — gestionale con assistente AI
- **/integrazioni** — integrazioni API
- **/segnalazioni** — pannello segnalazioni

> Tutti gli asset e i dati sono **placeholder/finti**: la struttura è pensata per sostituirli
> facilmente. L'**AI è simulata** (deterministica): nessun provider esterno viene mai chiamato.

## Stack

- **Turborepo** + **pnpm workspaces** (apps/_ + packages/_)
- **Next.js** (App Router) + **React** + **TypeScript** (strict)
- **Tailwind CSS v4** con token centralizzati in [`packages/tokens`](packages/tokens)
- **Animazioni**: GSAP + ScrollTrigger + Lenis (rispetta sempre `prefers-reduced-motion`)
- **Grafici**: recharts (dashboard, gestionale) · **Icone**: lucide-react
- **AI**: route handler server-side **simulati** (mock deterministico, mai un provider reale)
- **Tooling**: ESLint + Prettier · package manager **pnpm**

## Struttura

```
apps/
  web/         # IL sito unico (tutte le route)    → http://localhost:3000
    app/
      page.tsx            # / (home immersiva chromeless)
      assistente/ dashboard/ gestionale/ integrazioni/ segnalazioni/
      api/                # assistant, gestionale (server-side, risposte mock)
      layout.tsx · globals.css · robots.ts · sitemap.ts
    components/{home,assistente,dashboard,gestionale,integrazioni,segnalazioni,servizi}/
    data/      # dati finti deterministici (kb, telemetria, erp-mock)
    lib/       # ai.ts (mock), utils locali · public/assets/
packages/
  ui/          # @gmgroup/ui    — primitive UI, Header/Footer, ThemeProvider, Lenis
  tokens/      # @gmgroup/tokens— tokens.css (@theme) + base.css globali
  lib/         # @gmgroup/lib   — site (registry SERVICES), utils, motion, gsap, assets, theme
  config/      # @gmgroup/config— tsconfig/eslint/prettier base condivisi
docs/          # PROGETTO.md + ROADMAP-MULTIAGENTE.md = fonte di verità
tools/         # script dev-only (es. shot.mjs per gli screenshot)
turbo.json     # pipeline dev/build/lint/typecheck
```

Il sito è **de-brandizzato**: un solo accent (lime "hub") su tutte le route; uno script
pre-paint nel root layout fissa `data-theme="hub"` per evitare flash.

## Setup

Requisiti: Node 20+ e [pnpm](https://pnpm.io/) 11+.

```bash
pnpm install                                # installa tutto il workspace
cp .env.local.example apps/web/.env.local   # opzionale: la demo gira anche senza chiavi
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

## Note

- I design token sono l'unica fonte di verità: modificali in
  [`packages/tokens/tokens.css`](packages/tokens/tokens.css) e si propagano a tutto il sito.
- L'**AI è disabilitata per scelta** (`apps/web/lib/ai.ts`): le feature "intelligenti"
  rispondono con fallback deterministici. La demo non chiama mai un servizio esterno.
- Deploy: un unico progetto **Vercel** serve tutte le route. Imposta **Root Directory =
  `apps/web`** e premi Deploy (nessuna variabile d'ambiente necessaria). Guida completa:
  [`docs/DEPLOY-VERCEL.md`](docs/DEPLOY-VERCEL.md).
