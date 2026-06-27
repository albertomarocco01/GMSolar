# DIRECTOR BRIEF — Polish & fix della WebApp (giro "qualità")

> Regìa del Direttore (chat principale). Le chat parallele (SOLAR / MOBILITY / SHOP /
> SHARED-INFRA) leggono questo file PRIMA di lavorare. Affianca `PLAN.md`, `CLAUDE.md`,
> `NOTES-shared.md`. Rispetta la Ownership map di `CLAUDE.md`: ognuno nel proprio recinto;
> la zona condivisa (`packages/**`, layout, token) NON si tocca senza passare dal Direttore.

## 0. Contesto e diagnosi (27 giu 2026)

L'utente segnala "un sacco di errori" + UX rozza: **testo che si sovrappone allo scroll**,
**scroll non smooth/a scatti**, **resa grafica non bella**.

**Fatto accertato dal Direttore:**

- ✅ `pnpm build`, `pnpm typecheck`, `pnpm lint` sono **VERDI** (exit 0). Quindi gli "errori"
  **NON sono di compilazione** → sono **runtime/visivi** (e probabilmente console di dev).
- ✅ **RISOLTO — era questa la causa di "un sacco di errori".** Next inferiva la root del workspace
  come `C:\Users\Utente` (home) per via di **due `package-lock.json` npm estranei** (uno nella root
  del repo, uno nella home dell'utente) accanto al `pnpm-lock.yaml`. Con la root sbagliata, in **dev**
  Turbopack risolveva l'`@import "../../../packages/tokens/tokens.css"` rispetto ad `apps/web` invece
  che ad `app/`: i **token CSS non si caricavano** (sito senza stili) e comparivano errori RSC
  "Could not find module … in the React Client Manifest" + 500 intermittenti. **Fix:** rimossi i due
  lockfile estranei → dev pulito, tutte le route 200, token caricati. **NESSUNA modifica a codice o
  config** (provato `turbopack.root`: PEGGIORA, dà 500 — NON usarlo). La build di produzione non era
  toccata (resolve diverso) → restava verde, mascherando il problema che era solo in dev.
- 🟡 I bug visivi NON sono ancora confermati a video: i tre report di diagnosi (sotto) danno
  **cause candidate** con qualche imprecisione. **Ogni fix va verificato nel browser** (skill
  `/run` o `/verify`, screenshot a 360px / 768px / 1280px), non solo a typecheck.

**Già fatto dal Direttore in questo giro (zona home + shared):**

- Home: aggiunto rimando alle demo + tour. `components/home/Hero.tsx` ha ora un link "▶ Guarda il
  tour delle demo · 2 min"; `app/page.tsx` ha una nuova `Section#demo` "Demo Wrapped" con
  `Avvia il tour` (→ `/demos/tour`) e `Apri il demo launcher` (→ `/demos`).
- Header (shared): corretto refuso **"Demo IAchi" → "Demo AI"**; aggiunti in fondo al menu i link
  **Demo launcher** (`/demos`) e **Avvia il tour** (`/demos/tour`).

## 1. Temi trasversali (le vere cause, sintetizzate)

Più dei singoli numeri di riga, questi pattern ricorrono nei tre mondi e spiegano i sintomi:

1. **Overlap allo scroll = elementi `position:absolute/fixed` dentro contenitori senza altezza
   garantita, o pin/sticky che non rilasciano.** Dove c'è scrollytelling pinnato (SolarHero,
   MobilityStage) o sticky bar (Catalog, PDP), confermare a video che a TUTTE le altezze di
   viewport i blocchi non si accavallano. Regola: una scena pinnata deve avere `min-h-svh`
   esplicito e i layer assoluti non devono determinare l'altezza del contenitore.
2. **Jank = lavoro per-frame non ottimizzato.** Scritture DOM in `onUpdate` di ScrollTrigger senza
   `will-change`, parallax su `<video>`/immagini grandi senza promozione a layer composito, Canvas
   R3F in `frameloop="always"`. Regola: animare solo `transform`/`opacity`, aggiungere
   `will-change: transform` agli elementi animati, gate del render loop 3D al viewport.
3. **Resa "rozza" = incoerenze di design system.** Colori hardcoded invece dei token, stagger/offset
   dei reveal disallineati tra griglie, contrasto basso di `text-accent-ink` su superfici chiare,
   mancanza di `text-balance`/`line-clamp`, CLS da immagini/canvas senza spazio riservato. Regola:
   consumare SEMPRE i token, uniformare i valori di motion, riservare lo spazio dei media.
4. **prefers-reduced-motion**: alcuni effetti (SMIL SVG, reveal) potrebbero non rispettarlo. Regola
   di progetto: TUTTO si spegne con reduced-motion. Verificarlo.

## 2. Prompt per le chat parallele (copia-incolla)

> Ogni chat: lavora SOLO nel tuo recinto (Ownership map di `CLAUDE.md`). Se ti serve una modifica
> nella zona condivisa, annotala in `NOTES-shared.md` e CHIEDI al Direttore — non toccarla.
> A fine lavoro: `pnpm typecheck && pnpm lint` verdi **e** verifica VISIVA nel browser
> (skill `/run`) con screenshot a 360 / 768 / 1280px, in modalità normale e con
> `prefers-reduced-motion`. Riporta un changelog con prima/dopo.

### ▶ Prompt — chat SOLAR

```
Sei la chat SOLAR del progetto GM Group (vedi CLAUDE.md, PLAN.md, NOTES-shared.md,
docs/DIRECTOR-BRIEF-polish.md). Recinto: apps/web/app/solar/** e apps/web/components/solar/**.
NON toccare la zona condivisa (packages/**, layout, token): se serve, scrivi in NOTES-shared.md e
chiedi.

Obiettivo: eliminare i bug visivi e alzare la qualità grafica della sezione Solar. Sintomi
riferiti: testo che si sovrappone allo scroll, scroll a scatti, resa poco curata.

Fai PRIMA una verifica visiva nel browser (skill /run) della pagina /solar a 360/768/1280px,
normale e con prefers-reduced-motion, e annota cosa si rompe DAVVERO (screenshot). Poi correggi.
Piste da confermare (NON dare per scontate, alcune potrebbero essere errate):
- SolarHero: la sequenza pinnata desktop (matchMedia ≥768, end "+=320%", scrub) — verifica che a
  ogni altezza di viewport i 4 "beat" assoluti non si accavallino e che il pin rilasci pulito verso
  SolarStats. onUpdate scrive progress.style.transform ogni frame: valuta will-change/cheap update.
- Parallax su .hero-video e SolarCaseStudy: aggiungi will-change:transform agli elementi animati;
  evita reflow per-frame.
- Coerenza token: niente colori hardcoded; usa text-accent-ink su chiaro, text-accent su scuro
  (vedi nota contrasto in NOTES-shared.md). text-balance sui titoli lunghi.
- SolarMap: lo skeleton deve avere la stessa altezza della mappa (no CLS).
Vincoli: rispetta SEMPRE prefers-reduced-motion. Componenti piccoli e commentati. A fine:
typecheck+lint verdi + verifica visiva + changelog prima/dopo.
```

### ▶ Prompt — chat MOBILITY

```
Sei la chat MOBILITY del progetto GM Group (vedi CLAUDE.md, PLAN.md, NOTES-shared.md,
docs/DIRECTOR-BRIEF-polish.md). Recinto: apps/web/app/mobility/** e apps/web/components/mobility/**.
NON toccare la zona condivisa: se serve, scrivi in NOTES-shared.md e chiedi.

Obiettivo: eliminare bug visivi e jank della sezione Mobility (3D scroll). Sintomi: testo che si
sovrappone, scroll a scatti, resa rozza.

Verifica PRIMA a video (skill /run) /mobility e /mobility/agent a 360/768/1280px, normale e
reduced-motion (screenshot). Poi correggi. Piste da confermare:
- MobilityStage: scena pinnata/sticky 3D (h-[360svh] + sticky h-svh). Conferma che i layer overlay
  (hero copy, PartDetailPanel z-20) non vengano clippati da overflow-hidden/sticky e non si
  accavallino col contenuto sotto. Valuta portale/fixed per il pannello se clippato.
- Render loop R3F: assicurati che sia "demand"/gated al viewport (no frameloop:"always" perenne);
  l'invalidate in onUpdate non deve essere "chatty". will-change:transform sul contenitore sticky.
- Poster/fallback WebGL: niente CLS al mount del Canvas (skeleton = stesse dimensioni). Verifica che
  l'animazione SMIL del poster SVG rispetti reduced-motion.
- Token: i colori 3D in WallboxScene sono hardcoded (ok se necessario per il materiale, ma
  documentalo); UI attorno deve usare i token. Contrasto e spacing coerenti.
Vincoli: prefers-reduced-motion sempre; performance mobile mid-range. A fine: typecheck+lint verdi
+ verifica visiva + changelog.
```

### ▶ Prompt — chat SHOP

```
Sei la chat SHOP del progetto GM Group (vedi CLAUDE.md, PLAN.md, NOTES-shared.md,
docs/DIRECTOR-BRIEF-polish.md). Recinto: apps/web/app/shop/** e apps/web/components/shop/**.
NON toccare la zona condivisa: se serve, scrivi in NOTES-shared.md e chiedi.

Obiettivo: eliminare bug visivi e alzare la qualità della sezione Shop. Sintomi: testo che si
sovrappone, scroll a scatti, resa rozza.

Verifica PRIMA a video (skill /run) /shop, /shop/[id] e il CableFinder a 360/768/1280px, normale e
reduced-motion (screenshot). Poi correggi. Piste da confermare:
- Z-index: unifica la scala tra Header (z-50, shared, NON modificarlo), ShopChrome/cart button,
  CartDrawer (z-60/61) e la sticky filter bar del Catalog (z-20). Evita conflitti col cart.
- Catalog sticky bar: il margine negativo lg:-mx-3 + sticky può accavallarsi alla griglia; riserva
  spazio e verifica l'allineamento.
- CableFinder/CableRecommendation: contenuti animati dentro le chat-bubble non devono uscire dai
  bordi (overflow-hidden dove serve).
- PDP: la colonna immagine sticky (lg:top-24) non deve coprire il testo; allinea all'header.
- Coerenza: stagger/offset dei ScrollReveal uniformi tra Catalog/Related/Recommendation; line-clamp
  sui nomi lunghi; ProductImage senza CLS; contrasto di text-accent-ink su chiaro.
Vincoli: prefers-reduced-motion sempre. A fine: typecheck+lint verdi + verifica visiva + changelog.
```

### ▶ Prompt — chat SHARED-INFRA (la gestisce il Direttore, o delega esplicita)

```
Sei la chat SHARED-INFRA del progetto GM Group. Puoi toccare la zona condivisa SOLO con mandato del
Direttore. Task:
1) Lockfile/workspace root: GIÀ FATTO dal Direttore (rimossi i due package-lock.json estranei; NON
   usare turbopack.root, dà 500). Se il warning "multiple lockfiles" ricompare, significa che `npm`
   è stato rieseguito da qualche parte: rimuovi di nuovo i package-lock.json e usa sempre `pnpm`.
2) Audit delle primitive di motion condivise (packages/ui: ScrollReveal, SplitTextReveal,
   AnimatedCounter; packages/lib: gsap, motion): conferma che rispettino reduced-motion senza flash,
   espongono will-change dove animano transform, e che SplitTextReveal non lasci cloni assoluti.
   Proponi (non imporre) un token --reveal-stagger/--reveal-y per uniformare i reveal tra sezioni.
3) Header ≤390px: lo switcher + bottone Demo sborda (vedi NOTES-shared.md [QA]). Applica il fix
   responsive.
Ogni modifica shared va comunicata in NOTES-shared.md. A fine: build/typecheck/lint verdi + nota di
quali sezioni sono impattate.
```

## 3. Idee di elevazione grafica (backlog, non bloccante)

- **Tour come biglietto da visita**: anteprime reali nelle slide (mini-screenshot/video loop dei tre
  mondi) invece di placeholder; transizioni di brand più cinematografiche tra slide.
- **Home**: micro-interazioni sulle "tre porte" (hover parallax leggero), e un filo conduttore di
  motion coerente con le sezioni interne.
- **Coerenza di sistema**: estrarre costanti di motion condivise (durate/stagger/offset) per togliere
  il "rumore" che fa sembrare la UI poco curata.
- **Reduced-motion come prima classe**: ogni "wow" deve avere un fallback statico altrettanto bello.
- **Asset reali**: quando arrivano video drone 4K, foto impianti/prodotti e loghi vettoriali, swap 1:1
  (la struttura è già pronta — vedi NOTES-shared.md).

## 4. Ordine consigliato

1. SHARED-INFRA task 1 (lockfile/root) — toglie il rumore di "errori" e stabilizza il dev server.
2. In parallelo: SOLAR / MOBILITY / SHOP, ognuno con verifica VISIVA obbligatoria prima e dopo.
3. SHARED-INFRA task 2-3 (motion primitives + header), coordinati dal Direttore perché toccano tutti.
4. Backlog grafico (sez. 3) a fine, col deck di presentazione.
