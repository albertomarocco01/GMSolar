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

### Fase 2 (B-P3, B-P4, B-P5, B-P7, B-P8, B-P9, B-P10)

- **B-P5 → P6, FIRMA ESATTA bottone da riusare alla lettera:**
  ```jsx
  <button
    className="imm-report-btn bg-accent-soft text-accent-ink flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
    tabIndex={-1}
    aria-hidden
  >
    <MessageSquareWarning className="h-3.5 w-3.5" aria-hidden />
    Segnala un problema
  </button>
  ```
  (import lucide-react). A fine timeline il cursore fa `cursorTo(tl, ".imm-report-btn", { mode: "hand" })` + hold, NESSUN press.
- **B-P5 → P11:** Dashboard: pan `.imm-track` xPercent -25/-50/-75 (3 tween expo.inOut → whip);
  typing su `.imm-title-new` (in `.imm-title-field`, clickZoom `.imm-zoom-local` parallelo);
  punch su `.imm-publish-btn`; KPI countUp `.imm-kpi-val-0..3`. Nuovi selettori:
  `.imm-page-hero`, `.imm-page-active`, `.imm-replace-btn`, `.imm-img-new`, `.imm-title-old`,
  `.imm-toast`, `.imm-report-btn`. Say 0–5. heightVh 560. Card «Hero homepage» con foto
  `impianto-2026.jpg` + badge «Pubblicata» (speculare per il difetto mock di P6).
- **B-P7 → P6:** pattern flip rotateY `.imm-ag-old`/`.imm-ag-new` conservato identico
  (gsap.set transformPerspective 400 + rotationY -90 righe ~85–90, tween ~143–151).
- **B-P7 → P11:** Gestionale: whip su `.imm-track` (pan xPercent -50 riga ~111); push-in
  `.imm-query` (in `.imm-zoom-local`); rack focus `.imm-ag-drawer` (~288); micro-dutch su
  ultimo `.imm-ag-step`/`.imm-ag-check`; punch flip `.imm-ag-old`/`.imm-ag-new` (~346/348).
  Etichette UI rinominate «Assistente AI» (selettore `.imm-ai-btn` invariato).
- **B-P8 → P11:** Ricarica: nessun tag persistente residuo; `.imm-rc-send` = target punch.
- **B-P9 → P11:** Integrazioni: `.imm-int-wall` = bgTarget rackFocus; `.imm-int-row` ×3 = pan
  carrellata (label "carrellata", ease none); `.imm-int-wa` = tile WhatsApp (usa pressButton:
  se P11 aggiunge punch camera, togliere il press per la regola no-somma); `.imm-int-chat` =
  chat (label "chat"); bolle `.imm-int-msg-1/2/3`, `.imm-int-typing`. ⚠ fine timeline
  DIVERSA tra reduced (chat aperta) e non-reduced (chat richiusa): `cameraReset` in ENTRAMBI
  i rami o prima del branch. Say: solo 0 (veil) e 1 (caption).
- **B-P3 → P11:** Solare: overshoot card su `.vt-card`, timeline position 0.78,
  back.out(1.6); container `.vt-cards-scene`; sezione `section#vetrina`.
- **B-P3 → P12:** frase popup = blocco `.st-say` (const FRASE), slot enter 0.004–0.049 /
  exit 0.13–0.18 → diventa ChapterCard 01 «Siti vetrina» (sottotitolo = FRASE);
  `data-chapter` A MANO su `<section id="vetrina">` in ENTRAMBE le varianti (regia+reduced).
  Altri hook: `.st-cue`, `.st-exit-veil`, `.sc-dot` (ora GSAP-driven), FakeSiteHeader.
  Video rimappato: `seek(progress/0.8)` clampato (VIDEO_END=0.8, ultimo frame fermo dopo).
- **B-P4:** foto in `/assets/products/` (3 Unsplash + 4 Pexels, tutte ≤104KB); selettori
  P11 invariati (`.imm-bar` 380, `.imm-send` 393, `.imm-config-pick` 340).
- **B-P10 → P12:** trama a puntini rimossa da ClosingScene; pattern radial-gradient di
  riferimento per ChapterCard recuperabile da `git show fb182c8:apps/web/components/home/scenes/ClosingScene.tsx`
  (~riga 46): `radial-gradient(color-mix(in oklab, var(--accent) 20%, transparent) 1px, transparent 1.4px)`,
  backgroundSize 22px 22px. Wordmark chiusura = «GM Solar» (grafia brand repo, non «GM SOLAR»).
- **Nota cosmetica aperta:** commento AutoScroll.tsx:332 cita ancora `sc-dot` tra i keyframe
  CSS congelati (ora GSAP-driven) — innocuo, ritocco eventuale in F6.

### Fase 3 (B-P6)

- Ordine scene DEFINITIVO in page.tsx: SolarTwin → Assistente → Dashboard → Segnalazioni →
  Gestionale → Ricarica → Integrazioni → Closing.
- **B-P6 → P11:** Segnalazioni: punch «Segnala un problema» → `.imm-report-wrap` (wrapper
  zoom; il bottone stesso è già scalato da pressButton); rack focus modulo → `.imm-seg-drawer`
  (drawer con xPercent — NON scalarlo) / `.imm-zoom-form` (cluster interno libero per scale);
  lock typing → `.imm-seg-desc`; push-in fix + pull-back → `.imm-seg-card` + `.imm-img-fix`.
  Altri: `.imm-seg-page`, `.imm-seg-send`, `.imm-seg-toast` (flip `.imm-seg-old`/`.imm-seg-new`),
  `.imm-fix-toast`. Scelto DRAWER (no track a 2 schermate). heightVh=480.
- **B-P6 → P12:** Say 0 veil «Qualcosa non va? Lo segnali da dove sei.», 1 «Il link della
  pagina si compila da solo.», 2 «Il team riceve, sistema, e tu vedi il fix.». La scena non
  usa `.imm-track`. Eyebrow passati alle scene ora SFASATI rispetto al nuovo ordine (03/04/05):
  irrilevante (prop non renderizzata), P12 li rimuove e usa CHAPTERS.

### Fase 4 (KIT-11 + S11-*)

- Kit camera in shared.tsx: layer `.imm-camera` tra `.imm-stage` e `.imm-skew` (cursore FUORI);
  helper cameraTo/cameraReset/cameraFollow/cameraWhip/rackFocus/rackFocusOff; blocco
  «CAMERA · REGOLE DI SEQUENZIAMENTO»; clamp scale [1,1.7]; blur opt-in default OFF.
- **PER TUTTI I BUILDER P12: in OGNI scena il primo beat camera parte DOPO say(tl,0)** —
  sostituire `<Say i={0}>`/`say(tl,0)` con ChapterCard/`chapterIntro(tl)` non interseca
  alcun movimento camera (camera neutra durante tutta la title card). Dettaglio:
  Assistente → primo beat camera = push-in `.imm-bar` (beat ③); Dashboard = cameraFollow
  editor (~3.4s, dopo press «Hero homepage»); Segnalazioni = punch `.imm-report-wrap`
  subito dopo say(0); Gestionale = whip al pan beat ② (dopo say(1)); Ricarica = push-in
  typing beat ②; Integrazioni = contro-pan alla label "carrellata" (dopo say(0)).
- Nuovi selettori F4: `.imm-kpi-grid` (Dashboard), `.imm-ag-list` (Gestionale),
  `.imm-behind` (Assistente rack), `.imm-seg-bg` (Segnalazioni rack), `.imm-rc-bg` (Ricarica).
- QA runtime F4: fps medio 59.7 (worst frame 67ms), 0 errori console (normale+reduced),
  camera neutra a fine scene in entrambi i rami, scrub bidirezionale coerente.
- Note minori aperte (per F6): rack focus resta attivo a progress(1) in Assistente/
  Gestionale/Integrazioni (stato finale legittimo da doc kit; se QA reduced lo giudica
  poco leggibile → rackFocusOff nel ramo else); tween "a mano" su .imm-camera in
  Integrazioni (contro-pan, sanzionato dal prompt) e Gestionale (dutch rotation-only).

### Fase 5 (KIT-12 + S12-*)

- Kit capitoli in shared.tsx: `CHAPTERS` (7 voci 01→07 = ordine reale page.tsx),
  `ChapterCard`/`chapterIntro`, prop `chapterIndex` su ImmersiveStage → `data-chapter`
  sul section; prop `eyebrow` RIMOSSA (ondata 2.5). `ChapterHUD.tsx` montato in page.tsx.
- Ogni scena immersiva: prima `<Say i={0}>` veil → `<ChapterCard>` + `chapterIntro(tl)`
  come primo beat; heading statico reduced «NN · Titolo»; `label={CHAPTERS[i].title}` →
  aria-label. Solare: `data-chapter={0}` a mano su entrambe le varianti.
- QA F5: typecheck/build verde; HUD 01→07 visibile + sparisce sulla chiusura; card scure
  a ogni ingresso; reduced-motion heading statici presenti; 0 errori console.
- Fase 5 committata come `dbdc768` (msg «feat(home): migrate immersive scenes…», mergiata
  in main dall'umano); tag `roadmap-fase-5-ok` aggiunto a posteriori.

### Fase 6 (QA finale) + CACCIA BUG (richiesta utente)

- Controllo totale: typecheck ✓ build ✓ lint ✓; grep sweep vecchio racconto = 0;
  anti-regressione zona condivisa (packages/**, layout, globals) = diff VUOTO dal baseline.
  `format:check` rosso ma è **solo CRLF** (Git autocrlf su Windows, repo-wide incl. file
  mai toccati): codice prettier-clean a meno di line-ending → NON corretto (richiederebbe
  di toccare packages/**). Debito ambientale documentato.
- Caccia bug via workflow multi-agente (8 investigatori + verifica avversariale) →
  35 findings confermati (0 blocker, 13 major, 22 minor). Fix applicati e verificati a runtime:
  - **Intro solare** (bug utente #1): ChapterCard solare scorporata dallo scrub → one-shot
    on-mount, velo OPACO (#0b1020), titolo tenuto FERMO ~2.4s PRIMA dello scroll; AutoScroll
    coordinato via evento `presentation:introdone` + failsafe 8s. Sottotitolo aggiornato.
  - **Cursor-drift** (bug utente #2 "cose strane" + sistemico): nuovo helper kit `hideCursor`;
    applicato in Dashboard (follow/punch/reset), Assistente, Gestionale, Ricarica, Segnalazioni
    → il cursore finto sfuma durante i movimenti camera-only e a fine scena.
  - **AutoScroll** (bug utente #3): velocità variabile SPEED 210→300 + `FAST_SPEED` 1150
    nell'ASSIST band (hand-off) + DWELL 550→300 → ~328px/s effettivi (era 210), ~1min51s
    totali (era ~3min), transizioni "assistite" rapide tra i blocchi.
  - Minori: foto dettaglio Assistente wallbox→cavo-01; «Rete Mennekes»→«Rete partner»;
    puntino HUD attivo bg-accent→bg-accent-ink (contrasto); % ricarica inline→inline-block
    (pulsa); rete di sicurezza `.imm-camera` sotto reduced-motion; commenti stale.
- QA runtime finale: fps ~59, 0 errori console (motion+reduced), 7 heading reduced,
  camera neutra sotto reduced.
