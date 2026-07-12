# Struttura delle Directory — Vetrina Servizi

> Generato da Code Maniac · aggiornato 2026-07-12 (R1, roadmap-migliorie-3). **Documento
> deterministico:** albero da `tree.mjs`, non modificarlo a mano — modifica il codice, poi rigenera.

## Mappa (generata)

```
├── apps/
│   └── web/
│       ├── app/
│       │   ├── api/
│       │   │   ├── assistant/
│       │   │   │   └── route.ts
│       │   │   └── gestionale/
│       │   │       └── route.ts
│       │   ├── assistente/
│       │   │   └── page.tsx
│       │   ├── dashboard/
│       │   │   └── page.tsx
│       │   ├── gestionale/
│       │   │   └── page.tsx
│       │   ├── integrazioni/
│       │   │   └── page.tsx
│       │   ├── segnalazioni/
│       │   │   └── page.tsx
│       │   ├── favicon.ico
│       │   ├── globals.css
│       │   ├── icon.svg
│       │   ├── layout.tsx
│       │   ├── page.tsx
│       │   ├── robots.ts
│       │   └── sitemap.ts
│       ├── components/
│       │   ├── assistente/
│       │   │   ├── ChatWidget.tsx
│       │   │   ├── GlobalAssistant.tsx
│       │   │   ├── MessageBubble.tsx
│       │   │   ├── SiteAssistant.tsx
│       │   │   ├── SuggestionChips.tsx
│       │   │   └── types.ts
│       │   ├── dashboard/
│       │   │   ├── ContentEditorPanel.tsx
│       │   │   ├── ContentList.tsx
│       │   │   ├── ContenutiSection.tsx
│       │   │   ├── DashboardApp.tsx
│       │   │   ├── DashboardSidebar.tsx
│       │   │   ├── DashboardTopbar.tsx
│       │   │   ├── FilterBar.tsx
│       │   │   ├── InteractionsChart.tsx
│       │   │   ├── KpiCard.tsx
│       │   │   ├── SourcesChart.tsx
│       │   │   ├── TelemetriaSection.tsx
│       │   │   ├── TopPagesTable.tsx
│       │   │   └── TrafficChart.tsx
│       │   ├── gestionale/
│       │   │   ├── AssistantPanel.tsx
│       │   │   ├── columns.tsx
│       │   │   ├── DataTable.tsx
│       │   │   ├── DetailDrawer.tsx
│       │   │   ├── details.tsx
│       │   │   ├── filters.ts
│       │   │   ├── format.ts
│       │   │   ├── GestionaleApp.tsx
│       │   │   ├── heuristic.ts
│       │   │   ├── KpiCard.tsx
│       │   │   ├── OverviewChart.tsx
│       │   │   ├── OverviewView.tsx
│       │   │   ├── Sidebar.tsx
│       │   │   ├── Topbar.tsx
│       │   │   └── types.ts
│       │   ├── home/
│       │   │   ├── immersive/
│       │   │   │   ├── _assistente-data.ts
│       │   │   │   ├── ImmersiveAssistente.tsx
│       │   │   │   ├── ImmersiveDashboard.tsx
│       │   │   │   ├── ImmersiveGestionale.tsx
│       │   │   │   ├── ImmersiveIntegrazioni.tsx
│       │   │   │   ├── ImmersiveRicarica.tsx
│       │   │   │   ├── ImmersiveSegnalazioni.tsx
│       │   │   │   └── shared.tsx
│       │   │   ├── scenes/
│       │   │   │   ├── ClosingScene.tsx
│       │   │   │   ├── InterfacceScene.tsx
│       │   │   │   └── SolarTwinScene.tsx
│       │   │   ├── vetrina/
│       │   │   │   └── VetrinaTeaser.tsx
│       │   │   ├── AutoScroll.tsx
│       │   │   ├── CinematicGrain.tsx
│       │   │   ├── ClosingBubbles.tsx
│       │   │   ├── IntroOverlay.tsx
│       │   │   ├── ReplayButton.tsx
│       │   │   ├── ScrollCue.tsx
│       │   │   ├── ScrubVideo.tsx
│       │   │   └── VelocitySkew.tsx
│       │   ├── integrazioni/
│       │   │   ├── ConnectorCard.tsx
│       │   │   ├── ConnectorGrid.tsx
│       │   │   ├── data.ts
│       │   │   ├── FlowDiagram.tsx
│       │   │   ├── FlowLog.tsx
│       │   │   ├── FlowNode.tsx
│       │   │   └── types.ts
│       │   ├── segnalazioni/
│       │   │   ├── mockData.ts
│       │   │   ├── PriorityBadge.tsx
│       │   │   ├── ReportForm.tsx
│       │   │   ├── ReportList.tsx
│       │   │   ├── ReportRow.tsx
│       │   │   ├── SegnalazioniPanel.tsx
│       │   │   ├── StatusBadge.tsx
│       │   │   ├── StatusTimeline.tsx
│       │   │   └── types.ts
│       │   └── SiteChrome.tsx
│       ├── data/
│       │   ├── erp-mock.ts
│       │   ├── kb.ts
│       │   └── telemetry.ts
│       ├── lib/
│       │   └── ai.ts
│       ├── public/
│       │   └── assets/
│       │       ├── products/
│       │       │   ├── cavo-01.jpg
│       │       │   ├── cavo-02.jpg
│       │       │   ├── cavo-03.jpg
│       │       │   ├── cavo-04.jpg
│       │       │   ├── cavo-05.jpg
│       │       │   ├── cavo-06.jpg
│       │       │   ├── inverter-01.jpg
│       │       │   ├── pannello-01.jpg
│       │       │   └── wallbox-detail.jpg
│       │       ├── CavoAnimation.mp4
│       │       ├── solar-twin-poster.webp
│       │       ├── solar-twin.mp4
│       │       └── SolarPanelsAnimation.mp4
│       ├── scripts/
│       │   └── dev.mjs
│       ├── eslint.config.mjs
│       ├── next.config.ts
│       ├── package.json
│       ├── postcss.config.mjs
│       ├── tsconfig.json
│       └── vercel.json
├── docs/
│   ├── convenzioni/
│   │   └── best-practices.md
│   ├── roadmap-migliorie-2/
│   │   ├── 00-ORCHESTRATORE.md
│   │   ├── A-copy-brand.md
│   │   ├── B-immagini-reali.md
│   │   ├── C-autoscroll-gaussiano.md
│   │   ├── D-camera-scrittura.md
│   │   └── E-struttura-video.md
│   ├── DEBITO-TECNICO.md
│   ├── DEPLOY-VERCEL.md
│   ├── PROGETTO.md
│   ├── RICERCA.md
│   ├── RUNNING.md
│   └── struttura_directory.md
├── packages/
│   ├── config/
│   │   ├── eslint.base.mjs
│   │   ├── eslint.package.mjs
│   │   ├── package.json
│   │   ├── prettier.config.json
│   │   └── tsconfig.base.json
│   ├── lib/
│   │   ├── src/
│   │   │   ├── assets.ts
│   │   │   ├── gsap.ts
│   │   │   ├── motion.ts
│   │   │   ├── site.ts
│   │   │   ├── theme.ts
│   │   │   └── utils.ts
│   │   ├── eslint.config.mjs
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── tokens/
│   │   ├── base.css
│   │   ├── package.json
│   │   └── tokens.css
│   └── ui/
│       ├── src/
│       │   ├── AnimatedCounter.tsx
│       │   ├── Badge.tsx
│       │   ├── Button.tsx
│       │   ├── Card.tsx
│       │   ├── Container.tsx
│       │   ├── Footer.tsx
│       │   ├── Header.tsx
│       │   ├── LenisProvider.tsx
│       │   ├── PageTransition.tsx
│       │   ├── ScrollReveal.tsx
│       │   ├── Section.tsx
│       │   ├── SplitTextReveal.tsx
│       │   └── ThemeProvider.tsx
│       ├── eslint.config.mjs
│       ├── package.json
│       └── tsconfig.json
├── tools/
│   └── shot.mjs
├── .env.local.example
├── .gitignore
├── .nvmrc
├── .prettierignore
├── CLAUDE.md
├── NOTES-shared.md
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── prettier.config.mjs
├── README.md
└── turbo.json
```

## Responsabilità per cartella

| Cartella                           | Responsabilità                                                                           | Cosa NON ci va                                     |
| ---------------------------------- | ---------------------------------------------------------------------------------------- | -------------------------------------------------- |
| `apps/web/app/**`                  | Routing/composizione: le pagine compongono componenti, niente logica di business inline  | fetch/calcoli/markup di business inline            |
| `apps/web/components/<feature>/**` | Componenti di business di una feature, parametrizzati via props                          | logica di un'altra feature; chiamate cross-feature |
| `apps/web/components/home/**`      | La presentazione scrollytelling: scene, kit immersivo (`immersive/shared.tsx`), showcase | logica delle route demo (/dashboard ecc.)          |
| `apps/web/data/**`                 | Dati finti/placeholder (JSON/TS tipizzati)                                               | segreti; fetch runtime                             |
| `apps/web/lib/**`                  | Helper server-side (AI mock), utilità app-specifiche                                     | segreti hardcoded; codice client che espone chiavi |
| `apps/web/app/api/**`              | Route handler server-side (assistant, gestionale — AI simulata)                          | chiavi nel client; logica UI                       |
| `packages/ui/**` `[SHARED]`        | Primitive UI e shell (Header/Footer/Theme) riusate ovunque                               | logica di una singola sezione                      |
| `packages/tokens/**` `[SHARED]`    | Design token (colore/tipografia/spacing) — **unica fonte**                               | valori inline duplicati altrove                    |
| `packages/lib/**` `[SHARED]`       | Tipi/utility puri condivisi (site, theme, motion, gsap)                                  | dipendenze verso `ui` (no cicli)                   |
| `docs/**`                          | Documentazione e regìa (roadmap attiva: `roadmap-migliorie-3/`)                          | codice sorgente                                    |
| `tools/**`                         | Script dev-only (`shot.mjs` screenshot manuale)                                          | codice di runtime dell'app                         |
| `graphify-out/**`                  | Grafo di conoscenza della codebase (graphify) — rigenerabile                             | modifiche a mano                                   |

## Regole di collocazione

- L'entry-point (route/pagine) **compone** soltanto: niente logica di business.
- Componenti di business → cartella di feature dedicata, mai nuove cartelle top-level inventate.
- Le dipendenze vanno in **una direzione** (UI → logica → dati): `ui` può usare `lib`/`tokens`,
  mai il contrario; nessun import ciclico.
- **Le scene non toccano `packages/**`**: consumano token e kit (`immersive/shared.tsx`).

## Note dal grafo (graphify · 2026-07-12)

- Grafo: **917 nodi · 1363 archi · 79 community** (`graphify-out/graph.json`, viz `graph.html`).
- Nodi-cardine (god nodes): `useImmersiveScene()` (15 archi) e gli helper del kit
  (`maskReveal`, `useReducedMotion`) — conferma che `immersive/shared.tsx` è IL cuore della home;
  `PROGETTO.md` (18) e `CLAUDE.md` (11) come fonti di verità documentali.
- Community principali: regole/roadmap · route API assistente · segnalazioni · dati ERP mock ·
  gestionale (euristiche/tabella/filtri) · kit scroll home · package condivisi.
- Query: `/graphify query "<domanda>"` — tenerlo fresco con `/graphify --update` a fine round.
