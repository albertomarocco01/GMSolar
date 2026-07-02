# Ricognizione Fase 0 — log vivo della roadmap

> Scritto dall'orchestratore. Le fasi successive APPENDONO qui le
> `note_per_fasi_successive` dei report dei worker.

## Baseline (2026-07-02)

- Branch `migliorie-home` da `main` @ fb182c8; baseline committata d0c12d2
  (include WIP locale: tuning AutoScroll SPEED/MIN_SPEED/LAND_ZONE/DWELL_MS,
  replay via `window.location.reload()`, ritocchi scene).
- `pnpm install --frozen-lockfile` + `pnpm typecheck` + `pnpm build`: VERDI.
- `docs/PROMPTS-MIGLIORIE-HOME.md`: 12 sezioni P1…P12 presenti ✓.

## Esito ricognizione (explorer read-only)

Tutti i riferimenti dei prompt confermati, con drift di riga minori (entro i "~").
Ordine di montaggio reale in `page.tsx` = quello dichiarato nei prompt:
IntroOverlay → AutoScroll → CinematicGrain → VelocitySkew → VetrinaScene →
SolarTwinScene → ImmersiveAssistente → ImmersiveDashboard → ImmersiveGestionale →
ImmersiveSegnalazioni → EvCableScene → ImmersiveRicarica → ImmersiveIntegrazioni →
ClosingScene.

Posizioni attuali (per i builder):
- `AutoScroll.tsx`: `togglePause` righe 208–219; listener click 224–228 (esclude
  `a, button, [data-no-pause]`); pill 280–301; evento `presentation:replay`
  gestito a 251/267 con `onReplay` → `window.location.reload()` (234–237).
- `ScrubVideo.tsx`: `seek(progress)` via useImperativeHandle (47–59), lerp nel rAF.
- `SuspendedCards.tsx`: `.vt-card` riga 123, prop `animated` riga 60.
- `shared.tsx`: ImmersiveStage `.imm-stage`/`.imm-skew` righe 533–552; prop
  `eyebrow` dichiarata (526–531) ma NON renderizzata; helper esportati:
  cursorTo, clickZoom, pressButton, typeInField, drawPath, countUp, maskReveal,
  say, Say, useImmersiveScene, accentVars, Cursor, ImmersiveStage.
- Classi immersive: `.imm-track` Dashboard 254 · Gestionale 213 · Segnalazioni 152;
  `.imm-nav-item` Dash 202 · Gest 188; `.imm-ai-btn` Gest 207; `.imm-ag-drawer/old/new`
  Gest 282/340/342; `.imm-new-btn(-ring)` Segn 205/200; `.imm-webapp-tag` Ric 282
  («Web app · GM Charge» riga 287, gsap.set 103, tween entrata 109); `.imm-int-search/
  -detail` Int 205/261; `.imm-rc-send` Ric 593; `.imm-bar` Assist 380 (⚠ riusata in
  Dashboard 442 per le barre del grafico); `.imm-send` Assist 393; `.imm-config-pick`
  Assist 340; `.imm-query` Gest 247.
- `ImmersiveIntegrazioni`: float tween `repeat:-1` righe 183–187.
- `ImmersiveAssistente`: CARD_WASH 43/192, CableIcon 438/194, CABLE_VARIANTS 432,
  ProductArtwork 467/285, MiniArt 518/298; `_assistente-data.ts` → `GENERATED.eyebrow`
  riga 123 (DATO legittimo, non è la prop di ImmersiveStage).
- Asset: gm-solar-drone.mp4/-poster.webp, ev-cable.mp4/-poster.webp presenti (da
  eliminare in P1); solar-twin.mp4/-poster.webp presenti (INTOCCABILI, all-keyframe);
  sorgenti SolarPanelsAnimation.mp4 / CavoAnimation.mp4 presenti (NON toccare).
- Versioni: simple-icons ^16.24.1 (apps/web) · gsap ^3.15.0 (packages/lib).

## DEVIAZIONI (correzioni per i builder)

- **A → B-P1:** `vetrina/VetrinaIcons.tsx` è ORFANO già oggi (zero import nel
  codice). P1 non lo cita: NON eliminarlo in P1 (fuori ownership); resta a P3
  (ownership esplicita, "delete se orfano").
- **B → B-P3:** `vetrina/VetrinaFilmGrade.tsx` è importato SOLO da
  `VideoScrubScene.tsx`. Se P3 elimina VideoScrubScene, pulizia a cascata di
  VetrinaFilmGrade + VetrinaIcons (e verifica consumatori di ScrollCue/Callout).
- **C → B-P1:** il link `/#vetrina` è VIVO (`apps/web/data/kb.ts` riga 33);
  `id="vetrina"` oggi su VetrinaScene riga 31 → va spostato sulla config di
  SolarTwinScene. `VideoScrubScene` espone già la prop `id` (65–67, applicata a
  223); SolarTwinScene NON la passa: aggiungerla.
- **D → B-P10:** replay = reload pagina (WIP umano). `ReplayButton` e l'evento
  `presentation:replay` restano; il JSDoc di ReplayButton parla ancora di "rewind
  smooth" (doc-drift, non bloccante). P10 conserva `<ReplayButton/>` intatto.
- **E:** drift di riga minori ovunque, nessuna classe rinominata.

## Baseline peso primo load

- Misura via puppeteer-core + Chrome di sistema, viewport 1920×1080, contro
  `pnpm dev` (DEV MODE — bundle non minificati: confrontare in Fase 6 con lo
  stesso metodo): **7.65 MB trasferiti** (8 019 534 byte), networkidle2 + 3s.
- Console: 0 errori. Smoke test dev server: OK (server su porta 3000).

## Note per fasi successive (append dai report)

### Fase 1 (B-P1, B-P2)

- **B-P1 → P3:** conservare `id="vetrina"` sul `<section>` della scena Solare
  (kb.ts:33 linka `/#vetrina`). VideoScrubScene ora è scrub-only con UN solo
  consumatore (SolarTwinScene): se P3 lo elimina → pulizia a cascata
  VetrinaFilmGrade + VetrinaIcons + commento stale `SuspendedCards.tsx:33`
  ("vedi VetrinaScene") + verifica consumatori ScrollCue/Callout.
- **B-P2 → P9:** ImmersiveIntegrazioni ha ora (righe ~181-215, dentro
  `if (!reduced)` del build) un blocco da PRESERVARE nella riscrittura:
  `floats = tiles.map(gsap.to repeat:-1)` + listener `presentation:pausechange`
  che fa pause()/resume() + sync iniziale da attributo `data-presentation-paused`
  + cleanup via `floats[0]?.eventCallback("onInterrupt", removeEventListener)`.
- **B-P2 → P3:** la micro-demo `repeat:-1` del cue Solare dovrà fare
  pause/resume sullo stesso evento (stesso pattern).
- **B-P2:** pausa video liberi implementata GENERICAMENTE in AutoScroll
  (handler su `#top video` non-paused); nessun video libero esiste più in home.
- **Ordine capitoli P12:** 01 = scena Solare.
