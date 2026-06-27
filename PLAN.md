# GM Group — PLAN (fonte di verità della demo per il colloquio)

> Questo file è la **regìa**. Ogni chat/agent Claude e ogni collaboratore lo legge PRIMA di
> lavorare. Aggiornarlo a fine di ogni fase. Affianca (non sostituisce) `CLAUDE.md`,
> `README.md`, `NOTES-shared.md`.

## 0. Missione

Costruire **UNA demo** da portare al **colloquio commerciale del 15 luglio 2026** (≈3 settimane da
2026-06-24) per vincere l'incarico di rinnovare i 3 siti del gruppo **GM Group**:

- **GM Solar** — EPC fotovoltaico · attuale: <https://www.gmsolar.it/> (Webflow, hero a video drone)
- **GMobility** — wallbox/colonnine ricarica EV · attuale: <https://gmobility.it/> (WordPress, viola+verde)
- **Cavo Perfetto** — e-commerce cavi di ricarica · attuale: <https://cavoperfetto.it/> (WordPress/WooCommerce, datato)

Obiettivo della demo: **mostrare funzionalità e capacità tecnica** ("il futuro dei siti web"),
NON consegnare 3 siti finiti. Vince chi crea **2-3 momenti "wow" + una storia chiara + prova di
tech moderna**.

## 1. Decisioni bloccate (2026-06-24)

1. **Scope** = una sola demo unificata, estendendo il monorepo `apps/web` esistente (hub + 3
   mondi + feature firma + deck di presentazione `Shift+D`). Niente 3 siti separati.
2. **E-commerce Cavo Perfetto** = **ridisegnato da zero** ma **finto**: catalogo locale + AI,
   nessun backend/checkout reale. Shopify Hydrogen / Medusa li *proponiamo a voce* come "fase di
   produzione". Nessun pagamento reale nella demo.
3. **Dashboard "il cliente edita i contenuti"** = **mock UI** (si vede il concetto), **senza CMS
   reale** (niente Sanity/Payload nella demo).
4. **Visual** (no AI Ultra → niente Imagen/Veo): (a) **video/foto 4K da stock gratuito**
   (Pexels/Pixabay/Coverr…); (b) **Google AI Studio sezione "Build/app"** per **grafiche
   interattive** (Three.js, shader, generative-UI) da portare poi nei componenti. Vedi
   `docs/ai-studio-briefs/01-visual-hero.md`.

## 2. Stack

**Confermato (basso rischio, già in repo):** Next.js App Router + React 19 + TS · GSAP +
ScrollTrigger + Lenis · React Three Fiber + drei + postprocessing · MapLibre GL · Vercel ·
glTF + Draco · Tailwind v4 (token in `packages/tokens`).

**Consigliato (da introdurre):**
- AI = **Claude** (default; `apps/web/lib/ai.ts` è già multi-provider Anthropic/Gemini/DeepSeek).
- **Generative UI** = Vercel AI SDK (`ai`, `streamUI`/tool-calling) → l'AI renderizza componenti.
- **RAG leggero** = embeddings + JSON locale (knowledge base azienda/FAQ/catalogo). Niente infra
  pesante per una demo. Per ora la KB è **mock** (nessun fatto aziendale reale ancora fornito).
- **WebGPU** = stretch opzionale (supporto browser incerto) → default WebGL.
- Analytics cookieless (Plausible/Umami) = bonus di fine corsa.

## 3. Backlog feature (priorità: 🌟 WOW · 🔧 Core · ➕ Bonus)

Legenda stato: ✅ già c'è · ⬆️ da elevare · ✨ nuovo · ✔️ FATTO (a codice su `main`) · ⬜ ANCORA DA FARE

### ☀️ GM Solar — mondo "cinematic" (video 4K + motion)
- 🌟 ✔️ Hero **scrollytelling cinematografico** (video drone scrub + GSAP/Lenis, testi sync) — `SolarHero`
- 🔧 ✔️ Calcolatore risparmio/ROI con grafici **animati live** — `SolarCalculator`
- 🔧 ✔️ Lead-qualifier AI → genera una **"proposta impianto"** — `/solar/lead` + `api/lead-qualifier`
- ➕ ✔️ Mappa progetti (MapLibre) — `SolarMap` (coordinate placeholder)
- ➕ ✔️ **Bonus oltre piano:** analytics NL→SQL — `/solar/analytics` + `api/analytics`

### 🔌 GMobility — mondo "3D scroll"
- 🌟 ✔️ **Wallbox 3D configuratore** (R3F + glTF + postprocessing + poster fallback) — `three/WallboxScene`, `Configurator`
- 🔧 ✔️ Mappa colonnine (MapLibre + Open Charge Map, fallback curato) — `ChargingMap`
- 🔧 ✔️ Assistente di ricarica di bordo (costi/tempi live) — `/mobility/agent`
- NB: il brand reale usa **viola + verde** (il nostro token mobility è solo verde) → decidere se introdurre il viola.

### 🛒 Cavo Perfetto — rebuild + AI
- 🌟 ✔️ **"Che cavo per la mia auto?"** (AI function-calling + fallback wizard) — `CableFinder` + `api/cable-finder`
- 🌟 ⬜ **Chatbot RAG** su azienda/FAQ/catalogo (la "chat box interna") — **non ancora costruito** (KB mock da fare)
- 🔧 ✔️ Catalogo + PDP `/shop/[id]` + carrello **premium** — `Catalog`, `ProductCard`, `cart/*`
- Dati reali visti (da rispecchiare in `data/products.json`): cavi **Mennekes Modo 3 / Tipo 2**
  (liscio/spiralato) ~€219, **Modo 2 / Tipo 2 Schuko** ~€389; claim "Spedizioni gratuite / Reso facile".

### 🏢 Livello gruppo
- 🌟 ⬜ **Mock dashboard** "i contenuti li cambiate voi" (UI, no CMS reale) — **non ancora costruito**
- 🔧 ✔️ SEO tecnica (metadata/OG/JSON-LD/sitemap/robots/favicon) — sitewide in fase 5
- ➕ ⬜ Analytics cookieless — **non ancora**
- 🔁 ✔️ **Generative/AI UI = filo conduttore** (cable finder, lead, analytics, agent)
- 🎬 ✔️ **Story-tour "Demo Wrapped"** per il colloquio — `/demos/tour` + `PresentationDeck`

## 4. Piano ~3 settimane (24 giu → 15 lug 2026)

| Sett. | Date | Obiettivo | Stato |
|---|---|---|---|
| **1** | 24–30 giu | Fondamenta + deck · **Solar hero cinematic** (placeholder→AI Studio) · avvio rebuild Cavo Perfetto | ✔️ fatto |
| **2** | 1–7 lug | **GMobility scrollytelling 3D** · Cavo Perfetto premium (catalogo/PDP/carrello) · **generative-UI cable advisor** | ✔️ fatto (in anticipo) |
| **3** | 8–14 lug | **Chatbot RAG** (KB mock) · proposta solare AI · **mock dashboard** · polish/perf/a11y · **prova generale col deck** | 🟡 parziale: proposta solare ✔️, polish/perf/a11y ✔️, tour ✔️; **RAG ⬜** e **mock dashboard ⬜** |
| 🎯 | **15 lug** | **COLLOQUIO** | — |

> ⚠️ 3 settimane, non 4: prioritizzazione spietata. Per ogni mondo **1 momento-wow** garantito;
> il resto è bonus.
>
> **Avanzamento (27 giu):** sezioni Solar/Mobility/Shop ✔️, app unificata ✔️, 3 demo AI integrate ✔️,
> SEO/perf/a11y ✔️, story-tour ✔️. **Restano 2 feature di piano:** Chatbot RAG (KB mock) e Mock
> dashboard "i contenuti li cambiate voi" — più, se c'è tempo, analytics cookieless e il glTF reale
> del wallbox. Si è **avanti rispetto alla tabella**: la Sett. 3 può concentrarsi su questi 2 deliverable
> + prova generale.

## 5. Modello di regìa / ownership

- **Direttore (chat principale Claude):** architettura, decisioni, brief, review, integrazione,
  mantiene questo PLAN. Lavora a fasi: a fine fase si ferma e aspetta il "via" (regola CLAUDE.md).
- **Chat/agent Claude paralleli:** una per fetta verticale, ognuna nel proprio recinto
  (riusa la "Ownership map" di `CLAUDE.md`):
  - SOLAR → `apps/web/app/solar/**`, `apps/web/components/solar/**`
  - MOBILITY → `apps/web/app/mobility/**`, `apps/web/components/mobility/**`
  - SHOP → `apps/web/app/shop/**`, `apps/web/components/shop/**`
  - AI/RAG → `apps/web/app/api/**`, `apps/web/lib/**`
  - Zona condivisa (`packages/**`, layout, token) = NON si tocca senza autorizzazione → `NOTES-shared.md`.
- **Google AI Studio (Gemini/Imagen/Veo):** visual hero, texture, concept art, video loop, copy,
  prototipi. Brief in `docs/ai-studio-briefs/`. (NB: niente glTF di produzione da AI Studio.)
- **Alberto (owner):** asset reali (loghi, foto/video, dati catalogo, fatti aziendali per il RAG),
  decisioni business, conduce il colloquio.

## 6. Cosa serve da Alberto (per sbloccare le fasi)

- [x] Screenshot dei 3 siti reali ricevuti (recon completa).
- [x] Data colloquio = **15 luglio 2026**.
- [x] Asset reali non ancora disponibili → **placeholder + output AI Studio** (swappabili a fine corsa).
- [x] RAG → niente fatti aziendali per ora → **knowledge base mock**.
- [ ] (quando arrivano) asset reali: video drone 4K, foto impianti/prodotti, loghi vettoriali; catalogo reale Cavo Perfetto.

## 7. Stato

- **2026-06-24** — Fase 0 avviata. Repo analizzato (build verde da QA-REPORT, gira su :3001).
  Decisioni 1-4 bloccate. Creati `PLAN.md` e brief AI Studio.
- **2026-06-24 (agg.)** — Ricevuti screenshot dei 3 siti reali. Data colloquio = **15 lug 2026**
  (3 settimane) → timeline compressa a 3 settimane. Brief AI Studio riscritto più chiaro
  (`docs/ai-studio-briefs/01-visual-hero.md`). Pronto alla **Fase 1 (Solar hero cinematic)** al
  "via": parto sul video placeholder già nel repo, swap con l'output AI Studio quando pronto.
- **2026-06-24 (sera)** — Fase 1 Solar COMPLETATA dalla chat parallela (hero cinematic +
  film-grade/vignette/grana + regia di scroll pinnata; build/lint/typecheck verdi; review
  adversarial → 3 fix, incl. `pinReparent` per il pin dentro layout trasformato). **Da validare
  visivamente.** **AI Studio round 1:** Cable Advisor = ✅ keeper (→ portare in Cavo Perfetto);
  shader "Organic Energy" = 🟡 buono ma da domare (sfondo); Wallbox 3D da primitive = 🔴 debole →
  serve **glTF reale** (il repo ha già `components/mobility/three/WallboxScene.tsx`).
- **2026-06-25 — Fasi 2-4 (le 3 sezioni, in parallelo).** SOLAR, MOBILITY, SHOP costruite ognuna
  nel proprio recinto e poi mergiate. Stato a codice oggi:
  - **Solar** ✅ hero cinematic + stats + tipologie + servizi + case study + **mappa progetti**
    (MapLibre) + **calcolatore ROI**. (`app/solar`, `components/solar`).
  - **Mobility** ✅ stage 3D R3F + **configuratore wallbox 3D** (glTF + poster fallback) + market
    stats + **mappa colonnine** (Open Charge Map + fallback curato Piemonte). (`app/mobility`,
    `components/mobility`).
  - **Shop** ✅ hero + **AI cable finder** (chat function-calling + fallback wizard) + catalogo +
    PDP `/shop/[id]` + carrello + trust. (`app/shop`, `components/shop`).
- **2026-06-25 — Fase 5 (merge + SEO + perf).** Tre sezioni mergiate su `main` (mobility → solar →
  shop), build/typecheck verdi. Recepiti i 2 interventi shared di Mobility (`@types/three`, cast in
  `SplitTextReveal`). Aggiunti SEO sitewide (metadata/OG per route, `sitemap.ts`, `robots.ts`,
  JSON-LD Organization/LocalBusiness, favicon) + poster sul video hero home (LCP 4.8s→2.4s).
  **Fase 5.1:** 2 rilievi a11y shared risolti (A11y Lighthouse 100 su home e solar); gating del
  render loop 3D Mobility sul viewport; `/solar` con poster WebP come LCP + video lazy (Perf 50→72).
- **2026-06-25 — Fase 6 (app unica).** Il monorepo era 4 app Next separate (`apps/{hub,solar,mobility,shop}`):
  riportato tutto a **UN solo sito** (`apps/web`) su `:3000`. Tema derivato dalla route
  (`themeFromPath`) + script no-flash pre-paint; carrello in `app/shop/layout.tsx`; shop ribasato a
  `/shop`. `packages/*` restano librerie condivise (`transpilePackages`). Dipendenze unificate
  (`three`, R3F, `maplibre-gl`, `lucide-react`, `motion`, `recharts`).
- **2026-06-25 — Fase 7 (integrazione 3 demo AI di Jacopo).** Portate come route nel sito unico,
  re-tematizzate, AI spostata server-side: **`/mobility/agent`** (assistente di bordo, client-only),
  **`/solar/lead`** (lead-qualifier → `app/api/lead-qualifier`), **`/solar/analytics`** (NL→SQL +
  gatekeeper → `app/api/analytics`, dep `recharts`). Helper AI multi-provider `apps/web/lib/ai.ts`
  (Anthropic/Gemini/DeepSeek, JSON single-shot); il cable-finder resta sul suo helper di streaming.
  Tutte le route AI funzionano **senza chiave** (pre-baked + euristica). **Chiavi sempre solo server-side.**
- **2026-06-25 — Feature "Demo Wrapped" (story-tour).** Player di tour interattivo a slide con
  navigazione + progress (`/demos`, `/demos/tour`; `components/demos/TourPlayer/TourSlide/TourProgress`),
  più `PresentationDeck` per il colloquio. Ultimo commit su `main` (`ec5393d`).
- **2026-06-27 — Stato corrente.** `main` = `origin/main` (`ec5393d`), working tree pulito.
  **Typecheck verde** (5 package, 3 task ok). Restano aperti (non bloccanti) i placeholder e i
  debiti in `NOTES-shared.md`: `OCM_API_KEY` da impostare su Vercel, coordinate/foto/loghi Solar
  segnaposto, header che sborda ≤390px, asset video di stock da swappare.
