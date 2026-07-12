# Roadmap E — Struttura «Siti vetrina / Interfacce moderne» + video hero completo 🔴 Difficile

> **Modello consigliato:** Opus 4.8 (`claude-opus-4-8`) · **Effort:** high (xhigh se rifai il video)
> **Prerequisiti:** eseguire **DOPO A** (condividete `shared.tsx` `CHAPTERS` e `SolarTwinScene.tsx`).
> **Prima di D.** **Non committare.** Repo: `c:\Users\sinog\Desktop\GMSolar` (Windows/PowerShell).

Due richieste: **(2)** separare «Siti vetrina» (scrollytelling forte, col video) da «Interfacce
grafiche moderne» (i componenti UI, **senza video sotto**); **(3)** rendere il video hero «figo e
completo» come quello che l'utente aveva mandato (all-keyframe).

## Contesto minimo

- Home: `apps/web/app/page.tsx` monta le `<section>` figlie di `#top`. Prima scena:
  `SolarTwinScene.tsx` = finto sito con **video hero** scrubbato (`/assets/solar-twin.mp4`,
  all-keyframe) **e** — sul finale, **sopra il video** — le card 3D `SuspendedCards` (import da
  `../vetrina/SuspendedCards`, `.vt-card`, entrano in stagger a progress ~0.78).
- Capitoli: `CHAPTERS` in `shared.tsx` (fonte unica per `ChapterCard`, `ChapterHUD` e
  `data-chapter`). Oggi 7 voci. La scena Solare marca `data-chapter={0}` **a mano** (non passa da
  `ImmersiveStage`); le scene immersive lo ricevono via prop `chapterIndex` di `ImmersiveStage`.
- `ChapterHUD.tsx` disegna una mini-rail con **un puntino per voce di `CHAPTERS`** → si aggiorna da
  sola se cambi `CHAPTERS`, ma **gli indici `data-chapter`/`chapterIndex` di TUTTE le scene vanno
  rinumerati** se aggiungi un capitolo.
- GSAP solo da `@gmgroup/lib/gsap`. Tema chiaro, token, UI italiana, demo solo PC, reduced-motion sempre.

## FILE DI TUA PROPRIETÀ

- `apps/web/app/page.tsx` (nuova sezione + ordine)
- `apps/web/components/home/scenes/SolarTwinScene.tsx` (togli le card 3D dalla scena video)
- **nuovo** `apps/web/components/home/scenes/InterfacceScene.tsx` (la sezione «Interfacce moderne»)
- `apps/web/components/home/immersive/shared.tsx` — **solo** l'array `CHAPTERS` (+1 voce) e i numeri.
- **tutte** le scene immersive — **solo** la prop `chapterIndex`/`data-chapter` da rinumerare
  (`ImmersiveAssistente/Dashboard/Segnalazioni/Gestionale/Ricarica/Integrazioni`): modifica di **una
  riga per file**, la prop numerica. Nient'altro in quei file.
- `apps/web/public/assets/` (video hero, item 3)

---

## Item 2 — Split «Siti vetrina» (video) → «Interfacce grafiche moderne» (componenti, no video)

Oggi le card 3D vivono **dentro** la scena video (le vedi sopra il video sul finale). L'utente
vuole due beat distinti: prima il **video** (scrollytelling forte), **poi** una sezione dedicata
alle **interfacce moderne** con i componenti UI su **sfondo pulito, senza video**.

**Approccio raccomandato — nuovo capitolo dedicato (look premium, l'utente vede due beat netti):**

1. **`CHAPTERS`** in `shared.tsx`: inserisci una **2ª voce** e rinumera. Da 7 → **8** voci:
   ```
   01 Siti vetrina · 02 Interfacce grafiche moderne · 03 Assistente AI · 04 Dashboard ·
   05 Segnalazioni · 06 Gestionali su misura* · 07 App con assistente AI integrato* · 08 Integrazioni
   ```
   _(i titoli 06/07 sono già quelli aggiornati dalla roadmap A — non ritoccarli, solo rinumera `n`)._
2. **`SolarTwinScene.tsx`:** **rimuovi** le `SuspendedCards` e i beat `.vt-card` (lo stagger a 0.78,
   i `gsap.set(".vt-card", …)`, l'import). La scena resta: finto sito + **video hero scrubbato** +
   cue + micro-demo + velo d'uscita. Resta il **capitolo 01 «Siti vetrina»** (`data-chapter={0}`).
   Nella variante reduced-motion togli il blocco `SuspendedCards animated={false}`.
3. **Nuovo `InterfacceScene.tsx`** = capitolo 02, **senza video**:
   - `<section data-chapter={1}>` full-screen su **sfondo chiaro pulito** (`bg-background`, magari un
     alone `bg-accent-soft` tenue). Apre con la `ChapterCard` (chiara, post-roadmap-A): titolo
     **«Interfacce grafiche moderne»**, sottotitolo tipo «Componenti curati, animati, pronti all'uso.»
   - Mostra i **componenti UI fighi**: riusa `SuspendedCards` (`import da "../vetrina/SuspendedCards"`,
     `animated`) su sfondo chiaro, con l'ingresso in stagger delle `.vt-card` pilotato dallo scroll.
     Puoi arricchire con 1–2 altri componenti «vetrina» già presenti nel repo se ci sono; **non**
     inventare nuove primitive. **Nessun `<video>`** in questa scena.
   - Regia scrub semplice (puoi usare `useImmersiveScene` del kit **oppure** un `ScrollTrigger`
     locale come fa `SolarTwinScene`): le card entrano, respirano, restano leggibili. Reduced-motion
     (`progress(1)`/early-return) → griglia piatta `SuspendedCards animated={false}` + heading
     statico «02 · Interfacce grafiche moderne».
   - ⚠ `SuspendedCards` sono «in vetro chiaro» pensate per fondi scuri/video: su **sfondo chiaro**
     verifica il contrasto. Se si perdono, mettile su un pannello scuro morbido (`bg-[#0b1020]` come
     nella variante reduced di SolarTwinScene) **dentro** la sezione chiara, o adatta il loro
     contenitore. Scegli la resa che si legge meglio a 1920×1080 e commentala.
4. **`page.tsx`:** monta `<InterfacceScene />` **subito dopo** `<SolarTwinScene />` e prima di
   `<ImmersiveAssistente />`. Aggiorna il commento di regia.
5. **Rinumera i capitoli** in tutte le scene immersive: `Assistente` diventa capitolo **02→03**
   (`chapterIndex={2}`), `Dashboard` **03→04**, `Segnalazioni`, `Gestionale`, `Ricarica`,
   `Integrazioni` a scalare. **Una prop per file.** Controlla che `data-chapter` combaci con
   l'indice della voce in `CHAPTERS` (0-based) e che l'HUD mostri 8 puntini coerenti.

> **Alternativa lazy (se il tempo stringe):** NON aggiungere un capitolo. Tieni le card dentro la
> scena Solare ma **spostale in un secondo movimento a fondo-schermo chiaro senza video** (il video
> sfuma, entra un pannello chiaro con le card + heading «Interfacce grafiche moderne»), senza
> toccare `CHAPTERS` né gli indici. Meno «premium» ma zero rinumerazione. **Default: la versione con
> capitolo dedicato** (punto 1–5); usa l'alternativa solo se esplicitamente concordato.

**Accettazione item 2:** la scena Solare mostra **solo** il video (niente card 3D sopra); subito
dopo c'è una sezione «Interfacce grafiche moderne» con i componenti UI su **sfondo pulito senza
video**; HUD e title card numerano coerentemente 01→08 (o, in variante lazy, il secondo movimento è
senza video). Reduced-motion leggibile in entrambe.

---

## Item 3 — Video hero «figo e completo» (all-keyframe)

**Situazione accertata (non riscoprirla):**

- `apps/web/public/assets/solar-twin.mp4` (17 MB) è **già** la versione **all-keyframe** di
  `SolarPanelsAnimation.mp4` (2.6 MB, sorgente H.264), **stessa durata ~10 s**. Il re-encode
  all-keyframe è **obbligatorio**: senza, lo `seek` scrubbato lagga (è la ragione dei 17 MB — ogni
  frame è un keyframe).
- **ffmpeg è nel PATH** (v8.1.1).

**⚠ BLOCCO — input mancante dall'utente.** L'utente vuole il video «completo, tipo quello che ti
avevo mandato». Quel video **non è nel repo**: `solar-twin.mp4` è solo il derivato dei 10 s
esistenti. **Serve la sorgente giusta.** Due strade:

- **(a)** L'utente fornisce il nuovo video (o conferma quale sorgente usare). Mettilo in
  `apps/web/public/assets/` come `solar-source.mp4`.
- **(b)** Se «completo» significa semplicemente «la clip intera senza tagli», verifica con l'utente
  se `SolarPanelsAnimation.mp4` è già la sorgente piena (e allora il problema è solo di **regia**:
  il video oggi esaurisce la corsa a `VIDEO_END = 0.8` della timeline — vedi sotto).

**Quando hai la sorgente, re-encode ALL-KEYFRAME** (ogni frame keyframe → seek istantaneo):

```powershell
ffmpeg -i "apps\web\public\assets\solar-source.mp4" -an `
  -c:v libx264 -preset slow -crf 20 -pix_fmt yuv420p `
  -x264-params "keyint=1:min-keyint=1:scenecut=0" `
  -movflags +faststart "apps\web\public\assets\solar-twin.mp4"
```

(`keyint=1` = tutti keyframe; `-an` = niente audio; regola `-crf` per qualità/peso; il nome resta
`solar-twin.mp4` così `SolarTwinScene`/`InterfacceScene` non cambiano path). **Rigenera anche il
poster** se la prima frame cambia:

```powershell
ffmpeg -i "apps\web\public\assets\solar-twin.mp4" -frames:v 1 -q:v 2 `
  "apps\web\public\assets\solar-twin-poster.webp"
```

**Regia del video** (`SolarTwinScene.tsx`): oggi `VIDEO_END = 0.8` (il video finisce a progress 0.8
perché l'ultimo tratto serviva alle card 3D). Dopo l'item 2 **le card non sono più qui** → puoi
**alzare `VIDEO_END` verso ~1.0** così il video usa **tutta** la corsa di scroll e si vede
«completo». Tara il valore guardando che lo scrub resti fluido fino in fondo.

**Verifica del video** SOLO con **Chrome di sistema** (`C:\Program Files\Google\Chrome\Application\chrome.exe`);
il Chromium bundled non decodifica H.264 e mostrerebbe nero (falso negativo). Controlla che lo
`seek` avanti/indietro sia **istantaneo** (se lagga, il re-encode non è all-keyframe: rifallo).

**Accettazione item 3:** il video hero è la clip completa desiderata, re-encodata all-keyframe (seek
istantaneo), poster coerente, e usa (quasi) tutta la corsa di scroll della scena. **Se la sorgente
non è disponibile, lascia l'item 3 in stato «BLOCCATO — serve il video dall'utente» e consegna
comunque l'item 2**: non inventare/generare un video.

---

## Chiusura roadmap E

- Se giri in autonomia esegui `pnpm typecheck` + `pnpm build` (verdi) + verifica visiva a 1920×1080;
  altrimenti lascia i comandi pesanti al controllo di fase.
- Riepiloga: nuova `InterfacceScene`, ordine `page.tsx`, `CHAPTERS` a 8 voci + mappa degli indici
  rinumerati, stato item 3 (fatto / BLOCCATO-serve-video), valore finale di `VIDEO_END`.
- Commit suggerito: `migliorie2(E): split Siti vetrina / Interfacce moderne (no video) + video hero completo all-keyframe`
