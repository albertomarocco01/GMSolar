# FASE 6 — QA finale, review avversariale, documentazione, consegna

**Prompt coperti:** nessuno nuovo — verifica TOTALE di P1…P12 + allineamento docs.
**Parallelismo:** 1 controllo pesante → 3 reviewer in PARALLELO → arbitro se serve →
micro-fixer sequenziali → 1 builder docs → report finale.
**Gate d'ingresso:** tag `roadmap-fase-5-ok`.

## Ondata 1 — Controllo totale (template §8.3, esteso)

```powershell
pnpm typecheck
pnpm build
pnpm lint
pnpm format:check     # se rosso: pnpm format (unico caso in cui il controllo può scrivere) e rilancia
```
**Sweep completo dei grep di accettazione** (unione di TUTTE le fasi — devono ancora
valere tutti; il codice delle fasi tarde può aver reintrodotto vecchi pattern):
```powershell
rg "gm-solar-drone|ev-cable|EvCableScene|VetrinaScene|scrub=\{false\}" apps/web
rg "GM Charge|imm-webapp-tag" apps/web
rg "Copia link|Anagrafica clienti|Invia per email|imm-new-btn" apps/web/components/home
rg "Evaso|Pipeline|€" apps/web/components/home/immersive/ImmersiveGestionale.tsx
rg "imm-int-search|imm-int-detail" apps/web
rg "CableIcon|ProductArtwork|MiniArt" apps/web
rg "eyebrow=" apps/web/components/home
rg "eyebrow" apps/web/components/home/immersive/shared.tsx
# NB: "eyebrow" come dato in _assistente-data.ts / GENERATED.eyebrow è legittimo.
```
Verifica ANTI-REGRESSIONE zona condivisa (deve essere vuoto):
```powershell
git diff roadmap-fase-0-ok..HEAD --name-only -- packages apps/web/app/layout.tsx apps/web/app/globals.css
```

## Ondata 2 — QA runtime completo (agente dedicato, read-only sul codice)

Script puppeteer-core + Chrome di sistema (`C:\Program Files\Google\Chrome\Application\chrome.exe`),
viewport 1920×1080, contro `pnpm dev`:

1. **Percorso completo:** scroll dall'inizio alla fine (a passi, lasciando agire
   Lenis); raccogli TUTTI gli errori/warning console → zero errori attesi.
2. **Capitoli:** screenshot all'ingresso di ogni capitolo (card visibile) + HUD.
3. **Interazioni chiave:** pausa (click → attributo `data-presentation-paused`,
   overlay visibile, animazioni CSS ferme, micro-demo del cue Solare ferma) e
   resume; replay dalla chiusura («Rivedi la presentazione» → reload in cima);
   scena Solare: la micro-demo del cue si UCCIDE al primo scroll (criteri P2/P3);
   fine scena Dashboard: il cursore finto termina sopra «Segnala un problema»
   (criterio P5, mai verificato prima a runtime).
4. **Scrub bidirezionale:** su 3 scene a campione (Solare, Gestionale, Integrazioni)
   avanti→indietro→avanti: screenshot comparativi, nessuno stato rotto.
5. **Reduced-motion:** intera pagina con CDP
   `Emulation.setEmulatedMedia {features:[{name:"prefers-reduced-motion",value:"reduce"}]}`:
   ogni sezione leggibile, heading capitoli statici, zero errori.
6. **Performance:** 20s di scroll con tracing → fps medio ≥55; segnala i 3 frame
   peggiori e la scena in cui cadono.
7. **Peso pagina:** somma trasferimenti network al primo load ≤ baseline (misurata
   in Fase 0, valore in `_ricognizione.md`) + 1.5MB — le foto P4 sono l'unica
   aggiunta rilevante. Se la baseline non è stata misurata: soglia assoluta ≤4 MB.

Output: report + screenshot in `docs/roadmap-migliorie/_screens/fase6/` (non committare).

## Ondata 3 — Review avversariale finale (3 reviewer in parallelo, lenti diverse)

- **R-FIN-1 · Correttezza GSAP/scrub:** tween non deterministici, repeat:-1 in
  timeline scrubbate, camera non resettata, tween orfani (target eliminati),
  conflitti di transform sugli stessi nodi.
- **R-FIN-2 · A11y + reduced-motion:** aria-label sezioni, aria-hidden sui
  decorativi, contrasto testi (accent-ink su chiaro, accent su scuro), stato
  progress(1) di OGNI scena, focus/keyboard non peggiorati.
- **R-FIN-3 · Coerenza narrativa e testi:** ordine capitoli vs numerazione, italiano
  senza refusi, dati mock internamente coerenti (kW, kWh, contatori), niente
  residui del vecchio racconto (drone, evasi, GM Charge, ricerca integrazioni).

Ogni finding → classifica: BLOCCANTE (rompe demo/regola non negoziabile) o MINORE.
Contestazioni → arbitro (template §8.2 con i due report + diff). I fix vanno a
micro-builder SEQUENZIALI (uno per file, mai paralleli in questa fase) e ogni fix
ripassa da `pnpm typecheck`. Scope check in questa fase: la matrice §6 non ha
colonna F6 — lo scope di ogni micro-fixer è il SINGOLO file dichiarato nel suo
lancio, e il diff si confronta con quello.

## Ondata 4 — Documentazione (1 builder)

- **File di proprietà:** `docs/PROGETTO.md`.
- Task: «Aggiorna la sezione architettura/ordine della home al nuovo stato: ordine
  scene (Solare → Assistente → Dashboard → Segnalazioni → Gestionale → Ricarica →
  Integrazioni → Chiusura), scene rimosse (drone, cavo EV), nuovi sistemi (camera
  cinematografica nel kit, capitoli + HUD, pausa globale). Non riscrivere il file:
  modifica chirurgica delle parti diventate false.»

## GATE FINALE

- [ ] Controllo totale verde (typecheck, build, lint, format, grep sweep, zona condivisa intatta).
- [ ] QA runtime: tutte le 7 verifiche PASS (o deviazioni accettate e annotate).
- [ ] 3 reviewer: nessun finding bloccante aperto.
- [ ] PROGETTO.md aggiornato.
- Commit: `git add -A; git commit -m "fase 6: QA finale + docs"; git tag roadmap-fase-6-ok`

## Report finale all'umano (obbligatorio, chiude la roadmap)

```
ROADMAP MIGLIORIE HOME — REPORT FINALE
branch: migliorie-home · commit: <sha> · tag: roadmap-fase-6-ok

P1..P12: [per ciascuno: DONE | DONE con deviazioni (quali) | PARZIALE (cosa manca)]
Deviazioni accettate: [...]
Rischi aperti / debiti: [...]
QA: typecheck ✓ build ✓ lint ✓ · fps medio: NN · reduced-motion ✓ · console pulita ✓
Screenshot: docs/roadmap-migliorie/_screens/fase6/
Prossimi passi suggeriti all'umano: revisione visiva dal vivo, poi merge su main
(NESSUN push/merge è stato fatto).
```

## Failure mode

| Sintomo | Azione |
|---|---|
| Grep sweep trova regressione di una fase vecchia | micro-fixer sul file, NON riaprire la fase: fix in avanti |
| fps < 55 stabilmente | rimuovi blur dai rackFocus, poi riduci scale punch; se ancora rosso → report umano con trace |
| Reviewer in disaccordo | arbitro; se anche l'arbitro è incerto → classifica MINORE e annota nel report finale |
| Chrome di sistema assente | usa Edge (`C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe`, ha H.264); annota |
