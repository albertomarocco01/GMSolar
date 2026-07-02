# ROADMAP MULTI-AGENTE — Migliorie home GM Solar

> **Questo file è per TE, agente ORCHESTRATORE.** Leggilo per intero prima di lanciare
> qualunque sottoagente. Poi esegui le fasi nell'ordine dei file `01-…` → `07-…`.
> Ogni file di fase è auto-contenuto: dice chi lanciare, con quale prompt, su quali
> file, come verificare e quando committare.

---

## 1. Missione

Applicare al progetto le 12 migliorie specificate in **`docs/PROMPTS-MIGLIORIE-HOME.md`**
(P1…P12 — quella è la SPEC di dettaglio: i prompt sono già scritti per essere passati
ai sottoagenti). La roadmap organizza P1–P12 in 7 fasi (0–6) con parallelizzazione
massima dove i file non collidono, controllo qualità a ogni fase e checkpoint git.

Risultato finale atteso: home scrollytelling con — niente video drone né cavo EV; pausa
globale reale; scena solare = finto sito con video hero, frase popup, cue coordinato e
card 3D; foto prodotto nell'Assistente; Dashboard densa che modifica contenuti reali;
Segnalazioni subito dopo la Dashboard con link auto-rilevato e fix mostrato; Gestionale
delle colonnine senza dati economici; app di ricarica senza badge GM Charge; Integrazioni
a carrellata con esempio WhatsApp; chiusura minimale GM SOLAR; camera cinematografica
(P11) e title card di capitolo + HUD (P12) su tutte le scene.

## 2. Ambiente (fatti verificati, non riscoprirli)

| Cosa | Valore |
|---|---|
| OS / shell | Windows 11 · PowerShell (usa sintassi PowerShell nei comandi) |
| Repo | `c:\Users\sinog\Desktop\GMSolar` (git, branch `main`) |
| Monorepo | pnpm `9.15.4` + turbo · Node ≥ 20.9 |
| App | Next.js 16 App Router in `apps/web`, React 19, TS strict, Tailwind v4 |
| Comandi | `pnpm typecheck` · `pnpm build` · `pnpm lint` · `pnpm dev` (porta 3000) · `pnpm format` |
| Animazioni | GSAP+ScrollTrigger SOLO da `@gmgroup/lib/gsap`; Lenis attivo a layout |
| QA visuale | `puppeteer-core` (già devDependency) + **Chrome di sistema** (`C:\Program Files\Google\Chrome\Application\chrome.exe`) — il Chromium bundled NON decodifica H.264: i video si vedono solo con Chrome di sistema |
| Ricerca testo | ⚠ `rg` NON è nel PATH di PowerShell su questa macchina. I pattern `rg "…"` nei file di fase vanno eseguiti con il tool Grep del tuo harness, oppure via Git Bash (`bash -lc 'rg "…" path'`); fallback PowerShell puro: `Get-ChildItem -Recurse | Select-String -Pattern "…"`. Non interpretare "rg non riconosciuto" come un FAIL dei criteri. |
| Target | Demo SOLO PC desktop, 1920×1080. Niente QA mobile. |

## 3. Regole di progetto NON NEGOZIABILI (valgono per ogni sottoagente)

1. **Zona condivisa intoccabile**: `packages/**`, `apps/web/app/layout.tsx`,
   `apps/web/app/globals.css`. Modifica lì = FAIL immediato della fase.
2. **`prefers-reduced-motion` sempre rispettato**: le scene immersive portano la
   timeline a `progress(1)` → ogni beat deve avere stato finale leggibile e neutro.
3. Tema CHIARO forzato, un solo accent lime via utility token (`bg-accent`,
   `text-accent-ink`, `bg-accent-soft`, `text-accent-contrast`, `bg-surface`,
   `border-border`, `text-muted`). Su fondo scuro il testo accent è `text-accent`.
4. Tutti i dati/asset sono MOCK deterministici. AI simulata: `resolveAiProvider()`
   resta disabilitata. UI in ITALIANO.
5. Solo `transform`/`opacity` per le animazioni pesanti; 60fps obbligatori.
6. Nessun sottoagente committa. Committa SOLO l'orchestratore, ai gate di fase.

## 4. Principi di orchestrazione (come lavori TU)

1. **Non scrivi codice.** Deleghi, verifichi, committi. Se un fix è banale (<5 righe)
   puoi delegarlo a un micro-builder, mai farlo "al volo" senza traccia.
2. **Orchestrator→worker con ownership esclusiva dei file**: mai due agenti
   CONCORRENTI sullo stesso file (matrice §6). Le fasi sono barriere.
3. **Builder ≠ Reviewer**: chi ha scritto il codice non verifica se stesso. Ogni
   ondata di builder è seguita da reviewer indipendenti (adversarial: cercano di
   FALSIFICARE i criteri di accettazione, non di confermarli).
4. **Generate → Critique → Resolve**: se un reviewer contesta e il builder dissente,
   lancia un terzo agente ARBITRO con il diff + i due report; la sua decisione vince.
5. **Fan-out solo su task indipendenti**; lancia i worker paralleli in un unico
   messaggio. Task con dipendenze = sequenziali.
6. **Contesto minimo sufficiente**: a ogni worker passi (a) il testo INTEGRALE della
   sua sezione P<k> da `docs/PROMPTS-MIGLIORIE-HOME.md`, (b) le note di integrazione
   della fase, (c) le regole del §3. Non passare la storia delle altre fasi.
7. **Report strutturato obbligatorio** (§8): un worker senza report = failed.
8. **Nei fan-out paralleli i worker NON eseguono `pnpm typecheck`/`pnpm build`**
   (race sulla cache turbo e spreco): li esegue UNA volta l'agente di controllo di
   fase. Questa istruzione PREVALE sulla riga "esegui pnpm typecheck…" dei prompt P.
9. **Scope check meccanico**: dopo ogni ondata, `git diff --name-only` confrontato
   con la matrice ownership. File fuori scope → il builder responsabile rifà (o
   reverta il file estraneo: `git checkout -- <file>` solo se la modifica è certa
   di essere estranea al suo task).
10. **Checkpoint git a ogni gate**: commit + tag `roadmap-fase-N-ok`. Rollback di
    fase = `git reset --hard roadmap-fase-<N-1>-ok`.
11. **Retry max 2 per worker** (ogni retry riceve il report del reviewer). Al 3°
    fallimento: STOP della fase, report all'umano. Non improvvisare ri-progettazioni.
12. Se il tuo harness supporta l'isolamento in worktree per i builder, usalo per le
    ondate ≥4 agenti; altrimenti stesso working tree + ownership rigida va bene
    (la matrice garantisce zero sovrapposizioni).
13. **Autonomia pre-autorizzata.** La regola di progetto «lavora a fasi, fermati,
    aspetta il via» (CLAUDE.md) è soddisfatta DAI GATE di questa roadmap: lanciandola
    l'umano ha pre-autorizzato le 7 fasi in sequenza. Non chiedere conferme tra le
    fasi; fermati SOLO negli STOP espliciti dei file di fase. Il riepilogo per
    l'umano sono i commit taggati + il report finale della Fase 6.

## 5. Le fasi (mappa)

| Fase | File | Contenuto | Prompt | Parallelismo | Dipende da |
|---|---|---|---|---|---|
| 0 | `01-fase-0-preflight.md` | Baseline, branch, ricognizione | — | 1 explorer | — |
| 1 | `02-fase-1-demolizione.md` | Remover video + pausa globale | P1, P2 | 2 builder ∥ | Fase 0 |
| 2 | `03-fase-2-scene.md` | Riscrittura 7 scene/sezioni | P3,P4,P5,P7,P8,P9,P10 | 7 builder ∥ | Fase 1 |
| 3 | `04-fase-3-segnalazioni.md` | Segnalazioni collegata a Dashboard | P6 | 1 builder | Fase 2 (P5) |
| 4 | `05-fase-4-camera.md` | Camera cinematografica | P11 | 1 kit + 6 scene ∥ | Fase 3 |
| 5 | `06-fase-5-capitoli.md` | Title card capitoli + HUD | P12 | 1 kit + 7 scene ∥ | Fase 4 |
| 6 | `07-fase-6-qa-finale.md` | QA totale, review avversariale, docs | — | 2-3 reviewer ∥ | Fase 5 |

Ordine home DOPO la Fase 3 (riferimento per tutte le fasi successive):
`SolarTwinScene → ImmersiveAssistente → ImmersiveDashboard → ImmersiveSegnalazioni →
ImmersiveGestionale → ImmersiveRicarica → ImmersiveIntegrazioni → ClosingScene`.

## 6. Matrice di ownership dei file (chi può toccare cosa, per fase)

| File | F1 | F2 | F3 | F4 | F5 |
|---|---|---|---|---|---|
| `apps/web/app/page.tsx` | B-P1 | — | B-P6 | — | KIT-12 |
| `components/home/AutoScroll.tsx` | B-P2 | — | — | — | — |
| `components/home/ScrollCue.tsx` | — | B-P3 | — | — | — |
| `components/home/scenes/VetrinaScene.tsx` (delete) | B-P1 | — | — | — | — |
| `components/home/scenes/EvCableScene.tsx` (delete) | B-P1 | — | — | — | — |
| `components/home/scenes/VideoScrubScene.tsx` | B-P1 | B-P3 (delete se orfano) | — | — | — |
| `components/home/scenes/SolarTwinScene.tsx` | B-P1 (commenti) | B-P3 (riscrittura) | — | µB opz. (overshoot card) | S12-solar |
| `components/home/vetrina/VetrinaFilmGrade.tsx` + `VetrinaIcons.tsx` | — | B-P3 (delete se orfani) | — | — | — |
| `immersive/_chapters.ts` (opz., nuovo) | — | — | — | — | KIT-12 |
| `components/home/scenes/ClosingScene.tsx` | — | B-P10 | — | — | — |
| `components/home/vetrina/SuspendedCards.tsx` | — | B-P3 (solo se serve) | — | — | — |
| `immersive/shared.tsx` | — | — | — | KIT-11 | KIT-12 |
| `immersive/ImmersiveAssistente.tsx` | — | B-P4 | — | S11-ass | S12-ass |
| `immersive/ImmersiveDashboard.tsx` | — | B-P5 | — | S11-dash | S12-dash |
| `immersive/ImmersiveSegnalazioni.tsx` | — | — | B-P6 | S11-segn | S12-segn |
| `immersive/ImmersiveGestionale.tsx` | — | B-P7 | — | S11-gest | S12-gest |
| `immersive/ImmersiveRicarica.tsx` | — | B-P8 | — | S11-ric | S12-ric |
| `immersive/ImmersiveIntegrazioni.tsx` | B-P2 | B-P9 | — | S11-int | S12-int |
| `components/home/ChapterHUD.tsx` (nuovo) | — | — | — | — | KIT-12 |
| `apps/web/public/assets/*` (delete 4 file) | B-P1 | — | — | — | — |
| `apps/web/public/assets/products/` (nuovi) | — | B-P4 | — | — | — |
| `docs/PROGETTO.md` | — | — | — | — | — (F6) |

(Path relativi a `apps/web/components/home/` dove abbreviati.)

## 7. Algoritmo di fase (uguale per tutte)

```
1. GATE IN   → verifica prerequisiti del file di fase (tag fase precedente esiste,
               working tree pulito).
2. LANCIO    → lancia i builder dell'ondata (tutti in un messaggio se paralleli),
               ciascuno con il template §8.1 compilato.
3. RACCOLTA  → colleziona i report e APPENDI le `note_per_fasi_successive` di ogni
               report a `docs/roadmap-migliorie/_ricognizione.md` (log vivo che le
               fasi dopo consultano). Worker senza report o failed → retry (max 2).
4. SCOPE     → `git diff --name-only` vs matrice §6. Fuori scope → gestisci (§4.9).
5. CONTROLLO → lancia l'agente di CONTROLLO di fase (template §8.3): esegue
               `pnpm typecheck` + `pnpm build`, i grep di accettazione, e la
               checklist del file di fase. È lui l'unico a lanciare i comandi pesanti.
6. REVIEW    → lancia il/i REVIEWER indipendenti previsti dal file di fase
               (adversarial, leggono il diff: `git diff`).
7. FIX LOOP  → finding CONFERMATI → torna al builder proprietario del file con il
               report del reviewer (retry). Finding contestati → arbitro (§4.4).
8. GATE OUT  → tutti PASS → commit. PRIMA del primo commit assicurati che gli
               artefatti usa-e-getta siano esclusi: aggiungi la riga
               `docs/roadmap-migliorie/_screens/` a `.git/info/exclude`.
               Poi `git add -A; git commit -m "<msg del file di fase>"` e
               `git tag roadmap-fase-N-ok`. Passa alla fase successiva.
```

## 8. Template (compilali, non riscriverli)

### 8.1 Lancio BUILDER

```
Sei l'agente <ID> della Fase <N> della roadmap "migliorie home GM Solar".
Repo: c:\Users\sinog\Desktop\GMSolar (Windows, PowerShell). Non committare MAI.

FILE DI TUA PROPRIETÀ (puoi modificare SOLO questi): <elenco esatto>

TASK
Apri `docs/PROMPTS-MIGLIORIE-HOME.md` e leggi la sezione «## P<k> — <titolo>».
Eseguila INTEGRALMENTE. Queste note PREVALGONO sul testo del prompt:
- NON eseguire `pnpm typecheck` né `pnpm build` (li esegue il controllo di fase).
- NON committare.
- <note di integrazione specifiche della fase, dal file di fase>

REGOLE NON NEGOZIABILI
- Vietato toccare: packages/**, apps/web/app/layout.tsx, apps/web/app/globals.css.
- prefers-reduced-motion sempre rispettato (timeline a progress(1) leggibile e neutra).
- Tema chiaro, accent via utility token; dati mock; UI in italiano; demo solo PC.
- GSAP/ScrollTrigger solo da @gmgroup/lib/gsap.

OUTPUT — rispondi SOLO con questo report:
### REPORT <ID>
status: success | partial | failed
files_modificati: [elenco esatto]
criteri: [ogni criterio di accettazione del prompt → PASS/FAIL + evidenza in 1 riga]
deviazioni: [cosa hai fatto diversamente dal prompt e perché; "nessuna" se nessuna]
note_per_fasi_successive: [selettori/classi rinominati, decisioni che impattano P11/P12]
rischi_aperti: [...]
```

### 8.2 Lancio REVIEWER (adversarial)

```
Sei un REVIEWER indipendente della Fase <N>. NON modificare file: solo verificare.
Repo: c:\Users\sinog\Desktop\GMSolar.

1. Leggi la sezione «## P<k>» di docs/PROMPTS-MIGLIORIE-HOME.md (la spec).
2. Leggi il diff: `git diff` (+ `git diff --name-only`).
3. Per OGNI criterio di accettazione della spec: cerca di FALSIFICARLO leggendo il
   codice reale (non fidarti del report del builder). Controlla in particolare:
   <checklist specifica dal file di fase>
4. Verifica scope: file toccati ⊆ <ownership della fase>.
5. Rispondi SOLO con:
### REVIEW <ID>
verdetto: PASS | FAIL
finding: [file:riga → problema → gravità (bloccante/minore) → fix suggerito]
criteri_non_verificabili_staticamente: [cosa serve provare a runtime in Fase 6]
```

### 8.3 Lancio CONTROLLO di fase (comandi pesanti, una volta sola)

```
Sei l'agente di CONTROLLO della Fase <N>. Non modificare file.
1. Esegui `pnpm typecheck` poi `pnpm build` (PowerShell, dalla root). Se falliscono,
   riporta l'errore ESATTO e il file colpevole.
2. Esegui i grep di accettazione: <elenco rg dal file di fase>.
3. Esegui la checklist runtime se prevista dal file di fase.
4. Report: come 8.2 (verdetto + finding).
```

## 9. Gestione errori (tabella decisionale)

| Evento | Azione |
|---|---|
| typecheck/build rosso dopo un'ondata | Il controllo identifica il file → retry del builder proprietario con l'errore esatto. |
| Due builder hanno toccato lo stesso file | Bug di orchestrazione: reverta il non-proprietario, rilancialo con ownership corretta. |
| Reviewer FAIL bloccante | Retry del builder col report. Max 2, poi STOP fase → report umano. |
| Builder dice "impossibile" (es. rete bloccata per Unsplash in P4) | Usa il fallback previsto dal file di fase; se assente, STOP e chiedi all'umano. |
| Dev server non parte / porta occupata | Uccidi SOLO il processo sulla porta: `Get-NetTCPConnection -LocalPort 3000 -State Listen \| Select-Object -Expand OwningProcess \| ForEach-Object { Stop-Process -Id $_ -Force }`. MAI `Get-Process node \| Stop-Process` (ucciderebbe anche harness/MCP/turbo). Se persiste, salta la verifica visuale di fase e demandala alla Fase 6 annotandolo. |
| Regressione scoperta in fase tardiva causata da fase committata | NON riscrivere la storia: fix in avanti con micro-builder dedicato nella fase corrente. |
| Ambiguità nella spec P<k> | Decidi tu con la lettura più conservativa (meno file toccati) e ANNOTA la decisione nel commit; non chiedere all'umano per dettagli estetici. |

## 10. Cosa consegni alla fine

1. Branch `migliorie-home` con 7 commit di fase taggati (+ eventuali fix-commit).
2. Report finale (dalla Fase 6): stato dei 12 prompt, deviazioni, rischi aperti,
   screenshot chiave, esito reduced-motion e performance.
3. NIENTE push remoto e NIENTE merge su main senza ok esplicito dell'umano.
