# Prompt operativi — migliorie home GM Solar

12 prompt indipendenti e auto-contenuti, da incollare uno per chat/agente.

**Ordine di esecuzione consigliato** (committare tra un prompt e l'altro):

1. P1 Remover (drone + cavo EV) → 2. P2 Pausa globale → 3. P3 Scena Solare → 4. P4 Assistente foto →
5. P5 Dashboard → 6. P6 Segnalazioni (**richiede P5**) → 7. P7 Gestionale → 8. P8 Ricarica → 9. P9 Integrazioni → 10. P10 Chiusura → 11. P11 Camera cinematografica → 12. P12 Capitoli.

P4, P7, P8, P9, P10 sono indipendenti tra loro. P6 va dopo P5. P3 va dopo P1. **P11 e P12 vanno eseguiti per ultimi e in sequenza (non in parallelo: entrambi toccano `shared.tsx` e tutte le scene), dopo P3–P10.**

---

## P1 — REMOVER: eliminare il video drone e il video cavo EV

```text
Sei un agente "Remover": devi ELIMINARE due scene video dalla home scrollytelling, senza lasciare codice o asset orfani.

CONTESTO E VINCOLI
- Monorepo pnpm+turbo; app Next.js 16 App Router in `apps/web`, TypeScript strict, Tailwind v4 (token in `packages/tokens/tokens.css`).
- GSAP/ScrollTrigger si importano SOLO da `@gmgroup/lib/gsap`; Lenis è già attivo a layout.
- Home = presentazione scrollytelling chromeless composta in `apps/web/app/page.tsx`; scene in `apps/web/components/home/`.
- NON toccare la zona condivisa: `packages/**`, `apps/web/app/layout.tsx`, `apps/web/app/globals.css`.
- Demo solo PC desktop; rispetta sempre `prefers-reduced-motion`.

STATO ATTUALE
- `apps/web/app/page.tsx` monta in ordine: IntroOverlay, AutoScroll, CinematicGrain, VelocitySkew, VetrinaScene, SolarTwinScene, ImmersiveAssistente, ImmersiveDashboard, ImmersiveGestionale, ImmersiveSegnalazioni, EvCableScene, ImmersiveRicarica, ImmersiveIntegrazioni, ClosingScene.
- `apps/web/components/home/scenes/VetrinaScene.tsx` = intro azienda con VIDEO DRONE in autoplay libero (`scrub={false}`, src `/assets/gm-solar-drone.mp4`, poster `/assets/gm-solar-drone-poster.webp`) + 5 callout con dati azienda. DA ELIMINARE, comprese tutte le scritte.
- `apps/web/components/home/scenes/EvCableScene.tsx` = VIDEO CAVO EV scrubbato (src `/assets/ev-cable.mp4`, poster `/assets/ev-cable-poster.webp`) + 6 callout. DA ELIMINARE.
- `apps/web/components/home/scenes/VideoScrubScene.tsx` = motore generico con due modalità: `scrub` (default) e `free` (`scrub={false}`, usata SOLO dal drone: ref `freeVideoRef`, useEffect con IntersectionObserver play/pause, ramo `<video>` autoplay-loop).

ISTRUZIONI
1. In `page.tsx`: rimuovi import e JSX di `VetrinaScene` e `EvCableScene`; aggiorna il commento di regia in testa al file (la presentazione ora apre DIRETTAMENTE sulla scena solare; non esiste più lo "stacco EV").
2. Elimina i file `VetrinaScene.tsx` e `EvCableScene.tsx`.
3. In `VideoScrubScene.tsx` elimina la modalità free: prop `scrub`, `freeVideoRef`, l'useEffect free (IO play/pause), il ramo `<video>` non-scrub e i riferimenti al drone nei commenti. Resta solo il ramo `ScrubVideo`.
4. Cerca `#vetrina` in `apps/web/**`: se qualcosa linka `/#vetrina`, sposta `id="vetrina"` sulla config di `SolarTwinScene`; se nessun riferimento, non aggiungere nulla.
5. Aggiorna il commento descrittivo di `SolarTwinScene.tsx` (non è più "subito dopo l'intro drone": è la PRIMA scena della home). `exitToLight` resta true (la scena successiva, Assistente, è chiara).
6. Elimina gli asset orfani in `apps/web/public/assets/`: `gm-solar-drone.mp4`, `gm-solar-drone-poster.webp`, `ev-cable.mp4`, `ev-cable-poster.webp`. Prima di cancellare, grep di ogni filename in `apps/web/**` per confermare zero riferimenti residui. NON toccare gli eventuali sorgenti originali (`SolarPanelsAnimation.mp4`, `CavoAnimation.mp4`).
7. `AutoScroll.tsx` calcola gli anchor dinamicamente dai `<section>` figli di `#top`: nessuna modifica necessaria; lascia la sosta iniziale legata a IntroOverlay (il fade dal nero RESTA).

ACCETTAZIONE
- La home apre con il fade dal nero direttamente sul video solare; nessun drone, nessun cavo EV.
- `rg "gm-solar-drone|ev-cable|EvCableScene|VetrinaScene|scrub=\{false\}" apps/web` → zero risultati.
- `pnpm typecheck` e `pnpm build` passano. Al termine riepiloga i file toccati. NON committare.
```

---

## P2 — Pausa globale: il click ferma ANCHE video e animazioni autonome

```text
Devi fare in modo che la pausa della presentazione (click del mouse) congeli TUTTO, non solo l'auto-scroll.

CONTESTO E VINCOLI
- App Next.js 16 in `apps/web`; home scrollytelling in `apps/web/app/page.tsx` (root `<div id="top">`), scene in `apps/web/components/home/`.
- GSAP SOLO da `@gmgroup/lib/gsap`. NON toccare `packages/**`, `apps/web/app/layout.tsx`, `apps/web/app/globals.css` (zona condivisa: gli stili nuovi vanno in `<style>` scoped nei componenti home).
- Demo solo PC; rispetta `prefers-reduced-motion`.

STATO ATTUALE
- `apps/web/components/home/AutoScroll.tsx`: un click in qualsiasi punto (escluso `a, button, [data-no-pause]`) chiama `togglePause()` (~righe 207–228), che ferma SOLO l'auto-scroll (`lockedRef`/`setPaused`) e mostra l'overlay "Premi di nuovo per riprendere".
- Durante la pausa continuano a muoversi: i keyframe CSS (`animate-pulse`, `animate-bounce` dei typing-dots, `sc-dot`/`sc-arrow` di `ScrollCue.tsx`, l'auto-float di `vetrina/SuspendedCards.tsx`), i tween GSAP infiniti (float delle tile in `ImmersiveIntegrazioni.tsx`, `gsap.to(tile, { y:"-=8", repeat:-1, yoyo:true })` ~righe 180–191) e qualsiasi `<video>` in riproduzione libera. I video SCRUBBATI (`ScrubVideo`) seguono solo lo scroll → in pausa si fermano da soli, non toccarli.

ISTRUZIONI
1. In `togglePause()` di AutoScroll: oltre allo stato attuale, (a) aggiungi/rimuovi l'attributo `data-presentation-paused` su `document.documentElement`; (b) emetti `window.dispatchEvent(new CustomEvent("presentation:pausechange", { detail: { paused } }))`. Assicurati che entrambi vengano ripuliti anche nel cleanup dell'effect.
2. Sempre in AutoScroll aggiungi un `<style>` scoped:
   `html[data-presentation-paused] #top *, html[data-presentation-paused] #top *::before, html[data-presentation-paused] #top *::after { animation-play-state: paused !important; }`
   → congela tutti i keyframe CSS della home senza toccare globals condivisi.
3. In `ImmersiveIntegrazioni.tsx`: raccogli i tween float infiniti in un array; aggiungi un listener a `presentation:pausechange` che fa `pause()`/`resume()` su ognuno; rimuovi il listener nel cleanup del gsap.context. Se trovi ALTRI tween `repeat:-1` fuori dalle timeline scrubbate in `components/home/**`, applica lo stesso pattern.
4. Se in home esiste ancora un `<video>` in riproduzione libera (non scrubbata), mettilo in `pause()` sull'evento e riprendi al resume.
5. Reduced-motion: AutoScroll ritorna `null` → l'attributo non viene mai impostato; verifica che nulla si rompa.

ACCETTAZIONE
- Click su area vuota → overlay pausa E: dot del cue "Scorri" fermo, typing-dots fermi, tile Integrazioni ferme, eventuali video fermi. Secondo click → tutto riparte dallo stato in cui era.
- `pnpm typecheck` e `pnpm build` passano. Riepiloga i file toccati. NON committare.
```

---

## P3 — Scena SOLARE: finto sito con header, frase popup, cue coordinato, card 3D finali

```text
Devi RISCRIVERE la prima scena della home (fotovoltaico) come "anteprima di un sito vetrina premium": un finto sito con header, il video scrubbato come hero, una frase popup d'apertura, un cue di scroll grande e coordinato col video, e card 3D di interfaccia sul finale. PREREQUISITO: il prompt "Remover" è già stato eseguito (drone e cavo EV eliminati; la scena solare è la prima della home).

CONTESTO E VINCOLI
- App Next.js 16 in `apps/web`; TypeScript strict; Tailwind v4 con utility token (`bg-accent`, `text-accent-ink`, `bg-accent-soft`, `text-accent-contrast`, `bg-surface`, `border-border`, `text-muted`...).
- GSAP/ScrollTrigger SOLO da `@gmgroup/lib/gsap`; helper `useReducedMotion`/`useIsoLayoutEffect` da `@gmgroup/lib/motion`.
- NON toccare `packages/**`, `apps/web/app/layout.tsx`, `apps/web/app/globals.css`. Demo solo PC desktop (Chrome), tema chiaro, UI in italiano.
- Rispetta SEMPRE prefers-reduced-motion: variante statica leggibile.
- Il video di scrub DEVE restare `/assets/solar-twin.mp4` (già ri-encodato all-keyframe; il seek è istantaneo SOLO con questi derivati) con poster `/assets/solar-twin-poster.webp`.

STATO ATTUALE
- `apps/web/components/home/scenes/SolarTwinScene.tsx` è una config del motore `VideoScrubScene.tsx`: video full-bleed scuro con scrim, eyebrow+titolo+lede, 6 callout tecnici (kWp, moduli, inverter...), cue "Scorri" centrato in basso (`ScrollCue.tsx`, mousino piccolo h-9 w-[22px]), barra di progresso, velo chiaro d'uscita (`exitToLight`).
- `apps/web/components/home/ScrubVideo.tsx` espone `ref.seek(progress 0→1)` con lerp interno; richiede video all-keyframe.
- `apps/web/components/home/vetrina/SuspendedCards.tsx` = card "premium" già pronte (vetro chiaro, stat+sparkline, bar-chart, ring performance, anteprima sito) con pose 3D via CSS custom prop `--pose` e auto-float; prop `animated: boolean`; le card hanno classe `.vt-card` pensata per entrare in stagger via GSAP.
- Le scene immersive (`components/home/immersive/shared.tsx`) hanno il pattern `Say`/`say()`: frase "veil" grande centrata su velo sfocato full-screen che entra teatrale (expo.out, scale 1.08→1) e sfuma. Replica QUESTO stile per la frase popup (la scena solare non usa ImmersiveStage: puoi replicare il markup/tween nella scena invece di importare il kit).

OBIETTIVO — nuova regia (riscrivi `SolarTwinScene.tsx` come scena autonoma; se dopo la riscrittura `VideoScrubScene.tsx` non ha più consumatori, eliminalo — grep prima):
1. STRUTTURA: `<section>` alto ~320svh con viewport sticky (`sticky top-0 h-svh overflow-hidden`), come oggi. Dentro il viewport: un FINTO SITO che occupa tutto lo schermo:
   - Header di sito vetrina (barra ~h-14, `bg-background/90 backdrop-blur border-b border-border`): logo (quadratino `bg-accent h-4 w-4 rounded-[5px]` + wordmark "GM Solar" font-display bold), nav mock a destra («Impianti», «Accumulo», «Ricarica», «Contatti») e CTA «Richiedi preventivo» (`bg-accent text-accent-contrast rounded-full`). Tutto decorativo (aria-hidden sui link, nessun href).
   - Sotto l'header, il VIDEO SCRUB full-bleed come hero del sito (`ScrubVideo` + scrim leggero per contrasto). L'insieme deve leggersi come "questo è il sito del cliente, con hero video narrativo".
2. NIENTE TESTI DI SCENA: elimina eyebrow, titolo, lede e TUTTI i callout tecnici. Le uniche parole sono la frase popup (punto 3) e l'header finto.
3. FRASE POPUP D'APERTURA (stile veil immersive): appena la scena è visibile (dopo il fade di IntroOverlay), frase grande centrata su velo sfocato: «Creiamo siti web moderni con una forte narrativa di scrollytelling video.» Entra teatrale (autoAlpha 0→1, scale 1.08→1, y 26→0, expo.out) legata ai primissimi px della timeline scrubbata, resta leggibile per un beat, poi sfuma (back.in) lasciando il sito pulito. Stessa identica estetica delle frasi delle scene successive (`bg-background/85 backdrop-blur-sm`, testo `font-display text-3xl sm:text-5xl font-bold`).
4. CUE "SCORRI" GRANDE E COORDINATO: sostituisci il cue centrato con una versione più grande (~1.5×: mousino ~h-14 w-8, label text-sm, freccia 24px) posizionata in basso a SINISTRA (`left-[6vw] bottom-8`). Al mount (utente non ha ancora scrollato) parte una MICRO-DEMO in loop, indipendente dallo scroll: un tween GSAP yoyo (repeat:-1) porta un proxy progress 0→0.06→0 (~2.5s a ciclo, sine.inOut) e a ogni update chiama `videoRef.current.seek(proxy.p)`, MENTRE il dot dentro il mousino scende e risale in sync (stessa durata/ease) → si vede che il video va AVANTI E INDIETRO col movimento del mouse. La demo si UCCIDE definitivamente (kill del tween + il seek torna solo allo ScrollTrigger) al primo scroll reale (onUpdate dello ScrollTrigger con progress > 0.01, oppure primo evento wheel/touchstart). Il cue sfuma appena parte lo scroll, come oggi.
5. FINALE — CARD 3D: tra progress ~0.78 e ~0.95 della timeline, sopra l'ultimo tratto del video entrano le card premium: riusa `SuspendedCards` (import da `../vetrina/SuspendedCards`) in versione `animated={true}`, facendo entrare le `.vt-card` in stagger (autoAlpha 0→1, y 30→0, scale 0.92→1, back.out(1.6), stagger 0.12). Il video sotto resta fermo sull'ultimo frame. Le card NON devono coprire l'header.
6. Mantieni: barra di progresso accent in basso (scaleX = progress) e velo chiaro d'uscita sul finale (la scena successiva, Assistente, è chiara).
7. REDUCED-MOTION: nessuno sticky/scrub/demo: header finto + poster statico + frase come testo statico sotto + `SuspendedCards animated={false}` (griglia piatta). Tutto leggibile impilato.

ACCETTAZIONE
- Sequenza allo scroll: nero → fade → sito finto con hero video + frase popup → frase sfuma → scrub avanti/indietro fluido → card 3D sul finale → velo chiaro → Assistente.
- La micro-demo del cue muove visibilmente il video avanti e indietro e muore al primo scroll.
- Zero callout/testi tecnici residui. `pnpm typecheck` e `pnpm build` passano. Verifica visiva con `pnpm dev` a 1920×1080. Riepiloga i file toccati. NON committare.
```

---

## P4 — Assistente AI: foto prodotto reali al posto delle icone SVG

```text
Nella scena immersiva "Assistente AI" le card prodotto usano icone SVG astratte: non si capisce che sono prodotti. Sostituiscile con FOTO placeholder reali.

CONTESTO E VINCOLI
- App Next.js 16 in `apps/web`. Demo mock: le foto sono placeholder royalty-free (Unsplash o equivalente), nessun brand reale in evidenza.
- NON toccare `packages/**` né i file condivisi di layout. UI italiana, tema chiaro.

STATO ATTUALE — `apps/web/components/home/immersive/ImmersiveAssistente.tsx`
- Griglia 6 card prodotto "Cavi di ricarica" (~righe 181–221): area visiva = gradient `CARD_WASH[i%3]` + `<CableIcon variant={i}>` (SVG cavo+connettore, ~righe 432–463).
- Vista generata dall'AI (~righe 277–302): colonna visiva = `<ProductArtwork>` (SVG wallbox, ~righe 467–514) + 4 thumbnail `<MiniArt>` (~righe 518–554).

ISTRUZIONI
1. Procura 7 foto placeholder a tema ricarica EV (cavo di ricarica, connettore Type 2, wallbox a muro, auto in carica): scaricale da Unsplash (URL `images.unsplash.com/...?w=800&q=75&fm=jpg`) e salvale LOCALMENTE in `apps/web/public/assets/products/` come `cavo-01.jpg` … `cavo-06.jpg` e `wallbox-detail.jpg`. Pesi ≤150 KB l'una (ridimensiona/ricomprimi se serve). Niente hotlink remoto in produzione.
2. Card griglia: sostituisci il blocco CARD_WASH+CableIcon con `<img src={`/assets/products/cavo-0${i+1}.jpg`} alt="" loading="lazy" decoding="async" className="h-24 w-full object-cover" />`. Mantieni il badge «Best seller» in overlay (`absolute top-2 left-2`, quindi il contenitore resta `relative overflow-hidden`).
3. Vista generata: sostituisci `ProductArtwork` con `wallbox-detail.jpg` (`object-cover`, angoli arrotondati come l'attuale contenitore, riempi tutta la colonna visiva). Le 4 thumbnail `MiniArt` → 4 `<img>` con foto già usate nelle card (crop quadrato `object-cover`), mantenendo l'anello accent sulla thumbnail attiva (indice 0).
4. Rimuovi il codice morto: `CARD_WASH`, `CableIcon`, `CABLE_VARIANTS`, `ProductArtwork`, `MiniArt` (grep per conferma che nessun altro file li importi).
5. Le immagini sono decorative nella demo: `alt=""` e `aria-hidden` dove il contenitore non è già nascosto.

ACCETTAZIONE
- Card e vista generata mostrano foto riconoscibili di prodotti di ricarica; layout e animazioni (stagger di uscita griglia, maskReveal della vista generata) invariati.
- Nessun riferimento residuo ai componenti SVG rimossi. `pnpm typecheck` e `pnpm build` passano. Riepiloga i file toccati. NON committare.
```

---

## P5 — Dashboard: layout da vera dashboard + modifica di contenuti esistenti + bottone «Segnala un problema»

```text
Devi ridisegnare la scena immersiva DASHBOARD: layout denso da vero admin panel, un beat "contenuti" che MODIFICA contenuti già esistenti del sito (non un form vuoto), e un bottone «Segnala un problema» visibile fin da subito (servirà alla scena Segnalazioni).

CONTESTO E VINCOLI
- App Next.js 16 in `apps/web`; GSAP SOLO da `@gmgroup/lib/gsap`; kit scene immersive in `apps/web/components/home/immersive/shared.tsx` (helper: `useImmersiveScene`, `Say`/`say`, `cursorTo`, `clickZoom`, `pressButton`, `typeInField`, `drawPath`, `countUp`, `maskReveal`; la timeline è scrubbata dallo scroll e sotto reduced-motion va a `progress(1)` → OGNI beat deve avere stato finale leggibile).
- Tema chiaro, token (`bg-surface`, `border-border`, `text-muted`, `bg-accent`, `text-accent-ink`...). UI italiana, dati mock deterministici. Demo solo PC. NON toccare `packages/**`.

STATO ATTUALE — `apps/web/components/home/immersive/ImmersiveDashboard.tsx`
- Sidebar 4 voci (Contenuti/Prodotti/Visite/Ordini) + topbar "3 siti connessi" + track orizzontale 4 pannelli (width 400%, pan via `xPercent`).
- Beat ① "Contenuti": editor VUOTO — area upload tratteggiata che si riempie con un finto file + typing del titolo in un campo vuoto. PROBLEMA: non racconta il sito reale.
- PROBLEMA LAYOUT: ogni pannello è un solo blocco largo (p-6, card a tutta larghezza) → componenti troppo larghi, non sembra una dashboard vera.
- Nota: nel catalogo c'è «Cavo Type-C 5m» — errore di dominio (per EV è Type 2).

ISTRUZIONI
1. BEAT ① "Contenuti" — modifica di contenuto ESISTENTE:
   - Layout a 2 colonne: a sinistra una lista «Pagine del sito» con 3 voci già popolate («Hero homepage», «Chi siamo», «Impianti realizzati») ciascuna con mini-anteprima e badge «Pubblicata»; a destra l'editor della voce selezionata «Hero homepage», GIÀ COMPILATO: immagine esistente (riusa lo stile gradient attuale come "foto attuale" oppure una foto placeholder) + titolo esistente «Energia solare per la tua casa».
   - Regia: il cursore clicca la voce «Hero homepage» (pressButton) → punch-zoom dell'editor → il cursore clicca «Sostituisci immagine» e l'immagine attuale viene COPERTA dalla nuova con un wipe (maskReveal) + filename «impianto-2026.jpg» → il cursore va sul titolo e lo RISCRIVE (typeInField) in «Energia solare per la tua azienda» → click su «Pubblica» → toast «Modifiche pubblicate ✓». Frase caption: «Modifichi i contenuti del sito: online subito.»
2. LAYOUT DA VERA DASHBOARD (tutti e 4 i pannelli):
   - Ogni pannello: contenuto in `max-w-5xl`, padding p-4/p-5, griglie dense multi-colonna. Niente card singole a tutta larghezza.
   - Pannello Visite: riga di 4 KPI compatti (aggiungi un KPI, es. «Tempo medio 2:41») + sotto DUE colonne affiancate (sparkline | barre giornaliere).
   - Pannello Ordini: tabella con colonne in più (Data, Canale) e righe più compatte (py-2), footer totale invariato.
   - Pannello Prodotti: griglia 3 colonne, card più piccole. Correggi «Cavo Type-C 5m» → «Cavo Type 2 · 5 m».
   - I contenuti mock devono sembrare il prodotto finale GM Solar (fotovoltaico + ricarica EV), coerenti tra loro.
3. BOTTONE «SEGNALA UN PROBLEMA»: in topbar a destra, VISIBILE FIN DALL'INIZIO (nessuna animazione di comparsa), stile `bg-accent-soft text-accent-ink rounded-full px-3 py-1 text-xs font-semibold` con icona `MessageSquareWarning` (lucide-react) e classe `imm-report-btn`. A FINE timeline della scena il cursore si POSIZIONA sopra di esso (cursorTo, mode "hand") SENZA premerlo: è l'aggancio narrativo alla scena Segnalazioni successiva.
4. Aggiorna le frasi Say per coerenza col nuovo racconto (prima frase veil invariata o simile; caption descrittive, non commerciali).
5. Reduced-motion: `progress(1)` deve mostrare: editor con foto nuova e titolo nuovo, KPI a valore pieno, tabella completa. Il binario resta carosello `overflow-x-auto` come oggi.

ACCETTAZIONE
- La dashboard sembra un vero admin panel denso; il beat contenuti modifica visibilmente un contenuto esistente del sito e lo pubblica; il bottone «Segnala un problema» è presente dal primo frame e il cursore ci finisce sopra a fine scena.
- `pnpm typecheck` e `pnpm build` passano. Verifica con `pnpm dev` a 1920×1080. Riepiloga i file toccati. NON committare.
```

---

## P6 — Segnalazioni: subito dopo la Dashboard, link auto-rilevato, fix mostrato

```text
Devi spostare la scena SEGNALAZIONI subito dopo la Dashboard e riscriverne la regia: si parte dal bottone «Segnala un problema» della dashboard, il link della pagina è rilevato IN AUTOMATICO (il cliente non copia nulla), e alla fine si vede il FIX avvenuto. PREREQUISITO: il prompt "Dashboard" è già stato eseguito (esiste il bottone `imm-report-btn` in topbar).

CONTESTO E VINCOLI
- App Next.js 16 in `apps/web`; kit immersive in `apps/web/components/home/immersive/shared.tsx` (`useImmersiveScene`, `Say`/`say`, `cursorTo`, `clickZoom`, `pressButton`, `typeInField`, `maskReveal`; reduced-motion → `tl.progress(1)`: stato finale leggibile).
- Tema chiaro, token, UI italiana, mock deterministici, demo solo PC. NON toccare `packages/**`.

STATO ATTUALE
- `apps/web/app/page.tsx`: ordine attuale ...ImmersiveDashboard → ImmersiveGestionale → ImmersiveSegnalazioni...
- `apps/web/components/home/immersive/ImmersiveSegnalazioni.tsx`: Schermata A = gestionale «Anagrafica clienti» con bottone «Copia link» e toolbar «Esporta/Filtra/Stampa»; pan → Schermata B = modulo dove il cursore INCOLLA il link a mano; ritorno alla A dove APPARE un 4° bottone verde «Invia per email» (`.imm-new-btn`, bg-accent) con anello e toast «Email inviata». DA BUTTARE: il flusso copia/incolla, l'anagrafica clienti e il bottone verde che spunta nel vuoto.

ISTRUZIONI
1. `page.tsx`: sposta `<ImmersiveSegnalazioni />` SUBITO DOPO `<ImmersiveDashboard />`. Nuovo ordine servizi: Assistente → Dashboard → Segnalazioni → Gestionale → Ricarica → Integrazioni. Aggiorna i commenti di regia.
2. Riscrivi la scena (stessa meccanica ImmersiveStage + track a 2 schermate o drawer, a tua scelta la più pulita):
   - SCHERMATA A = la STESSA dashboard della scena precedente in versione compatta (topbar con il bottone «Segnala un problema» `imm-report-btn`, stesso stile: `bg-accent-soft text-accent-ink` + icona MessageSquareWarning) con un DIFETTO visibile mock: nella card «Hero homepage» l'immagine è rotta (riquadro grigio con icona immagine spezzata + badge rosso «Immagine non trovata»).
   - Beat ① — Say veil: «Qualcosa non va? Lo segnali da dove sei.» Poi il cursore (hand) preme «Segnala un problema» (pressButton + clickZoom).
   - Beat ② — si apre il MODULO DI SEGNALAZIONE: campo «Pagina» GIÀ COMPILATO: `gmsolar.it/dashboard/contenuti` in font-mono + badge accanto «Rilevata in automatico ✓» (bg-accent-soft). NESSUN copia/incolla: elimina il beat «Copia link» e il toast «Link pagina copiato». Il cursore (caret) digita SOLO la descrizione (typeInField): «L'immagine della hero non si carica» → preme «Invia segnalazione» → toast «Segnalazione ricevuta ✓ · In lavorazione». Caption: «Il link della pagina si compila da solo.»
   - Beat ③ — IL FIX: ritorno alla dashboard: badge stato della segnalazione flippa «In lavorazione» → «Risolta ✓» (riusa il pattern flip rotateY di ImmersiveGestionale `.imm-ag-old`/`.imm-ag-new`), l'immagine rotta viene SOSTITUITA dalla foto corretta con un wipe (maskReveal) e compare un mini-toast «Fix pubblicato ✓». Caption finale: «Il team riceve, sistema, e tu vedi il fix.»
3. ELIMINA dal file: schermata «Anagrafica clienti», toolbar Esporta/Filtra/Stampa, `.imm-new-btn`, `.imm-new-btn-ring`, `.imm-email-toast` e ogni riferimento (il "bottone verde nel vuoto" non deve più esistere).
4. Reduced-motion (`progress(1)`): modulo inviato + difetto RISOLTO visibile (immagine ok, badge «Risolta ✓»).

ACCETTAZIONE
- Ordine scene aggiornato; la segnalazione parte dal bottone della dashboard; il campo pagina è precompilato con badge "rilevata in automatico"; il fix finale è mostrato visivamente.
- `rg "Copia link|Anagrafica clienti|Invia per email|imm-new-btn" apps/web/components/home` → zero risultati.
- `pnpm typecheck` e `pnpm build` passano. Riepiloga i file toccati. NON committare.
```

---

## P7 — Gestionale: colonnine di ricarica, niente «Evaso», niente dati economici

```text
Devi convertire la scena immersiva GESTIONALE da "ordini/clienti con importi in €" a GESTIONALE DELLE COLONNINE DI RICARICA con assistente AI integrato. Nessun dato economico.

CONTESTO E VINCOLI
- App Next.js 16 in `apps/web`; kit immersive in `apps/web/components/home/immersive/shared.tsx` (reduced-motion → `tl.progress(1)`: stato finale leggibile). Tema chiaro, token, UI italiana, mock deterministici, demo solo PC. NON toccare `packages/**`.

STATO ATTUALE — `apps/web/components/home/immersive/ImmersiveGestionale.tsx`
- Sidebar: Panoramica / Ordini / Preventivi / Magazzino. KPI: «23 Ordini aperti», «1,2 M€ Pipeline», «148 Clienti». Tabella ORDINI con importi €; query NL «ordini aperti sopra 50.000 €»; drawer Agente AI che «evade» 2 ordini (flip «Aperto» → «Evaso ✓») e decrementa il KPI 23→21.
- La MECCANICA (nav, pan, typeInField, filtro maskReveal, drawer, flip rotateY, proxy KPI) è buona: cambia SOLO il dominio dei contenuti.

ISTRUZIONI
1. Sidebar → «Panoramica», «Colonnine», «Sessioni», «Manutenzione» (la demo visita le prime due; le altre restano di catalogo).
2. KPI Panoramica (NIENTE €): «46 Colonnine attive», «128 Sessioni oggi», «97% Disponibilità». Grafico a barre = «Sessioni per giorno» (7 barre come ora).
3. Tabella (pannello «Colonnine»): colonne Colonnina / Potenza / Stato. 5 righe mock, es.: «COL-012 · Torino Nord | 150 kW | Offline», «COL-007 · Milano Est | 22 kW | Online», «COL-019 · Asti Centro | 22 kW | Offline», «COL-003 · Cuneo Sud | 50 kW | Online», «COL-015 · Alba | 22 kW | In manutenzione». Le 2 «Offline» sono i match (`m: true`).
4. Query NL: il cursore digita «colonnine offline» → le righe non-match sfumano, le 2 offline si evidenziano a wipe, badge «2 risultati».
5. Agente AI (drawer invariato come meccanica): richiesta «riavvia le colonnine offline»; step: «Leggo le 2 colonnine offline…», «Invio il comando di riavvio…», «Verifico lo stato…», «Fatto»; mini-lista con le 2 colonnine che flippano «Offline» → «Online ✓»; KPI footer del drawer: «Colonnine offline» con proxy 2 → 0.
6. Frasi Say: 0 (veil) «Tutte le colonnine, in un unico gestionale.»; 1 (caption) «Scrivi in italiano: i dati si filtrano da soli.»; 2 (caption) «E l'assistente AI risolve per te.»
7. Aggiorna label/eyebrow di ImmersiveStage («Gestionale colonnine») e il commento descrittivo del file. Elimina OGNI occorrenza di €, «Evaso», «ordini», «Pipeline», «Preventivi» (sostituita), nomi clienti.
8. Reduced-motion (`progress(1)`): drawer aperto, colonnine Online, KPI a 0 — tutto leggibile.

ACCETTAZIONE
- La scena parla solo di colonnine (stati, potenze, sessioni); zero valori economici; l'agente AI riavvia le colonnine offline con effetto visibile sui dati.
- `rg "Evaso|Pipeline|€" apps/web/components/home/immersive/ImmersiveGestionale.tsx` → zero risultati.
- `pnpm typecheck` e `pnpm build` passano. Riepiloga i file toccati. NON committare.
```

---

## P8 — App ricarica: «un'app con assistente AI integrato», via il badge GM Charge

```text
Due modifiche puntuali alla scena immersiva RICARICA EV.

CONTESTO E VINCOLI
- App Next.js 16 in `apps/web`. NON toccare `packages/**`. UI italiana.

STATO ATTUALE — `apps/web/components/home/immersive/ImmersiveRicarica.tsx`
- C'è un tag persistente in alto a sinistra «Web app · GM Charge» (blocco `.imm-webapp-tag`, ~righe 281–288) con relativo `gsap.set(".imm-webapp-tag", { autoAlpha: 0, y: -8 })` (~riga 103) e tween di entrata dopo la prima frase (~righe 108–109).
- La prima frase (Say 0) è «Un assistente di ricarica dentro l'app.»; eyebrow/label dello stage: «06 · App ricarica EV con AI» / «Ricarica».

ISTRUZIONI
1. RIMUOVI completamente il badge: blocco JSX `.imm-webapp-tag`, il `gsap.set` e il tween di entrata, e ogni riferimento nei commenti.
2. La scena si presenta come "un'app con assistente AI integrato": cambia Say 0 in «Un'app con assistente AI integrato.»; aggiorna l'eyebrow in «06 · App con assistente AI integrato» e il commento descrittivo in testa al file. Le altre frasi e la regia restano invariate.

ACCETTAZIONE
- Nessun riferimento a «GM Charge» o `.imm-webapp-tag` nel repo (`rg "GM Charge|imm-webapp-tag" apps/web`).
- `pnpm typecheck` e `pnpm build` passano. Riepiloga i file toccati. NON committare.
```

---

## P9 — Integrazioni: via la ricerca, carrellata di loghi + esempio WhatsApp

```text
Devi riscrivere la regia della scena immersiva INTEGRAZIONI: niente barra di ricerca, l'animazione si incentra sul MOVIMENTO dei loghi ("carrellata") e culmina in un esempio concreto con WhatsApp.

CONTESTO E VINCOLI
- App Next.js 16 in `apps/web`; kit immersive in `apps/web/components/home/immersive/shared.tsx` (reduced-motion → `tl.progress(1)`: stato finale leggibile). Tema chiaro, token, UI italiana, mock deterministici, demo solo PC. NON toccare `packages/**`.
- I loghi brand vengono da `simple-icons` (già dipendenza; usa `#${icon.hex}` per i colori ufficiali — per WhatsApp usa `siWhatsapp.hex`, non hardcodare).

STATO ATTUALE — `apps/web/components/home/immersive/ImmersiveIntegrazioni.tsx`
- Muro di 18 tile logo (TILES, con siWhatsapp al primo posto) + barra di ricerca `.imm-int-search` la cui query «pagamenti» filtra il muro + dettaglio Stripe `.imm-int-detail`. Beat: ① 6 tile in vetrina; ② resto in cascata; ③ ricerca+filtro; ④ dettaglio; ⑤ reset. Float continuo motion-safe sulle tile (tienilo).

ISTRUZIONI
1. ELIMINA: tutto il blocco barra di ricerca (`.imm-int-search`, `.imm-int-placeholder`, `.imm-int-query`, `.imm-int-badge`), il dettaglio (`.imm-int-detail`, `.imm-int-open`, const DETAIL), i beat ③/④/⑤ della timeline, le frasi Say 2 e Say 3, e gli import del kit non più usati (typeInField; valuta clickZoom/cursorTo in base alla nuova regia).
2. NUOVA REGIA:
   - Say 0 (veil): «Ci integriamo con i sistemi di tutti i giorni.»
   - CARRELLATA DI LOGHI: disponi le tile su 3 RIGHE orizzontali (6 per riga, il container può eccedere il viewport). Le righe entrano e SCORRONO in direzioni alternate pilotate dalla timeline scrubbata (riga 1: xPercent 8→-8; riga 2: -8→8; riga 3: 8→-8, ease "none" distribuito su tutto il beat) mentre le tile compaiono a ondata (scale 0.6→1, autoAlpha, stagger). Il focus visivo è il MOVIMENTO continuo dei loghi.
   - ESEMPIO WHATSAPP: il cursore (hand) va sulla tile WhatsApp → punch (pressButton/clickZoom); le altre tile sfumano a 0.25; si APRE una finestra chat mock in stile WhatsApp centrata (w ~340px): header nel verde brand (`#${siWhatsapp.hex}`) con avatar e nome «GM Solar», corpo chat su fondo chiaro. Sequenza bolle (fade+rise, una alla volta): messaggio in ENTRATA dal sistema «⚡ Ricarica completata — 12,6 kWh · Colonnina Torino Nord» (con orario mock «14:32»), typing-dots, seconda bolla «Ricevuta n. 0421 disponibile nell'app.», bolla di risposta del cliente a destra «Grazie! 👍». Caption durante la chat: «Per esempio: le notifiche ti arrivano su WhatsApp.»
   - CHIUSURA: la chat si richiude (scale+fade), le tile tornano tutte a opacità piena → stato finale = griglia/carrellata completa e pulita.
3. Il float continuo per-tile resta (motion-safe, solo `y`).
4. Reduced-motion (`progress(1)`): tutte le tile visibili E la chat WhatsApp aperta e leggibile (in questo caso NON richiuderla: sposta la richiusura prima della fine oppure rendi lo stato finale "chat aperta" — scegli tu, purché a progress(1) il contenuto sia comprensibile e non ci siano elementi a metà).

ACCETTAZIONE
- Niente barra di ricerca né dettaglio Stripe; loghi in movimento coordinato; esempio WhatsApp concreto e leggibile.
- `rg "Cerca un|imm-int-search|imm-int-detail|pagamenti" apps/web/components/home/immersive/ImmersiveIntegrazioni.tsx` → zero risultati.
- `pnpm typecheck` e `pnpm build` passano. Riepiloga i file toccati. NON committare.
```

---

## P10 — Chiusura: solo «GM SOLAR» + «Rivedi la presentazione», centrato e pulito

```text
Devi semplificare la scena di CHIUSURA della home: solo il marchio GM SOLAR e il bottone «Rivedi la presentazione», centrati, puliti.

CONTESTO E VINCOLI
- App Next.js 16 in `apps/web`. Tema chiaro, accent lime via token. NON toccare `packages/**`.

STATO ATTUALE — `apps/web/components/home/scenes/ClosingScene.tsx`
- Contiene: riga accent in alto, trama a puntini, 2 aloni lime, mark+wordmark «GM Solar», h2 lungo («Un unico partner…»), paragrafo descrittivo, ELENCO dei 6 servizi con icone lucide (const SERVIZI), e `ReplayButton` (che riavvia la presentazione via evento `presentation:replay`).

ISTRUZIONI
1. Riduci la scena a: (a) mark + wordmark «GM SOLAR» ben grande e centrato (quadratino `bg-accent` + wordmark `font-display font-bold tracking-tight`, dimensione ~text-4xl/5xl); (b) sotto, il solo `<ReplayButton />` («Rivedi la presentazione»). Nient'altro: elimina h2, paragrafo, const SERVIZI, l'elenco `<ol>` e gli import lucide non più usati.
2. Sfondo PULITO: mantieni la riga accent in alto; rimuovi la trama a puntini; al massimo UN alone `bg-accent-soft` molto tenue. Tanto spazio bianco.
3. Mantieni `Section fullBleed min-h-svh` centrata e l'entrata `ScrollReveal` (rispetta già reduced-motion).

ACCETTAZIONE
- Ultima schermata = solo logo GM SOLAR centrato + bottone «Rivedi la presentazione»; il replay funziona come prima.
- `pnpm typecheck` e `pnpm build` passano. Riepiloga i file toccati. NON committare.
```

---

## P11 — Camera cinematografica: motion design "da After Effects" su tutte le scene immersive

```text
Devi trasformare le animazioni delle scene immersive della home in MOTION DESIGN PREMIUM stile After Effects: una "camera virtuale" che fa punch-in sui click, push-in lento durante la digitazione, segue il cursore, whip-pan tra i pannelli, rack focus quando si aprono drawer/modali. Le inquadrature devono essere VARIEGATE (non lo stesso zoom ovunque). PREREQUISITO: i prompt P3–P10 sono già stati eseguiti (le scene hanno la regia definitiva).

CONTESTO E VINCOLI
- App Next.js 16 in `apps/web`; GSAP/ScrollTrigger SOLO da `@gmgroup/lib/gsap`. Tema chiaro, UI italiana, demo solo PC desktop (Chrome). NON toccare `packages/**`, `apps/web/app/layout.tsx`, `apps/web/app/globals.css`.
- Le timeline delle scene sono SCRUBBATE dallo scroll (avanti E indietro): ogni tween deve essere scrub-safe e deterministico (niente `repeat:-1` dentro la timeline scrubbata). Sotto `prefers-reduced-motion` il kit porta la timeline a `progress(1)`: la camera DEVE finire neutra (x:0, y:0, scale:1, rotation:0).
- Solo `transform` e `opacity` (60fps obbligatori); `filter: blur()` ammesso SOLO ≤2px e per beat ≤0.5s, da rimuovere se causa jank.

ARCHITETTURA ATTUALE (leggi questi file PRIMA di scrivere codice)
- `apps/web/components/home/immersive/shared.tsx` = kit condiviso delle scene. `ImmersiveStage` rende:
  `<section> → <div sticky> → <div class="imm-stage"> → <div class="imm-skew">{children}</div> + <Cursor/> </div>`
  - `.imm-stage` è GIÀ una "camera" ma è RISERVATA all'hand-off tra scene (entrata/uscita con scale+fade su finestre di scrub separate): NON toccarla e NON animarla dalla timeline principale.
  - `.imm-skew` porta il velocity skew. Il cursore finto (`.imm-cursor`) è FUORI da `.imm-skew` ma dentro `.imm-stage`.
  - VINCOLO CRITICO: `cursorTo()` misura i target a runtime con `getBoundingClientRect` assumendo che durante le interazioni la scena sia a scale 1 (vedi commento in `cursorDest`). Qualunque camera che scala il contenuto DEVE tenere il cursore FUORI dal layer scalato, altrimenti la matematica cursore↔target si rompe.
  - Helper esistenti: `cursorTo`, `clickZoom` (punch locale su un cluster), `pressButton`, `typeInField`, `drawPath`, `countUp`, `maskReveal`, `say`/`Say`, `useImmersiveScene(build)`.
- Scene consumatrici (tutte in `apps/web/components/home/immersive/`): ImmersiveAssistente, ImmersiveDashboard, ImmersiveSegnalazioni, ImmersiveGestionale, ImmersiveRicarica, ImmersiveIntegrazioni.

ISTRUZIONI

1. LAYER CAMERA. In `ImmersiveStage` (shared.tsx) introduci un layer dedicato tra `.imm-stage` e `.imm-skew`:
   `<div class="imm-stage"> → <div class="imm-camera"> → <div class="imm-skew">{children}</div> </div> + <Cursor/> </div>`
   - `.imm-camera`: `h-full w-full`, `transformOrigin: "50% 50%"`, `willChange: "transform"`.
   - Il CURSORE resta figlio diretto di `.imm-stage` (FUORI dalla camera): così non viene scalato e `cursorDest` continua a funzionare — il target scalato viene misurato in coordinate schermo via getBoundingClientRect, e il cursore vive in uno spazio non trasformato che coincide con lo schermo. Modifica ADDITIVA e retro-compatibile: se una scena non usa la camera, nulla cambia.

2. NUOVI HELPER in shared.tsx (stesso stile documentale degli helper esistenti):
   - `cameraTo(tl, target, opts?: { scale?: number; duration?: number; ease?: string; position?: number|string })` — inquadra un elemento: anima `.imm-camera` (x, y, scale) in modo che il CENTRO del target finisca al centro del viewport alla scala richiesta (default scale 1.4, duration 0.9, ease "power3.inOut"). Usa valori FUNCTION-BASED (ri-misurati a tween start e su invalidateOnRefresh). Ricetta per il calcolo, robusta anche a camera già trasformata:
     ```
     const cam = section.querySelector(".imm-camera");
     const s0 = Number(gsap.getProperty(cam, "scaleX")) || 1;
     const camRect = cam.getBoundingClientRect();          // rect TRASFORMATO
     const r = el.getBoundingClientRect();
     // centro del target nello spazio NON trasformato della camera:
     const localX = (r.left + r.width / 2 - camRect.left) / s0;
     const localY = (r.top + r.height / 2 - camRect.top) / s0;
     // con transformOrigin al centro, per portare (localX, localY) al centro viewport a scala S:
     const cx = cam.offsetWidth / 2, cy = cam.offsetHeight / 2;
     x = viewportCenterX - stageRect.left - cx + (cx - localX) * S;
     y = viewportCenterY - stageRect.top  - cy + (cy - localY) * S;
     ```
     (stageRect = rect del genitore sticky non trasformato; verifica la formula empiricamente su un bottone e aggiusta finché il target è perfettamente centrato). CLAMP: S max 1.7; non inquadrare mai fuori dai bordi del contenuto (limita x/y perché ai margini non si veda il fondo).
   - `cameraReset(tl, opts?)` — torna a x:0, y:0, scale:1, rotation:0 (default duration 0.8, ease "power2.inOut").
   - `cameraFollow(tl, target, opts?)` — "lock" sul cursore: pan della camera (stessa duration/ease del `cursorTo` concorrente, zoom invariato o lieve 1.15) verso lo stesso target, così la camera SEGUE il cursore in viaggio. Da usare per traversate lunghe (es. sidebar → contenuto).
   - `cameraWhip(tl, dir: "l"|"r", opts?)` — whip-pan per i cambi pannello: burst rapido (0.35s, expo.inOut) con xPercent ∓3 + skewX 0→1.2→0 su `.imm-camera` (squash da colpo di frusta), in sync con il pan del `.imm-track`. Finisce SEMPRE a valori neutri.
   - `rackFocus(tl, bgTarget, opts?)` — profondità quando si apre un drawer/modale/chat: il layer dietro va a opacity ~0.55 + scale 0.985 (power2.out, 0.5s); `rackFocusOff(tl, ...)` ripristina. (Blur 2px opzionale SOLO se i 60fps reggono.)

3. REGOLE DI SEQUENZIAMENTO (documentale in shared.tsx, da rispettare nelle scene):
   - Camera e cursore NON partono nello stesso istante verso lo stesso target: prima parte la camera (o il cursore), l'altro segue con position ">-0.2" max di overlap — i valori function-based si misurano a tween start e una misura a metà movimento camera darebbe coordinate sbagliate.
   - Ogni "inquadratura" si chiude: `cameraReset` prima del beat finale della scena e comunque prima della fine timeline (a `progress(1)` la camera è neutra → reduced-motion pulito e hand-off `.imm-stage` senza conflitti).
   - `clickZoom` (punch locale) e `cameraTo` (punch di camera) NON si sommano sullo stesso beat: dove introduci il punch di camera, rimuovi il clickZoom corrispondente.
   - Rotation micro-dutch: max 0.6deg, solo su beat drammatici, sempre riportata a 0.

4. VOCABOLARIO DI INQUADRATURE (usa TUTTE queste, distribuite: nessuna scena deve avere solo punch-in):
   a. PUNCH-IN sul click: cameraTo scale 1.35–1.5, 0.45s "expo.out", micro-overshoot con "back.out(1.2)" sull'arrivo; hold breve; reset.
   b. PUSH-IN lento sulla digitazione: cameraTo scale 1.2, duration pari al typeInField (~1.0–1.4s), ease "power1.inOut" (respiro da documentario); pull-back all'invio.
   c. LOCK/FOLLOW del cursore: cameraFollow durante le traversate lunghe del cursore.
   d. WHIP-PAN sui cambi pannello: cameraWhip in sync con il pan del track (+ eventuale micro-rotation 0.5deg).
   e. RACK FOCUS: rackFocus quando si aprono drawer AI / modulo segnalazione / chat WhatsApp; off alla chiusura.
   f. PULL-BACK REVEAL: da zoom 1.2–1.4 a 1 per "svelare" un risultato (interfaccia generata, fix pubblicato).

5. SHOT-LIST PER SCENA (applica nelle rispettive build; adatta ai selettori reali post P3–P10):
   - ImmersiveAssistente: push-in (b) su `.imm-bar` durante il typing; punch (a) su `.imm-send`; pull-back reveal (f) quando la griglia vola via e entra la genui + rack focus (e) leggero sulla griglia dietro; punch (a) su `.imm-config-pick`.
   - ImmersiveDashboard: follow (c) dal click sidebar all'editor; push-in (b) sul typing del titolo; punch (a) su «Pubblica»; whip (d) su OGNI cambio pannello del `.imm-track`; push-in lento sui KPI durante il countUp, poi reset.
   - ImmersiveSegnalazioni: punch (a) su «Segnala un problema»; rack focus (e) sul modulo (dashboard dietro sfocata/attenuata); lock (c) sul typing della descrizione; sul FIX finale: push-in (b) sull'immagine che si sistema, poi pull-back (f) + reset.
   - ImmersiveGestionale: whip (d) Panoramica→Colonnine; push-in (b) su `.imm-query`; rack focus (e) all'apertura del drawer AI; micro-dutch 0.5deg sul «Fatto»; punch (a) sui flip Offline→Online ✓.
   - ImmersiveRicarica: qui la camera è DISCRETA (il telefono è già centrato e piccolo): push-in max 1.15 durante il typing, punch leggero su `.imm-rc-send`, push-in lento durante la ricarica 20→80%, reset finale.
   - ImmersiveIntegrazioni: pan laterale lieve in CONTRO-movimento durante la carrellata dei loghi; punch (a) sulla tile WhatsApp; rack focus (e) sulla chat (loghi dietro attenuati); pull-back (f) finale sulla griglia piena.
6. La scena Solare (P3) è già cinematografica: al massimo aggiungi l'overshoot (a) sull'entrata delle card 3D. Non introdurre la camera lì.

ACCETTAZIONE
- Ogni scena immersiva usa ALMENO 4 tipi di inquadratura diversi; nessun beat interattivo (click/typing) resta "piatto".
- Scrubbando avanti e indietro la camera è sempre coerente (nessun salto, nessun offset del cursore rispetto ai target dopo i movimenti di camera).
- A fine di ogni scena (e a `progress(1)`) la camera è neutra; hand-off tra scene invariato.
- 60fps: verifica con il pannello Performance di Chrome su un ciclo completo di scroll; se un blur scende sotto i 60fps, eliminalo.
- `pnpm typecheck` e `pnpm build` passano. Verifica visiva con `pnpm dev` a 1920×1080. Riepiloga i file toccati. NON committare.
```

---

## P12 — Capitoli: title card numerate + HUD di capitolo (le sezioni devono essere DISTINTE)

```text
Le sezioni della presentazione non sono abbastanza distinte: quando si entra in un nuovo servizio serve un segnale forte di "cambio argomento". Devi introdurre: (1) TITLE CARD DI CAPITOLO scure e numerate, visivamente diverse dalle frasi di spiegazione; (2) un HUD persistente che indica il capitolo corrente. PREREQUISITO: P3–P10 già eseguiti (ordine e testi delle scene definitivi).

CONTESTO E VINCOLI
- App Next.js 16 in `apps/web`; GSAP SOLO da `@gmgroup/lib/gsap`; kit scene in `apps/web/components/home/immersive/shared.tsx`. Tema chiaro con accent lime via token; su fondo SCURO l'accent pieno (`text-accent`) è leggibile, su fondo chiaro per il testo si usa `text-accent-ink`. UI italiana, demo solo PC. NON toccare `packages/**` né i file condivisi di layout.
- Reduced-motion: il kit porta le timeline a `progress(1)` → serve uno stato finale leggibile; l'HUD deve funzionare anche senza animazioni.

STATO ATTUALE E PROBLEMA
- Ogni scena immersiva apre con una frase `<Say i={0}>` variante "veil": velo CHIARO sfocato + testo scuro — identica per stile alle caption successive e uguale in TUTTE le scene → i capitoli si confondono, non si percepisce il cambio di servizio.
- `ImmersiveStage` ha una prop `eyebrow` (es. «03 · Dashboard») NON più renderizzata (tenuta per compatibilità): la numerazione dei capitoli esiste già nelle chiamate ma non si vede, ed è sfasata rispetto al nuovo ordine.
- Ordine capitoli definitivo: 01 Siti vetrina (scena Solare) · 02 Assistente AI · 03 Dashboard · 04 Segnalazioni · 05 Gestionale colonnine · 06 App di ricarica · 07 Integrazioni.

ISTRUZIONI

1. DATI CAPITOLI centralizzati. In `shared.tsx` (o file `_chapters.ts` accanto) esporta:
   `export const CHAPTERS = [ { n: "01", title: "Siti vetrina" }, { n: "02", title: "Assistente AI" }, { n: "03", title: "Dashboard" }, { n: "04", title: "Segnalazioni" }, { n: "05", title: "Gestionale colonnine" }, { n: "06", title: "App di ricarica" }, { n: "07", title: "Integrazioni" } ] as const;`

2. TITLE CARD DI CAPITOLO (`ChapterCard` + helper `chapterIntro(tl)` in shared.tsx, stesso pattern di Say/say):
   - Aspetto — NETTAMENTE diverso dalle frasi di spiegazione: velo full-screen SCURO (`bg-[#0b1020]/95`) con trama a puntini accent tenue (backgroundImage radial-gradient come in ClosingScene ma opacità bassa); al centro:
     · kicker numerico «02 / 07» in `text-accent` font-mono, tracking largo, testo piccolo maiuscolo;
     · TITOLO del servizio grande (`font-display text-5xl md:text-6xl font-bold tracking-tight`) in `text-accent` (lime pieno: su fondo scuro è leggibile ed è il segnale cromatico del cambio capitolo — le frasi di spiegazione restano testo scuro su velo chiaro);
     · sotto il titolo una LINEA accent sottile (h-[2px], w-24) che si disegna (scaleX 0→1, transformOrigin left);
     · opzionale una riga di sottotitolo in `text-white/70` (una sola frase).
   - Motion (dentro la timeline scrubbata, PRIMA di ogni altro beat della scena): velo entra con fade veloce (0.3), kicker fade+rise, titolo con mask reveal parola-per-parola (riusa `maskReveal` con `stagger` sulle parole avvolte in span, dir "l"), linea che si disegna; hold breve; uscita compatta (velo+contenuto salgono e sfumano con "power2.in"). L'intera card occupa il primo ~8–10% della timeline.
   - Integrazione: in OGNI scena immersiva sostituisci la prima `<Say i={0}>` (veil) con `<ChapterCard chapter={CHAPTERS[i]} subtitle="...(la frase veil attuale)..." />` + `chapterIntro(tl)` al posto di `say(tl, 0)`. Le caption successive (`variant="caption"`) restano INVARIATE (chiare) — il contrasto scuro/chiaro è ciò che distingue "nuovo capitolo" da "spiegazione".
   - Scena Solare (P3): la frase popup «Creiamo siti web moderni…» diventa la ChapterCard 01: titolo «Siti vetrina», sottotitolo la frase stessa.
   - Rimuovi la prop `eyebrow` morta da ImmersiveStage e dalle chiamate (la numerazione ora vive in CHAPTERS).

3. HUD DI CAPITOLO persistente (`ChapterHUD`, nuovo componente client in `components/home/`, montato una volta in `page.tsx`):
   - Pill fissa in alto a destra (`fixed top-5 right-5 z-40`, stile della pill di AutoScroll: `border-border bg-background/80 backdrop-blur rounded-full px-3.5 py-1.5 text-xs`): mostra «02 · Dashboard» + accanto una mini-rail di 7 puntini (puntino attivo `bg-accent`, gli altri `bg-border`).
   - Rilevamento: ogni scena-capitolo espone `data-chapter="1"` (indice in CHAPTERS) sul proprio `<section>` (aggiungi una prop opzionale `chapterIndex` a ImmersiveStage che la imposta; per la scena Solare mettila a mano). L'HUD usa UN IntersectionObserver (threshold ~0.5) sulle section marcate e aggiorna testo+puntini al cambio.
   - Comportamento: nascosta finché non si entra nel capitolo 01; si nasconde sulla ClosingScene; niente animazioni oltre a un crossfade breve del testo (e nessuna sotto reduced-motion — swap secco); `pointer-events-none` e `aria-hidden` (è un indicatore di regia, non navigazione).
4. REDUCED-MOTION: a `progress(1)` la ChapterCard finisce nascosta come il vecchio veil → per gli utenti reduced aggiungi nella variante statica di ogni scena un HEADING visibile in cima («02 · Dashboard», testo normale, niente velo). Aggiorna gli `aria-label` delle section con i nomi capitolo.

ACCETTAZIONE
- Entrando in ogni servizio compare una title card scura numerata con titolo lime: il cambio di argomento è inconfondibile; le frasi di spiegazione restano chiare e visivamente subordinate.
- L'HUD in alto a destra indica sempre capitolo corrente e posizione (puntini) e sparisce sulla chiusura.
- Numerazione coerente con l'ordine reale delle scene (01→07). `rg "eyebrow" apps/web/components/home` → zero usi morti residui.
- `pnpm typecheck` e `pnpm build` passano. Verifica visiva con `pnpm dev` a 1920×1080. Riepiloga i file toccati. NON committare.
```

---

*Nota: dopo l'esecuzione di tutti i prompt, allineare `docs/PROGETTO.md` al nuovo ordine scene (Solare → Assistente → Dashboard → Segnalazioni → Gestionale → Ricarica → Integrazioni → Chiusura).*
