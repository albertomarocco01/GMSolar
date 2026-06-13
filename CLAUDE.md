# GM Group — Demo sito-portale unificato

## Obiettivo

Demo single-page-app multi-sezione per un colloquio commerciale. UN solo
sito Next che racconta l'ecosistema di GM Group (3 brand dello stesso gruppo)
e dentro ha tre "mondi", ognuno con una tecnica visiva diversa:

- /solar (GM Solar, EPC fotovoltaico): cinematic video 4K + scroll GSAP, stats, mappa progetti, calcolatore ROI
- /mobility (GMobility, wallbox/colonnine Mennekes): 3D scroll storytelling con React Three Fiber
- /shop (Cavo Perfetto, e-commerce cavi ricarica): rebuild + AI "trova il cavo per la tua auto"

## Stack (fisso, non cambiare senza chiedere)

- Next.js App Router + React + TypeScript
- Tailwind CSS con design token centralizzati (colori/spacing/typography in un solo file)
- Animazioni: GSAP + ScrollTrigger + Lenis (rispetta SEMPRE prefers-reduced-motion)
- 3D: React Three Fiber + drei + postprocessing; shader GLSL; WebGL come default
- AI: route handler server-side; chiavi MAI nel client; function-calling con tool deterministico + catalogo JSON locale
- Mappe: MapLibre GL
- Deploy: Vercel

## Regole

- È una DEMO: tutti gli asset sono PLACEHOLDER (video di stock, glTF gratuiti o primitive, foto e catalogo finti in /data). Struttura tutto per sostituire facilmente gli asset reali dopo. NON inventare che gli asset esistono.
- Performance prima dell'effetto: lazy-load del 3D, Suspense, fallback a poster/video se WebGL non disponibile. Deve girare su mobile mid-range.
- Mobile-first, accessibile, italiano come lingua principale.
- Lavora a fasi. Dopo ogni fase: fermati, riepiloga cosa hai fatto, aspetta il via.
- Codice pulito e commentato, componenti piccoli e riusabili.

---

## Ownership map (fase parallela)

La fase 1 ha costruito le fondamenta condivise (design system, theming, primitive UI,
motion, layout, hub). Da qui le tre sezioni possono procedere IN PARALLELO, ognuna nel
proprio recinto.

| Agente   | POSSIEDE (crea/modifica)                       | LEGGE (dati)                                   |
| -------- | ---------------------------------------------- | ---------------------------------------------- |
| SOLAR    | `/app/solar/**`, `/components/solar/**`        | `/data/solar-projects.json`; video drone in `/public/assets` (`gm-solar-hero.mp4`, `gm-solar-drone.mp4`) |
| MOBILITY | `/app/mobility/**`, `/components/mobility/**`  | `/data/charging-points.json` + Open Charge Map |
| SHOP     | `/app/shop/**`, `/components/shop/**`          | `/data/products.json`                          |

### REGOLA FERREA (zona condivisa, NON si tocca)

Nessuno modifica `/components/ui`, `/components/layout`, `/components/providers`, `/lib`,
i token (`app/tokens.css`), `app/globals.css`, `app/layout.tsx`, il ThemeProvider,
Header/Footer. Sono la base che tutte e tre le sezioni ereditano: una modifica unilaterale
rompe le altre.

Se a una sezione serve una modifica nella zona condivisa (un nuovo token, una prop in più
su una primitiva, un colore): **annotala in `NOTES-shared.md` e CHIEDI. Non modificare.**

## Design system — riferimento per le sezioni

Tutto parte da `app/tokens.css` (fonte unica). Le sezioni **consumano** i token, non li
ridefiniscono.

### Accent per "mondo" (theming)

- L'accent attivo è la CSS var `--accent` (+ `--accent-strong`, `--accent-soft`,
  `--accent-contrast`, `--accent-ink`, `--accent-ring`). Lo imposta `ThemeProvider` mettendo
  `data-theme` su `<html>` in base alla route: `hub` (`#84CC16` lime gruppo), `solar`
  (`#A8D920`), `mobility` (`#3C9E3A`), `shop` (`#C8D400`).
- **Sulla tua route l'accent è già quello del tuo brand.** Usa le utility tematizzate:
  `bg-accent`, `text-accent`, `border-accent`, `bg-accent-soft`, `text-accent-contrast`
  (testo sopra l'accent pieno) e **`text-accent-ink`** (accent come TESTO, leggibile su
  chiaro e scuro — l'accent pieno lime ha contrasto basso come testo su sfondo chiaro).
- Leggi la chiave attiva con `useTheme()` da `@/components/providers/ThemeProvider`.
- Colori statici di tutti i brand (solo per viste dove convivono, es. hub):
  `bg-solar`/`text-solar`, `bg-mobility`/..., `bg-shop`/...; brand gruppo: `brand-50..950`.

### Primitive UI (`/components/ui`) — API

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

- Importa GSAP/ScrollTrigger SOLO da `@/lib/gsap` (registrazione unica del plugin).
- `@/lib/motion`: `prefersReducedMotion()`, `useReducedMotion()`, `useIsoLayoutEffect`,
  `DURATION` (secondi), `EASE` (eased GSAP). Lo smooth scroll (Lenis) è già attivo a livello
  di layout e si disattiva da solo con reduced-motion.
