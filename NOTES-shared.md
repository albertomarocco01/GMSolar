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
