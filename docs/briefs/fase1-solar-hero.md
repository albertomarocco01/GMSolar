# Brief Fase 1 — Eleva /solar a "cinematic wow" (per chat parallela)

> Da incollare a un'altra chat Claude che lavora **nello stesso repo**.

## Contesto
Repo monorepo pnpm+turbo, app in `apps/web`. È una **DEMO da colloquio (15/07/2026)**: conta il
"wow", non la completezza. `/solar` è il mondo **cinematic** (video + motion smooth).

**PRIMA di scrivere codice, LEGGI:** `PLAN.md`, `CLAUDE.md`, `NOTES-shared.md`, e i componenti in
`apps/web/components/solar/` — soprattutto `SolarHero.tsx` e `apps/web/app/solar/page.tsx`.

⚠️ **L'hero ESISTE già ed è buono** (video full-bleed + parallax scroll GSAP + reveal tipografico +
reduced-motion + numeri reali). Il compito **non è rifarlo da zero**, ma **elevarlo a livello "wow"** e
dare una **regia di scroll cinematografica coerente a tutta la pagina `/solar`**.

## Regole ferree
- Lavori SOLO in `apps/web/app/solar/**` e `apps/web/components/solar/**`.
- **NON toccare la zona condivisa:** `packages/**` (ui/lib/tokens), `apps/web/app/layout.tsx`,
  `apps/web/app/globals.css`. Se ti serve un token/prop nuovo lì → annotalo in `NOTES-shared.md` e
  **fermati**, non modificarlo.
- **Import (convenzioni già in uso, rispettale):**
  - UI: `@gmgroup/ui/Section`, `/Container`, `/Button`, `/Badge`, `/Card`, `/SplitTextReveal`,
    `/ScrollReveal`, `/AnimatedCounter`
  - Motion/3D: `@gmgroup/lib/gsap` (gsap + ScrollTrigger già registrati), `@gmgroup/lib/motion`
    (`useReducedMotion`, `useIsoLayoutEffect`, `DURATION`, `EASE`), `@gmgroup/lib/assets`
    (`VIDEOS`, `POSTERS`), `@gmgroup/lib/utils` (`cn`)
  - Locali: `@/components/solar/...`, `@/data/...`
  - **Niente nuove dipendenze.**
- Rispetta SEMPRE `prefers-reduced-motion` (`useReducedMotion`): con reduced-motion le animazioni si
  disattivano e resta una pagina **statica e pulita**.
- Mobile-first, accessibile, **copy in ITALIANO**. Performance: poster come LCP (è già così), video
  lazy, **60fps** su mid-range, **niente CLS**.
- Il video è un **placeholder** centralizzato in `@gmgroup/lib/assets` (`VIDEOS.solarHero`). Per
  sostituirlo col 4K reale si **rimpiazza il file** `apps/web/public/assets/gm-solar-hero.mp4` —
  **NON** modificare `assets.ts` (zona condivisa). Quindi non cambiare i path: lavora con quel video.

## Obiettivo — da "buono" a "memorabile"
1. **Hero**: potenzia la regia di scroll. Scegli e motiva tra: pin dell'hero con più "beat"
   (headline → claim → CTA) mentre il video resta dietro; mask/clip-reveal del titolo; grading +
   grana + vignette per il taglio cinematografico; easing più curato (usa `EASE`). *Stretch
   opzionale:* video frame-scrub sullo scroll (solo se fluido, con fallback). Mantieni Badge, CTA e i
   micro-numeri reali presi da `data/solar-projects.json`.
2. **Regia di pagina**: coreografia di scroll coerente sulle sezioni successive (stats coi counter,
   Tipologie, Case study, Mappa) — reveal sequenziali, parallax leggeri, transizioni curate, ritmo.
   Lenis (smooth scroll) è già globale.
3. **Art direction**: tipografia (scala `display-*` già nei token), spaziature, overlay/gradienti
   coerenti col brand solar. Accent attivo via `data-theme` (testo su chiaro = `text-accent-ink`,
   fill = `bg-accent`).

## Vincoli tecnici
- Next App Router; `"use client"` dove serve. GSAP via `gsap.context(...)` + ScrollTrigger; cleanup
  con `ctx.revert()` (vedi pattern in `SolarHero.tsx` / `SolarCaseStudy.tsx`).
- Nessuna modifica a Header/Footer/layout/token.

## Output atteso
- Componenti aggiornati/nuovi in `apps/web/components/solar/` (+ eventualmente `app/solar/page.tsx`).
- `pnpm --filter @gmgroup/web build`, `pnpm --filter @gmgroup/web lint`, `... typecheck` **VERDI**.
- Alla fine: **riepilogo dei file toccati + cosa hai cambiato**, poi **fermati per review** (regola
  "lavora a fasi").

## Criteri di accettazione
- `/solar`: hero con scroll cinematic fluido + regia coerente lungo la pagina, copy IT, CTA ok.
- reduced-motion: tutto statico, **0 errori console**.
- **Nessun file della zona condivisa modificato.**
- Build/lint/typecheck verdi; LCP sul poster; niente CLS dall'hero.
