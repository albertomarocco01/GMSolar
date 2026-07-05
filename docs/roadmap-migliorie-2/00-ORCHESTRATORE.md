# Migliorie home — Round 2 · ORCHESTRATORE

> **Per l'umano / l'orchestratore.** 10 richieste utente raggruppate in **5 mini-roadmap
> (A–E) per DIFFICOLTÀ**. Ognuna è un file **auto-contenuto**: la passi a un agente e lui
> la esegue senza altro contesto. Questo file dice solo: *chi fa cosa, con quale modello,
> in che ordine, e i permessi.*

## 0. Le 10 richieste → dove vivono

| # | Richiesta utente | Roadmap |
|---|---|---|
| 1 | Titoli di capitolo NON verdi: sfondo bianco + scritte nere grosse (com'era prima) | **A** |
| 2 | Prima «Siti vetrina» (scrollytelling forte), poi «Interfacce grafiche moderne» = componenti UI **senza video sotto** | **E** |
| 3 | Video hero «figo e completo» come quello mandato (all-keyframe) | **E** |
| 4 | Camera che, mentre zooma sulla scrittura, **trasla a destra col cursore** | **D** |
| 5 | Auto-scroll con curva **gaussiana** (lento → accelera → lento), non a velocità costante | **C** |
| 6 | Dashboard: **stesse foto** del sito vetrina (dove l'AI consiglia i prodotti), via emoji, foto prodotti veri | **B** |
| 7 | Segnalazioni: l'«immagine non disponibile» è brutta | **B** |
| 8 | Gestionale: non «colonnine» ma **«Gestionali su misura per le vostre attività»** | **A** |
| 9 | App: titolo **«App con assistente AI integrato»** | **A** |
| 10 | Chiusura: **solo** «Rivedi la presentazione» (via «GM Solar») + animazione loop di sfondo | **A** |

## 1. Le 5 mini-roadmap → modello + effort consigliati

| Roadmap | Contenuto | Difficoltà | **Modello consigliato** | **Effort** |
|---|---|---|---|---|
| **A** — `A-copy-brand.md` | Titoli capitolo bianco/nero (1) · Gestionale «su misura» (8) · titolo App (9) · Chiusura minimale + loop (10) | 🟢 Facile | **Fable 5** (`claude-fable-5`) | **medium** |
| **B** — `B-immagini-reali.md` | Dashboard foto reali + via emoji (6) · Segnalazioni: stato «immagine rotta» pulito (7) | 🟡 Medio | **Sonnet 5** (`claude-sonnet-5`) | **medium** |
| **C** — `C-autoscroll-gaussiano.md` | Curva di velocità gaussiana in `AutoScroll` (5) | 🟡 Medio | **Sonnet 5** (`claude-sonnet-5`) | **medium** |
| **D** — `D-camera-scrittura.md` | Nuovo helper camera che segue il caret in scrittura + applicazione nelle scene (4) | 🔴 Difficile | **Opus 4.8** (`claude-opus-4-8`) | **high** |
| **E** — `E-struttura-video.md` | Split «Siti vetrina» / «Interfacce moderne» senza video (2) · video hero completo all-keyframe (3) | 🔴 Difficile | **Opus 4.8** (`claude-opus-4-8`) | **high** (xhigh se rifà anche il video) |

> **Perché questi modelli.** A = copy + CSS leggero → un modello veloce basta. B/C = lavoro
> deterministico e circoscritto (asset/layout, una funzione di easing) → Sonnet medium. D/E =
> correttezza GSAP scrub-safe, matematica cursore↔camera, ristrutturazione + pipeline video →
> Opus, effort alto. Se l'agente di A inciampa sull'intreccio reduced-motion/pausa dell'item 10,
> promuovilo a Sonnet.

## 2. Ordine di esecuzione (IMPORTANTE — evita collisioni sui file condivisi)

Alcune roadmap toccano gli **stessi file** (`shared.tsx`, `SolarTwinScene.tsx`, `page.tsx`,
le scene immersive). **Non lanciarle in parallelo se condividono un file.** Grafo:

```
  B ─┐  (Dashboard, Segnalazioni — isolate)
  C ─┤  (AutoScroll.tsx — 100% isolato)
     ├─> A ─> E ─> D
  A: shared.tsx (ChapterCard + CHAPTERS titoli) · SolarTwinScene (intro) · Gestionale · Closing
  E: shared.tsx (CHAPTERS +1 voce) · SolarTwinScene (togli card) · page.tsx · nuova scena · video
  D: shared.tsx (nuovo helper camera) · Dashboard/Segnalazioni/Gestionale (applica)
```

- **Sequenza raccomandata (semplice e sicura):** **A → B → C → E → D.**
- **Se vuoi parallelismo:** `B` e `C` sono isolate → possono girare **insieme ad A**. Poi
  `E` (dopo A), poi `D` (per ultima: dipende da A, B, E).
- Regola d'oro: **due agenti non scrivono lo stesso file nello stesso momento.** Ogni roadmap
  ha in testa la sua sezione «FILE DI PROPRIETÀ» e i suoi «PREREQUISITI».

## 3. Ambiente (fatti verificati — non riscoprirli)

| Cosa | Valore |
|---|---|
| OS / shell | Windows 11 · PowerShell (usa sintassi PowerShell) |
| Repo | `c:\Users\sinog\Desktop\GMSolar` · git · branch **`migliorie-home`** |
| Monorepo | pnpm + turbo · Next.js 16 App Router in `apps/web` · React 19 · TS strict · Tailwind v4 |
| Comandi | `pnpm typecheck` · `pnpm build` · `pnpm lint` · `pnpm dev` (porta 3000) |
| Animazioni | GSAP/ScrollTrigger **solo** da `@gmgroup/lib/gsap`; Lenis attivo a layout |
| Video | **ffmpeg presente** (`ffmpeg` nel PATH, v8.1.1). Chrome di sistema decodifica H.264; il Chromium bundled no → verifica i video con `C:\Program Files\Google\Chrome\Application\chrome.exe` |
| Ricerca testo | `rg` **non** nel PATH PowerShell: usa il tool Grep dell'harness o `bash -lc 'rg …'` |
| Target | Demo **solo PC desktop** 1920×1080. **Niente QA mobile/touch** |

## 4. Regole NON NEGOZIABILI (valgono per OGNI roadmap)

1. **Zona condivisa intoccabile:** `packages/**`, `apps/web/app/layout.tsx`,
   `apps/web/app/globals.css`. (⚠ `apps/web/components/home/immersive/shared.tsx` **NON** è
   zona condivisa: è il kit della home, si può modificare — ma con ownership esclusiva, vedi §2.)
2. **`prefers-reduced-motion` sempre**: le timeline scrubbate vanno a `progress(1)` → ogni beat
   deve avere uno stato finale leggibile; la camera deve finire **neutra**.
3. Tema **chiaro** forzato, un solo accent lime via utility token (`bg-accent`, `text-accent-ink`,
   `bg-accent-soft`, `text-accent-contrast`, `bg-surface`, `border-border`, `text-muted`).
4. Dati/asset **mock deterministici**. AI **simulata** (`resolveAiProvider()` resta `null`). UI in **italiano**.
5. Solo `transform`/`opacity` per le animazioni pesanti; **60 fps**. `blur()` solo ≤2px e per beat ≤0.5s.
6. **Nessun agente committa.** Committa solo l'orchestratore (o l'umano) al gate di ogni roadmap.

## 5. Permessi — `.claude/settings.local.json` (leggilo, non allargarlo)

Il repo ha già i permessi impostati:

```jsonc
{
  "defaultMode": "bypassPermissions",           // gli agenti NON ricevono prompt di conferma
  "permissions": {
    "allow": ["Bash(*)","Read(*)","Write(*)","Edit(*)","PowerShell(*)",
              "MultiEdit(*)","WebFetch(*)","WebSearch(*)","Glob(*)","Grep(*)",
              "LS(*)","TodoWrite(*)","TodoRead(*)","Task(*)","mcp_*(*)"],
    "additionalDirectories": ["\\tmp", "C:\\Users\\sinog\\.claude"]
  }
}
```

Conseguenze pratiche per gli agenti:

- **Puoi eseguire senza chiedere conferma**: `pnpm`, `git` (diff/status/log), `ffmpeg`,
  `WebFetch`/`WebSearch` (es. scaricare una foto placeholder), lettura/scrittura file.
- **NON allargare i permessi** e **non cambiare `defaultMode`**.
- `bypassPermissions` **non** è un permesso di committare o di pushare: resta il §4.6.
  Niente `git commit`, niente `git push`, niente merge su `main`.
- Scratch/temporanei → nella cartella scratchpad di sessione o in `\tmp`, mai nel progetto.

## 6. Definizione di «fatto» (gate di ogni roadmap)

`pnpm typecheck` **verde** + `pnpm build` **verde** · nessun nuovo warning lint · i grep di
accettazione della roadmap a **zero** · verifica visiva a 1920×1080 con Chrome di sistema ·
reduced-motion leggibile. Poi l'orchestratore committa con il messaggio suggerito in fondo alla
roadmap e tagga `migliorie2-<lettera>-ok`.

## 7. Dopo tutte e 5

Allinea `docs/PROGETTO.md` (ordine scene + nomi capitolo aggiornati) e chiudi il round.
