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

Legenda stato: ✅ già c'è · ⬆️ da elevare · ✨ nuovo

### ☀️ GM Solar — mondo "cinematic" (video 4K + motion)
- 🌟 ⬆️ Hero **scrollytelling cinematografico** (video drone 4K scrub + GSAP/Lenis, testi sync)
- 🔧 ⬆️ Calcolatore risparmio/ROI con grafici **animati live**
- 🔧 ⬆️ Lead-qualifier AI → genera una **"proposta impianto"** (generative UI)
- ➕ ✅ Mappa progetti reali

### 🔌 GMobility — mondo "3D scroll"
- 🌟 ⬆️ **Wallbox 3D "esploso" pilotato dallo scroll** (R3F + Draco + shader/postprocessing)
- 🔧 ✅ Mappa colonnine (MapLibre + Open Charge Map, fallback curato)
- 🔧 ⬆️ Assistente di ricarica di bordo (costi/tempi live)
- NB: il brand reale usa **viola + verde** (il nostro token mobility è solo verde) → decidere se introdurre il viola.

### 🛒 Cavo Perfetto — rebuild + AI
- 🌟 ✨⬆️ **"Che cavo per la mia auto?" con generative UI** (card prodotto/confronto generati)
- 🌟 ✨ **Chatbot RAG** su azienda/FAQ/catalogo (la "chat box interna")
- 🔧 ⬆️ Catalogo + PDP + carrello **ridisegnati premium** (da zero)
- Dati reali visti (da rispecchiare in `data/products.json`): cavi **Mennekes Modo 3 / Tipo 2**
  (liscio/spiralato) ~€219, **Modo 2 / Tipo 2 Schuko** ~€389; claim "Spedizioni gratuite / Reso facile".

### 🏢 Livello gruppo
- 🌟 ✨ **Mock dashboard** "i contenuti li cambiate voi" (UI, no CMS reale)
- 🔧 ✅ SEO tecnica (metadata/OG/JSON-LD/sitemap) + storia Google Business / local SEO
- ➕ ✨ Analytics cookieless
- 🔁 **Generative UI = filo conduttore** trasversale

## 4. Piano ~3 settimane (24 giu → 15 lug 2026)

| Sett. | Date | Obiettivo |
|---|---|---|
| **1** | 24–30 giu | Fondamenta + deck · **Solar hero cinematic** (placeholder→AI Studio) · avvio rebuild Cavo Perfetto |
| **2** | 1–7 lug | **GMobility scrollytelling 3D** · Cavo Perfetto premium (catalogo/PDP/carrello) · **generative-UI cable advisor** |
| **3** | 8–14 lug | **Chatbot RAG** (KB mock) · proposta solare AI · **mock dashboard** · polish/perf/a11y · **prova generale col deck** |
| 🎯 | **15 lug** | **COLLOQUIO** |

> ⚠️ 3 settimane, non 4: prioritizzazione spietata. Per ogni mondo **1 momento-wow** garantito;
> il resto è bonus. Il repo è già al ~60%, quindi è fattibile, ma niente scope creep.

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
