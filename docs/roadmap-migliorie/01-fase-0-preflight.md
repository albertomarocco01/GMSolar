# FASE 0 — Preflight: baseline, branch, ricognizione

**Prompt coperti:** nessuno (preparazione).
**Parallelismo:** 1 solo agente explorer (il resto lo fai tu, orchestratore).
**Durata attesa:** breve. Non saltarla: qui si prevengono i fallimenti delle fasi 1–6.

## Scopo

1. Congelare una baseline VERDE e committata da cui ogni fase può fare rollback.
2. Verificare che l'ambiente funzioni (install, typecheck, build, dev server).
3. Ricognizione: confermare che i riferimenti dei prompt P1–P12 (file, classi,
   selettori, righe) esistano ancora nel codice reale; produrre l'elenco delle
   deviazioni da passare ai builder.

## Passi (in ordine)

### 0.1 Stato git e branch
```powershell
git status --porcelain
```
- Working tree SPORCO è probabile (modifiche locali preesistenti alle scene home).
  NON scartarle: sono lavoro dell'umano. Procedi così:
  `git checkout -b migliorie-home` e poi `git add -A; git commit -m "baseline pre-roadmap (wip locale incluso)"`.
- Working tree pulito: solo `git checkout -b migliorie-home`.
- Se esiste già un branch `migliorie-home`: STOP, chiedi all'umano come procedere.

### 0.2 Ambiente verde
```powershell
pnpm install --frozen-lockfile
pnpm typecheck
pnpm build
```
- Tutti verdi → prosegui. `pnpm build` rosso sulla BASELINE → STOP: report all'umano
  con l'errore esatto (la roadmap non parte da una base rotta; non tentare fix).

### 0.3 Verifica documenti sorgente
- `docs/PROMPTS-MIGLIORIE-HOME.md` esiste e contiene le 12 sezioni `## P1` … `## P12`.
  Se ne manca una → STOP, report all'umano.

### 0.4 Ricognizione (1 agente EXPLORER, read-only)

Lancia un agente esplorativo con questo task:

```
Sei un explorer read-only. Repo: c:\Users\sinog\Desktop\GMSolar.
Verifica che questi riferimenti citati in docs/PROMPTS-MIGLIORIE-HOME.md esistano
ancora nel codice (i prompt sono stati scritti su una versione precedente del repo;
segnala OGNI scostamento: file mancante, classe rinominata, riga spostata di molto):

1. apps/web/app/page.tsx monta: IntroOverlay, AutoScroll, CinematicGrain, VelocitySkew,
   VetrinaScene, SolarTwinScene, ImmersiveAssistente, ImmersiveDashboard,
   ImmersiveGestionale, ImmersiveSegnalazioni, EvCableScene, ImmersiveRicarica,
   ImmersiveIntegrazioni, ClosingScene.
2. In components/home/: AutoScroll.tsx (funzione togglePause, listener click, pill),
   ScrollCue.tsx, ScrubVideo.tsx (metodo seek), IntroOverlay.tsx,
   scenes/{VetrinaScene,SolarTwinScene,EvCableScene,VideoScrubScene,ClosingScene}.tsx,
   vetrina/SuspendedCards.tsx (classi .vt-card, prop animated).
3. In components/home/immersive/: shared.tsx (ImmersiveStage con .imm-stage/.imm-skew,
   Cursor .imm-cursor, helper cursorTo/clickZoom/pressButton/typeInField/maskReveal/
   countUp/drawPath/say/Say, useImmersiveScene) e le 6 scene Immersive*.tsx con le
   classi citate nei prompt (.imm-track, .imm-nav-item, .imm-ai-btn, .imm-ag-drawer,
   .imm-new-btn, .imm-webapp-tag, .imm-int-search, .imm-rc-send, ecc.).
4. Asset: apps/web/public/assets/{gm-solar-drone.mp4, gm-solar-drone-poster.webp,
   ev-cable.mp4, ev-cable-poster.webp, solar-twin.mp4, solar-twin-poster.webp}.
5. Cerca riferimenti a "#vetrina" in apps/web/** (serve a P1 punto 4).
6. Riporta versioni: `simple-icons` in apps/web/package.json; `gsap` in
   packages/lib/package.json (la dipendenza vive lì, non in apps/web).

OUTPUT: tabella "riferimento → OK | DEVIAZIONE (dettaglio)" + elenco sintetico delle
deviazioni. Nessuna modifica ai file.
```

### 0.5 Consolidamento

- Salva l'output dell'explorer in `docs/roadmap-migliorie/_ricognizione.md` (lo scrivi
  tu, orchestratore). Questo file è un LOG VIVO: a ogni fase vi appenderai anche le
  `note_per_fasi_successive` dei report dei worker (vedi 00 §7.3) — le fasi tarde
  lo consultano (es. la firma del bottone di P5 per P6).
- Se ci sono deviazioni: per ogni fase successiva, aggiungi le correzioni pertinenti
  alle "note di integrazione" dei builder coinvolti (es. "la classe X ora si chiama Y").
  Le deviazioni NON bloccano: i prompt P usano selettori/nomi come ancore, non le righe.

### 0.6 Smoke test dev server + baseline di peso (facoltativo ma raccomandato)
```powershell
# in background
pnpm dev
```
Attendi il "ready" di Next, poi: con puppeteer-core + Chrome di sistema carica
`http://localhost:3000` e MISURA il peso del primo load (somma dei byte trasferiti,
via `page.on('response')`); annota il valore in `_ricognizione.md` — serve al
criterio di peso della Fase 6. Se la misura non è praticabile, annota l'assenza
(la Fase 6 userà una soglia assoluta). Chiudi il dev server (solo il processo
sulla porta 3000 — vedi 00 §9). Se il server non parte → STOP, report umano.

## GATE di uscita Fase 0

- [ ] Branch `migliorie-home` attivo, baseline committata.
- [ ] `pnpm typecheck` e `pnpm build` verdi sulla baseline.
- [ ] `docs/PROMPTS-MIGLIORIE-HOME.md` con 12 sezioni presenti.
- [ ] `_ricognizione.md` scritto (anche se vuoto di deviazioni).
- Commit: `git add -A; git commit -m "fase 0: baseline + ricognizione"; git tag roadmap-fase-0-ok`

## Failure mode principali

| Sintomo | Causa probabile | Azione |
|---|---|---|
| build rossa baseline | wip locale rotto | STOP → umano (non è compito della roadmap) |
| explorer trova scene già modificate rispetto ai prompt | wip locale | annota nelle note di integrazione dei builder; i prompt restano validi come intento |
| PROMPTS file mancante | percorso/branch sbagliato | verifica branch; STOP se assente davvero |
