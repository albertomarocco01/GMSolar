# FASE 4 — Camera cinematografica (P11)

**Prompt coperti:** P11 (motion design "da After Effects").
**Parallelismo:** 2 sotto-ondate: KIT (1 builder, sequenziale) → 6 builder scena in
PARALLELO → controllo → 2 reviewer → fix loop.
**Gate d'ingresso:** tag `roadmap-fase-3-ok` (tutte le scene hanno la regia definitiva).

## Perché due sotto-ondate

P11 ha due parti con dipendenza rigida: (A) il LAYER CAMERA + gli helper nel kit
condiviso `shared.tsx` (un solo agente: è il file più delicato del progetto home);
(B) l'applicazione della shot-list nelle 6 scene (parallelizzabile: un file a testa,
tutte consumano l'API creata in A). Lanciare B prima che A sia verde = 6 fallimenti.

## Ondata 1 — KIT-11 (singolo builder)

- **Template:** §8.1, `<k>` = 11 — MA con task RISTRETTO:
  «Esegui SOLO le istruzioni 1, 2 e 3 della sezione P11 (layer `.imm-camera` in
  ImmersiveStage, helper `cameraTo`/`cameraReset`/`cameraFollow`/`cameraWhip`/
  `rackFocus`/`rackFocusOff`, regole di sequenziamento documentate). NON toccare le
  scene. La modifica a ImmersiveStage deve essere RETRO-COMPATIBILE: con camera
  inutilizzata le scene attuali devono comportarsi come prima.»
- **File di proprietà:** `apps/web/components/home/immersive/shared.tsx`.
- **Nota critica da includere:** «Il cursore `.imm-cursor` DEVE restare figlio
  diretto di `.imm-stage`, FUORI da `.imm-camera` — altrimenti `cursorDest` misura
  coordinate sbagliate quando la camera scala. Verifica la formula di centratura
  empiricamente come chiede il prompt.»

**Mini-gate intermedio (fai TU, orchestratore):** dopo il report di KIT-11 lancia il
controllo SOLO su `pnpm typecheck` + `pnpm build` + verifica statica che
`.imm-camera` avvolga `.imm-skew` ma non il Cursor. Verde → Ondata 2. Rosso → retry
KIT-11. NON committare ancora.

## Ondata 2 — 6 builder scena in parallelo

Per tutti: template §8.1, `<k>` = 11, con task ristretto:
«Il kit camera è GIÀ implementato in `shared.tsx` (leggi le firme degli helper lì).
Esegui SOLO le istruzioni 4 e 5 della sezione P11 limitatamente alla TUA scena,
applicando la shot-list corrispondente. Ricorda: ≥4 tipi di inquadratura diversi,
`cameraReset` prima della fine timeline, mai camera+cursore in partenza simultanea
sullo stesso target, rimuovi i `clickZoom` che sostituisci con punch di camera.»

| ID | File di proprietà | Shot-list (dalla sezione P11, punto 5) |
|---|---|---|
| S11-ass | `immersive/ImmersiveAssistente.tsx` | push-in barra AI, punch send, pull-back reveal genui + rack focus, punch config |
| S11-dash | `immersive/ImmersiveDashboard.tsx` | follow sidebar→editor, push-in typing, punch «Pubblica», whip su ogni pan, push-in KPI |
| S11-segn | `immersive/ImmersiveSegnalazioni.tsx` | punch «Segnala un problema», rack focus modulo, lock typing, push-in fix + pull-back |
| S11-gest | `immersive/ImmersiveGestionale.tsx` | whip pan, push-in query, rack focus drawer AI, micro-dutch «Fatto», punch flip Online |
| S11-ric | `immersive/ImmersiveRicarica.tsx` | camera DISCRETA: push-in ≤1.15 typing, punch send, push lento ricarica, reset |
| S11-int | `immersive/ImmersiveIntegrazioni.tsx` | contro-pan carrellata, punch tile WhatsApp, rack focus chat, pull-back finale |

La scena Solare NON riceve la camera (P11 punto 6): al massimo, se il reviewer di
Fase 2 aveva segnalato un'entrata piatta delle card 3D, lancia un MICRO-BUILDER
dedicato con proprietà su `scenes/SolarTwinScene.tsx` (solo overshoot `back.out`
sull'entrata delle card) DOPO l'ondata 2 — altrimenti niente.

## Ondata 3 — Controllo (template §8.3)

```powershell
pnpm typecheck
pnpm build
```
Grep di presenza:
```powershell
rg "imm-camera" apps/web/components/home/immersive/shared.tsx
rg "cameraTo|cameraReset" apps/web/components/home/immersive --files-with-matches
# atteso: shared.tsx + le 6 scene
```
Checklist statica:
- [ ] In ogni scena l'ULTIMO riferimento camera della timeline è un `cameraReset`
      (o equivalente ritorno a neutro) PRIMA della pausa finale.
- [ ] Nessun tween camera con `repeat:-1`.
- [ ] Nessun `filter: blur` fuori dai limiti (≤2px, beat brevi) — grep `blur(`.
- [ ] `.imm-stage` non è animata da nessuna timeline di scena (solo hand-off del kit).

## Ondata 4 — 2 reviewer in parallelo

- **R-CAM-1 (correttezza geometrica/scrub):** per ogni scena: camera neutra a fine
  timeline (reduced-motion safe)? sequenziamento camera/cursore rispettato (mai
  partenza simultanea sullo stesso target)? clickZoom duplicati rimossi? clamp
  scale ≤1.7? bordi mai scoperti (x/y limitati)?
- **R-CAM-2 (varietà/qualità):** conta i TIPI di inquadratura per scena (≥4);
  segnala scene "tutte punch-in"; verifica ease/durate nei range del prompt;
  verifica che ImmersiveRicarica sia davvero discreta (≤1.15).

## Verifica runtime OBBLIGATORIA (questa fase non passa senza)

`pnpm dev` + puppeteer-core con Chrome di sistema:
1. **Coerenza scrub:** scrolla ogni scena avanti, poi INDIETRO, poi di nuovo avanti
   (via `window.scrollTo` progressivi o CDP Input): nessun salto visivo della
   camera, cursore mai disallineato dai target dopo un movimento camera
   (screenshot before/after nei beat di click).
2. **Reduced-motion:** rilancia la pagina con CDP
   `Emulation.setEmulatedMedia { features: [{name:"prefers-reduced-motion", value:"reduce"}] }`
   → nessuna camera, layout statici leggibili, zero errori console.
3. **Performance:** trace di 20s di scroll continuo (CDP Tracing o
   `page.metrics()`): media fps ≥55 su una macchina desktop; se un rack focus con
   blur scende sotto, il fix è RIMUOVERE il blur (previsto dal prompt).
Salva screenshot in `docs/roadmap-migliorie/_screens/fase4/` (non committare).

## GATE di uscita Fase 4

- [ ] KIT + 6 scene success; controllo verde; 2 reviewer PASS; runtime ok.
- Commit: `git add -A; git commit -m "fase 4: camera cinematografica sulle scene immersive (P11)"; git tag roadmap-fase-4-ok`

## Failure mode

| Sintomo | Azione |
|---|---|
| Cursore atterra fuori dai bottoni dopo uno zoom | formula di centratura o sequenziamento: retry della SCENA (se solo una) o di KIT-11 (se tutte) |
| Hand-off tra scene "doppio zoom" | una scena anima `.imm-stage` o non resetta la camera → retry scena |
| Reduced-motion mostra scena zoomata | manca cameraReset finale → retry scena (criterio bloccante) |
| Jank sotto 55fps | rimuovi blur dai rackFocus; se persiste, riduci le scale dei punch a ≤1.35 |
