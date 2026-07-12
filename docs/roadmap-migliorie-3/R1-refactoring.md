# R1 — Refactoring code-maniac (deterministico prima, LLM sul residuo)

> Auto-contenuta. Leggi «Ambiente» e «Regole» in `00-ORCHESTRATORE.md` §3–§4.
> Modello: Sonnet 5 medium; SOLO i task T4/T5 (GSAP scrub-safe) → Opus 4.8 high.
> **Gira da sola, prima di ogni altra roadmap** (tocca file di tutto il repo).

## Obiettivo

Portare la codebase alla baseline pulita di Code Maniac: tool deterministici installati e
verdi, grafo graphify costruito, hotspot di complessità rientrati sotto soglia. **Zero
cambi di comportamento osservabile**: refactor puri.

## FILE DI PROPRIETÀ

Tutto il repo (per questo è serializzata), con priorità sugli hotspot in §Task.
NON toccare: `packages/**`, `app/layout.tsx`, `app/globals.css` (zona condivisa).

## Task (in ordine)

### T1 — Tool deterministici

`node C:\Users\jacop\.claude\skills\code-maniac\scripts\setup.mjs --tools`
Poi verifica: `node .../scripts/scan.mjs --json` deve eseguire (non "skip") almeno
eslint · tsc · knip · jscpd · depcruise · gitleaks. Se un tool resta skip, dichiaralo nel
report: non simulare.

### T2 — Grafo graphify

Costruisci il grafo del repo (skill graphify, pip già installato) → `graphify-out/graph.json`
in root progetto. Da qui in poi le domande sulla codebase si fanno al grafo, non leggendo
file interi.

### T3 — Formato + residuo automatico

1. `pnpm format` (prettier --write, ripulisce i ≥5 file sporchi della baseline).
2. `scan.mjs --fix` → autofix eslint.
3. Residuo knip (codice morto) e jscpd (duplicati): rimuovi il morto certo, registra il
   dubbio in `docs/DEBITO-TECNICO.md`. Ponytail: cancellare > astrarre.

### T4 — Hotspot GSAP (⚠ Opus 4.8, scrub-safe) — comportamento IDENTICO

| File                                                | Funzione      | ccn | Intervento                                                                                                                             |
| --------------------------------------------------- | ------------- | --- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/web/components/home/AutoScroll.tsx:177`       | `tick`        | 21  | Estrai fasi pure (calcolo velocità a campana / intento indietro / carry sub-pixel) in funzioni nominate; la macchina a stati resta una |
| `apps/web/components/home/immersive/shared.tsx:219` | `pressButton` | 19  | Estrai normalizzazione opzioni + costruzione tween; API pubblica invariata                                                             |

Vincolo: le timeline restano **scrubbate e reversibili** (to/fromTo deterministici,
niente misure in corsa introdotte). Test manuale: scroll avanti/indietro sulla scena
Dashboard e sul cap. 01 → nessun salto.

### T5 — Hotspot non-GSAP

| File                                              | Funzione               | ccn | Intervento                                                                    |
| ------------------------------------------------- | ---------------------- | --- | ----------------------------------------------------------------------------- |
| `apps/web/components/gestionale/heuristic.ts:96`  | `detectStato`          | 18  | Tabella pattern→stato al posto della catena if                                |
| `apps/web/components/gestionale/heuristic.ts:121` | `buildFilter`          | 17  | Stessa logica: lookup, non branch                                             |
| `apps/web/components/gestionale/DataTable.tsx:35` | `DataTable` (10 param) | 17  | Raggruppa i 10 parametri in un oggetto props tipizzato; estrai celle ripetute |
| `apps/web/app/integrazioni/page.tsx:32`           | (issue routing scan)   | —   | Spezza in sotto-componenti nella stessa cartella                              |

Gli altri ~35 issue/warn: rientra quelli a costo basso (estrazione ovvia), registra il
resto in `docs/DEBITO-TECNICO.md` con motivazione. Non inseguire ccn≤10 a ogni costo:
minimalismo > purezza metrica.

### T6 — Chiusura

`scan.mjs --json` finale: allega al report il confronto issue prima/dopo. Aggiorna
`docs/DEBITO-TECNICO.md` (residui + marcatori `ponytail:`).

## Accettazione

- [ ] `pnpm typecheck` + `pnpm build` verdi · `pnpm format:check` pulito
- [ ] `scan`: 0 issue prettier · hotspot T4/T5 sotto soglia issue (ccn <15) · nessun NUOVO issue
- [ ] `graphify-out/graph.json` esiste ed è interrogabile
- [ ] Nessun cambio visivo/funzionale (diff solo strutturale; scene verificate a scrub)
- [ ] `docs/DEBITO-TECNICO.md` aggiornato

Commit suggerito: `refactor: baseline code-maniac (tool deterministici, grafo, hotspot complessità)`
