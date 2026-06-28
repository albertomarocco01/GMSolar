# Struttura delle Directory — Vetrina Servizi

> Generato da Code Maniac `init` · 2026-06-28. **Documento deterministico:** rigenerabile a ogni commit (`scan` / graphify). Non modificarlo a mano — modifica il codice, poi rigenera. Le voci marcate _(pianificato)_ non esistono ancora: le crea la roadmap.

## Mappa

```
GM-SOLAR/
├─ apps/
│  └─ web/                         # IL sito unico (tutte le route) → :3000
│     ├─ app/
│     │  ├─ layout.tsx             # root: ThemeProvider, font Geist, no-flash, GlobalAssistant  [SHARED]
│     │  ├─ page.tsx               # / landing scroll-narrativa (7 capitoli servizi)
│     │  ├─ globals.css            # @import token + utility globali  [SHARED]
│     │  ├─ robots.ts · sitemap.ts # sitemap include i 7 servizi (registry)
│     │  ├─ solar/ mobility/ shop/ # mondi-esempio (servizio #1) + /mobility/agent (servizio #5)
│     │  ├─ demos/                 # /demos, /demos/tour  (story-tour, deck)
│     │  ├─ assistente/            # servizio #2: pagina assistente AI
│     │  ├─ dashboard/             # servizio #3: telemetria + contenuti (mock)
│     │  ├─ gestionale/            # servizio #4: gestionale + AI (mock)
│     │  ├─ integrazioni/          # servizio #6: showcase API simulato
│     │  ├─ segnalazioni/          # servizio #7: pannello segnalazioni (mock)
│     │  └─ api/                   # cable-finder, charging-points, lead-qualifier, analytics,
│     │                            #   assistant, gestionale (route AI, fallback deterministico)
│     ├─ components/
│     │  ├─ home/                  # Hero + Chapter + ChapterVisual + visuals/ (narrativa)
│     │  ├─ solar/ mobility/ shop/ # sezioni-esempio
│     │  ├─ demos/                 # TourPlayer, PresentationDeck, catalog, tour
│     │  ├─ assistente/            # SiteAssistant, GlobalAssistant, ChatWidget, …
│     │  ├─ dashboard/             # DashboardApp, grafici recharts, editor contenuti
│     │  ├─ gestionale/            # GestionaleApp, DataTable<T>, AssistantPanel, …
│     │  ├─ integrazioni/          # ConnectorGrid, FlowDiagram, FlowLog
│     │  ├─ segnalazioni/          # SegnalazioniPanel, ReportForm/List, timeline
│     │  └─ servizi/               # ServiceStub (fallback pagina-servizio)
│     ├─ data/                     # solar-projects, products, ev-onboard, charging-fallback,
│     │                            #   telemetry, erp-mock, kb  (registry SERVICES → packages/lib/site.ts)
│     ├─ lib/ai.ts                 # helper AI multi-provider (server-only)
│     ├─ public/assets/            # video/poster/immagini placeholder
│     ├─ next.config.ts · tsconfig.json · package.json
│
├─ packages/                       # [SHARED] librerie di workspace
│  ├─ ui/src/                      # primitive: Button, Card, Section, Container, Badge,
│  │                               #   AnimatedCounter, ScrollReveal, SplitTextReveal,
│  │                               #   Header, Footer, ThemeProvider, LenisProvider, PageTransition
│  ├─ tokens/                      # tokens.css (fonte unica colore/tipografia) + base.css
│  ├─ lib/src/                     # site, theme, assets, motion, gsap, utils, types
│  └─ config/                      # tsconfig/eslint/prettier base
│
├─ docs/                           # PROGETTO, struttura, ROADMAP, DEBITO, RICERCA, convenzioni/
│  ├─ scraping/                    # provenienza dati dai siti reali
│  └─ ai-studio-briefs/           # brief visual per asset generati
├─ tools/                          # script dev-only una-tantum
├─ CLAUDE.md · PLAN.md · NOTES-shared.md · README.md
└─ turbo.json · package.json · pnpm-workspace.yaml
```

## Responsabilità per cartella

| Cartella | Responsabilità | Cosa NON ci va |
|---|---|---|
| `apps/web/app/**` | Routing/composizione: le pagine compongono componenti, niente logica di business inline | fetch/calcoli/markup di business inline |
| `apps/web/components/<feature>/**` | Componenti di business di una feature, parametrizzati via props | logica di un'altra feature; chiamate cross-feature |
| `apps/web/data/**` | Dati finti/placeholder e registry (JSON/TS tipizzati) | segreti; fetch runtime |
| `apps/web/lib/**` | Helper server-side (AI), utilità app-specifiche | segreti hardcoded; codice client che espone chiavi |
| `apps/web/app/api/**` | Route handler server-side (AI, mappe, integrazioni) | chiavi nel client; logica UI |
| `packages/ui/**` `[SHARED]` | Primitive UI e shell (Header/Footer/Theme) riusate da tutte le sezioni | logica di una singola sezione |
| `packages/tokens/**` `[SHARED]` | Design token (colore/tipografia/spacing) — **unica fonte** | valori inline duplicati altrove |
| `packages/lib/**` `[SHARED]` | Tipi/utility puri condivisi (site, theme, motion, gsap) | dipendenze verso `ui` (no cicli) |
| `docs/**` | Documentazione e regìa | codice sorgente |
| `tools/**` | Script dev-only una-tantum | codice di runtime dell'app |

## Regole di collocazione

- L'entry-point (route/pagine) **compone** soltanto: niente logica di business.
- Componenti di business → cartella di feature dedicata, mai nuove cartelle top-level inventate.
- Le dipendenze vanno in **una direzione** (UI → logica → dati): `ui` può usare `lib`/`tokens`,
  mai il contrario; nessun import ciclico.
- **Le demo nuove non toccano `packages/**`**: consumano i token e si registrano nel registry
  servizi creato in Fondazione.
- Verifica deterministica: `dependency-cruiser` / `madge` (da installare con `scan setup`).

## Note dal grafo (graphify)

graphify non ancora eseguito su questa codebase (non attivo nell'ambiente). Da popolare al primo
`/graphify`: community principali (probabili: shell condivisa, i 3 mondi, le route AI), nodi-cardine
attesi (`packages/tokens/tokens.css`, `packages/ui`, `apps/web/lib/ai.ts`, registry servizi),
accoppiamenti da sorvegliare (qualsiasi import da una demo verso `packages/**` oltre i token).
