# FASE 5 — Capitoli: title card numerate + HUD (P12)

**Prompt coperti:** P12.
**Parallelismo:** KIT (1 builder) → 7 builder scena in PARALLELO → controllo →
1 reviewer → fix loop.
**Gate d'ingresso:** tag `roadmap-fase-4-ok`.

## Struttura (stesso pattern della Fase 4)

Parte A (kit + HUD + page.tsx) è sequenziale e di un solo agente; parte B
(integrazione nelle 7 scene-capitolo) è parallela. P12 va DOPO P11 perché
sostituisce il primo `Say` di ogni scena: le timeline hanno già i beat camera e la
ChapterCard va inserita PRIMA di essi.

## Ondata 1 — KIT-12 (singolo builder)

- **Template:** §8.1, `<k>` = 12, task RISTRETTO:
  «Esegui SOLO le istruzioni 1, 2 (limitatamente a shared.tsx: componente
  `ChapterCard` + helper `chapterIntro` + costante `CHAPTERS` + prop opzionale
  `chapterIndex` su ImmersiveStage che imposta `data-chapter`; rimozione della prop
  morta `eyebrow` da ImmersiveStage MA lasciando temporaneamente tollerate le
  chiamate — le puliranno gli agenti scena) e 3 (componente `ChapterHUD` nuovo in
  `components/home/ChapterHUD.tsx` + montaggio in `page.tsx`) della sezione P12.
  NON toccare le scene.»
- **File di proprietà:** `immersive/shared.tsx`,
  `components/home/ChapterHUD.tsx` (nuovo), `apps/web/app/page.tsx`.
- **Nota critica:** «Se rimuovere `eyebrow` dalla firma rompe il typecheck per le
  chiamate esistenti, rendila `eyebrow?: never` o lasciala deprecata fino
  all'ondata 2 — la scelta che tiene il typecheck VERDE a fine ondata 1.»

**Mini-gate intermedio:** `pnpm typecheck` + `pnpm build` verdi → Ondata 2.

## Ondata 2 — 7 builder scena in parallelo

Template §8.1, `<k>` = 12, task ristretto per ciascuno:
«Il kit capitoli è già in shared.tsx (ChapterCard, chapterIntro, CHAPTERS) e l'HUD è
montato. Nella TUA scena: (a) sostituisci la prima `<Say i={0}>` veil con
`<ChapterCard>` del TUO capitolo (sottotitolo = la frase veil attuale) e `say(tl,0)`
con `chapterIntro(tl)` come PRIMO beat della timeline (prima dei beat camera);
(b) passa `chapterIndex={<i>}` a ImmersiveStage e rimuovi la prop `eyebrow` dalla
chiamata; (c) variante reduced-motion: heading statico visibile in cima
(«<NN> · <Titolo>»); (d) aggiorna l'aria-label della section col nome capitolo.
Le caption successive NON si toccano.»

| ID | File | Capitolo |
|---|---|---|
| S12-solar | `scenes/SolarTwinScene.tsx` | 01 «Siti vetrina» — la frase popup di P3 diventa il sottotitolo della card; la scena non usa ImmersiveStage: imposta `data-chapter` a mano sulla `<section>` |
| S12-ass | `immersive/ImmersiveAssistente.tsx` | 02 «Assistente AI» |
| S12-dash | `immersive/ImmersiveDashboard.tsx` | 03 «Dashboard» |
| S12-segn | `immersive/ImmersiveSegnalazioni.tsx` | 04 «Segnalazioni» |
| S12-gest | `immersive/ImmersiveGestionale.tsx` | 05 «Gestionale colonnine» |
| S12-ric | `immersive/ImmersiveRicarica.tsx` | 06 «App di ricarica» |
| S12-int | `immersive/ImmersiveIntegrazioni.tsx` | 07 «Integrazioni» |

⚠ La numerazione DEVE combaciare con l'ordine reale in `page.tsx` (post Fase 3).
Se la ricognizione o le fasi precedenti hanno cambiato l'ordine, adegua QUI i numeri
(fonte di verità = ordine dei componenti in page.tsx, non questa tabella).

## Ondata 2.5 — Pulizia kit (micro-step sequenziale, DOPO i 7 report)

Rilancia KIT-12 (o un micro-builder con proprietà su `shared.tsx`) con task:
«Ora che nessuna scena passa più `eyebrow` a ImmersiveStage, rimuovi DEFINITIVAMENTE
la prop deprecata dalla firma e dai commenti di shared.tsx.»
⚠ NON toccare `eyebrow` altrove: in `_assistente-data.ts` (`GENERATED.eyebrow`) e in
`ImmersiveAssistente.tsx` è un DATO legittimo della vista generata, estraneo a
ImmersiveStage — deve restare.

## Ondata 3 — Controllo (template §8.3)

```powershell
pnpm typecheck
pnpm build
```
Grep:
```powershell
rg "eyebrow=" apps/web/components/home       # atteso: ZERO (prop JSX residua)
rg "eyebrow" apps/web/components/home/immersive/shared.tsx   # atteso: ZERO (dopo ondata 2.5)
# NB: "eyebrow" come DATO in _assistente-data.ts / GENERATED.eyebrow è LEGITTIMO: non contarlo.
rg "ChapterCard|chapterIntro" apps/web/components/home --files-with-matches
# atteso: shared.tsx + 7 scene
rg "data-chapter" apps/web/components/home --files-with-matches
rg "ChapterHUD" apps/web/app/page.tsx
```
Checklist statica:
- [ ] `CHAPTERS` ha 7 voci nell'ordine reale di page.tsx (01→07).
- [ ] ogni scena-capitolo: chapterIntro è il PRIMO beat; nessun `say(tl, 0)` residuo
      accoppiato a un `<Say i={0}>` veil eliminato (niente tween orfani).
- [ ] HUD: `pointer-events-none`, `aria-hidden`, nascosto prima del cap. 01 e sulla
      ClosingScene.

## Ondata 4 — Reviewer (1, template §8.2)

Checklist:
- Contrasto: titoli card in `text-accent` SU FONDO SCURO (mai lime pieno su chiaro).
- La card occupa ~8–10% iniziale della timeline e non si sovrappone al primo beat
  interattivo/camera.
- Reduced-motion: heading statici presenti in tutte e 7; aria-label aggiornati.
- IntersectionObserver dell'HUD: un solo observer, disconnesso su unmount.

## Verifica runtime OBBLIGATORIA

`pnpm dev` + Chrome di sistema:
1. Scroll completo: a ogni ingresso scena compare la title card scura numerata;
   l'HUD in alto a destra avanza 01→07 e sparisce sulla chiusura.
2. Scrub indietro: le card ricompaiono/scompaiono senza stati rotti.
3. Reduced-motion (CDP): heading statici visibili, HUD senza animazioni, zero
   errori console.
Screenshot per capitolo in `docs/roadmap-migliorie/_screens/fase5/` (non committare).

## GATE di uscita Fase 5

- [ ] KIT + 7 scene success; controllo verde; reviewer PASS; runtime ok.
- Commit: `git add -A; git commit -m "fase 5: title card capitoli + HUD (P12)"; git tag roadmap-fase-5-ok`

## Failure mode

| Sintomo | Azione |
|---|---|
| typecheck rosso per `eyebrow` mancante | disallineamento kit/scene: retry del builder scena rimasto indietro |
| grep `eyebrow=` trova match in una scena | quel builder scena non ha rimosso la prop dalla chiamata → retry di QUEL builder |
| grep `eyebrow` in shared.tsx trova match | l'ondata 2.5 non è stata eseguita → esegui il micro-step |
| HUD che sfarfalla al cambio scena | threshold IO troppo basso → 0.5, e crossfade breve: retry KIT-12 |
| Card capitolo sopra la frase veil doppia | il builder scena non ha rimosso il vecchio Say 0 → retry |
| Numerazione sfasata | fonte di verità = ordine page.tsx; retry dei soli builder col numero errato |
