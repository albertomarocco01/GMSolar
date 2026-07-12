# Migliorie home — Round 3 · ORCHESTRATORE

> **Per l'umano / l'orchestratore.** 4 step utente → **5 roadmap auto-contenute** (R1–R4B).
> Ogni file si passa a un agente e lui esegue senza altro contesto. Questo file dice:
> _chi fa cosa, con quale modello, in che ordine, con quali gate._

## 0. Gli step utente → dove vivono

| #   | Richiesta utente                                                                                                                                       | Roadmap |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ------- |
| 1   | Refactoring con logiche code-maniac + ponytail + caveman; grafo graphify                                                                               | **R1**  |
| 2   | Animazioni in alta qualità: motion design da brand-identity "After Effects"                                                                            | **R2**  |
| 3   | Layout da vero sito web: card troppo larghe, immagini troppo strette → armonia                                                                         | **R3**  |
| 4a  | Capitolo «Interfacce grafiche moderne» → carrellata di card super-moderne (liquid glass, glassmorphism, card elettriche), bottoni animati, UI avanzata | **R4A** |
| 4b  | Segnalazioni: rendere CHIARO che qualcuno assiste e sistema il problema                                                                                | **R4B** |

## 1. Roadmap → modello + effort

| Roadmap                                   | Contenuto                                                                      | Difficoltà   | Modello                                                                                            | Effort                      |
| ----------------------------------------- | ------------------------------------------------------------------------------ | ------------ | -------------------------------------------------------------------------------------------------- | --------------------------- |
| **R1** — `R1-refactoring.md`              | Tool deterministici + prettier + grafo graphify + refactor hotspot complessità | 🟡 Medio     | **Sonnet 5** (`claude-sonnet-5`); i 2 hotspot GSAP (`shared.tsx`, `AutoScroll.tsx`) → **Opus 4.8** | medium (high sui 2 hotspot) |
| **R4A** — `R4A-ui-showcase.md`            | InterfacceScene v4: showcase UI moderne (liquid glass, glass, electric)        | 🔴 Difficile | **Opus 4.8** (`claude-opus-4-8`)                                                                   | **high**                    |
| **R4B** — `R4B-segnalazioni-chiarezza.md` | Beat "presa in carico umana" + timeline stato in Segnalazioni                  | 🟡 Medio     | **Sonnet 5**                                                                                       | medium                      |
| **R3** — `R3-layout-armonico.md`          | Pass di layout su tutte le scene: proporzioni, aspect-ratio, griglie           | 🔴 Difficile | **Opus 4.8**                                                                                       | **high**                    |
| **R2** — `R2-motion-quality.md`           | Linguaggio di motion unico (easing/durate/coreografia) + polish per scena      | 🔴 Difficile | **Opus 4.8**                                                                                       | **high**                    |

> **Perché quest'ordine di difficoltà/modello.** R1 è guidato dai tool (residuo piccolo),
> tranne i refactor scrub-safe GSAP che il routing di `scan` instrada a Opus. R4A/R3/R2
> sono giudizio estetico + correttezza GSAP → Opus high. R4B è copy + 1 beat sul pattern
> flip già esistente → Sonnet.

## 2. Ordine di esecuzione (evita collisioni sui file)

```
R1 (serializzata, tocca tutto il repo)
  └─> R4A ∥ R4B      (file disgiunti: InterfacceScene+showcase/ vs ImmersiveSegnalazioni)
        └─> R3        (layout su TUTTE le scene → dopo che il contenuto è definitivo)
              └─> R2  (motion polish per ULTIMO: si rifinisce il layout finale, non uno che cambierà)
```

- **R1 prima di tutto e da sola**: prettier --write e i refactor toccano file che le altre
  roadmap possiedono. Niente in parallelo con R1.
- **R4A ∥ R4B possono girare insieme**: proprietà disgiunte. `shared.tsx` per entrambe è
  **SOLA LETTURA**; se serve un helper nuovo nel kit → annotarlo nel report, lo aggiunge R2.
- **R3 e R2 sequenziali e per ultime**: entrambe scopano tutte le scene; il motion polish
  su un layout che poi cambia è lavoro buttato.
- Regola d'oro: **due agenti non scrivono lo stesso file nello stesso momento.** Ogni
  roadmap ha la sua sezione «FILE DI PROPRIETÀ».

## 3. Ambiente (fatti verificati il 2026-07-12 — non riscoprirli)

| Cosa          | Valore                                                                                                                                                                                                                                                                                               |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| OS / shell    | Windows 11 · PowerShell (il tool Bash accetta sintassi POSIX)                                                                                                                                                                                                                                        |
| Repo          | `C:\Users\jacop\Desktop\DEV\Lavori\GM-SOLAR` · git · branch **`main`** (creare `migliorie-3` prima di partire)                                                                                                                                                                                       |
| Monorepo      | pnpm 9 + turbo · Next.js 16 App Router in `apps/web` · React 19 · TS strict · Tailwind v4                                                                                                                                                                                                            |
| Comandi       | `pnpm typecheck` · `pnpm build` · `pnpm lint` · `pnpm format` · `pnpm dev`                                                                                                                                                                                                                           |
| Animazioni    | GSAP/ScrollTrigger **solo** da `@gmgroup/lib/gsap`; Lenis attivo a layout                                                                                                                                                                                                                            |
| Kit home      | `apps/web/components/home/immersive/shared.tsx` (1151 righe: `useImmersiveScene`, ChapterCard, camera, cursor, typeInField…)                                                                                                                                                                         |
| Baseline scan | prettier sporco su ≥5 file · 41 issue complessità (top: `AutoScroll.tick` ccn 21 · `shared.pressButton` ccn 19 · `gestionale/heuristic.ts` · `gestionale/DataTable.tsx` · `app/integrazioni/page.tsx:32`) · eslint/tsc/knip/jscpd/depcruise/semgrep/gitleaks NON installati · grafo graphify ASSENTE |
| Skill attive  | code-maniac · ponytail (full) · caveman (full) · graphify (pip, grafo da costruire in R1)                                                                                                                                                                                                            |
| Target        | Demo **solo PC desktop** 1920×1080. Niente QA mobile/touch                                                                                                                                                                                                                                           |

## 4. Regole NON NEGOZIABILI (valgono per OGNI roadmap)

1. **Zona condivisa intoccabile:** `packages/**`, `apps/web/app/layout.tsx`,
   `apps/web/app/globals.css`. (`shared.tsx` NON è zona condivisa: ownership esclusiva per
   roadmap, vedi §2.)
2. **`prefers-reduced-motion` sempre**: timeline scrubbate a `progress(1)` → ogni beat con
   stato finale leggibile; camera neutra a fine scena.
3. Tema **chiaro** forzato, un solo accent lime via utility token (`bg-accent`,
   `text-accent-ink`, `bg-accent-soft`, `text-accent-contrast`, `bg-surface`,
   `border-border`, `text-muted`).
4. Dati/asset **mock deterministici**. AI **simulata** (`resolveAiProvider()` resta `null`). UI in **italiano**.
5. Solo `transform`/`opacity` per le animazioni pesanti; **60 fps**; `blur()` ≤2px e per
   beat ≤0.5s. `backdrop-filter` ammesso in R4A solo su superfici piccole e statiche
   (card), MAI animato in scrub.
6. **Nessun agente committa/pusha.** Committa l'orchestratore (o l'umano) al gate di ogni
   roadmap, un commit = un motivo.
7. **Comunicazione tra macchine in stile caveman** (report subagent compressi);
   minimalismo ponytail: nessuna astrazione speculativa, scorciatoie deliberate marcate
   `// ponytail:`.

## 5. Definizione di «fatto» (gate di ogni roadmap)

`pnpm typecheck` verde + `pnpm build` verde · nessun nuovo warning lint ·
`node <code-maniac>/scripts/scan.mjs` senza NUOVI problemi rispetto alla baseline (§3) ·
grep di accettazione della roadmap a zero · verifica visiva 1920×1080 (Chrome) ·
reduced-motion leggibile. Poi commit dell'orchestratore e tag `migliorie3-<sigla>-ok`.

## 6. Dopo tutte e cinque

1. Rigenera `docs/struttura_directory.md` (`node <code-maniac>/scripts/tree.mjs`) e il
   grafo graphify (`/graphify --update`).
2. Allinea `docs/PROGETTO.md` (stato home + capitolo Interfacce v4) e `docs/DEBITO-TECNICO.md`.
3. Aggiorna il puntatore «roadmap attiva» in `CLAUDE.md` → `docs/roadmap-migliorie-3/00-ORCHESTRATORE.md`.
