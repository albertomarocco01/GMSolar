# GM Group — sito-portale unificato (demo)

Demo single-page-app multi-sezione che racconta l'ecosistema **GM Group** (tre brand
dello stesso gruppo), ognuno con una tecnica visiva diversa:

- **/solar** — GM Solar (EPC fotovoltaico): video cinematic + scroll GSAP, stats, mappa progetti, calcolatore ROI
- **/mobility** — GMobility (wallbox/colonnine): 3D scroll storytelling con React Three Fiber
- **/shop** — Cavo Perfetto (e-commerce cavi di ricarica): catalogo + AI "trova il cavo per la tua auto"

> Tutti gli asset sono **placeholder** (video di stock, glTF gratuiti/primitive, foto e
> cataloghi finti in `/data`): la struttura è pensata per sostituirli facilmente.

## Stack

- **Next.js** (App Router) + **React** + **TypeScript** (strict)
- **Tailwind CSS v4** con design token centralizzati in [`app/tokens.css`](app/tokens.css)
- **Animazioni**: GSAP + ScrollTrigger + Lenis (rispetta sempre `prefers-reduced-motion`)
- **3D**: React Three Fiber + drei + postprocessing
- **Mappe**: MapLibre GL
- **Tooling**: ESLint + Prettier · package manager **pnpm**
- **Deploy**: Vercel

## Setup

Requisiti: Node 20+ e [pnpm](https://pnpm.io/).

```bash
pnpm install          # installa le dipendenze
cp .env.local.example .env.local   # poi compila le chiavi quando serviranno
pnpm dev              # dev server su http://localhost:3000
```

Altri comandi:

```bash
pnpm build         # build di produzione
pnpm start         # avvia la build
pnpm lint          # ESLint
pnpm format        # Prettier (write)
pnpm typecheck     # tsc --noEmit
```

## Struttura

```
app/                 # App Router: layout, pagine di sezione, CSS globale + token
  layout.tsx         # shell: Header + main (PageTransition) + Footer
  globals.css        # stili base + import dei token
  tokens.css         # design token (palette, tipografia, spacing, radius) → Tailwind
  page.tsx           # Home
  solar/             # /solar   (placeholder)
  mobility/          # /mobility (placeholder)
  shop/              # /shop     (placeholder)
components/
  layout/            # Header, Footer, PageTransition
  ui/                # Container, PagePlaceholder (componenti riusabili)
lib/                 # nav, types, utils
data/                # JSON placeholder (solar-projects, charging-points, products)
public/              # asset statici
```

## Note

- È una **demo**: lavorare a fasi, performance prima dell'effetto, mobile-first e
  accessibile, italiano come lingua principale.
- I design token sono l'unica fonte di verità per colori/tipografia/spacing/radius:
  modificali in [`app/tokens.css`](app/tokens.css) e si propagano via utility Tailwind.
