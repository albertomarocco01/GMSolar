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
