# FASE 1 — Demolizione e fondamenta (P1 Remover + P2 Pausa globale)

**Prompt coperti:** P1, P2 (sezioni omonime in `docs/PROMPTS-MIGLIORIE-HOME.md`).
**Parallelismo:** 2 builder in PARALLELO (zero file in comune) → 1 controllo → 1 reviewer.
**Gate d'ingresso:** tag `roadmap-fase-0-ok` presente; working tree pulito.

## Perché questi due insieme e per primi

- P1 (rimozione drone + cavo EV) sblocca P3 (la scena solare diventa la prima) e
  riduce la superficie di tutte le fasi successive.
- P2 (pausa globale) tocca `AutoScroll.tsx` + `ImmersiveIntegrazioni.tsx`, disgiunti
  dai file di P1 → parallelo sicuro.
- ⚠ P2 va fatto PRIMA di P9 (Fase 2 riscrive ImmersiveIntegrazioni e dovrà
  PRESERVARE il listener di pausa introdotto qui).

## Ondata 1 — Builder (lanciali nello stesso messaggio)

### B-P1 «Remover»
- **Template:** §8.1 del file 00, con:
  - `<ID>` = B-P1, `<k>` = 1
  - **File di proprietà:** `apps/web/app/page.tsx`,
    `apps/web/components/home/scenes/VetrinaScene.tsx` (delete),
    `apps/web/components/home/scenes/EvCableScene.tsx` (delete),
    `apps/web/components/home/scenes/VideoScrubScene.tsx`,
    `apps/web/components/home/scenes/SolarTwinScene.tsx` (solo commenti/id),
    `apps/web/public/assets/gm-solar-drone.mp4`, `…/gm-solar-drone-poster.webp`,
    `…/ev-cable.mp4`, `…/ev-cable-poster.webp` (delete).
  - **Note di integrazione:** «Le deviazioni segnalate in
    `docs/roadmap-migliorie/_ricognizione.md` prevalgono sui numeri di riga del
    prompt. La scena SolarTwinScene verrà interamente riscritta nella fase
    successiva: su di essa fai il minimo indispensabile (commento + eventuale id).»

### B-P2 «Pausa»
- **Template:** §8.1, con:
  - `<ID>` = B-P2, `<k>` = 2
  - **File di proprietà:** `apps/web/components/home/AutoScroll.tsx`,
    `apps/web/components/home/immersive/ImmersiveIntegrazioni.tsx`.
  - **Note di integrazione:** «Il punto 4 del prompt (video in riproduzione libera)
    è probabilmente vuoto: un agente parallelo sta eliminando l'unico video libero
    (drone). Implementa comunque il meccanismo in modo generico via evento
    `presentation:pausechange` e annota nel report se non hai trovato video liberi.
    NON toccare `page.tsx` né i file delle scene video (proprietà di B-P1).»

## Ondata 2 — Controllo (dopo i 2 report)

Agente di CONTROLLO (template §8.3) con questi comandi:

```powershell
pnpm typecheck
pnpm build
```
Grep di accettazione (tutti devono dare ZERO risultati, salvo doc/roadmap):
```powershell
rg "gm-solar-drone|ev-cable|EvCableScene|VetrinaScene" apps/web
rg "scrub=\{false\}|freeVideoRef" apps/web
```
Grep di presenza (devono dare ALMENO un risultato):
```powershell
rg "data-presentation-paused" apps/web/components/home
rg "presentation:pausechange" apps/web/components/home
```
Checklist statica:
- [ ] `page.tsx` non importa più VetrinaScene/EvCableScene; commento di regia aggiornato.
- [ ] I 4 asset video/poster eliminati esistono ancora? (`Test-Path`) → devono essere assenti.
- [ ] `VideoScrubScene.tsx`: nessuna prop `scrub`, nessun ramo `<video>` autoplay.
- [ ] In `ImmersiveIntegrazioni.tsx` i tween float hanno pause/resume su evento e
      cleanup nel context.
- [ ] La regola CSS `animation-play-state` è in un `<style>` DENTRO AutoScroll
      (non in globals.css).

## Ondata 3 — Reviewer

1 reviewer (template §8.2) con checklist specifica:
- Il click su elementi interattivi (`a, button, [data-no-pause]`) NON deve attivare
  la pausa (comportamento preesistente da preservare).
- L'attributo `data-presentation-paused` viene RIMOSSO sia al resume sia nel cleanup
  dell'effect (unmount) — verificare entrambi i punti nel codice.
- Nessun residuo di import inutilizzati dopo le cancellazioni (VetrinaScene, ecc.).
- `SolarTwinScene` funziona ancora da prima scena (exitToLight true, ancora montata).
- Scope: file toccati ⊆ unione proprietà B-P1 + B-P2.

## Verifica runtime minima (fa parte del controllo)

```powershell
pnpm dev   # in background
```
Con puppeteer-core + Chrome di sistema (o manualmente se l'harness non può):
apri `http://localhost:3000`, attendi 3s, verifica in console che non ci siano errori;
esegui un click al centro pagina via CDP e verifica che
`document.documentElement.hasAttribute("data-presentation-paused")` sia `true`,
poi secondo click → `false`. Chiudi il dev server.
Se la verifica runtime non è praticabile ora, annotala come debito per la Fase 6.

## GATE di uscita Fase 1

- [ ] Report B-P1 e B-P2 = success; scope check ok.
- [ ] Controllo: typecheck+build verdi, grep ok, checklist ok.
- [ ] Reviewer: PASS (o finding risolti con retry).
- Commit: `git add -A; git commit -m "fase 1: rimozione video drone/cavo EV + pausa globale (P1, P2)"; git tag roadmap-fase-1-ok`

## Failure mode

| Sintomo | Azione |
|---|---|
| build rossa per import orfano di VideoScrubScene | retry B-P1 con l'errore esatto |
| pausa che congela anche lo scrub manuale (scroll da fermo non anima) | FAIL bloccante: B-P2 ha messo in pausa la globalTimeline GSAP invece del solo CSS/tween: il prompt lo vieta — retry |
| grep `ev-cable` trova match in docs/ | ignorare: i grep valgono su `apps/web` |
