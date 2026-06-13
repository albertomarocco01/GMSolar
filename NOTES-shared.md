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

### Due rilievi di accessibilità nella ZONA CONDIVISA — servono al proprietario del design system

Lighthouse mobile dà A11y 95–96 su tutte le route. I due rilievi residui sono entrambi
**in `/components/layout` (Header/Footer)**, quindi NON li ho toccati (regola ferrea):

1. **Contrasto `text-muted/70`** (Footer): `#6f7681` su `#0a0c10` = **4.27:1**, sotto la
   soglia AA di 4.5:1 per testo piccolo. Fix possibile: usare `text-muted` pieno (senza
   `/70`) per quel testo, o scurire un filo il token muted. Tocca il design system → decidere
   a livello shared.
2. **`label-content-name-mismatch`** sul link logo (Header): `aria-label="GM Group — home"`
   mentre il testo visibile è "GM Group". Per i voice-control è meglio che l'accessible name
   contenga esattamente il testo visibile (es. `aria-label="GM Group, vai alla home"` →
   include "GM Group"). Fix in `components/layout/Header`.

### Mobility: Performance Lighthouse = 0 (artefatto di misura, NON un problema di UX)

`/mobility` mostra Performance 0 con errore `NO_TTI_CPU_IDLE_PERIOD`: il `<Canvas>` R3F gira
in `frameloop="always"` (richiesto dal pilotaggio scroll via `progressRef`, letto ogni frame),
quindi la pagina non raggiunge mai un periodo di CPU idle e Lighthouse non riesce a calcolare
TBT/TTI → azzera lo _score_. Le metriche di paint reali sono però sane (FCP ~2.4s, LCP ~4.5s,
CLS 0) e la pagina è interattiva. **Fix consigliato (mobility-owned, da QA visivo):** passare
a `frameloop="demand"` e chiamare `invalidate()` dentro l'`onUpdate` di ScrollTrigger (render
solo durante lo scroll). Non l'ho fatto in fase 5 per non alterare il cuore dell'esperienza 3D
senza verifica visiva.
