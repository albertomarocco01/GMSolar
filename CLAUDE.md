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
