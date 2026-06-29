# Vetrina Servizi — demo (de-brandizzata)

## Obiettivo

Demo single-page-app **de-brandizzata**: una **presentazione interattiva** (scrollytelling
cinematografico) con cui mostriamo a un cliente le nostre capacità su **7 servizi digitali**.
NON è un prodotto in produzione e NON è "tre siti vetrina brandizzati": è un'unica app Next
che funge da vetrina delle proposte (noi → cliente). Niente nomi/loghi/anagrafiche reali.

Route vive (le uniche che esistono):

- **/** — home immersiva **chromeless** (scroll-narrativa che racconta i servizi; dentro
  ci sono i capitoli "Siti vetrina" e "App ricarica EV")
- **/assistente** — assistente AI di sito (chatbot demo)
- **/dashboard** — dashboard & telemetria (mock analytics, grafici recharts)
- **/gestionale** — gestionale con assistente AI (query in linguaggio naturale)
- **/integrazioni** — integrazioni API (diagramma di flusso)
- **/segnalazioni** — pannello segnalazioni (bug/richieste con stato e priorità)

## Stack (fisso, non cambiare senza chiedere)

- Next.js App Router (16) + React (19) + TypeScript (strict)
- Tailwind CSS v4 con design token centralizzati (`packages/tokens/tokens.css`, fonte unica)
- Animazioni: GSAP + ScrollTrigger + Lenis (rispetta **SEMPRE** prefers-reduced-motion)
- Grafici: recharts (dashboard, gestionale)
- Icone: lucide-react
- **AI: SIMULATA (mock)**. `resolveAiProvider()` in `apps/web/lib/ai.ts` ritorna sempre `null`:
  nessun provider esterno viene mai chiamato, neanche con una chiave. Ogni route AI usa
  fallback deterministici. **Deve restare disabilitata.**
- Deploy: Vercel

## Regole

- È una **DEMO mock**: tutti gli asset sono PLACEHOLDER, tutti i dati sono finti/deterministici
  (in `apps/web/data/**` e nei componenti). NON inventare che asset o integrazioni reali esistano.
- Performance prima dell'effetto: lazy-load, Suspense, fallback statici. Deve girare su mobile
  mid-range.
- **Mobile-first**, accessibile (target AA), **italiano** come lingua dei contenuti/UI.
- **Tema CHIARO forzato**, un solo accent (lime del cliente). Nessun dark-mode, nessun
  theming per-route.
- Lavora a fasi. Dopo ogni fase: fermati, riepiloga, aspetta il via.
- Codice pulito e commentato, componenti piccoli e riusabili.

## Fonte di verità

Il piano e l'architettura aggiornati vivono in **`docs/PROGETTO.md`** e
**`docs/ROADMAP-MULTIAGENTE.md`**. In caso di dubbio, quelli vincono su questo file.

---

## Zona condivisa (NON si tocca senza concordare)

Nessuno modifica unilateralmente la base condivisa che tutte le sezioni ereditano:
`packages/ui` (primitive UI, Header/Footer, ThemeProvider, Lenis), `packages/lib`
(site, utils, motion, gsap, assets, theme), `packages/tokens` (`tokens.css` + base.css),
`packages/config`, `apps/web/app/layout.tsx`, `apps/web/app/globals.css`. Una modifica
unilaterale qui rompe le altre sezioni.

Se serve una modifica nella zona condivisa (un nuovo token, una prop in più su una primitiva,
un colore): **annotala in `NOTES-shared.md` e CONCORDA prima.**

## Design system — riferimento per le sezioni

Tutto parte da `packages/tokens/tokens.css` (fonte unica). Le sezioni **consumano** i token,
non li ridefiniscono.

### Accent (theming)

- L'accent attivo è la CSS var `--accent` (+ `--accent-strong`, `--accent-soft`,
  `--accent-contrast`, `--accent-ink`, `--accent-ring`). È **un solo colore de-brandizzato**
  (lime `#84CC16`, chiave `hub`) su tutte le route: lo imposta `ThemeProvider` mettendo
  `data-theme="hub"` su `<html>`.
- Usa le utility tematizzate: `bg-accent`, `text-accent`, `border-accent`, `bg-accent-soft`,
  `text-accent-contrast` (testo sopra l'accent pieno) e **`text-accent-ink`** (accent come
  TESTO, leggibile su chiaro — l'accent pieno lime ha contrasto basso come testo).
- Palette gruppo statica per scale/sfumature: `brand-50..950`.
- `useTheme()` da `@gmgroup/ui/ThemeProvider` ritorna sempre `"hub"`.

### Primitive UI (`@gmgroup/ui`) — API

- **Container** `{ size?: "narrow"|"default"|"wide"; className?; children }`
- **Section** `{ id?; className?; fullBleed?: boolean; size?; containerClassName?; children }` — ritmo verticale `py-section`, wrappa in Container salvo `fullBleed`.
- **Button** `{ variant?: "solid"|"outline"|"ghost"; size?: "sm"|"md"|"lg"; href?; ...DOM }` — con `href` rende un `<Link>`, altrimenti `<button>`. Solid usa l'accent attivo.
- **Card** `{ interactive?: boolean; className?; ...divProps }`
- **Badge** `{ variant?: "accent"|"neutral"|"outline"; className?; children }`
- **AnimatedCounter** `{ value: number; duration?; decimals?; prefix?; suffix?; locale?="it-IT"; className? }` — conta allo scroll-in, una volta.
- **ScrollReveal** `{ children; className?; y?=24; from?=0; duration?; delay?; start?="top 85%"; once?=true; stagger? }` — fade+rise; con `stagger` anima i figli diretti in cascata.
- **SplitTextReveal** `{ text: string; as?=("div"); className?; by?: "word"|"char"; duration?; stagger?=0.06; delay?; start?; once? }` — reveal con maschera, accessibile.

Tutte rispettano **SEMPRE** `prefers-reduced-motion` (regola di progetto).

### Motion

- Importa GSAP/ScrollTrigger SOLO da `@gmgroup/lib/gsap` (registrazione unica del plugin).
- `@gmgroup/lib/motion`: `prefersReducedMotion()`, `useReducedMotion()`, `useIsoLayoutEffect`,
  `DURATION` (secondi), `EASE` (eased GSAP). Lo smooth scroll (Lenis) è già attivo a livello
  di layout e si disattiva da solo con reduced-motion.
