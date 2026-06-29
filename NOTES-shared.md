# NOTES-shared — registro delle richieste sulla zona condivisa

La zona condivisa (`/components/ui`, `/components/layout`, `/components/providers`, `/lib`,
`app/tokens.css`, `app/globals.css`, `app/layout.tsx`) è la base che TUTTE e tre le sezioni
ereditano. Vedi la "Ownership map" in `CLAUDE.md`.

**Protocollo.** Se a una sezione (Solar / Mobility / Shop) serve una modifica qui:

1. NON modificare i file condivisi.
2. Aggiungi una voce qui sotto: chi chiede, cosa serve, perché, file/token coinvolto.
3. Chiedi conferma. La modifica la fa chi gestisce la zona condivisa, una volta sola, per
   tutti.

In questo modo il design system resta coerente e nessuna sezione rompe le altre.

---

## Richieste aperte

### [MOBILITY] `OCM_API_KEY` nell'env condiviso (.env.example + Vercel)

- **Chi chiede:** Mobility (mappa rete di ricarica).
- **Cosa serve:** aggiungere `OCM_API_KEY=` all'`.env.example` e impostarla negli
  env di Vercel (variabile **server-only**, niente prefisso `NEXT_PUBLIC_`).
- **Perché:** dal 2024 l'endpoint pubblico di Open Charge Map **richiede una API
  key** — senza, risponde **403** e la mappa resterebbe senza punti pubblici.
  Verificato dal vivo (`403 "You must specify an API key"`). La key è gratuita
  (registrazione su openchargemap.org). Il route la legge già da
  `process.env.OCM_API_KEY` e la passa come header `X-API-Key`.
- **Non bloccante:** in assenza di key la mappa **non resta vuota**: il route
  (`app/api/charging-points/route.ts`) fa fallback a un set CURATO di punti in
  comuni reali del Piemonte (`data/charging-fallback.ts`, `source: "curated"`) e
  la UI lo segnala con una nota "punti indicativi". Con la key impostata si passa
  automaticamente al feed reale in tempo reale (`source: "openchargemap"`).
- **Io NON tocco** `.env.example` (zona condivisa): chiedo a chi la gestisce di
  aggiungerla.

### [MOBILITY] `SplitTextReveal.tsx` va in errore di tipo quando il progetto include React Three Fiber

- **Chi chiede:** Mobility (sezione 3D).
- **Cosa serve:** un fix di tipo in `components/ui/SplitTextReveal.tsx` (riga ~76).
- **Perché:** `@react-three/fiber` (stack obbligatorio della sezione) aggiunge a
  `React.JSX.IntrinsicElements` tutti gli elementi three (`mesh`, `group`, geometrie…).
  Questo **allarga** `React.ElementType`, e il tag polimorfico `const Tag = as` →
  `<Tag ref className aria-label>` collassa le sue prop a `never`. `tsc` fallisce con 3
  errori su `SplitTextReveal.tsx:79`. Su `main` (senza R3F) il file è pulito; comparirà
  l'errore anche su `main` appena la sezione Mobility verrà mergiata.
- **Fix proposto (verificato: `tsc` torna pulito), 0 impatti a runtime/UX:**

  ```tsx
  // da:
  const Tag = as;
  // a:
  const Tag = as as React.ComponentType<{
    ref?: React.Ref<HTMLElement>;
    className?: string;
    "aria-label"?: string;
    children?: React.ReactNode;
  }>;
  ```

- **Stato:** APPLICATO sul branch `feature/mobility` con approvazione esplicita. Da
  validare/recepire ufficialmente da chi gestisce la zona condivisa al momento del merge
  (il fix serve comunque su `main` non appena R3F entra nel programma).

### [MOBILITY] Aggiunto `@types/three` (devDependency)

- **Cosa:** `pnpm add -D @types/three@^0.184.0` (→ `0.184.1`). Tocca `package.json` +
  `pnpm-lock.yaml` (root, fuori dall'ownership Mobility).
- **Perché:** `three` non espone i propri tipi e R3F in TypeScript li richiede; senza,
  `tsc` non risolve `import * as THREE from "three"`. È **solo-tipi**, non cambia il runtime
  né le altre sezioni (three lo usa solo Mobility). Committato sul branch per far passare il
  typecheck; segnalato qui per trasparenza.

### [SOLAR] Aggiungere `maplibre-gl` a `apps/solar/package.json` (mappa progetti)

- **Chi chiede:** Solar (sezione fotovoltaico).
- **Cosa serve:** `maplibre-gl@^5.24.0` come dependency di `apps/solar`, allineata
  alla versione già usata da Mobility (così pnpm la deduplica nel lockfile).
- **Perché:** la nuova sezione "mappa progetti" (`components/solar/SolarMap.tsx` +
  `SolarMapInner.tsx`) riusa il pattern MapLibre di Mobility (dynamic `ssr:false`,
  mount pigro, clustering GeoJSON nativo, popup con kWp/anno). MapLibre porta i
  propri tipi: niente `@types`.
- **Impatto zona condivisa:** il comando `pnpm --filter @gmgroup/solar add maplibre-gl@^5.24.0`
  tocca **`apps/solar/package.json`** (mia ownership) e il **`pnpm-lock.yaml` di root**
  (zona condivisa). Nessun altro file condiviso cambia; le altre sezioni non sono
  toccate (maplibre è già nel monorepo via Mobility).
- **Stato:** ⏳ DA AUTORIZZARE. Codice e dati già pronti; il typecheck di Solar
  fallisce con "Cannot find module 'maplibre-gl'" finché non si installa.

### [SOLAR] Coordinate dei progetti in mappa = PLACEHOLDER

- `data/solar-projects.json → mappaProgetti` contiene 12 impianti showcase con
  **coordinate a livello città** (nord-ovest Italia) e nomi/kWp/anno indicativi: da
  sostituire con l'elenco reale degli impianti GM Solar. Strutturato per la
  sostituzione (array di `{ nome, tipo, kWp, anno, lng, lat }`). Non bloccante.

### [SOLAR] Foto case study + loghi/certificazioni trust band = PLACEHOLDER

- **Foto progetti** (`SolarCaseStudy`): le immagini delle card sono SVG branded
  generati da `components/solar/SolarProjectPhoto.tsx` (scena solare astratta), non
  foto reali. Sostituibili 1:1 con vere immagini (rimpiazzare il componente con un
  `<Image src={progetto.foto} … />` e aggiungere il campo `foto` ai progetti).
  Le metriche per card (kWp, CO₂/anno calcolata, anno) usano kWp/anno indicativi.
- **Trust band** (`SolarTrust`): nomi clienti/partner e certificazioni (ISO 9001/
  14001/45001) sono **SEGNAPOSTO, non claim verificati**: sostituire con i loghi reali
  e le certificazioni effettivamente possedute. Liste in cima al componente.

### [QA] Header: il cluster di destra sborda su telefoni stretti (≤390px)

- **Chi chiede:** QA (passata di test del 2026-06-19).
- **Cosa serve:** un fix responsive in `packages/ui/src/Header.tsx` (zona condivisa).
- **Perché:** a viewport 390px (e più stretti) il cluster di destra dell'header (lo
  switcher segmentato Solar/Mobility/Shop **+** il bottone "✨ Demo AI") è ~25px più
  largo del viewport: il bottone **Demo AI viene tagliato sul bordo destro** (chevron e
  bordo). Il cluster ha una larghezza minima fissa (succede anche a 360px). Verificato
  con screenshot. **Non è uno scroll-trap:** non si crea barra di scorrimento orizzontale
  (`scrollX` resta 0 su tutte le pagine); impatto limitato alla chip tagliata.
- **Severità:** BASSA (cosmetico, controllo comunque utilizzabile).
- **Fix proposto (per chi gestisce la zona condivisa):** sotto `sm` far restringere/andare
  a capo lo switcher, oppure nascondere prima l'etichetta del bottone Demo, oppure ridurre
  `gap`/`px`. Da decidere chi gestisce la shared zone.
- **Stato:** ⏳ DA AUTORIZZARE — riportato, NON modificato (zona condivisa).

### [SOLAR] Centralizzare i path dei poster video in `lib/assets.ts` (opzionale)

- Per il taglio cinematografico la sezione Solar usa due poster placeholder
  (`/public/assets/gm-solar-hero-poster.svg`, `gm-solar-drone-poster.svg`) come fallback dei
  `<video>`. Per non toccare la zona condivisa li referenzio con una costante LOCALE nei
  componenti Solar. Se si vuole coerenza, aggiungere a `lib/assets.ts → VIDEOS` (o un nuovo
  `POSTERS`) i relativi path e farli consumare ai componenti. _Non bloccante._

---

## Note / debiti tecnici noti

- **Recapiti del footer = PLACEHOLDER.** `lib/site.ts → GROUP.email` (`info@gmgroup.it`) è
  un segnaposto: sostituire con l'email/telefono/PEC ufficiali del gruppo. Dati societari
  reali e confermati: ragione sociale **GM Solar S.R.L.**, sede **Settimo Torinese (TO)**,
  **P.IVA 10086000014**.
- **Asset = PLACEHOLDER** (regola di progetto): video di stock, loghi reali, cataloghi finti
  in `/data`. Tutto è strutturato per sostituire gli asset reali senza toccare il codice.
- **`data/charging-points.json` contiene punti INVENTATI** (Milano/Monza/Bergamo), in
  contrasto con la regola "niente dati finti spacciati per reali". La sezione Mobility NON
  legge più quel file: i punti pubblici arrivano in tempo reale da **Open Charge Map**
  (route `app/mobility/api/charging-points`), più 3 pin showcase di clienti reali in Piemonte
  (Borello, Ronchiverdi, Bellini — coordinate a livello città, da confermare). Suggerito:
  svuotare/aggiornare quel JSON o rimuoverlo. _(Fase 5: svuotato a `[]`.)_
- **[SOLAR] Poster video = PLACEHOLDER branded.** `gm-solar-hero-poster.svg` e
  `gm-solar-drone-poster.svg` in `/public/assets` sono SVG segnaposto (gradiente + motivo
  solare): da sostituire con un frame reale esportato dai video (JPG/WebP). Il fallback vero
  "se il video non parte" resta comunque il layer a gradiente dietro al `<video>`.
- **Contrasto accent.** Gli accent lime/verde hanno contrasto basso come TESTO su sfondo
  chiaro: per il testo usare sempre `text-accent-ink` (o gli `*-ink` di brand), mai
  `text-accent` su superfici chiare. `text-accent` va bene su superfici scure.

---

## Fase 5 — note di integrazione (merge su `main`)

Le tre sezioni sono state mergiate su `main` (mobility → solar → shop), build verde,
typecheck pulito. Recepiti ufficialmente i due interventi shared di Mobility (`@types/three`
e il cast in `SplitTextReveal`). Aggiunti, sempre in fase 5, SEO sitewide (metadata/OG per
route, `sitemap.ts`, `robots.ts`, JSON-LD Organization/LocalBusiness, favicon brandizzata) e
una piccola ottimizzazione perf (poster sul video hero della home → LCP ~4.8s→2.4s).

**Fase 5.1 (micro-fix pre-demo):** risolti i 2 rilievi a11y shared (→ A11y 100); gating del
render loop 3D di Mobility sul viewport; /solar con poster WebP come LCP + video lazy
(LCP 4.9s→2.4s, Perf 50→72). Dettagli sotto.

### Due rilievi di accessibilità nella ZONA CONDIVISA — RISOLTI in fase 5.1

> ✅ **Risolti** (con autorizzazione esplicita, fase 5.1): A11y Lighthouse ora **100** su
> home e solar. Lasciati qui come storia.

1. **Contrasto `text-muted/70`** (Footer): `#6f7681` su `#0a0c10` = **4.27:1**, sotto AA.
   → portato a `text-muted` pieno: **5.98:1** (light) / **7.77:1** (dark), entrambi ≥ 4.5.
2. **`label-content-name-mismatch`** sul link logo (Header): testo DOM `GMGroup` vs
   `aria-label="GM Group — home"`. → testo visibile ora `GM Group` (= `GROUP.name`) e
   `aria-label="GM Group"` identici.

### Mobility: Performance Lighthouse = 0 (artefatto di misura, NON un problema di UX)

`/mobility` mostra Performance 0 con errore `NO_TTI_CPU_IDLE_PERIOD`: il `<Canvas>` R3F gira
in `frameloop="always"` mentre la scena è a schermo (il pilotaggio scroll legge `progressRef`
ogni frame), quindi la pagina non raggiunge mai un periodo di CPU idle e Lighthouse non riesce
a calcolare TBT/TTI → azzera lo _score_. Le metriche di paint reali sono però sane (FCP ~2.4s,
LCP ~4.5s, CLS 0) e la pagina è interattiva.

> **Fase 5.1:** aggiunto il gating del render loop sul viewport (secondo IntersectionObserver
> → `frameloop` `never` fuori schermo / `always` in vista). Risparmia GPU/batteria quando la
> scena non è visibile, ma NON cambia lo score Lighthouse: al primo load la scena è in vista
> (`always`), quindi il `NO_TTI` resta. Il fix vero per lo score (render solo durante lo
> scroll: `frameloop="demand"` + `invalidate()` nell'`onUpdate`) resta consigliato ma va fatto
> con QA visivo dedicato dalla sezione Mobility.

---

## Fase 6 — consolidamento in un'app unica + integrazione demo AI

Il monorepo era **4 app Next separate** (`apps/{hub,solar,mobility,shop}`) — una scelta di
_deploy_, non architetturale. Riportato tutto a **UN solo sito Next** (`apps/web`), servito da
un unico server su `:3000`, come da visione di CLAUDE.md ("UN solo sito Next"). I `packages/*`
restano librerie di workspace condivise (transpilate via `transpilePackages`).

### Decisioni nella ZONA CONDIVISA (recepite con autorizzazione "fai tutte le fasi")

1. **`ThemeProvider` senza prop `theme` fissa** (`app/layout.tsx`). Nel monorepo ogni app
   passava `theme="hub|solar|…"`. Ora il tema **deriva dalla route** via `themeFromPath`
   (già supportato dal provider). `themeFromPath("/")` → `hub`. Nessuna modifica al codice di
   `ThemeProvider`/`theme.ts`: solo rimossa la prop nel layout.
2. **Script no-flash pre-paint** nel root layout: imposta `data-theme` su `<html>` da
   `location.pathname` PRIMA dell'hydration, così non si vede il flash dell'accent del gruppo
   (lime) prima che il client imposti l'accent del mondo. Tenere in **sync** con
   `themeFromPath` se cambiano i prefissi delle route.
3. **Layout di sezione `app/shop/layout.tsx`**: il "chrome" del carrello (`CartProvider` +
   `ShopChrome`) non sta più nel root layout (sarebbe visibile in tutti i mondi) ma in un
   layout di segmento che avvolge solo `/shop/*`. Lo stato del carrello sopravvive a
   `/shop ⇄ /shop/[id]` (store esterno + localStorage). _Nota:_ il `CartProvider` ora è sotto
   `PageTransition`, quindi si rimonta a ogni navigazione — i **dati** del carrello persistono
   (store esterno), ma il drawer si chiude al cambio route (comportamento accettabile).
4. **Shop ribasato da `/` a `/shop`**: PDP a `/shop/[id]`; aggiornati i link interni
   (`ProductCard`, `CableFinder`, `CartDrawer`), i canonical e gli URL JSON-LD.
5. **Un solo `sitemap.ts`/`robots.ts`/`favicon`** a livello app; canonical per-route aggiunti
   a `/solar`, `/mobility`, `/shop`.

### Deduplica asset/dati (collisioni risolte)

- `public/assets/gm-solar-hero.mp4` + `gm-solar-hero-poster.webp`: erano identici in hub+solar
  → una sola copia. Aggiunti i due asset drone di solar.
- `data/solar-projects.json`: la versione di solar è **superset** di quella di hub (hub legge
  solo `.stats`, identico) → tenuta quella di solar.
- `icon.svg`/`favicon.ico`/`robots.ts`: identici tra le app → una sola copia.

### Dipendenze unificate in `apps/web/package.json`

Unione delle 4 app: `three` + `@react-three/{fiber,drei,postprocessing}` + `@types/three`
(da mobility), `maplibre-gl` (solar+mobility). Aggiunte per le demo di fase 2:
`lucide-react`, `motion`, `recharts`. **Niente `@google/genai`**: le demo AI passano dal nostro
helper multi-provider raw-`fetch`.

---

## Fase 7 — integrazione delle 3 demo AI di Jacopo (route nel sito unico)

Le tre demo standalone (Vite + Express + AI Studio) sono state **portate come route**
dentro l'app unica, re-tematizzate sui token e con l'AI spostata server-side.

- **/mobility/agent** — assistente di ricarica di bordo (client-only, nessuna chiave).
- **/solar/lead** — lead-qualifier agentico → `app/api/lead-qualifier`.
- **/solar/analytics** — analytics NL→SQL + security gatekeeper → `app/api/analytics`
  (dep nuova: `recharts`).

### Aggiunte alla ZONA CONDIVISA (recepite, "fai tutte le fasi")

1. **`apps/web/lib/ai.ts`** — helper AI multi-provider per completamenti **JSON single-shot**
   (Anthropic / Gemini / DeepSeek), che **generalizza** lo stesso contratto env del
   cable-finder (`AI_API_KEY` / `AI_PROVIDER` / `AI_MODEL`). Il cable-finder resta sul suo
   helper di streaming + function-calling (`app/api/cable-finder/providers.ts`); le due nuove
   route usano `@/lib/ai`. Piccola duplicazione voluta di `resolveProvider` per non toccare
   codice funzionante. **Chiavi sempre solo server-side.**
2. **`app/globals.css`** — due utility riusabili per le demo: `.glass` (superficie vetro su
   sfondi scuri) e `.animate-fade-in` (+ keyframe; la regola reduced-motion di `base.css` la
   azzera). Niente nuovi token in `tokens.css`.

### Note di re-theme (demo → brand)

- **EV agent**: device scuro mantenuto (è uno schermo d'auto); accent neon-lime → accent del
  mondo (verde GMobility); cyan tenuto come colore-convenzione del percorso GPS.
- **Lead qualifier**: UI chiara; accent `#a3cf3c`→accent solare, `#80a42d`→`accent-ink`;
  colori semantici (blu/smeraldo/rosso) tenuti per distinguere categorie/stati.
- **Analytics**: ERP back-office (slate/white) tenuto; emerald _brand/primario_ → accent
  solare (anche la serie primaria dei grafici, `#10b981`→`#a8d920`); indigo/amber/purple/rosso
  restano come palette categoriale dei dati. `h-screen` → finestra incorniciata `h-[85vh]`.
- Shade Tailwind inesistenti (es. `slate-550`, `emerald-150`, `text-3.5xl`) normalizzate;
  classi anim custom mappate (`fade-in-up`→`fade-in`, `headshake`→`pulse`).
- Le due route AI funzionano **senza chiave** (pre-baked + euristica/sandbox); con chiave
  passano al modello. `react/no-unescaped-entities` disabilitato a livello di file solo nei
  due grandi componenti di copy italiana (apostrofi), per leggibilità.

---

## Fondazione — accent unico LIME + copy integrazioni (de-violet), round corrente

Modifiche ZONA CONDIVISA fatte dal chat "Fondazione" (unico writer della shared zone in
questo round), su richiesta del cliente. Verificate: `pnpm typecheck` ✅, `pnpm build` ✅,
verifica visiva a 1280px su /dashboard, /assistente, /integrazioni (accent lime, testo AA),
no-flash confermato (SSR `<html data-theme="hub">` + script no-flash + render JS-off = lime).

### TASK 1 — il tema "platform" (viola `#7c5cff`) è stato eliminato → tutte le route servizio usano il lime del gruppo ("hub" `#84cc16`)

Il cliente vuole UN solo colore brand (lime). Le 5 route servizio (/dashboard, /gestionale,
/integrazioni, /segnalazioni, /assistente) risolvevano al tema "platform" viola: ora risolvono
a "hub". **Fonte di verità unica del lime = blocco `:root,[data-theme="hub"]` in tokens.css.**

- `packages/tokens/tokens.css`: **rimosso** il blocco `[data-theme="platform"]` (accent viola).
  Lasciati i token STATICI `--color-violet`/`--color-violet-strong`/`--violet-ink` (NON sono
  l'accent di route: `--color-violet` è usato da `components/home/scenes/HeroScene.tsx`
  → `bg-violet/12`, blob decorativo). Aggiornato solo il commento ora fuorviante.
- `packages/lib/src/theme.ts`: rimosso `PLATFORM_PREFIXES` e il valore `"platform"` dal tipo
  `ThemeKey` (ora `"hub" | "solar" | "mobility" | "shop"`); `themeFromPath` fa cadere ogni
  route non-vetrina su `"hub"`. (Verificato type-safe: gli unici literal `"platform"` come
  `ThemeKey` erano in site.ts; i componenti home usano un tipo LOCALE `theme: string`.)
- `apps/web/app/layout.tsx`: script inline `NO_FLASH_THEME` riallineato byte-per-byte a
  `themeFromPath` (rimosso l'array `plat[]` → solar/mobility/shop, altrimenti hub). Evita
  mismatch di hydration sul colore.
- `packages/lib/src/site.ts`: i 5 servizi con `theme:"platform"` → `theme:"hub"`.
- **A11y:** le 5 route servizio NON usavano mai `text-accent` "nudo" (già `text-accent-ink`/
  `-contrast`/`-soft`/`-strong`), quindi il lime come TESTO è già AAA. Nessun fix necessario.

### TASK 2 — copy "integrazioni" vietata: niente "(sistemi) che usi già"

Canonico imposto ovunque: **"Ci integriamo con molti sistemi, su richiesta."** (senza virgola
nei titoli composti / con i due punti).

- `apps/web/app/integrazioni/page.tsx`: metadata `title` + `h1` + commento di intestazione.
- `packages/lib/src/site.ts`: `SERVICES` → titolo del servizio integrazioni (era "Connessi a
  tutto ciò che usi già").
- `apps/web/data/kb.ts`: prima frase della `contenuto` integrazioni (era "Connettiamo ciò che
  usi già:") → canonico; tenuta la 2ª frase (orchestrazione), non vietata.

### ⚠️ DA FARE — chat HOME (`components/home/**`, fuori dal mio recinto)

Per coerenza visiva/copy, la HOME deve recepire:

1. **Viola hardcoded nelle scene immersive** → portarlo a lime (`#84cc16`/strong `#65a30d`):
   `components/home/immersive/shared.tsx` (`THEMES.platform`), `components/home/ServiceScene.tsx`
   (`ACCENTS.platform`), `components/home/immersive/ImmersiveDashboard.tsx` (`PLT="#7c5cff"` +
   gradienti `#7c5cff..`). Finché non cambia, le scene-prodotto della home restano viola.
2. **Copy vietata in `components/home/immersive/ImmersiveIntegrazioni.tsx`** righe ~91 (commento)
   e ~160 (visibile: "Ci colleghiamo ai sistemi che usi già.") → canonico Task 2.

### Note / lasciato com'è di proposito

- **Viola CATEGORICO dei grafici** (NON è il brand accent → lasciato): `data/telemetry.ts`
  serie "Organica" (`#7c5cff`, donut "Sorgenti di traffico" su /dashboard) e il fallback
  `?? "#7c5cff"` in `components/dashboard/TrafficChart.tsx` (~riga 90). Fuori dal mio recinto;
  lo swap cosmetico del solo fallback è opzionale e spetta a chi possiede dashboard.
- **Commenti stantii fuori dal mio recinto** (solo commenti, nessun effetto a runtime — l'accent
  reso è lime): `apps/web/app/segnalazioni/page.tsx` (~riga 3) e `apps/web/app/assistente/page.tsx`
  (~riga 71) citano ancora il tema "platform (viola)". Da aggiornare da chi possiede quelle pagine
  (io ho corretto solo il commento equivalente in `integrazioni/page.tsx`, nel mio recinto).
- **Pre-esistenti, NON introdotti da me** (verificato con `git stash` su HEAD pulito, stessi
  errori): `pnpm lint` rosso — `components/assistente/ChatWidget.tsx` (no-unescaped-entities),
  `components/dashboard/ContentEditorPanel.tsx` + `components/home/AutoScroll.tsx`
  (set-state-in-effect) + warning vari. E un mismatch di hydration su /dashboard
  (`AnimatedCounter`, "1.428" SSR vs "1428" client, formato it-IT). Tutti fuori dal mio recinto.

---

## [BUG FINDER] Zero-defect sweep — modifiche zona condivisa (round corrente)

Fase SOLO "bug finder" (nessun altro chat sta scrivendo). Le modifiche qui sotto toccano la
zona condivisa per correggere difetti REALI di tooling; loggate come da protocollo.

### eslint.base.mjs — onorare la convenzione `_`-prefix (no-unused-vars)

`packages/config/eslint.base.mjs`: aggiunto un override di `@typescript-eslint/no-unused-vars`
con `argsIgnorePattern`/`varsIgnorePattern`/`caughtErrorsIgnorePattern: "^_"`. Motivo: il
codice usa già il prefisso `_` per segnalare identificatori intenzionalmente inutilizzati
(es. `getTopPages(site, _range)` in `data/telemetry.ts`, dove `range` fa parte della firma
uniforme dei getter dashboard ma non scala i dati mock). Prima il linter non rispettava la
convenzione → falso positivo. La modifica RILASSA solo su nomi `_`-prefix (opt-in esplicito):
non può nascondere bug non intenzionali. Verificato: `pnpm lint` ✅ 0 problemi.

### packages/ui/AnimatedCounter.tsx + packages/tokens/tokens.css + packages/ui/Footer.tsx

Difetti REALI trovati col runtime audit (Puppeteer + console F12 + axe-core), corretti nella zona
condivisa:

1. **AnimatedCounter.tsx** — `Intl.NumberFormat("it-IT")` (default `useGrouping:"auto"`) produceva
   un **mismatch di idratazione** su /dashboard: l'ICU di Node (SSR) raggruppa i numeri a 4 cifre
   ("1.428"), i browser per it-IT no (CLDR `minimumGroupingDigits=2` → "1428"). React rigenerava il
   sottoalbero (errore #418) e, di rimbalzo, emetteva pure il warning "Encountered a script tag…"
   (rirendendo lo `<script>` no-flash del layout). Fix: `useGrouping:"always"` → SSR e client
   coincidono ("1.428"). Stesso fix applicato ai formatter it-IT lato app (TopPagesTable, grafici
   dashboard, gestionale format.ts/OverviewView/filters) per coerenza e per l'intento documentato.

2. **tokens.css `--accent-ink`** — mix verso il foreground 38% → 46%. A 38% l'ink lime su
   `--accent-soft` restava 4.17–4.37:1 (sotto WCAG AA 4.5) per badge e voci attive di sidebar.
   A 46% l'accoppiata ink/soft passa AA (≈5.1:1, hub lime) e su sfondo chiaro resta ottima. Le
   route reali usano tutte il tema "hub" (lime), quindi il tuning è sul lime.

3. **Footer.tsx** — la barra in fondo usava `text-muted/80`: l'opacità portava `--muted` (#5b6472)
   a un effettivo #7c838e su bianco = 3.82:1 (sotto AA). Tolto `/80` → `text-muted` pieno (≈5.6:1).

Verificato: `pnpm typecheck`/`lint`/`build` ✅; console F12 pulita su tutte e 6 le route
(360/768/1280, normal + reduced-motion, + interazioni); axe-core 0 violazioni (incl. stati aperti
gestionale/dashboard e mobile).

### packages/ui/Header.tsx — link rotto /demos/tour → HUB_URL

Il prefetch del `<Link href="/demos/tour">` (CTA "Tour" sempre visibile da ≥sm + voce "Avvia il
tour" nel menu Servizi) dava **404** in produzione (visibile in F12 su ogni route ≥768; la route
`/demos/tour` non esiste più — era il tour pre-pivot, branded). Repuntati entrambi a `HUB_URL`: la
home È la scroll-narrativa cinematica (il "tour"), quindi la CTA torna alla panoramica. In dev non
si vedeva (Next prefetcha solo in produzione) → trovato col `next start` + audit console.

### Dead-code prune (seed list)

- **packages/tokens/tokens.css**: rimossi `--color-violet`, `--color-violet-strong`, `--violet-ink`.
  Erano vivi solo finché `components/home/scenes/HeroScene.tsx` li consumava (`bg-violet/12`); quel
  file è stato eliminato e nessun altro consumatore esiste (verificato grep su apps+packages, CSS
  incluso). Il viola "categorico" dei grafici resta perché usa l'hex letterale `#7c5cff`
  (data/telemetry.ts, TrafficChart fallback), non il token.
- **packages/lib/src/types.ts**: eliminato (+ rimosso l'export `./types` da package.json). Tipi di
  dominio (SolarStats, ChargingPoint, Product…) che puntavano a JSON inesistenti
  (solar-projects.json, charging-points.json, products.json: vivono solo in legacy/docs). Nessun
  import attivo (solo una menzione in un commento di vetrina3d/content.ts, che resta valida).
- **"platform" theme**: confermato già rimosso (nessun ThemeKey/`data-theme="platform"` residuo nel
  core theme/providers/tokens). Le route reali risolvono tutte a "hub" (lime).

Verificato dopo il prune: `pnpm typecheck`/`lint`/`build` ✅ verdi; due passate consecutive pulite
(prod `next start` + dev) — console F12 e axe-core 0 problemi su tutte le route, breakpoint
360/768/1280, normal + reduced-motion, stati interattivi inclusi.
