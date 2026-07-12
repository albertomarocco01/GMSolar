# Roadmap A — Copy & Branding 🟢 Facile

> **Modello consigliato:** Fable 5 (`claude-fable-5`) · **Effort:** medium
> **Prerequisiti:** nessuno. **Va eseguita PRIMA di E** (condividete `shared.tsx` e `SolarTwinScene.tsx`).
> **Non committare** (lo fa l'orchestratore al gate). Repo: `c:\Users\sinog\Desktop\GMSolar` (Windows/PowerShell).

Quattro modifiche di testo/stile a basso rischio: titoli di capitolo bianco+nero, gestionale
«su misura», titolo App, chiusura minimale con loop di sfondo.

## Contesto minimo

- Home scrollytelling in `apps/web/app/page.tsx`; scene in `apps/web/components/home/`.
- Kit scene immersive in `apps/web/components/home/immersive/shared.tsx`: espone `CHAPTERS`
  (fonte unica dei capitoli, usata da `ChapterCard`, `ChapterHUD`, `data-chapter`) e
  `ChapterCard` (title card d'apertura di ogni scena).
- GSAP **solo** da `@gmgroup/lib/gsap`. Tema chiaro, accent lime via token. UI italiana. Demo solo PC.
- `prefers-reduced-motion` sempre rispettato.

## FILE DI TUA PROPRIETÀ (modifica SOLO questi)

- `apps/web/components/home/immersive/shared.tsx` — **solo** `ChapterCard` (item 1) e l'array `CHAPTERS` (item 8, 9). **Non** toccare gli helper camera né `useImmersiveScene`.
- `apps/web/components/home/scenes/SolarTwinScene.tsx` — **solo** l'intro one-shot della title card (item 1).
- `apps/web/components/home/immersive/ImmersiveGestionale.tsx` — testo/framing (item 8).
- `apps/web/components/home/scenes/ClosingScene.tsx` — riscrittura (item 10).

⚠ Non toccare `ImmersiveRicarica.tsx` (item 9 è **solo** il titolo capitolo in `CHAPTERS`: la
frase Say0 e l'eyebrow della scena sono già a posto).

---

## Item 1 — Title card capitolo: sfondo BIANCO + titolo NERO grosso (non lime)

**Cosa non va oggi:** ogni scena apre con una `ChapterCard` a **velo scuro** (`bg-[#0b1020]/95`)
e **titolo lime** (`text-accent`). L'utente li chiama «titoli verdi» e vuole il look di prima:
**sfondo bianco, scritte nere grosse.**

In `shared.tsx`, funzione `ChapterCard`:

1. Velo: da `bg-[#0b1020]/95` → **velo chiaro** `bg-background/90 backdrop-blur-sm` (come le
   frasi-veil di `Say`). La trama a puntini resta ma abbassa l'opacità (`opacity-30` → `opacity-20`)
   perché su chiaro spicca di più.
2. Kicker numerico «01 / 08»: da `text-accent` → `text-accent-ink` (accent leggibile su chiaro).
3. **Titolo**: da `text-accent` → **`text-foreground`** (nero), tenendo `font-display font-bold
tracking-tight` e la dimensione grossa (`text-5xl md:text-6xl`). Questa è la modifica chiave.
4. Linea sotto il titolo: resta `bg-accent` (accento grafico, va bene su chiaro).
5. Sottotitolo: da `text-white/70` → `text-muted`.

In `SolarTwinScene.tsx`, l'intro one-shot forza il fondo scuro a mano:

6. `gsap.set(".imm-chapter", { autoAlpha: 1, backgroundColor: "#0b1020" })` → **rimuovi
   `backgroundColor: "#0b1020"`** (lascia `autoAlpha: 1`), così la card apre chiara come le altre.
   Verifica che il fade da `IntroOverlay` (nero) → card chiara non faccia un flash brutale: se
   serve, la card chiara va bene perché l'IntroOverlay sfuma prima del reveal del titolo.

**Nota estetica:** il capitolo resta distinguibile dalle caption perché il **titolo è grande e
centrato** (le caption sono pill piccole in basso). Non serve più il contrasto scuro/chiaro.

**Accettazione item 1:** nessuna title card di capitolo ha testo lime; il titolo è nero grande su
fondo chiaro; l'apertura della scena Solare non parte più dal velo scuro. `text-accent` non
compare più come colore del **titolo** in `ChapterCard`.

---

## Item 8 — Gestionale: «Gestionali su misura per le vostre attività» (non «colonnine»)

**Cosa non va:** il capitolo si chiama «Gestionale colonnine» e la scena è tutta sulle colonnine
di ricarica. L'utente vuole il framing **«gestionali su misura per le vostre attività»** — le
colonnine restano come **un esempio concreto**, ma il messaggio è la personalizzazione.

1. In `shared.tsx`, `CHAPTERS`: la voce indice 4 `{ n: "05", title: "Gestionale colonnine" }`
   → **`{ n: "05", title: "Gestionali su misura" }`** (il titolo capitolo è corto; il claim lungo
   sta nel sottotitolo/veil, punto 2). ⚠ Se la roadmap **E** è già passata, gli indici/numeri di
   `CHAPTERS` sono cambiati (è diventato di 8 voci): trova la voce **Gestionale** per `title`, non per indice.
2. In `ImmersiveGestionale.tsx`, la prima frase (veil/ChapterCard subtitle) → qualcosa come
   **«Un gestionale su misura per la tua attività.»**; se c'è una caption che dice «tutte le
   colonnine…», riformulala come esempio: **«Per esempio: le tue colonnine di ricarica.»** Le
   colonnine, gli stati (Online/Offline), l'agente Ach che le riavvia **restano** (sono la demo viva).
3. Aggiorna l'eyebrow/`label` dello stage e il commento `@descrizione` in testa al file.

**Laziness note:** non riscrivere la meccanica della scena. È un **cambio di cornice/testo**, non
di contenuto. Se vuoi rafforzare il messaggio «su misura», al massimo aggiungi UNA riga di
sottotitolo; non inventare nuove entità.

**Accettazione item 8:** il capitolo non si chiama più «Gestionale colonnine»; la prima frase parla
di gestionale «su misura»; le colonnine restano come esempio. Nessun `€` introdotto.

---

## Item 9 — App: capitolo «App con assistente AI integrato»

In `shared.tsx`, `CHAPTERS`, voce **App di ricarica** (indice 5 pre-E):
`{ n: "06", title: "App di ricarica" }` → **`{ n: "06", title: "App con assistente AI integrato" }`**.

È l'unica modifica dell'item 9 (Say0 «Un'app con assistente AI integrato.» ed eyebrow sono già
corretti in `ImmersiveRicarica.tsx` — **non** toccarlo). Se il titolo lungo va a capo brutto nella
`ChapterCard`, va bene: `text-balance` è già attivo.

**Accettazione item 9:** l'HUD e la title card del 6° capitolo mostrano «App con assistente AI integrato».

---

## Item 10 — Chiusura: solo «Rivedi la presentazione» + loop di sfondo, via «GM Solar»

**Stato oggi** (`ClosingScene.tsx`): mark+wordmark **«GM Solar»** grande centrato + `ReplayButton`.
L'utente vuole: **togliere GM Solar**, tenere **solo** il bottone «Rivedi la presentazione», con
una **animazione loop di sfondo** discreta.

1. **Rimuovi** il blocco mark+wordmark «GM Solar» (`<span bg-accent…>` + `<span>GM Solar</span>`).
   Resta, centrato: **solo `<ReplayButton />`** (che già dice «Rivedi la presentazione» e emette
   `presentation:replay`). Non aggiungere altri testi.
2. **Loop di sfondo discreto** (solo `transform`/`opacity`, dietro il bottone, `pointer-events-none`,
   `aria-hidden`, `-z-10`). Tienilo sobrio: 1–2 aloni `bg-accent-soft`/`bg-accent/5` che respirano
   in loop (scale/opacity, ~8–12s, `yoyo`, `repeat: -1`) via un piccolo `useIsoLayoutEffect` +
   `gsap.context`. **Vincoli obbligatori:**
   - GSAP da `@gmgroup/lib/gsap`. Il file diventa `"use client"` (oggi è server: `ReplayButton` è
     già client, ma il loop richiede l'effect → aggiungi la direttiva in testa).
   - **Reduced-motion:** niente loop (early-return nell'effect); lascia gli aloni statici.
   - **Pausa globale:** il loop deve fermarsi quando la presentazione è in pausa. Aggancia
     `presentation:pausechange` (`e.detail.paused` → `tween.pause()/resume()`) **e** parti già in
     pausa se `document.documentElement.hasAttribute("data-presentation-paused")` al mount
     (stesso pattern di `SolarTwinScene` micro-demo). Ricorda il cleanup del listener.
   - Mantieni la riga accent in alto e `Section fullBleed min-h-svh` centrata.

**Laziness note:** un solo tween `repeat:-1` yoyo su un paio di aloni basta. Non serve canvas,
non servono particelle, non serve una libreria. Se il loop non regge i 60fps, riducilo a un solo alone.

**Accettazione item 10:** ultima schermata = solo bottone «Rivedi la presentazione» centrato +
sfondo che respira in loop; nessun testo «GM Solar»; il replay funziona; in pausa il loop si ferma;
reduced-motion = sfondo statico. `rg "GM Solar" apps/web/components/home/scenes/ClosingScene.tsx` → zero.

---

## Chiusura roadmap A

- **NON** eseguire `pnpm typecheck`/`pnpm build` tu (lo fa il controllo di fase dell'orchestratore),
  a meno che tu non stia girando in autonomia: in quel caso eseguili e riporta l'esito esatto.
- Riepiloga i **file toccati** e, per ogni item, PASS/FAIL con evidenza in 1 riga.
- Messaggio di commit suggerito (per l'orchestratore):
  `migliorie2(A): title card chiare, gestionale "su misura", titolo App, chiusura minimale + loop`
